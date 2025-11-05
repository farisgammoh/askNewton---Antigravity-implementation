import { z } from 'zod'
import { conciergeAgent } from '../agents/concierge.js'
import { coverageAdvisorAgent } from '../agents/coverageAdvisor.js'
import { IntakeProfile } from '../schemas/intakeProfile.js'
import { AgentResponse, errorResponse } from '../schemas/agentResponse.js'
import { inferIntent, validateIntent } from './intents.js'

const GatewayPayload = z.object({
  channel: z.string().default('web'),
  intent: z.string().optional(),
  message: z.string().optional(),
  intake: IntakeProfile.optional(),
  context: z.record(z.any()).optional()
})

export const router = {
  async handle(payload: any) {
    const startTime = Date.now()
    
    try {
      // Validate and parse input
      const data = GatewayPayload.parse(payload)

      // Infer intent with confidence scoring
      const { intent, confidence } = inferIntent(data.message, data)

      // Validate intent requirements
      const validation = validateIntent(intent, data)
      if (!validation.valid) {
        return errorResponse('router', {
          code: 'INVALID_REQUEST',
          message: `Missing required fields for ${intent}: ${validation.missing?.join(', ')}`,
          details: { intent, missing: validation.missing }
        })
      }

      // Log routing decision
      console.log(`[Router] Intent: ${intent} (confidence: ${confidence.toFixed(2)}) - Channel: ${data.channel}`)

      // Route to appropriate agent with error handling
      let response: any
      switch (intent) {
        case 'concierge':
          response = await conciergeAgent.handle(data)
          break
        case 'coverage_recommendation':
          response = await coverageAdvisorAgent.recommend(data.intake!)
          break
        default:
          // Fallback to concierge for unknown intents
          console.warn(`[Router] Unknown intent '${intent}', falling back to concierge`)
          response = await conciergeAgent.handle(data)
      }

      // Add routing metadata to response
      if (response.metadata) {
        response.metadata.processing_time_ms = Date.now() - startTime
        response.metadata.routing_confidence = confidence
      }

      return AgentResponse.parse(response)
    } catch (error: any) {
      console.error('[Router] Error:', error)
      
      // Return standardized error response
      return errorResponse('router', {
        code: error.name || 'ROUTER_ERROR',
        message: error.message || 'An error occurred processing your request',
        details: { stack: error.stack }
      })
    }
  }
}
