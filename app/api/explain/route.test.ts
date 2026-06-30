import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { BrainResult } from '../../../lib/brain/types';
import type { POST as PostHandler } from './route';

// This route falls back to a deterministic template whenever
// ANTHROPIC_API_KEY is unset, which is the case in CI. These tests cover
// that fallback path (request validation + template rendering per
// language). The live Claude call path isn't covered here — it would need
// network mocking of the Anthropic SDK.
const previousApiKey = process.env.ANTHROPIC_API_KEY;
let POST: typeof PostHandler;

before(async () => {
  delete process.env.ANTHROPIC_API_KEY;
  ({ POST } = await import('./route'));
});

after(() => {
  if (previousApiKey !== undefined) process.env.ANTHROPIC_API_KEY = previousApiKey;
});

const sampleBrainResult: BrainResult = {
  window: { type: 'Annual Open Enrollment Period', deadline: '2027-01-15', specialEnrollment: false },
  eligibility: { subsidyLikely: true, notes: ['Sample eligibility note.'] },
  plans: [
    { id: 'p1', name: 'Newton Choice Gold PPO', monthlyCost: 640, covers: [], excludes: [], networkTier: 'PPO', provider: 'Newton Insurance', score: 130 },
    { id: 'p2', name: 'Newton Essential Silver HMO', monthlyCost: 450, covers: [], excludes: [], networkTier: 'HMO', provider: 'Newton Insurance', score: 110 },
    { id: 'p3', name: 'Newton Care Bronze HMO', monthlyCost: 320, covers: [], excludes: [], networkTier: 'HMO', provider: 'Newton Insurance', score: 90 },
  ],
  topRisk: 'Sample top risk description.',
  nextAction: 'Sample next action.',
  sources: ['Test source'],
};

function postRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/explain (fallback template path)', () => {
  test('renders an English fallback explanation referencing only Brain values', async () => {
    const res = await POST(postRequest({ brainResult: sampleBrainResult, language: 'en' }));
    assert.strictEqual(res.status, 200);
    const json = await res.json();

    assert.strictEqual(json.isFallback, true);
    assert.match(json.explanation, /Newton Choice Gold PPO/);
    assert.match(json.explanation, /640/);
    assert.match(json.explanation, /2027-01-15/);
    assert.match(json.explanation, /licensed advisor/);
  });

  test('renders Spanish and Arabic explanations without invoking the LLM', async () => {
    const esRes = await POST(postRequest({ brainResult: sampleBrainResult, language: 'es' }));
    const esJson = await esRes.json();
    assert.strictEqual(esJson.isFallback, true);
    assert.match(esJson.explanation, /Newton Choice Gold PPO/);

    const arRes = await POST(postRequest({ brainResult: sampleBrainResult, language: 'ar' }));
    const arJson = await arRes.json();
    assert.strictEqual(arJson.isFallback, true);
    assert.match(arJson.explanation, /Newton Choice Gold PPO/);
  });

  test('rejects a request missing brainResult', async () => {
    const res = await POST(postRequest({ language: 'en' }));
    assert.strictEqual(res.status, 400);
  });
});
