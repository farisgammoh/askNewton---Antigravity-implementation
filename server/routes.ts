import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { leadSchema } from "@shared/schema";
import { z } from "zod";
import { sendLeadNotification, type LeadNotificationData } from "./email";
import { hubSpotService } from "./services/hubspot";
import { askNewtonAI } from "./services/openai";
import { personaSchema, recommendationSchema, personas, recommendations } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Lead submission endpoint
  app.post("/api/lead", async (req, res) => {
    try {
      const parsed = leadSchema.parse(req.body);
      
      // Create lead in storage
      const storageInstance = await storage();
      const lead = await storageInstance.createLead(parsed);

      // Forward to webhook if configured
      const webhookUrl = process.env.WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...lead })
          });
        } catch (error) {
          console.error('Webhook error:', error);
          // Don't fail the request if webhook fails
        }
      }

      // Send email notification using SendGrid
      await sendLeadNotification(lead);

      // Send to HubSpot CRM (don't fail if HubSpot fails)
      try {
        const hubspotResult = await hubSpotService.createContact(lead);
        if (hubspotResult.success) {
          console.log(`📊 Lead sent to HubSpot: ${lead.email}`);
        } else {
          console.warn(`⚠️ HubSpot integration failed: ${hubspotResult.error}`);
        }
      } catch (error) {
        console.error('HubSpot integration error:', error);
        // Don't fail the request if HubSpot fails
      }

      res.status(201).json({ success: true, leadId: lead.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      } else {
        console.error('Lead creation error:', error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Get individual lead endpoint (public - for recommendation flow, PII redacted)
  app.get("/api/leads/:leadId", async (req, res) => {
    try {
      const { leadId } = req.params;
      const storageInstance = await storage();
      const lead = await storageInstance.getLead(leadId);
      
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      // SECURITY: Return only non-PII fields for public access
      const publicLead = {
        id: lead.id,
        persona: lead.persona,
        name: lead.name, // First name only for personalization
        arrivalDate: lead.arrivalDate,
        stayLength: lead.stayLength,
        currentCoverage: lead.currentCoverage,
        preexisting: lead.preexisting,
        dependents: lead.dependents,
        consent: lead.consent,
        createdAt: lead.createdAt
        // Removed: email, phone, notes, zip (PII)
      };
      
      res.json(publicLead);
    } catch (error) {
      console.error('Get lead error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get leads endpoint (admin only - for debugging)
  app.get("/api/leads", async (req, res) => {
    // Require admin API key for security
    const adminKey = req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_API_KEY;
    
    const receivedKeyStr = Array.isArray(adminKey) ? adminKey[0] : adminKey;
    
    if (!receivedKeyStr || receivedKeyStr !== expectedKey) {
      return res.status(401).json({ error: "Unauthorized - Admin access required" });
    }

    try {
      const storageInstance = await storage();
      const leads = await storageInstance.getLeads();
      res.json(leads);
    } catch (error) {
      console.error('Get leads error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // HubSpot connection test endpoint (admin only)
  app.get("/api/hubspot/test", async (req, res) => {
    // Require admin API key for security
    const adminKey = req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_API_KEY;
    const receivedKeyStr = Array.isArray(adminKey) ? adminKey[0] : adminKey;
    
    if (!receivedKeyStr || receivedKeyStr !== expectedKey) {
      return res.status(401).json({ error: "Unauthorized - Admin access required" });
    }

    try {
      const testResult = await hubSpotService.testConnection();
      res.json({
        configured: hubSpotService.isConfigured(),
        ...testResult
      });
    } catch (error) {
      console.error('HubSpot test error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Persona generation endpoint (admin only)
  app.post("/api/personas/generate", async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_API_KEY;
    const receivedKeyStr = Array.isArray(adminKey) ? adminKey[0] : adminKey;
    
    if (!receivedKeyStr || receivedKeyStr !== expectedKey) {
      return res.status(401).json({ error: "Unauthorized - Admin access required" });
    }

    try {
      const { count = 12 } = req.body;
      
      if (!askNewtonAI.isConfigured()) {
        return res.status(503).json({ 
          error: "AI service not configured",
          message: "OPENAI_API_KEY is required for persona generation" 
        });
      }

      // Generate personas using AI
      const generatedPersonas = await askNewtonAI.generatePersonas(count);
      
      // Store personas in database
      const storageInstance = await storage();
      const savedPersonas = [];
      
      for (const personaData of generatedPersonas) {
        try {
          const persona = await storageInstance.createPersona(personaData);
          savedPersonas.push(persona);
        } catch (error) {
          console.error(`Failed to save persona ${personaData.name}:`, error);
        }
      }

      res.json({ 
        success: true, 
        generated: generatedPersonas.length,
        saved: savedPersonas.length,
        personas: savedPersonas
      });

    } catch (error) {
      console.error('Persona generation error:', error);
      res.status(500).json({ 
        error: "Failed to generate personas",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get personas endpoint
  app.get("/api/personas", async (req, res) => {
    try {
      const storageInstance = await storage();
      const allPersonas = await storageInstance.getPersonas();
      res.json(allPersonas);
    } catch (error) {
      console.error('Get personas error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get specific persona
  app.get("/api/personas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const storageInstance = await storage();
      const persona = await storageInstance.getPersona(id);
      
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }
      
      res.json(persona);
    } catch (error) {
      console.error('Get persona error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Generate personalized recommendation
  app.post("/api/recommendations", async (req, res) => {
    try {
      // Validate request body
      const validation = z.object({
        leadId: z.string().uuid("Invalid lead ID format"),
        personaId: z.string().uuid("Invalid persona ID format")
      }).safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validation.error.errors 
        });
      }

      const { leadId, personaId } = validation.data;

      if (!askNewtonAI.isConfigured()) {
        return res.status(503).json({ 
          error: "AI service not configured",
          message: "OPENAI_API_KEY is required for recommendations" 
        });
      }

      const storageInstance = await storage();
      
      // Get lead and persona data
      const lead = await storageInstance.getLead(leadId);
      const persona = await storageInstance.getPersona(personaId);
      
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      if (!persona) {
        return res.status(404).json({ error: "Persona not found" });
      }

      // CRITICAL: Check user consent before sending data to OpenAI
      if (!lead.consent) {
        return res.status(403).json({ 
          error: "User consent required",
          message: "Cannot generate AI recommendations without user consent" 
        });
      }

      // Generate AI recommendation (cast persona to match expected type)
      const generatedPersona = {
        ...persona,
        communicationStyle: persona.communicationStyle as any,
        specialties: persona.specialties as string[],
        targetPersonas: persona.targetPersonas as ('nomad' | 'traveler' | 'student')[],
        newtonianValues: persona.newtonianValues as any
      };
      
      const aiRecommendation = await askNewtonAI.generateRecommendation(lead, generatedPersona);
      
      // Validate AI response before saving
      const recommendationValidation = recommendationSchema.safeParse({
        leadId,
        personaId,
        ...aiRecommendation
      });

      if (!recommendationValidation.success) {
        console.error('AI recommendation validation failed:', recommendationValidation.error);
        return res.status(500).json({
          error: "AI generated invalid recommendation",
          message: "Please try again or contact support"
        });
      }
      
      // Save recommendation to database
      const savedRecommendation = await storageInstance.createRecommendation(recommendationValidation.data);
      
      console.log(`✅ Generated recommendation for lead ${lead.email} using persona ${persona.name}`);
      
      res.json({ 
        success: true, 
        recommendation: savedRecommendation 
      });

    } catch (error) {
      console.error('Recommendation generation error:', error);
      res.status(500).json({ 
        error: "Failed to generate recommendation",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get recommendations for a lead
  app.get("/api/leads/:leadId/recommendations", async (req, res) => {
    try {
      const { leadId } = req.params;
      const storageInstance = await storage();
      const recommendations = await storageInstance.getLeadRecommendations(leadId);
      res.json(recommendations);
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get recommendations by query parameter (for easier frontend access)
  app.get("/api/recommendations", async (req, res) => {
    try {
      const { leadId } = req.query;
      
      if (!leadId) {
        return res.status(400).json({ error: "Missing leadId query parameter" });
      }
      
      const storageInstance = await storage();
      const recommendations = await storageInstance.getLeadRecommendations(leadId as string);
      res.json(recommendations);
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // OpenAI connection test endpoint (admin only)
  app.get("/api/ai/test", async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_API_KEY;
    const receivedKeyStr = Array.isArray(adminKey) ? adminKey[0] : adminKey;
    
    if (!receivedKeyStr || receivedKeyStr !== expectedKey) {
      return res.status(401).json({ error: "Unauthorized - Admin access required" });
    }

    try {
      const testResult = await askNewtonAI.testConnection();
      res.json({
        configured: askNewtonAI.isConfigured(),
        ...testResult
      });
    } catch (error) {
      console.error('AI test error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
