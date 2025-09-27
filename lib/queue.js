// lib/queue.js
import { postJson } from './outbound.js';
import { sleep } from './resilience.js';
import { initDb, insertEvent, listEvents, getEventById } from '../db.js';

const MAX_ATTEMPTS = 8;

function now() { return Date.now(); }

function backoffMs(attempt) {
  // Expo backoff with jitter, cap 5 min
  const base = 400 * Math.pow(2, attempt);
  const jitter = base * (0.5 + Math.random());
  return Math.min(5 * 60_000, base + jitter);
}

export async function enqueue(db, { eventId, dest, url, payload }) {
  const ts = now();
  await db.run(
    `INSERT INTO outbound_attempts (event_id, destination, url, payload, status, attempts, next_attempt_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'pending', 0, ?, ?, ?)`,
    [eventId, dest, url, JSON.stringify(payload), ts, ts, ts]
  );
}

async function _fetchBatch(db, limit = 20) {
  const ts = now();
  return db.all(
    `SELECT * FROM outbound_attempts
     WHERE status IN ('pending','retry') AND next_attempt_at <= ?
     ORDER BY next_attempt_at ASC
     LIMIT ?`,
    [ts, limit]
  );
}

async function _attempt(db, row) {
  const payload = JSON.parse(row.payload);
  try {
    await postJson({
      url: row.url,
      dest: row.destination,
      body: payload,
      timeoutMs: 8000
    });
    await db.run(
      `UPDATE outbound_attempts SET status='ok', updated_at=? WHERE id=?`,
      [now(), row.id]
    );
    // Import metrics dynamically to avoid circular deps
    const { inc } = await import('../lib/metrics.js');
    inc('outbound_ok');
    inc('queue_processed');
    console.log(`[queue] SUCCESS: ${row.destination} event ${row.event_id}`);
  } catch (err) {
    const attempts = row.attempts + 1;
    const nAttemptAt = now() + backoffMs(attempts);
    const status = attempts >= MAX_ATTEMPTS ? 'failed' : 'retry';
    await db.run(
      `UPDATE outbound_attempts SET status=?, attempts=?, last_error=?, next_attempt_at=?, updated_at=? WHERE id=?`,
      [status, attempts, String(err && err.message || err), nAttemptAt, now(), row.id]
    );
    
    // Import metrics dynamically to avoid circular deps
    const { inc } = await import('../lib/metrics.js');
    inc('queue_processed');
    if (status === 'retry') {
      inc('outbound_retry');
    } else {
      inc('outbound_failed');
      inc('retry_exhausted');
    }
    
    console.warn(`[queue] ${status.toUpperCase()}: ${row.destination} event ${row.event_id} (attempt ${attempts}): ${err.message}`);
  }
}

let _running = false;

export async function workerLoop(db, { tickMs = 1000 } = {}) {
  if (_running) return;
  _running = true;
  console.log('[queue] Worker started');
  try {
    while (_running) {
      const batch = await _fetchBatch(db, 25);
      if (batch.length === 0) {
        await sleep(tickMs);
        continue;
      }
      console.log(`[queue] Processing ${batch.length} pending deliveries`);
      for (const row of batch) {
        if (!_running) break;
        await _attempt(db, row);
      }
    }
  } catch (err) {
    console.error('[queue] Worker error:', err);
  } finally {
    _running = false;
    console.log('[queue] Worker stopped');
  }
}

export function stopWorker() { 
  _running = false; 
  console.log('[queue] Stopping worker...');
}

export async function replayFailed(db, idList = []) {
  if (!idList.length) return 0;
  const ts = now();
  let count = 0;
  for (const id of idList) {
    const row = await db.get(`SELECT * FROM outbound_attempts WHERE id=?`, [id]);
    if (!row || row.status !== 'failed') continue;
    await db.run(
      `UPDATE outbound_attempts SET status='retry', next_attempt_at=?, updated_at=? WHERE id=?`,
      [ts, ts, id]
    );
    count++;
  }
  console.log(`[queue] Replayed ${count} failed deliveries`);
  return count;
}

export async function getQueueStats(db) {
  const stats = await db.all(`
    SELECT status, COUNT(*) as count 
    FROM outbound_attempts 
    GROUP BY status
  `);
  const result = { pending: 0, retry: 0, ok: 0, failed: 0 };
  for (const stat of stats) {
    result[stat.status] = stat.count;
  }
  return result;
}