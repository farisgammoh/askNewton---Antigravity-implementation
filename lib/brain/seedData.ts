// Illustrative sample data for askNewton
// In a production environment, this could be loaded from a database or external API.

export interface SamplePlan {
  id: string;
  name: string;
  baseMonthlyCost: number; // Cost at age 21
  covers: string[];
  excludes: string[];
  networkTier: 'HMO' | 'PPO' | 'EPO';
  provider: string;
  description: string;
}

// 2024 HHS Federal Poverty Level (FPL) Guidelines for the 48 contiguous
// states and DC (annual income). NOT yet updated to the current plan year —
// confirm against the latest HHS poverty guidelines before relying on this
// for real eligibility determinations.
// IMPORTANT: Alaska and Hawaii have separate, higher FPL tables under
// federal guidelines. This table does not include those figures; treat any
// AK/HI household as unsupported until that data is added.
export const FPL_TABLE: Record<number, number> = {
  1: 15060,
  2: 20440,
  3: 25820,
  4: 31200,
  5: 36580,
  6: 41960,
  7: 47340,
  8: 52720,
};

export function getFPLForHousehold(size: number, state?: string): number {
  if (state === 'AK' || state === 'HI') {
    throw new Error(
      `getFPLForHousehold: Alaska/Hawaii FPL increments are not yet implemented (state=${state}). Refusing to return a contiguous-US figure for this household.`
    );
  }
  const baseSize = Math.max(1, Math.min(8, Math.floor(size)));
  const baseValue = FPL_TABLE[baseSize];
  if (size > 8) {
    return baseValue + (size - 8) * 5380;
  }
  return baseValue;
}

// ACA Standard Age Factors (simplified curve)
// Multiplier for base plan costs based on age
export const ACA_AGE_CURVE: Record<number, number> = {
  0: 0.635, // 0-14
  15: 0.635,
  21: 1.000, // Standard anchor age
  30: 1.135,
  40: 1.278,
  50: 1.786,
  60: 2.714,
  64: 3.000, // Age 64+ is capped at 3x
};

export function getAgeMultiplier(age: number): number {
  if (age <= 14) return 0.635;
  if (age >= 64) return 3.000;
  
  // Find closest bracket or interpolate
  const ages = Object.keys(ACA_AGE_CURVE).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < ages.length - 1; i++) {
    const ageStart = ages[i];
    const ageEnd = ages[i + 1];
    if (age >= ageStart && age <= ageEnd) {
      const factorStart = ACA_AGE_CURVE[ageStart];
      const factorEnd = ACA_AGE_CURVE[ageEnd];
      // Linear interpolation
      return factorStart + ((age - ageStart) / (ageEnd - ageStart)) * (factorEnd - factorStart);
    }
  }
  return 1.0;
}

export const SEED_PLANS: SamplePlan[] = [
  {
    id: 'plan-newton-bronze-hmo',
    name: 'Newton Care Bronze HMO',
    baseMonthlyCost: 320,
    description: 'Affordable monthly premium with higher out-of-pocket costs for medical visits. Ideal for healthy individuals needing protection against major emergencies.',
    covers: [
      'Preventive care visits (100% covered)',
      'Generic prescription drugs (after deductible)',
      'Emergency room services (50% co-insurance)',
      'Telehealth visits (flat $20 copay)'
    ],
    excludes: [
      'Out-of-network care (except emergencies)',
      'Brand-name prescription drugs',
      'Adult dental and vision care',
      'Acupuncture and chiropractic therapy'
    ],
    networkTier: 'HMO',
    provider: 'Newton Insurance'
  },
  {
    id: 'plan-newton-essential-silver-hmo',
    name: 'Newton Essential Silver HMO',
    baseMonthlyCost: 450,
    description: 'Balanced premiums and co-pays. The most popular plan tier, eligible for Cost-Sharing Reductions (CSR) if you qualify.',
    covers: [
      'Preventive care visits (100% covered)',
      'Primary care doctor visits (flat $30 copay)',
      'Generic prescription drugs ($15 copay)',
      'Specialist doctor visits ($60 copay)',
      'Mental health counseling ($30 copay)'
    ],
    excludes: [
      'Out-of-network provider visits',
      'Cosmetic medical procedures',
      'Adult dental and vision care',
      'Weight-loss programs'
    ],
    networkTier: 'HMO',
    provider: 'Newton Insurance'
  },
  {
    id: 'plan-newton-active-silver-ppo',
    name: 'Newton Active Silver PPO',
    baseMonthlyCost: 510,
    description: 'Moderate monthly premiums with the flexibility to see out-of-network doctors without referrals.',
    covers: [
      'Preventive care visits (100% covered)',
      'In-network primary care visits ($35 copay)',
      'Out-of-network doctor visits (covered at 50%)',
      'Generic & preferred brand drugs',
      'Specialist visits without referrals ($65 copay)'
    ],
    excludes: [
      'Non-preferred brand name drugs',
      'Adult dental and vision care',
      'Experimental clinical trials',
      'Cosmetic surgeries'
    ],
    networkTier: 'PPO',
    provider: 'Newton Insurance'
  },
  {
    id: 'plan-newton-saver-bronze-epo',
    name: 'Newton Saver Bronze EPO',
    baseMonthlyCost: 360,
    description: 'Exclusively uses the Newton Provider Network, but does not require primary care physician referrals to see in-network specialists.',
    covers: [
      'Preventive care visits (100% covered)',
      'In-network specialist visits ($50 copay, no referral)',
      'Generic prescription drugs ($10 copay)',
      'Emergency medical transportation'
    ],
    excludes: [
      'Any out-of-network care (0% coverage)',
      'Brand-name prescription drugs',
      'Adult dental and vision care',
      'Private nursing care'
    ],
    networkTier: 'EPO',
    provider: 'Newton Insurance'
  },
  {
    id: 'plan-newton-premier-gold-hmo',
    name: 'Newton Premier Gold HMO',
    baseMonthlyCost: 580,
    description: 'Higher premium with very low copays and zero deductible for medical care. Perfect if you have frequent doctor visits or chronic conditions.',
    covers: [
      'Preventive care visits (100% covered)',
      'Primary care doctor visits (flat $15 copay)',
      'Specialist doctor visits ($30 copay)',
      'Generic and brand-name prescription drugs ($10/$35 copay)',
      'Maternity and prenatal care (fully covered)',
      'Hospital stays ($250 per day copay)'
    ],
    excludes: [
      'Out-of-network care (except emergencies)',
      'Adult dental and vision care',
      'Alternative medicine (acupuncture/homeopathy)',
      'Elective cosmetic procedures'
    ],
    networkTier: 'HMO',
    provider: 'Newton Insurance'
  },
  {
    id: 'plan-newton-choice-gold-ppo',
    name: 'Newton Choice Gold PPO',
    baseMonthlyCost: 640,
    description: 'Premium plan providing maximum flexibility. Excellent out-of-network coverage, low deductibles, and no referrals required.',
    covers: [
      'Preventive care visits (100% covered)',
      'In-network primary care visits ($20 copay)',
      'Out-of-network provider visits (covered at 70%)',
      'Generic, preferred brand, and specialty drugs',
      'Physical and occupational therapy ($30 copay)',
      'Specialist visits without referrals ($40 copay)'
    ],
    excludes: [
      'Cosmetic treatments',
      'Adult routine dental and vision care',
      'Over-the-counter non-prescription drugs',
      'Custodial nursing home care'
    ],
    networkTier: 'PPO',
    provider: 'Newton Insurance'
  }
];
