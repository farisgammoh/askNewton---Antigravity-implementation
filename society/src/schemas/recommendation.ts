import { z } from 'zod'

export const PlanOption = z.object({
  plan_id: z.string(),
  name: z.string(),
  monthly_premium: z.number(),
  oop_max: z.number(),
  est_annual_cost: z.number(),
  in_network_hits: z.array(z.string()),
  pros_cons: z.object({
    pros: z.array(z.string()),
    cons: z.array(z.string())
  }),
  explanation: z.string()
})

export const PlanRecommendationSet = z.object({
  shortlist: z.array(PlanOption).min(1),
  comparison_table: z.array(z.record(z.string(), z.string())).optional()
})

export type PlanRecommendationSetT = z.infer<typeof PlanRecommendationSet>
