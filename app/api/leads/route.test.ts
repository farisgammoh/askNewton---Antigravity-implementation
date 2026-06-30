import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { NextRequest } from 'next/server';
import type { POST as PostHandler } from './route';
import type { db as Db } from '../../../lib/db';

// Point the local-JSON DB fallback at a throwaway file so this test never
// touches the real db.json in the repo. Must happen before lib/db.ts is
// evaluated, so the route module is imported dynamically in before().
const tmpDbPath = path.join(os.tmpdir(), `leads-route-test-${process.pid}-${Date.now()}.json`);

let POST: typeof PostHandler;
let db: typeof Db;

before(async () => {
  process.env.LOCAL_DB_PATH = tmpDbPath;
  delete process.env.DATABASE_URL;

  // Force the CRM sync to its no-credentials no-op path regardless of
  // what's in the developer's shell environment, so this test is
  // deterministic and never makes a real network call.
  delete process.env.AIRTABLE_TOKEN;
  delete process.env.AIRTABLE_BASE_ID;
  delete process.env.HUBSPOT_TOKEN;
  delete process.env.HUBSPOT_ACCESS_TOKEN;

  ({ POST } = await import('./route'));
  ({ db } = await import('../../../lib/db'));
});

after(() => {
  if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath);
});

function postRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/leads', () => {
  test('rejects a request without consent', async () => {
    const res = await POST(postRequest({ email: 'a@example.com' }));
    assert.strictEqual(res.status, 400);
    assert.strictEqual(await db.getLeadsCount(), 0);
  });

  test('rejects a request without an email', async () => {
    const res = await POST(postRequest({ consentToContact: true }));
    assert.strictEqual(res.status, 400);
  });

  test('saves a consented lead even when Airtable/HubSpot credentials are absent', async () => {
    const res = await POST(
      postRequest({
        email: 'lead@example.com',
        language: 'en',
        state: 'California',
        consentToContact: true,
        sourcePage: 'Test Suite',
      })
    );

    // CRM sync is best-effort: missing credentials must not fail the
    // user-facing request, since the lead is already durably saved locally.
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.leadId);
    assert.strictEqual(await db.getLeadsCount(), 1);
  });

  test('registers a reminder without throwing when requested', async () => {
    const res = await POST(
      postRequest({
        email: 'reminder@example.com',
        language: 'en',
        state: 'California',
        consentToContact: true,
        sourcePage: 'Test Suite',
        registerReminder: true,
        windowType: 'Special Enrollment Period (Newcomer)',
        deadlineDate: '2027-08-15',
        reminderChannel: 'whatsapp',
      })
    );

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
  });
});
