import { Profile, BrainResult, RankedPlan, BasePlan } from './types';

/**
 * The Insurance Brain: A deterministic rules engine.
 * No LLM calls allowed here. Pure TypeScript logic.
 */
export class InsuranceBrain {
    private plans: BasePlan[];

    constructor(seedPlans: BasePlan[]) {
        this.plans = seedPlans;
    }

    /**
     * Processes the profile to generate insurance recommendations.
     * @param referenceDate Optional date for testing deterministic deadline logic.
     */
    public process(profile: Profile, referenceDate: Date = new Date()): BrainResult {
        return {
            window: this.computeEnrollmentWindow(profile, referenceDate),
            eligibility: this.evaluateEligibility(profile),
            plans: this.rankPlans(profile),
            topRisk: this.getTopRisk(profile),
            nextAction: this.getNextBestAction(profile),
            sources: [
                'ACA Federal Guidelines 2024',
                'Newton Internal Plan Dataset v1.0',
                profile.state ? `${profile.state} Exchange Regulations` : 'Federal Marketplace Rules'
            ],
        };
    }

    private computeEnrollmentWindow(profile: Profile, today: Date) {
        const isSEP = !!profile.isNewcomer;

        // Standard Open Enrollment (OE) usually ends Jan 15th
        // If they are a newcomer, they typically have a 60-day window
        const oeDeadline = new Date(today.getFullYear(), 11, 15); // Dec 15
        const sepDeadline = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);

        return {
            type: isSEP ? 'Special Enrollment Period' : 'Open Enrollment',
            deadline: (isSEP ? sepDeadline : oeDeadline).toISOString().split('T')[0],
            specialEnrollment: isSEP,
        };
    }

    private evaluateEligibility(profile: Profile) {
        // Logic based on income band and household size
        const subsidyLikely = profile.incomeBand === 'low' || (profile.incomeBand === 'mid' && (profile.householdSize || 0) > 2);

        return {
            subsidyLikely,
            notes: subsidyLikely
                ? ['You likely qualify for Advanced Premium Tax Credits (APTC) based on household size and income.']
                : ['Based on current data, you may be above the standard subsidy threshold.'],
        };
    }

    private rankPlans(profile: Profile): RankedPlan[] {
        // Deterministic scoring logic
        return this.plans
            .map(plan => ({
                ...plan,
                suitabilityScore: this.calculateScore(profile, plan),
            }))
            .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
            .slice(0, 3);
    }

    private calculateScore(profile: Profile, plan: BasePlan): number {
        let score = 100;

        // Cost Affinity: Low income profiles prefer low premiums
        if (profile.incomeBand === 'low' && plan.monthlyPremium > 150) score -= 40;
        if (profile.incomeBand === 'high' && plan.networkTier === 'PPO') score += 20;

        // Coverage Match: Chronic conditions need broader networks or specific tiers
        if (profile.needs?.includes('chronic-condition')) {
            if (plan.networkTier === 'HMO') score -= 30;
            if (plan.networkTier === 'PPO') score += 20;
        }
        return score;
    }

    private getTopRisk(profile: Profile): string {
        if (profile.isNewcomer) {
            return "Missing the 60-day Special Enrollment window after arriving in the US.";
        }
        return "Underestimating out-of-pocket maximums on low-premium plans.";
    }

    private getNextBestAction(profile: Profile): string {
        if (profile.isNewcomer) {
            return "Gather your immigration documents (I-94 or Visa) for eligibility verification.";
        }
        return "Compare the summary of benefits for the top two ranked plans.";
    }
}
