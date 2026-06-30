import { test, describe } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { POST } from './route';

function postRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/recommend', () => {
  test('runs the deterministic Brain server-side and returns a BrainResult', async () => {
    const res = await POST(
      postRequest({
        state: 'CA',
        language: 'en',
        householdSize: 2,
        incomeBand: 'mid',
        hasEmployerCoverage: false,
        age: 35,
      })
    );

    assert.strictEqual(res.status, 200);
    const json = await res.json();

    assert.ok(json.window?.deadline);
    assert.ok(json.eligibility);
    assert.strictEqual(json.plans.length, 3);
    assert.ok(typeof json.topRisk === 'string' && json.topRisk.length > 0);
    assert.ok(typeof json.nextAction === 'string' && json.nextAction.length > 0);
    assert.ok(Array.isArray(json.sources) && json.sources.length > 0);
  });

  test('defaults missing language to en without crashing', async () => {
    const res = await POST(postRequest({ householdSize: 1, incomeBand: 'low' }));
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.plans.length, 3);
  });

  test('rejects a non-object profile body', async () => {
    const res = await POST(postRequest(null));
    assert.strictEqual(res.status, 400);
  });

  test('throws a clear error for Alaska/Hawaii households (unsupported FPL data)', async () => {
    const res = await POST(
      postRequest({ state: 'AK', language: 'en', householdSize: 2, incomeBand: 'low' })
    );
    assert.strictEqual(res.status, 500);
    const json = await res.json();
    assert.match(json.details, /Alaska\/Hawaii/);
  });
});
