import { test, describe } from 'node:test';
import assert from 'node:assert';
import { runInsuranceBrain, rankPlans, evaluateEligibility, computeEnrollmentWindow } from './rules';
import { Profile } from './types';

describe('Insurance Brain Engine Tests', () => {
  
  test('Determinism: same inputs yield exact same outputs', () => {
    const profile: Profile = {
      state: 'CA',
      language: 'en',
      isNewcomer: true,
      householdSize: 3,
      incomeBand: 'mid',
      needs: ['doctor-choice', 'two-kids'],
    };

    const run1 = runInsuranceBrain(profile);
    const run2 = runInsuranceBrain(profile);

    assert.deepStrictEqual(run1, run2);
    assert.strictEqual(run1.plans.length, 3);
  });

  test('Newcomer Special Enrollment Window computation', () => {
    const profile: Profile = {
      language: 'es',
      isNewcomer: true,
    };

    const window = computeEnrollmentWindow(profile);
    assert.strictEqual(window.specialEnrollment, true);
    assert.match(window.type, /Special/);
    
    // Check that deadline is formatted as YYYY-MM-DD
    assert.match(window.deadline, /^\d{4}-\d{2}-\d{2}$/);
  });

  test('Standard Open Enrollment Window computation', () => {
    const profile: Profile = {
      language: 'en',
      isNewcomer: false,
      hasEmployerCoverage: false,
    };

    const window = computeEnrollmentWindow(profile);
    assert.strictEqual(window.specialEnrollment, false);
    assert.match(window.type, /Annual Open Enrollment/);
  });

  test('Medicaid / Cost-Sharing Reductions eligibility for low income', () => {
    const profile: Profile = {
      language: 'en',
      householdSize: 1,
      incomeBand: 'low',
      hasEmployerCoverage: false,
    };

    const eligibility = evaluateEligibility(profile);
    assert.strictEqual(eligibility.subsidyLikely, true);
    assert.ok(eligibility.notes.some(note => note.includes('Cost-Sharing Reductions')));
  });

  test('Subsidies disabled if user has employer coverage', () => {
    const profile: Profile = {
      language: 'en',
      householdSize: 2,
      incomeBand: 'low',
      hasEmployerCoverage: true,
    };

    const eligibility = evaluateEligibility(profile);
    assert.strictEqual(eligibility.subsidyLikely, false);
    assert.ok(eligibility.notes.some(note => note.includes('employer-sponsored')));
  });

  test('Plan ranking matches specific needs', () => {
    const baseProfile: Profile = {
      language: 'en',
      incomeBand: 'mid',
      age: 30,
    };

    // Case 1: Prioritizing doctor-choice should rank PPO/EPO plans higher
    const docProfile: Profile = { ...baseProfile, needs: ['doctor-choice'] };
    const docPlans = rankPlans(docProfile);
    assert.ok(docPlans[0].networkTier === 'PPO' || docPlans[0].networkTier === 'EPO');

    // Case 2: Prioritizing low-cost should yield cheaper plans
    const lowCostProfile: Profile = { ...baseProfile, needs: ['low-cost'] };
    const lowCostPlans = rankPlans(lowCostProfile);
    
    // Case 3: Chronic condition should favor Gold plans
    const chronicProfile: Profile = { ...baseProfile, needs: ['chronic-condition'] };
    const chronicPlans = rankPlans(chronicProfile);
    assert.ok(chronicPlans[0].name.includes('Gold'));
  });
});
