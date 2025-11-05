import { z } from 'zod'
import { IntakeProfile } from '../schemas/intakeProfile.js'
import { PlanRecommendationSet } from '../schemas/recommendation.js'
import { findPlans } from '../tools/planCatalog.js'
import { inNetworkHits } from '../tools/providerDir.js'
import { openai } from '../utils/openai.js'
import { successResponse, errorResponse, partialResponse } from '../schemas/agentResponse.js'

const TIMEOUT_MS = 45000
const MAX_RETRIES = 2

export const coverageAdvisorAgent = {
  async recommend(intake: z.infer<typeof IntakeProfile>) {
    const startTime = Date.now()
    
    try {
      // Step 1: Find plans with error handling
      let plans
      try {
        plans = await findPlans({
          zip: intake.residency.zip,
          age: intake.person.age,
          doctors: intake.doctors,
          meds: intake.medications,
          budget: intake.budget_usd_monthly
        })

        if (!plans || plans.length === 0) {
          return partialResponse('coverage_advisor', {
            shortlist: [],
            message: 'No plans found matching your criteria. Please try adjusting your budget or location.'
          }, ['No matching plans found'])
        }
      } catch (err: any) {
        console.error('[CoverageAdvisor] Plan search failed:', err)
        return errorResponse('coverage_advisor', {
          code: 'PLAN_SEARCH_FAILED',
          message: 'Unable to search for plans',
          details: { error: err.message }
        })
      }

      // Step 2: Compute estimates and in-network hits
      const shortlist = await Promise.all(plans.slice(0, 3).map(async p => {
        try {
          const hits = await inNetworkHits(p.network, intake.doctors)
          const estAnnualCost = p.premium * 12 // TODO: Add utilization heuristics
          
          return {
            plan_id: p.id,
            name: p.name,
            monthly_premium: p.premium,
            oop_max: p.oop_max,
            est_annual_cost: estAnnualCost,
            in_network_hits: hits,
            pros_cons: {
              pros: [
                `${p.metal} tier coverage`,
                hits.length > 0 ? `${hits.length} of your doctors in-network` : 'Comprehensive network'
              ],
              cons: [
                `Out-of-pocket max: $${p.oop_max.toLocaleString()}`,
                p.premium > (intake.budget_usd_monthly || 0) ? 'Above budget' : undefined
              ].filter(Boolean) as string[]
            },
            explanation: '' // Will be filled by LLM
          }
        } catch (err) {
          console.warn('[CoverageAdvisor] Error processing plan:', p.id, err)
          return null
        }
      }))

      const validPlans = shortlist.filter(p => p !== null)
      if (validPlans.length === 0) {
        return errorResponse('coverage_advisor', {
          code: 'PLAN_PROCESSING_FAILED',
          message: 'Unable to process plan details'
        })
      }

      // Step 3: Generate LLM explanations with structured output and retry
      let explanations: string[] = []
      let lastError: any
      
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const explanationPrompt = {
            role: 'system',
            content: `You are a health insurance expert. Generate exactly ${validPlans.length} short explanations (max 80 words each) for these plans.
Format: Return ONLY a JSON array of strings, one explanation per plan, in the same order as the input plans.
Focus on: who the plan is best for, key benefits, and any trade-offs.
Tone: Neutral, helpful, conversational.`
          }

          const planSummaries = validPlans.map(p => ({
            name: p!.name,
            premium: p!.monthly_premium,
            oop_max: p!.oop_max,
            in_network_doctors: p!.in_network_hits
          }))

          const resp = await Promise.race([
            openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [
                explanationPrompt as any,
                { 
                  role: 'user', 
                  content: `User profile: Age ${intake.person.age}, Budget $${intake.budget_usd_monthly || 'flexible'}/month, ${intake.doctors.length} preferred doctors\n\nPlans to explain:\n${JSON.stringify(planSummaries, null, 2)}` 
                }
              ],
              response_format: { type: 'json_object' },
              temperature: 0.7
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('LLM timeout')), TIMEOUT_MS)
            )
          ]) as any

          const content = resp.choices[0]?.message?.content
          if (!content) throw new Error('Empty LLM response')

          // Parse structured response
          const parsed = JSON.parse(content)
          explanations = parsed.explanations || Object.values(parsed)
          
          if (!Array.isArray(explanations) || explanations.length === 0) {
            throw new Error('Invalid explanation format')
          }

          break // Success!
        } catch (err: any) {
          lastError = err
          console.warn(`[CoverageAdvisor] LLM explanation attempt ${attempt + 1}/${MAX_RETRIES} failed:`, err.message)
          
          if (attempt < MAX_RETRIES - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      }

      // Apply explanations (with fallbacks)
      for (let i = 0; i < validPlans.length; i++) {
        validPlans[i]!.explanation = explanations[i] || 
          `This ${validPlans[i]!.name} plan offers a good balance of monthly cost ($${validPlans[i]!.monthly_premium}) and out-of-pocket protection (max $${validPlans[i]!.oop_max.toLocaleString()}).`
      }

      // Validate final output
      const recommendation = { shortlist: validPlans }
      const validated = PlanRecommendationSet.parse(recommendation)

      return successResponse('coverage_advisor', validated, {
        processing_time_ms: Date.now() - startTime,
        model_used: 'gpt-4o-mini',
        plans_considered: plans.length,
        plans_returned: validPlans.length,
        warnings: lastError ? ['LLM explanations used fallback'] : undefined
      })

    } catch (error: any) {
      console.error('[CoverageAdvisor] Critical error:', error)
      return errorResponse('coverage_advisor', {
        code: error.name || 'ADVISOR_ERROR',
        message: 'Unable to generate plan recommendations',
        details: { error: error.message }
      })
    }
  }
}
