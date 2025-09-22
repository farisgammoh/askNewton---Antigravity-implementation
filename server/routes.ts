import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { leadSchema } from "@shared/schema";
import { z } from "zod";
import { sendLeadNotification, type LeadNotificationData } from "./email";
import { hubSpotService } from "./services/hubspot";
import { askNewtonAI } from "./services/openai";
import { personaSchema, recommendationSchema, messageSchema, personaSelectionSchema, googleAdsLeadSchema, personas, recommendations } from "@shared/schema";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

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

  // Persona selection endpoints
  // Create a persona selection (one per email)
  app.post("/api/persona-selections", async (req, res) => {
    try {
      const parsed = personaSelectionSchema.parse(req.body);
      const storageInstance = await storage();
      
      // Check if email already has a selection
      const existingSelection = await storageInstance.getPersonaSelectionByEmail(parsed.email);
      if (existingSelection) {
        const selectedPersona = await storageInstance.getPersona(existingSelection.personaId);
        const personaName = selectedPersona?.name || "a persona";
        return res.status(400).json({ 
          error: "Email already registered",
          message: `You can only select one persona per email address. You've already selected: ${personaName}`
        });
      }

      // Verify persona exists
      const persona = await storageInstance.getPersona(parsed.personaId);
      if (!persona) {
        return res.status(404).json({ error: "Selected persona not found" });
      }

      // Create the selection
      const selection = await storageInstance.createPersonaSelection(parsed);
      
      res.status(201).json({ 
        success: true, 
        selection,
        message: `Successfully selected ${persona.name} as your health insurance expert!`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      } else {
        console.error('Persona selection error:', error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Get all persona selections (admin only)
  app.get("/api/persona-selections", async (req, res) => {
    try {
      const storageInstance = await storage();
      const selections = await storageInstance.getPersonaSelections();
      res.json(selections);
    } catch (error) {
      console.error('Get persona selections error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Check if email has already selected a persona
  app.get("/api/persona-selections/check/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const storageInstance = await storage();
      const selection = await storageInstance.getPersonaSelectionByEmail(email);
      
      if (!selection) {
        return res.json({ hasSelection: false });
      }

      const persona = await storageInstance.getPersona(selection.personaId);
      res.json({ 
        hasSelection: true,
        selection,
        personaName: persona?.name
      });
    } catch (error) {
      console.error('Check persona selection error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Generate images for personas (admin only)
  app.post("/api/personas/generate-images", async (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_API_KEY;
    const receivedKeyStr = Array.isArray(adminKey) ? adminKey[0] : adminKey;
    
    if (!receivedKeyStr || receivedKeyStr !== expectedKey) {
      return res.status(401).json({ error: "Unauthorized - Admin access required" });
    }

    try {
      if (!askNewtonAI.isConfigured()) {
        return res.status(503).json({ 
          error: "AI service not configured",
          message: "OPENAI_API_KEY is required for image generation" 
        });
      }

      const storageInstance = await storage();
      const personas = await storageInstance.getPersonas();
      
      if (personas.length === 0) {
        return res.status(404).json({ error: "No personas found to generate images for" });
      }

      // Generate images for personas that don't have them
      const personasNeedingImages = personas.filter(p => !p.imageUrl);
      
      if (personasNeedingImages.length === 0) {
        return res.json({ 
          success: true, 
          message: "All personas already have images",
          processed: 0
        });
      }

      const results = await askNewtonAI.generatePersonaImages(
        personasNeedingImages.map(p => ({ id: p.id, name: p.name, title: p.title }))
      );

      // Update personas with image URLs (for memory storage only - would need proper DB update for production)
      let updatedCount = 0;
      for (const result of results) {
        if (result.imageUrl) {
          const persona = await storageInstance.getPersona(result.personaId);
          if (persona && 'imageUrl' in persona) {
            (persona as any).imageUrl = result.imageUrl;
            updatedCount++;
          }
        }
      }

      res.json({ 
        success: true, 
        processed: results.length,
        updated: updatedCount,
        results: results.map(r => ({ 
          personaId: r.personaId, 
          hasImage: !!r.imageUrl 
        }))
      });
    } catch (error) {
      console.error('Persona image generation error:', error);
      res.status(500).json({ 
        error: "Failed to generate persona images",
        message: error instanceof Error ? error.message : "Unknown error"
      });
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

  // Chat API endpoints
  // Create new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const { title, userId } = req.body;
      const storageInstance = await storage();
      
      const conversation = await storageInstance.createConversation({
        title: title || "New Chat",
        userId: userId || null
      });
      
      res.status(201).json(conversation);
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const { userId } = req.query;
      const storageInstance = await storage();
      
      const conversations = await storageInstance.getConversations(userId as string);
      res.json(conversations);
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get conversation by ID
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const storageInstance = await storage();
      
      const conversation = await storageInstance.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update conversation title
  app.put("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }
      
      const storageInstance = await storage();
      await storageInstance.updateConversationTitle(id, title);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Update conversation error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create new message
  app.post("/api/messages", async (req, res) => {
    try {
      const validation = messageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validation.error.errors 
        });
      }

      const { conversationId, role, content, fileUrls } = validation.data;
      const storageInstance = await storage();
      
      // Create user message
      const userMessage = await storageInstance.createMessage({
        conversationId: conversationId!,
        role,
        content,
        fileUrls: fileUrls || null
      });

      // If it's a user message, generate AI response
      if (role === 'user' && askNewtonAI.isConfigured()) {
        try {
          // Get conversation context (last few messages)
          const messages = await storageInstance.getMessages(conversationId!);
          const recentMessages = messages.slice(-5); // Last 5 messages for context

          const aiResponse = await askNewtonAI.generateChatResponse(content, recentMessages);
          
          // Create AI response message
          await storageInstance.createMessage({
            conversationId: conversationId!,
            role: 'assistant',
            content: aiResponse,
            fileUrls: null
          });

          // Update conversation title with first user message if it's still "New Chat"
          const conversation = await storageInstance.getConversation(conversationId!);
          if (conversation && conversation.title === "New Chat" && content.length > 0) {
            const titlePreview = content.length > 50 ? content.substring(0, 47) + "..." : content;
            await storageInstance.updateConversationTitle(conversationId!, titlePreview);
          }
        } catch (aiError) {
          console.error('AI response generation failed:', aiError);
          // Don't fail the request, just log the error
        }
      }
      
      res.status(201).json(userMessage);
    } catch (error) {
      console.error('Create message error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get messages for a conversation
  app.get("/api/messages/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const storageInstance = await storage();
      
      const messages = await storageInstance.getMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Simple file upload endpoint (basic implementation)
  app.post("/api/upload", async (req, res) => {
    try {
      // This is a placeholder implementation
      // In a real implementation, you would use multer or similar for file handling
      // and integrate with object storage
      
      res.status(501).json({ 
        error: "File upload not yet implemented",
        message: "File upload functionality requires object storage setup" 
      });
    } catch (error) {
      console.error('File upload error:', error);
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

  // Google Ads lead endpoint - accepts leads from Google Ads campaigns
  app.post("/api/google-ads-leads", async (req, res) => {
    try {
      console.log("📱 New Google Ads lead received:", req.body);
      
      const parsed = googleAdsLeadSchema.parse(req.body);
      
      // Map Google Ads lead data to our existing lead structure
      const mappedLead = {
        // Combine name fields if needed
        name: parsed.name || `${parsed.first_name || ''} ${parsed.last_name || ''}`.trim(),
        email: parsed.email,
        phone: parsed.phone || parsed.phone_number || undefined,
        
        // Use ZIP code from either field
        zip: parsed.zip_code || parsed.postal_code || "90210", // Default to Beverly Hills if not provided
        
        // Map persona type or default to 'traveler' for Google Ads leads
        persona: parsed.persona_type || 'traveler',
        
        // Map stay length or default
        stayLength: parsed.stay_length || 'lt90',
        
        // Map arrival date or default to near future
        arrivalDate: parsed.arrival_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        
        // Default values for required fields
        currentCoverage: parsed.current_coverage || 'none',
        preexisting: false, // Default to false for Google Ads leads
        dependents: 'none', // Default to none
        consent: true, // Implicit consent for Google Ads lead form submission
        
        // Combine notes from various message fields
        notes: [
          parsed.notes,
          parsed.message,
          parsed.gclid ? `Google Click ID: ${parsed.gclid}` : null,
          parsed.campaign_id ? `Campaign: ${parsed.campaign_id}` : null,
          parsed.keyword ? `Keyword: ${parsed.keyword}` : null
        ].filter(Boolean).join(' | ') || `Google Ads lead submitted on ${new Date().toLocaleDateString()}`,
        
        // Optional fields
        status: undefined, // Let user specify later
        address: undefined,
        budgetOrNetwork: undefined
      };
      
      // Create lead using existing storage system
      const storageInstance = await storage();
      const lead = await storageInstance.createLead(mappedLead);

      // Forward to webhook if configured (same as regular leads)
      const webhookUrl = process.env.WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              ...lead, 
              source: 'google_ads',
              original_data: parsed 
            })
          });
          console.log("📡 Google Ads lead forwarded to webhook");
        } catch (error) {
          console.error('Google Ads webhook error:', error);
          // Don't fail the request if webhook fails
        }
      }

      // Send email notification using SendGrid (same as regular leads)
      try {
        await sendLeadNotification(lead);
        console.log("📧 Google Ads lead notification sent");
      } catch (error) {
        console.error('Google Ads email notification error:', error);
        // Don't fail the request if email fails
      }

      // Send to HubSpot CRM (same as regular leads)
      try {
        const hubspotResult = await hubSpotService.createContact(lead);
        if (hubspotResult.success) {
          console.log(`📊 Google Ads lead sent to HubSpot: ${lead.email}`);
        } else {
          console.warn(`⚠️ Google Ads HubSpot integration failed: ${hubspotResult.error}`);
        }
      } catch (error) {
        console.error('Google Ads HubSpot integration error:', error);
        // Don't fail the request if HubSpot fails
      }

      console.log(`✅ Google Ads lead processed successfully: ${lead.email}`);
      
      res.status(200).json({ 
        success: true, 
        leadId: lead.id,
        message: "Lead received and processed successfully" 
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Google Ads lead validation failed:', error.errors);
        res.status(400).json({ 
          error: "Invalid lead data", 
          details: error.errors,
          message: "Please check the required fields and try again"
        });
      } else {
        console.error('Google Ads lead processing error:', error);
        res.status(500).json({ 
          error: "Internal server error",
          message: "Failed to process Google Ads lead"
        });
      }
    }
  });

  // Privacy policy routes (both /privacy and /api/privacy for flexibility)
  const servePrivacyPolicy = (req: any, res: any) => {
    try {
      const privacyPath = path.join(process.cwd(), 'public', 'asknewton_privacy.html');
      const htmlContent = fs.readFileSync(privacyPath, 'utf-8');
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    } catch (error) {
      console.error('Privacy policy file error:', error);
      res.status(404).send('Privacy policy not found');
    }
  };

  app.get("/api/privacy", servePrivacyPolicy);
  app.get("/privacy", servePrivacyPolicy);

  // Terms of service routes (both /terms and /api/terms for flexibility)
  const serveTermsOfService = (req: any, res: any) => {
    try {
      const termsPath = path.join(process.cwd(), 'public', 'asknewton_terms.html');
      const htmlContent = fs.readFileSync(termsPath, 'utf-8');
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    } catch (error) {
      console.error('Terms of service file error:', error);
      res.status(404).send('Terms of service not found');
    }
  };

  app.get("/api/terms", serveTermsOfService);
  app.get("/terms", serveTermsOfService);

  const httpServer = createServer(app);
  return httpServer;
}
