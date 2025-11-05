import { z } from 'zod'

/**
 * Unified response envelope for all agents
 * Ensures consistent structure across multi-agent interactions
 */
export const AgentResponse = z.object({
  status: z.enum(['success', 'error', 'partial']),
  agent: z.string(), // Which agent handled this request
  channel: z.string().optional(), // web, whatsapp, sms, etc.
  timestamp: z.string(),
  metadata: z.object({
    processing_time_ms: z.number().optional(),
    model_used: z.string().optional(),
    tokens_used: z.number().optional(),
    retry_count: z.number().optional(),
    routing_confidence: z.number().optional(),
    plans_considered: z.number().optional(),
    plans_returned: z.number().optional(),
    warnings: z.array(z.string()).optional()
  }).optional(),
  payload: z.any().optional(), // Agent-specific data (null for error responses)
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  }).optional()
})

export type AgentResponseT = z.infer<typeof AgentResponse>

/**
 * Helper to create successful agent responses
 */
export function successResponse(agent: string, payload: any, metadata?: any): AgentResponseT {
  return {
    status: 'success',
    agent,
    timestamp: new Date().toISOString(),
    metadata,
    payload
  }
}

/**
 * Helper to create error agent responses
 */
export function errorResponse(agent: string, error: { code: string, message: string, details?: any }): AgentResponseT {
  return {
    status: 'error',
    agent,
    timestamp: new Date().toISOString(),
    payload: null, // Explicitly set null payload for error responses
    error
  }
}

/**
 * Helper to create partial responses (e.g., streaming, timeout)
 */
export function partialResponse(agent: string, payload: any, warnings: string[]): AgentResponseT {
  return {
    status: 'partial',
    agent,
    timestamp: new Date().toISOString(),
    metadata: { warnings },
    payload
  }
}
