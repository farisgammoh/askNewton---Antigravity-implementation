export type Profile = {
  state?: string;
  language: 'en' | 'es' | 'ar';
  isNewcomer?: boolean;
  householdSize?: number;
  incomeBand?: 'low' | 'mid' | 'high';
  hasEmployerCoverage?: boolean;
  needs?: string[]; // e.g. ['chronic-condition', 'two-kids', 'low-cost', 'doctor-choice']
  age?: number;
};

export type RankedPlan = {
  id: string;
  name: string;
  monthlyCost: number; // dynamically computed or base cost
  covers: string[];
  excludes: string[];
  networkTier: 'HMO' | 'PPO' | 'EPO';
  provider: string;
  score: number;
};

export type BrainResult = {
  window: {
    type: string;
    deadline: string;
    specialEnrollment: boolean;
  };
  eligibility: {
    subsidyLikely: boolean;
    notes: string[];
  };
  plans: RankedPlan[]; // exactly the shortlist, with cost/covers/excludes
  topRisk: string;
  nextAction: string;
  sources: string[]; // dataset + rule references for traceability
};
