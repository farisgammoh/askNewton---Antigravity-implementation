import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import type { db as Db } from './db';

// @types/node marks process.env.NODE_ENV as readonly; cast to a plain
// mutable record so tests can flip it to exercise both code paths.
const mutableEnv = process.env as Record<string, string | undefined>;

const tmpDbPath = path.join(os.tmpdir(), `lib-db-test-${process.pid}-${Date.now()}.json`);
const previousNodeEnv = mutableEnv.NODE_ENV;

let db: typeof Db;

before(async () => {
  mutableEnv.LOCAL_DB_PATH = tmpDbPath;
  delete mutableEnv.DATABASE_URL;
  ({ db } = await import('./db'));
});

after(() => {
  if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath);
  mutableEnv.NODE_ENV = previousNodeEnv;
});

describe('lib/db production guard', () => {
  // Order matters: the db singleton is constructed lazily on first use and
  // then cached, so the production-guard check only has a chance to fire
  // before anything else has triggered construction. Once a non-production
  // instance is cached, later NODE_ENV changes can't retroactively un-cache
  // it — which is also why this guard only protects a genuinely
  // production-started process, not a process that flips NODE_ENV at
  // runtime after already serving a request.
  test('throws instead of silently using the ephemeral local DB when NODE_ENV=production and DATABASE_URL is unset', async () => {
    mutableEnv.NODE_ENV = 'production';
    await assert.rejects(() => db.getLeadsCount(), /DATABASE_URL is required in production/);
    mutableEnv.NODE_ENV = 'test';
  });

  test('falls back to the local JSON DB outside production without throwing', async () => {
    mutableEnv.NODE_ENV = 'test';
    const count = await db.getLeadsCount();
    assert.strictEqual(count, 0);
  });
});
