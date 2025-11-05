import { z } from 'zod'
import { IntakeProfile } from '../schemas/intakeProfile.js'
import { PlanRecommendationSet } from '../schemas/recommendation.js'
import { findPlans } from '../tools/planCatalog.js'
import { inNetworkHits } from '../tools/providerDir.js'
import { openai } from '../utils/openai.js'

export const coverageAdvisorAgent = {
  async recommend(intake: z.infer<typeof IntakeProfile>) {
    const plans = await findPlans({
      zip: intake.residency.zip,
      age: intake.person.age,
      doctors: intake.doctors,
      meds: intake.medications,
      budget: intake.budget_usd_monthly
    })

    // Compute simple estimates and in-network hits
    const shortlist = await Promise.all(plans.slice(0, 3).map(async p => {
      const hits = await inNetworkHits(p.network, intake.doctors)
      const estAnnualCost = p.premium * 12 // + (very rough heuristic for utilization omitted)
      return {
        plan_id: p.id,
        name: p.name,
        monthly_premium: p.premium,
        oop_max: p.oop_max,
        est_annual_cost: estAnnualCost,
        in_network_hits: hits,
        pros_cons: {
          pros: [
            `Lower premium for ${p.metal}`
          ], cons: [
            `OOP max up to $${p.oop_max}`
          ]
        },
        explanation: ''
      }
    }))

    // Ask LLM to generate human explanation for each plan
    const explanationPrompt = `Create short, plain-English explanations (<=80 words each) for these plans given the user profile.
User: ${JSON.stringify(intake, null, 2)}
Plans: ${JSON.stringify(shortlist.map(p => ({ id: p.plan_id, name: p.name, premium: p.monthly_premium, oop_max: p.oop_max, hits: p.in_network_hits })), null, 2)}`

    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You help consumers compare health plans clearly and neutrally.' },
        { role: 'user', content: explanationPrompt }
      ]
    })

    const lines = (resp.choices[0].message.content || '').split(/\n+/).filter(Boolean)
    for (let i = 0; i < shortlist.length; i++) {
      shortlist[i].explanation = lines[i] || 'Good balance of cost and coverage.'
    }

    const recommendation = { shortlist }
    return PlanRecommendationSet.parse(recommendation)
  }
}
