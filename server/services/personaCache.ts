import { storage } from "../storage";
import { eq } from "drizzle-orm";
import { personaCache } from "@shared/schema";
import { makePersonaInputHash } from "../lib/hash";
import { askNewtonAI } from "./openai";
import type { GeneratedPersona } from "./openai";

/**
 * Generate personas with caching to reduce OpenAI API calls
 * Returns cached personas if inputs match, otherwise generates new ones
 */
export async function generatePersonasWithCaching(options: {
  count?: number;
  config?: unknown;
  email?: string;
}): Promise<{ personas: GeneratedPersona[]; fromCache: boolean }> {
  const { count = 12, config, email } = options;
  
  const inputHash = makePersonaInputHash({ count, config, email });
  
  // Try to get from cache
  const storageInstance = await storage();
  if (storageInstance.getPersonaCache) {
    const cached = await storageInstance.getPersonaCache(inputHash);
    
    if (cached) {
      const personas = cached.personasJson as GeneratedPersona[];
      console.log(`✅ Persona cache hit (${personas.length} personas)`);
      return { personas, fromCache: true };
    }
  }
  
  console.log(`🔄 Persona cache miss - generating new personas`);
  
  // Generate new personas using AI
  const personas = await askNewtonAI.generatePersonas(count);
  
  // Cache the result
  if (storageInstance.createPersonaCache) {
    try {
      await storageInstance.createPersonaCache({
        inputHash,
        personasJson: personas as any
      });
      console.log(`💾 Cached ${personas.length} personas (hash: ${inputHash.substring(0, 8)}...)`);
    } catch (error) {
      console.error('Failed to cache personas:', error);
    }
  }
  
  return { personas, fromCache: false };
}
