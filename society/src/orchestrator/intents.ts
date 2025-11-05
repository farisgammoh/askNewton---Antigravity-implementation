/**
 * Intent Registry: Centralized configuration for all intents and their handlers
 * Provides type safety, extensibility, and clear routing rules
 */

export type IntentHandler = (data: any) => Promise<any>

export interface IntentConfig {
  name: string
  description: string
  requiredFields?: string[]
  keywords?: string[]
  priority: number // Higher priority = checked first
  enabled: boolean
}

export const INTENT_REGISTRY: Record<string, IntentConfig> = {
  coverage_recommendation: {
    name: 'coverage_recommendation',
    description: 'Generate health insurance plan recommendations',
    requiredFields: ['intake'],
    keywords: ['recommend', 'plan', 'coverage', 'insurance', 'compare'],
    priority: 10,
    enabled: true
  },
  concierge: {
    name: 'concierge',
    description: 'General customer service and health insurance Q&A',
    requiredFields: ['message'],
    keywords: ['help', 'question', 'explain', 'what', 'how'],
    priority: 5,
    enabled: true
  },
  claims_helper: {
    name: 'claims_helper',
    description: 'Claims submission and status tracking',
    requiredFields: ['claim_data'],
    keywords: ['claim', 'reimbursement', 'eob', 'billing'],
    priority: 8,
    enabled: false // Not implemented yet
  },
  benefits_navigator: {
    name: 'benefits_navigator',
    description: 'Find in-network providers and estimate costs',
    requiredFields: ['search_params'],
    keywords: ['doctor', 'provider', 'network', 'appointment'],
    priority: 7,
    enabled: false // Not implemented yet
  }
}

/**
 * Infer intent from message content and available data
 * Returns intent name with confidence score
 */
export function inferIntent(message?: string, data?: any): { intent: string, confidence: number } {
  // If explicit intent provided, use it
  if (data?.intent && INTENT_REGISTRY[data.intent]?.enabled) {
    return { intent: data.intent, confidence: 1.0 }
  }

  // Check for required fields first (high confidence)
  if (data?.intake) {
    return { intent: 'coverage_recommendation', confidence: 0.9 }
  }

  if (data?.claim_data && INTENT_REGISTRY.claims_helper.enabled) {
    return { intent: 'claims_helper', confidence: 0.9 }
  }

  // Keyword matching on message (medium confidence)
  if (message) {
    const msg = message.toLowerCase()
    const matches: Array<{ intent: string, score: number, priority: number }> = []

    for (const [intentName, config] of Object.entries(INTENT_REGISTRY)) {
      if (!config.enabled) continue
      
      const keywordMatches = config.keywords?.filter(kw => msg.includes(kw)).length || 0
      if (keywordMatches > 0) {
        matches.push({
          intent: intentName,
          score: keywordMatches / (config.keywords?.length || 1),
          priority: config.priority
        })
      }
    }

    if (matches.length > 0) {
      // Sort by score, then priority
      matches.sort((a, b) => {
        if (Math.abs(a.score - b.score) < 0.1) {
          return b.priority - a.priority
        }
        return b.score - a.score
      })
      
      return { intent: matches[0].intent, confidence: Math.min(0.8, matches[0].score) }
    }
  }

  // Default fallback to concierge (low confidence)
  return { intent: 'concierge', confidence: 0.3 }
}

/**
 * Validate that request has required fields for intent
 */
export function validateIntent(intent: string, data: any): { valid: boolean, missing?: string[] } {
  const config = INTENT_REGISTRY[intent]
  if (!config) {
    return { valid: false, missing: ['unknown_intent'] }
  }

  if (!config.enabled) {
    return { valid: false, missing: ['intent_disabled'] }
  }

  const missing = config.requiredFields?.filter(field => !data[field]) || []
  
  return {
    valid: missing.length === 0,
    missing: missing.length > 0 ? missing : undefined
  }
}
