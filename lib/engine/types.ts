export type Profile = {
    state?: string;
    language: 'en' | 'es' | 'ar';
    isNewcomer?: boolean;
    householdSize?: number;
    incomeBand?: 'low' | 'mid' | 'high';
    hasEmployerCoverage?: boolean;
    needs?: string[]; // e.g. ['chronic-condition', 'two-kids']
    age?: number;
};

export type BasePlan = Omit<RankedPlan, 'suitabilityScore'>;

export type RankedPlan = {
    id: string;
    name: string;
    monthlyPremium: number;
    coverage: string[];
    exclusions: string[];
    networkTier: 'HMO' | 'PPO' | 'EPO';
    suitabilityScore: number;
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
    plans: RankedPlan[];
    topRisk: string;
    nextAction: string;
    sources: string[];
};
