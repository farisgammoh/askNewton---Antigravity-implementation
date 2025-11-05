import { z } from 'zod'
import { conciergeAgent } from '../agents/concierge.js'
import { coverageAdvisorAgent } from '../agents/coverageAdvisor.js'
import { IntakeProfile } from '../schemas/intakeProfile.js'

const GatewayPayload = z.object({
  channel: z.string().default('web'),
  intent: z.string().optional(),
  message: z.string().optional(),
  intake: IntakeProfile.optional(),
  context: z.record(z.any()).optional()
})

export const router = {
  async handle(payload: any) {
    const data = GatewayPayload.parse(payload)

    // Simple planner/router: prefer intent if provided, else infer
    const intent = data.intent ?? inferIntent(data)

    switch (intent) {
      case 'concierge':
        return await conciergeAgent.handle(data)
      case 'coverage_recommendation':
        if (!data.intake) throw new Error('Missing intake for coverage recommendation')
        return await coverageAdvisorAgent.recommend(data.intake)
      default:
        // Fallback to concierge
        return await conciergeAgent.handle(data)
    }
  }
}

function inferIntent(d: z.infer<typeof GatewayPayload>): string {
  const msg = (d.message || '').toLowerCase()
  if (msg.includes('recommend') || msg.includes('plan')) return 'coverage_recommendation'
  return 'concierge'
}
