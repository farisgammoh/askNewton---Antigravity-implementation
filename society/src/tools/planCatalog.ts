export type Plan = {
  id: string
  name: string
  metal: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  premium: number
  oop_max: number
  network: string[] // provider IDs or names (stub)
}

const MOCK_PLANS: Plan[] = [
  { id: 'p1', name: 'Nomad Bronze 4500', metal: 'Bronze', premium: 320, oop_max: 9000, network: ['Dr. Lee', 'Dr. Patel'] },
  { id: 'p2', name: 'Student Silver 2500', metal: 'Silver', premium: 410, oop_max: 6500, network: ['Dr. Gomez', 'Dr. Lee'] },
  { id: 'p3', name: 'Traveler Gold 1500', metal: 'Gold', premium: 530, oop_max: 4500, network: ['Dr. Chen', 'Dr. Rivera'] }
]

export async function findPlans(params: { zip: string; age: number; doctors: string[]; meds: string[]; budget?: number }) {
  // Simple filter by budget and doctor hits
  let plans = MOCK_PLANS
  if (params.budget) plans = plans.filter(p => p.premium <= params.budget! + 50)
  plans = plans.sort((a, b) => a.premium - b.premium)
  return plans
}
