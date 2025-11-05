import { z } from 'zod'

export const IntakeProfile = z.object({
  person: z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    age: z.number().int().min(0),
    email: z.string().email().optional()
  }),
  residency: z.object({
    state: z.string().length(2),
    zip: z.string().min(5).max(10),
    visa_status: z.string().optional(),
    student: z.boolean().optional()
  }),
  household: z.object({
    size: z.number().int().min(1),
    dependents: z.number().int().min(0).default(0),
    income_range: z.string().optional()
  }),
  doctors: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  budget_usd_monthly: z.number().int().optional(),
  preferences: z.object({
    mental_health: z.boolean().optional(),
    pcp_required: z.boolean().optional()
  }).partial().default({})
})

export type IntakeProfileT = z.infer<typeof IntakeProfile>
