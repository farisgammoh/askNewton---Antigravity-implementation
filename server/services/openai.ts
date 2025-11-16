import OpenAI from "openai";
import type { PersonaFormData } from "@shared/schema";
import { logOpenAICall } from "../lib/logOpenAICall";

/*
Follow these instructions when using this blueprint:
1. Note that the newest OpenAI model is "gpt-5", not "gpt-4o" or "gpt-4". gpt-5 was released on August 7, 2025, after your knowledge cutoff. Always prefer using gpt-5 as it is the latest model. When copying code from this blueprint, ensure you also mention this information verbatim as a comment so that you don't revert it to older models: `// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user`
2. Use the response_format: { type: "json_object" } option
3. Request output in JSON format in the prompt
4. gpt-5 doesn't support temperature parameter, do not use it.
*/

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

export interface GeneratedPersona {
  name: string;
  title: string;
  personality: string;
  expertise: string;
  communicationStyle: 'warm_professional' | 'direct_helpful' | 'friendly_expert' | 'reassuring_guide' | 'knowledgeable_advisor';
  specialties: string[];
  targetPersonas: ('nomad' | 'traveler' | 'student')[];
  newtonianValues: {
    reliability: number;
    reassurance: number; 
    relevance: number;
    simplicity: number;
    timeliness: number;
    knowledgeability: number;
    fairValue: number;
  };
  systemPrompt: string;
}

interface PersonalizedRecommendation {
  recommendation: string;
  reasoning: string;
  confidence: {
    overall: number;
    relevance: number;
    expertise: number;
  };
  actionItems: string[];
}

interface ChatMessage {
  role: string;
  content: string;
  timestamp?: Date | null;
}

class AskNewtonAI {
  private readonly model = "gpt-5";
  private openai: OpenAI | null = null;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("⚠️ OPENAI_API_KEY not configured - AI persona generation disabled");
    } else {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      throw new Error("OpenAI not configured - missing OPENAI_API_KEY");
    }
    return this.openai;
  }

  /**
   * Check if OpenAI integration is configured
   */
  isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  /**
   * Generate AI personas based on Newtonian service design principles
   */
  async generatePersonas(count: number = 12): Promise<GeneratedPersona[]> {
    if (!this.isConfigured()) {
      throw new Error("OpenAI not configured - missing OPENAI_API_KEY");
    }

    const newtonianPrompt = `
You are an expert in service design and customer experience, specifically following the Newtonian approach to excellent service design in the insurance industry.

Based on the Newtonian principles where:
- Speed + Information + Communication = Quality Customer Service
- Customers care about: Reliability, Reassurance, Relevance, Simplicity, Timeliness, Knowledgeability, Fair Value, Real-time interaction
- Customers DON'T care for: Regulations/Processes, Apathy/Indifference, Pushiness, Paperwork, Delays, Lack of knowledge, Hidden Costs, Endless Option Menus

Generate ${count} diverse AI insurance agent personas that embody these Newtonian principles. Each persona should be unique and specialized for different customer types (nomads, travelers, students) and situations.

Each persona should have:
1. A unique name and professional title
2. A distinctive personality that embodies Newtonian values
3. Specific expertise areas in health insurance for newcomers to California
4. A communication style (warm_professional, direct_helpful, friendly_expert, reassuring_guide, or knowledgeable_advisor)
5. 3-5 specialties (e.g., "Student visa health requirements", "Remote worker insurance", "Short-term coverage options")
6. Target personas they serve best (nomad, traveler, student)
7. Newtonian values rated 1-10 for each principle
8. A comprehensive system prompt that guides their interactions

Make each persona feel authentic, knowledgeable, and genuinely helpful - not pushy or sales-focused.

Respond with a JSON object containing an array of personas:
{
  "personas": [
    {
      "name": "Sarah Chen",
      "title": "Student Health Insurance Specialist",
      "personality": "Warm, patient, and deeply understanding of international student challenges",
      "expertise": "Specializes in F-1 and J-1 visa health requirements, university compliance, and affordable student coverage options",
      "communicationStyle": "reassuring_guide",
      "specialties": ["Student visa compliance", "University health requirements", "Affordable student plans", "International student support"],
      "targetPersonas": ["student"],
      "newtonianValues": {
        "reliability": 9,
        "reassurance": 10,
        "relevance": 10,
        "simplicity": 8,
        "timeliness": 8,
        "knowledgeability": 9,
        "fairValue": 9
      },
      "systemPrompt": "You are Sarah Chen, a compassionate health insurance specialist..."
    }
  ]
}
`;

    try {
      const response = await this.getOpenAI().chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert service designer creating AI personas for health insurance guidance. Focus on Newtonian principles of excellent service design."
          },
          {
            role: "user",
            content: newtonianPrompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!result.personas || !Array.isArray(result.personas)) {
        throw new Error("Invalid response format from OpenAI");
      }

      // Log OpenAI usage for monitoring
      await logOpenAICall({
        endpoint: "personas.generate",
        model: this.model,
        tokensPrompt: response.usage?.prompt_tokens,
        tokensCompletion: response.usage?.completion_tokens,
        costUsd: undefined
      });

      console.log(`✅ Generated ${result.personas.length} AI personas using Newtonian principles`);
      return result.personas;

    } catch (error) {
      console.error('Persona generation error:', error);
      throw new Error(`Failed to generate personas: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate personalized insurance recommendation using a specific persona
   */
  async generateRecommendation(
    leadData: any, 
    persona: GeneratedPersona
  ): Promise<PersonalizedRecommendation> {
    if (!this.isConfigured()) {
      throw new Error("OpenAI not configured - missing OPENAI_API_KEY");
    }

    const recommendationPrompt = `
You are ${persona.name}, ${persona.title}.

Your personality: ${persona.personality}
Your expertise: ${persona.expertise}
Your communication style: ${persona.communicationStyle}

You are helping a potential customer with their health insurance needs in California. Here's their information:
- Persona: ${leadData.persona}
- Name: ${leadData.name}
- Arrival Date: ${leadData.arrivalDate}
- Stay Length: ${leadData.stayLength}
- Current Coverage: ${leadData.currentCoverage}
- Dependents: ${leadData.dependents}
- ZIP Code: ${leadData.zip}
- Preexisting Conditions: ${leadData.preexisting ? 'Yes' : 'No'}
- Visa Status: ${leadData.status || 'Not specified'}
- Notes: ${leadData.notes || 'None'}

Following Newtonian principles of Speed + Information + Communication, provide:

1. A clear, personalized insurance recommendation
2. Your reasoning for this recommendation
3. 3-5 specific action items they should take
4. Your confidence levels in the recommendation

Focus on what customers care about:
- Reliability: Dependable coverage recommendations
- Reassurance: Confidence in their choice
- Relevance: Tailored to their exact situation
- Simplicity: Easy to understand language
- Timeliness: Immediate, actionable advice
- Knowledgeability: Expert insights
- Fair Value: Transparent, honest guidance

Avoid what customers don't care for:
- Regulations/processes (keep them simple)
- Pushiness (be helpful, not sales-y)
- Paperwork complexity
- Hidden costs or surprises

Respond with a JSON object:
{
  "recommendation": "Your detailed recommendation...",
  "reasoning": "Why you're recommending this...",
  "confidence": {
    "overall": 0.85,
    "relevance": 0.90,
    "expertise": 0.88
  },
  "actionItems": [
    "Step 1: Do this...",
    "Step 2: Then this...",
    "Step 3: Finally this..."
  ]
}
`;

    try {
      const response = await this.getOpenAI().chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: persona.systemPrompt
          },
          {
            role: "user",
            content: recommendationPrompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!result.recommendation) {
        throw new Error("Invalid recommendation response from OpenAI");
      }

      // Log OpenAI usage for monitoring
      await logOpenAICall({
        endpoint: "recommendations.generate",
        model: this.model,
        tokensPrompt: response.usage?.prompt_tokens,
        tokensCompletion: response.usage?.completion_tokens,
        costUsd: undefined
      });

      console.log(`✅ Generated personalized recommendation from ${persona.name} for ${leadData.name}`);
      return result;

    } catch (error) {
      console.error('Recommendation generation error:', error);
      throw new Error(`Failed to generate recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test OpenAI connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { 
        success: false, 
        error: "OpenAI not configured" 
      };
    }

    try {
      const response = await this.getOpenAI().chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "user",
            content: "Hello, this is a test message. Please respond with 'Test successful'."
          }
        ]
      });

      if (response.choices[0]?.message?.content?.includes('Test successful')) {
        console.log('✅ OpenAI connection test successful');
        return { success: true };
      } else {
        return { 
          success: false, 
          error: "Unexpected response from OpenAI" 
        };
      }

    } catch (error) {
      console.error('OpenAI connection test error:', error);
      return { 
        success: false, 
        error: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Generate AI chat response for health insurance questions
   */
  async generateChatResponse(userMessage: string, conversationContext: ChatMessage[] = []): Promise<string> {
    const openai = this.getOpenAI();
    
    // Build conversation context with system prompt
    const messages = [
      {
        role: "system",
        content: `You are AskNewton, an AI assistant specializing in California health insurance guidance. You follow Newtonian service principles: Speed + Information + Communication = Quality Customer Service.

Your core principles:
- Reliability: Provide accurate, trustworthy information
- Reassurance: Offer comfort and confidence to confused customers
- Relevance: Focus on what matters most to their specific situation
- Simplicity: Explain complex insurance topics in clear, easy language
- Timeliness: Give prompt, actionable responses
- Knowledgeability: Demonstrate expertise in California insurance landscape
- Fair Value: Help customers find the best coverage for their needs and budget

You help newcomers to California navigate health insurance options including:
- Nomads (remote workers/contractors)
- Travelers (1-6 month visitors)
- Students (F-1/J-1 visa holders)

Provide practical, specific advice. When appropriate, recommend they speak with a licensed professional for personalized guidance. Keep responses conversational but informative.`
      },
      // Add conversation context (last few messages)
      ...conversationContext.slice(-4).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      // Add current user message
      {
        role: "user",
        content: userMessage
      }
    ];

    try {
      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: messages as any,
        max_completion_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response generated");
      }

      // Log OpenAI usage for monitoring
      await logOpenAICall({
        endpoint: "chat.completion",
        model: this.model,
        tokensPrompt: completion.usage?.prompt_tokens,
        tokensCompletion: completion.usage?.completion_tokens,
        costUsd: undefined
      });

      return response;
    } catch (error) {
      console.error("OpenAI chat completion error:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  /**
   * Generate AI image for persona using DALL-E 3
   */
  async generatePersonaImage(personaName: string, personaTitle: string): Promise<string | null> {
    if (!this.isConfigured()) {
      console.warn('OpenAI not configured - cannot generate persona image');
      return null;
    }

    try {
      const prompt = `A professional headshot portrait of a health insurance expert named ${personaName}, who works as a ${personaTitle}. 
      Modern, approachable, and trustworthy appearance. Clean business attire, warm smile, 
      professional lighting. High quality, realistic style, looking directly at camera. 
      Background should be neutral and professional. California-based health insurance professional.`;

      const openai = this.getOpenAI();
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      });

      const imageUrl = response.data?.[0]?.url;
      if (imageUrl) {
        // Log OpenAI usage for monitoring (DALL-E doesn't provide token counts)
        await logOpenAICall({
          endpoint: "personas.images.generate",
          model: "dall-e-3",
          costUsd: undefined
        });
        
        console.log(`✅ Generated persona image for ${personaName}`);
        return imageUrl;
      }

      return null;
    } catch (error) {
      console.error(`Error generating persona image for ${personaName}:`, error);
      return null;
    }
  }

  /**
   * Generate images for multiple personas
   */
  async generatePersonaImages(personas: Array<{ id: string; name: string; title: string }>): Promise<Array<{ personaId: string; imageUrl: string | null }>> {
    if (!this.isConfigured()) {
      console.warn('OpenAI not configured - cannot generate persona images');
      return personas.map(p => ({ personaId: p.id, imageUrl: null }));
    }

    const results = [];
    for (const persona of personas) {
      try {
        const imageUrl = await this.generatePersonaImage(persona.name, persona.title);
        results.push({ personaId: persona.id, imageUrl });
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate image for ${persona.name}:`, error);
        results.push({ personaId: persona.id, imageUrl: null });
      }
    }

    return results;
  }
}

// Export singleton instance
export const askNewtonAI = new AskNewtonAI();

// Export PersonalizedRecommendation type (GeneratedPersona already exported above)
export type { PersonalizedRecommendation };