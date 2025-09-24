import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

export interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface ElevenLabsTextToSpeechRequest {
  text: string;
  model_id?: string;
  voice_settings?: ElevenLabsVoiceSettings;
}

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
}

// Newton voice personas
export const NEWTON_VOICES = {
  isaac: "VOICE_ID_BRITISH",      // Isaac - British accent for professional outreach
  mila: "VOICE_ID_SPANISH",       // Mila - Spanish accent for diverse market reach  
  faris: "VOICE_ID_ARABIC"        // Faris - Arabic accent for Middle Eastern markets
} as const;

export type VoicePersona = keyof typeof NEWTON_VOICES;

export class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      'xi-api-key': this.apiKey
    };
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json() as any;
      return data.voices || [];
    } catch (error) {
      console.error('ElevenLabs get voices error:', error);
      throw new Error('Failed to fetch voices from ElevenLabs');
    }
  }

  /**
   * Convert text to speech using ElevenLabs
   */
  async textToSpeech(
    voiceId: string, 
    request: ElevenLabsTextToSpeechRequest
  ): Promise<Buffer> {
    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            text: request.text,
            model_id: request.model_id || 'eleven_monolingual_v1',
            voice_settings: request.voice_settings || {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('ElevenLabs text-to-speech error:', error);
      throw new Error('Failed to generate speech from ElevenLabs');
    }
  }

  /**
   * Generate voice with file saving capability
   */
  async generateVoice(voiceId: string, text: string, fileName?: string): Promise<Buffer> {
    const audioBuffer = await this.textToSpeech(voiceId, {
      text,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    });

    // Save to file if fileName provided
    if (fileName) {
      const outputDir = path.join(process.cwd(), 'audio_output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const filePath = path.join(outputDir, `${fileName}.mp3`);
      fs.writeFileSync(filePath, audioBuffer);
      console.log(`🎵 Audio saved to: ${filePath}`);
    }

    return audioBuffer;
  }

  /**
   * Generate speech for Isaac Newton Sales Navigator
   */
  async generateIsaacResponse(
    text: string,
    voiceId?: string
  ): Promise<Buffer> {
    // Use a professional, trustworthy voice for Isaac
    const defaultVoiceId = voiceId || 'pNInz6obpgDQGcFmaJgB'; // Adam voice
    
    const voiceSettings: ElevenLabsVoiceSettings = {
      stability: 0.6,
      similarity_boost: 0.8,
      style: 0.2,
      use_speaker_boost: true
    };

    return this.textToSpeech(defaultVoiceId, {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: voiceSettings
    });
  }
}

/**
 * Newton Sales Navigator Voice Agent
 * Based on Newton's core principles and knowledge base
 */
export class NewtonVoiceAgent {
  public elevenLabs: ElevenLabsService;
  private defaultPersona: VoicePersona;

  constructor(elevenLabsService: ElevenLabsService, defaultPersona: VoicePersona = 'isaac') {
    this.elevenLabs = elevenLabsService;
    this.defaultPersona = defaultPersona;
  }

  /**
   * Get voice ID for a specific persona
   */
  getVoiceId(persona?: VoicePersona): string {
    return NEWTON_VOICES[persona || this.defaultPersona];
  }

  /**
   * Generate personalized outreach message based on context
   */
  generateOutreachScript(context: {
    type: 'b2c' | 'b2b' | 'ecosystem';
    name?: string;
    company?: string;
    demographic?: 'under-30' | '30-50' | '50+';
  }): string {
    const { type, name, company, demographic } = context;
    const greeting = name ? `Hi ${name}` : 'Hello';

    switch (type) {
      case 'b2c':
        if (demographic === 'under-30') {
          return `${greeting}, I'm Isaac from AskNewton! We're revolutionizing health insurance with AI - making it as simple as tapping your phone. We focus on speed, clarity, and keeping your life in motion. Our customers love our instant coverage, lightning-fast claims, and transparent pricing. Could we set up a quick 10-minute call this week to show you how AskNewton makes insurance actually work for you?`;
        } else if (demographic === '50+') {
          return `${greeting}, this is Isaac calling from AskNewton. We specialize in simplifying health and life insurance through trusted AI guidance. We're known for our reliable service, clear communication, and fair pricing - no hidden costs or endless phone menus. I'd love to schedule a brief consultation to review your current coverage and show you how AskNewton can provide better peace of mind. Would next week work for a 15-minute call?`;
        } else {
          return `${greeting}, I'm reaching out from AskNewton - we help simplify health and life insurance with AI. We focus on speed, clarity, and keeping your life in motion. Customers choose us for instant coverage, fast claims, and fair pricing. Could we set up a quick call this week to review your needs and show you how AskNewton makes insurance as simple as a tap on your phone?`;
        }

      case 'b2b':
        return `${greeting}, this is Isaac from AskNewton's Growth team. We work with ${company ? `partners like ${company}` : 'innovative insurers'} to co-create AI-driven distribution and claims solutions. Newton's venture studio has successfully scaled InsurTechs, and we're looking for forward-thinking partners ready to capture new revenue while reducing customer friction. Would you be open to a 20-minute strategy call next week to explore collaboration opportunities?`;

      case 'ecosystem':
        return `${greeting}, reaching out on behalf of AskNewton Momentum Labs. We build scalable AI ventures in insurance and healthtech, working with partners ${company ? `like ${company}` : 'across the ecosystem'}. We'd love to explore how our platform can integrate with your customer journey and co-create new revenue streams. Can I send you a brief case study and schedule time to discuss potential synergies?`;

      default:
        return `${greeting}, I'm Isaac from AskNewton. We're transforming insurance with AI to make it reliable, fast, and simple. I'd love to connect and show you how we can help. Are you available for a brief call this week?`;
    }
  }

  /**
   * Generate voice response with specific persona
   */
  async generateVoiceResponse(context: {
    type: 'b2c' | 'b2b' | 'ecosystem';
    name?: string;
    company?: string;
    demographic?: 'under-30' | '30-50' | '50+';
    persona?: VoicePersona;
    fileName?: string;
  }): Promise<Buffer> {
    const script = this.generateOutreachScript(context);
    const voiceId = this.getVoiceId(context.persona);
    return this.elevenLabs.generateVoice(voiceId, script, context.fileName);
  }

  /**
   * Generate custom voice message with persona
   */
  async generateCustomMessage(
    text: string, 
    persona?: VoicePersona, 
    fileName?: string
  ): Promise<Buffer> {
    const voiceId = this.getVoiceId(persona);
    const newtonText = `${text} This is ${persona || this.defaultPersona} from AskNewton, and I'm here to help keep your life in motion with simple, reliable insurance solutions.`;
    return this.elevenLabs.generateVoice(voiceId, newtonText, fileName);
  }
}

// Factory function to create Newton voice agent
export function createNewtonAgent(defaultPersona: VoicePersona = 'isaac'): NewtonVoiceAgent | null {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.warn('ELEVENLABS_API_KEY not configured - Newton voice agent disabled');
    return null;
  }

  const elevenLabsService = new ElevenLabsService(apiKey);
  return new NewtonVoiceAgent(elevenLabsService, defaultPersona);
}

// Legacy factory function for backwards compatibility
export function createIsaacAgent(): NewtonVoiceAgent | null {
  return createNewtonAgent('isaac');
}