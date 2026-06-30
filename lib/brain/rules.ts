import { Profile, RankedPlan, BrainResult } from './types';
import { SEED_PLANS, getAgeMultiplier, getFPLForHousehold } from './seedData';

// Helper to get today's date formatted as YYYY-MM-DD
function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Add days to a date and return YYYY-MM-DD
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the enrollment window, deadline date, and SEP status.
 */
export function computeEnrollmentWindow(profile: Profile): {
  type: string;
  deadline: string;
  specialEnrollment: boolean;
} {
  const today = getTodayString();
  
  if (profile.isNewcomer) {
    // Newcomers get a 60-day Special Enrollment Period starting from entry date.
    // For the UI, we compute 60 days from "today" as the demonstration deadline.
    return {
      type: 'Special Enrollment Period (Newcomer)',
      deadline: addDays(today, 60),
      specialEnrollment: true,
    };
  }

  if (profile.hasEmployerCoverage === false) {
    // Standard Open Enrollment in the US: Nov 1 to Jan 15.
    // Let's deterministically target the upcoming/current enrollment window.
    const currentYear = new Date().getFullYear();
    return {
      type: 'Annual Open Enrollment Period',
      deadline: `${currentYear + 1}-01-15`, // Standard end date (Jan 15 of next year)
      specialEnrollment: false,
    };
  }

  // If they have employer coverage, their window is governed by their employer's schedule.
  return {
    type: 'Employer Enrollment Period / Qualifying Life Event',
    deadline: 'Refer to your employer human resources benefits schedule',
    specialEnrollment: false,
  };
}

/**
 * Evaluates ACA subsidy eligibility using household size and estimated income band.
 */
export function evaluateEligibility(profile: Profile): {
  subsidyLikely: boolean;
  notes: string[];
} {
  const size = profile.householdSize || 1;
  const fpl = getFPLForHousehold(size, profile.state);
  const notes: string[] = [];

  // NOTE: estimatedFplPct bands and the 8.39% affordability threshold below
  // are simplified placeholders, not the IRS applicable-percentage sliding
  // scale. Treat all subsidy figures here as illustrative estimates only —
  // see lib/brain/seedData.ts FPL_TABLE notes for current known gaps.

  if (profile.hasEmployerCoverage) {
    notes.push('Since you have employer-sponsored coverage, you generally do not qualify for premium tax credits unless your employer plan is deemed unaffordable (exceeds approximately 8.39% of household income, per the most recently published IRS affordability percentage — confirm the current year\'s figure before relying on this).');
    return {
      subsidyLikely: false,
      notes,
    };
  }

  notes.push(`Based on your household size of ${size}, 100% of the Federal Poverty Level (FPL) is $${fpl.toLocaleString()} (2024 HHS guideline for the 48 contiguous states/DC — illustrative estimate, not the current plan year's confirmed figure).`);

  if (profile.incomeBand === 'low') {
    notes.push('Your estimated household income is below 150% of the FPL. You likely qualify for Silver-tier Cost-Sharing Reductions (CSR) which significantly lower deductibles, and near-zero premium plans.');
    return {
      subsidyLikely: true,
      notes,
    };
  }

  if (profile.incomeBand === 'mid') {
    notes.push('Your estimated household income (150% - 400% FPL) makes you eligible for Advanced Premium Tax Credits (APTC) to discount your monthly insurance premiums.');
    return {
      subsidyLikely: true,
      notes,
    };
  }

  notes.push('Your income is in the higher band (above 400% FPL). You can buy any marketplace plan, but government premium subsidies may be minimal or phased out.');
  return {
    subsidyLikely: false,
    notes,
  };
}

/**
 * Computes deterministic score and monthly premium, then returns top 3 ranked plans.
 */
export function rankPlans(profile: Profile, ageOverride?: number): RankedPlan[] {
  const age = ageOverride ?? profile.age ?? 30; // default to age 30
  const ageMultiplier = getAgeMultiplier(age);
  const eligibility = evaluateEligibility(profile);
  
  // Calculate potential subsidy discount
  let subsidyDiscount = 0;
  if (eligibility.subsidyLikely) {
    if (profile.incomeBand === 'low') {
      subsidyDiscount = 0.75; // 75% off premiums
    } else if (profile.incomeBand === 'mid') {
      subsidyDiscount = 0.40; // 40% off premiums
    }
  }

  const scoredPlans: RankedPlan[] = SEED_PLANS.map((plan) => {
    // 1. Calculate dynamic cost based on age and subsidies
    const rawCost = plan.baseMonthlyCost * ageMultiplier;
    const finalCost = Math.round(Math.max(15, rawCost * (1 - subsidyDiscount)));

    // 2. Compute deterministic score
    let score = 100;

    // Adjust score based on cost vs income band
    if (profile.incomeBand === 'low') {
      // Prioritize low monthly cost
      score += (600 - finalCost) * 0.1;
      if (plan.name.includes('Bronze')) score += 15;
    } else if (profile.incomeBand === 'high') {
      // Prioritize richer coverage
      if (plan.name.includes('Gold')) score += 20;
      if (plan.networkTier === 'PPO') score += 10;
    }

    // Apply specific needs modifiers
    const needs = profile.needs || [];
    
    if (needs.includes('low-cost')) {
      score += (600 - finalCost) * 0.2;
      if (plan.name.includes('Bronze')) score += 25;
      if (plan.name.includes('Gold')) score -= 20;
    }

    if (needs.includes('chronic-condition')) {
      // Gold and PPO plans are preferred for chronic illnesses
      if (plan.name.includes('Gold')) score += 30;
      if (plan.networkTier === 'PPO') score += 15;
      if (plan.name.includes('Bronze')) score -= 25;
    }

    if (needs.includes('two-kids')) {
      // Silver plans often provide standard pediatric dental/copays, Gold provides security
      if (plan.name.includes('Silver')) score += 20;
      if (plan.name.includes('Gold')) score += 15;
      if (plan.name.includes('Bronze')) score -= 15;
    }

    if (needs.includes('doctor-choice')) {
      // PPO/EPO are much better for choosing own doctors
      if (plan.networkTier === 'PPO') score += 30;
      if (plan.networkTier === 'EPO') score += 15;
      if (plan.networkTier === 'HMO') score -= 20;
    }

    return {
      id: plan.id,
      name: plan.name,
      monthlyCost: finalCost,
      covers: plan.covers,
      excludes: plan.excludes,
      networkTier: plan.networkTier,
      provider: plan.provider,
      score: Math.round(score),
    };
  });

  // Sort by score descending, then by cost ascending if tied
  return scoredPlans
    .sort((a, b) => b.score - a.score || a.monthlyCost - b.monthlyCost)
    .slice(0, 3); // Top 3 plans only
}

/**
 * Identifies the top risk vector for a user profile.
 */
export function topRiskForProfile(profile: Profile): string {
  if (profile.isNewcomer) {
    return 'Assuming travel or temporary expatriate insurance satisfies US legal requirements. Temporary travel policies do not cover pre-existing conditions, preventative care, or meet the regulatory compliance of standard ACA plans, leaving you exposed to out-of-pocket costs.';
  }
  
  if (profile.incomeBand === 'low' && !profile.hasEmployerCoverage) {
    return 'Choosing a Bronze-tier plan solely because of its low premium. By doing so, you may forfeit federal "Cost-Sharing Reductions" (CSR) that are legally restricted to Silver-tier plans, which can reduce your medical deductible from $7,500 down to under $500.';
  }

  const needs = profile.needs || [];
  if (needs.includes('chronic-condition') || needs.includes('doctor-choice')) {
    return 'Selecting an HMO plan without checking the specific network directory. If your primary specialist or local hospital is out-of-network, HMO networks exclude coverage entirely, forcing you to pay 100% of costs.';
  }

  if (profile.hasEmployerCoverage) {
    return 'Missing your employer\'s narrow annual selection window (usually 2-3 weeks in autumn). Missing this deadline locks you into your current plan or leaves you without coverage for the entire upcoming year unless you experience a major life event like marriage or child birth.';
  }

  return 'Failing to submit required income or residency proof documents to the Marketplace exchange within 90 days of enrollment. If verification documents are missed, the state system will terminate your financial subsidies, retroactively raising your monthly premium.';
}

/**
 * Computes the concrete next best action for the user.
 */
export function nextBestAction(profile: Profile): string {
  if (profile.isNewcomer) {
    return 'Locate your immigration landing documents (Visa status page, I-94 record, or Green Card) and entry date stamp. You will need to upload these to prove your Special Enrollment Period eligibility.';
  }

  if (profile.incomeBand === 'low') {
    return 'Prepare a household income estimate using recent pay stubs or a jobs offer letter. Silver plans with Cost-Sharing Reductions will require documentation of your income range.';
  }

  if (profile.hasEmployerCoverage) {
    return 'Request the Summary of Benefits and Coverage (SBC) from your employer\'s HR department to compare co-pays and deductibles against Marketplace standard options.';
  }

  return 'Set up a verified user account on Healthcare.gov (or your state-specific exchange) to complete identity verification and preview local plan pricing.';
}

/**
 * Main query entry point for the Insurance Brain.
 */
export function runInsuranceBrain(profile: Profile): BrainResult {
  const window = computeEnrollmentWindow(profile);
  const eligibility = evaluateEligibility(profile);
  const plans = rankPlans(profile);
  const topRisk = topRiskForProfile(profile);
  const nextAction = nextBestAction(profile);

  return {
    window,
    eligibility,
    plans,
    topRisk,
    nextAction,
    sources: [
      'Affordable Care Act (ACA) Federal poverty level guidelines (2024 HHS figures, illustrative)',
      'Standard Age Curve Adjustment factor table',
      'Newton Insurance Seed Marketplace Plan Database v1.0',
      profile.isNewcomer ? 'Special Enrollment Rules (8 CFR § 214.1)' : 'Standard Open Enrollment rules (45 CFR § 155.410)',
    ],
  };
}
