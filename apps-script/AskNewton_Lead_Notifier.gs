/***********************
 * AskNewton_Lead_Notifier (Hardened v2)
 * - Locking to prevent overlaps
 * - Exponential backoff retries (I/O)
 * - Checkpoint cursor to resume safely
 * - Batched sheet reads/writes
 * - Optional Slack notify with retry
 * - v2: Resilient sheet reopening, props handling, start jitter, smaller chunks
 ***********************/

const CONFIG = {
  SHEET_ID: 'PUT_YOUR_SHEET_ID_HERE',     // <-- REQUIRED
  SHEET_NAME: 'Leads',                    // change if different
  HEADER_ROW: 1,                          // 1-based header row
  START_COL: 1,                           // first data col
  COL_COUNT: 8,                           // number of columns to read/write
  CURSOR_KEY: 'LEADS_CURSOR',             // property key for checkpoint
  SLACK_WEBHOOK_URL: '',                  // optional: paste Slack webhook URL
  NOTIFY_STATUS_COL_INDEX: 8,             // 1-based column index to write status (e.g., "NOTIFIED")
  CHUNK_ROWS: 150,                        // max rows per run (tuned for stability)
  CHECKPOINT_EVERY: 25,                   // checkpoint frequency (tuned for rough conditions)
};

/** ---------- Resilience helpers ---------- **/
function withRetry(fn, opts = {}) {
  const {
    attempts = 6, baseMs = 400, factor = 2.0, jitter = true,
    isTransient = defaultTransientCheck,
    onRetry = (err, i, delay) => console.warn(`Retry #${i+1} in ${delay}ms: ${err && err.message}`)
  } = opts;
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try { return fn(); }
    catch (err) {
      lastErr = err;
      if (!isTransient(err) || i === attempts - 1) throw err;
      const delay = Math.round(baseMs * Math.pow(factor, i) * (jitter ? (0.5 + Math.random()) : 1));
      onRetry(err, i, delay);
      Utilities.sleep(delay);
    }
  }
  throw lastErr;
}

function defaultTransientCheck(err) {
  const msg = String(err && err.message || '').toLowerCase();
  return (
    msg.includes("we're sorry") ||
    msg.includes('internal') ||
    msg.includes('aborted') ||
    msg.includes('exceeded') ||
    msg.includes('service invoked too many times') ||
    msg.includes('timeout') ||
    msg.includes('temporarily unavailable') ||
    msg.includes('failed to fetch') ||
    msg.includes('connection') ||
    msg.includes('rate limit')
  );
}

function tryAcquireLock(timeoutMs = 20000) {
  const lock = LockService.getScriptLock();
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    try { lock.tryLock(5000); return lock; } // waits up to 5s
    catch (e) { Utilities.sleep(400); }
  }
  return null;
}

/** ---------- v2: Resilient sheet + props helpers ---------- **/
function reopenSheet_(sheetId, sheetName) {
  return withRetry(() => {
    const ss = SpreadsheetApp.openById(sheetId);
    const sh = ss.getSheetByName(sheetName);
    if (!sh) throw new Error(`Sheet "${sheetName}" not found`);
    return sh;
  });
}

function getPropSafe_(key, def) {
  const props = PropertiesService.getScriptProperties();
  try { return withRetry(() => props.getProperty(key)) ?? def; }
  catch (e) { return def; } // fall back if props storage hiccups
}

function setPropSafe_(key, val) {
  const props = PropertiesService.getScriptProperties();
  return withRetry(() => props.setProperty(key, String(val)));
}

/** ---------- Entrypoint (trigger target) ---------- **/
function myFunction() {
  const lock = tryAcquireLock(20000);
  if (!lock) { console.warn('No lock — exiting to avoid overlap.'); return; }
  try {
    Utilities.sleep(1000 + Math.floor(Math.random() * 2000)); // jitter to avoid contention
    mainJob();
  } finally {
    lock.releaseLock();
  }
}

/** ---------- Main job ---------- **/
function mainJob() {
  const startTs = Date.now();
  const headerRow = CONFIG.HEADER_ROW;

  // Reopen sheet handle resiliently (avoids stale storage handles)
  let sheet = reopenSheet_(CONFIG.SHEET_ID, CONFIG.SHEET_NAME);

  // Cursor with resilient props access
  const cursor = Number(getPropSafe_(CONFIG.CURSOR_KEY, headerRow + 1));

  const lastRow = withRetry(() => sheet.getLastRow());
  if (lastRow < cursor) { console.log('No new rows.'); return; }

  const rowsRemaining = lastRow - cursor + 1;
  const numRows = Math.min(rowsRemaining, CONFIG.CHUNK_ROWS);

  // If a storage error happens mid-run, we can re-get the handle:
  const range = withRetry(() => sheet.getRange(cursor, CONFIG.START_COL, numRows, CONFIG.COL_COUNT));
  const values = withRetry(() => range.getValues());

  const statusIdx = CONFIG.NOTIFY_STATUS_COL_INDEX - 1;

  for (let i = 0; i < values.length; i++) {
    const row = values[i];

    if (!row[statusIdx]) {
      if (CONFIG.SLACK_WEBHOOK_URL) {
        postSlack(CONFIG.SLACK_WEBHOOK_URL, {
          text: `🆕 New lead: ${String(row[1]||'Unknown')} ${row[3] ? '('+row[3]+')' : ''}`
        });
      }
      row[statusIdx] = 'NOTIFIED';
    }

    if (i > 0 && (i % CONFIG.CHECKPOINT_EVERY) === 0) {
      const checkpointRow = cursor + i;
      setPropSafe_(CONFIG.CURSOR_KEY, checkpointRow);
      // if we hit storage weirdness, refresh the handle before continuing
      sheet = reopenSheet_(CONFIG.SHEET_ID, CONFIG.SHEET_NAME);
    }
  }

  // Batched write with handle refresh fallback
  try {
    withRetry(() => range.setValues(values));
  } catch (e) {
    // If range became invalid due to a transient, re-open and rewrite just this chunk
    sheet = reopenSheet_(CONFIG.SHEET_ID, CONFIG.SHEET_NAME);
    const retryRange = withRetry(() => sheet.getRange(cursor, CONFIG.START_COL, numRows, CONFIG.COL_COUNT));
    withRetry(() => retryRange.setValues(values));
  }
  SpreadsheetApp.flush();

  setPropSafe_(CONFIG.CURSOR_KEY, cursor + numRows);
  
  const elapsed = Date.now() - startTs;
  console.log(`Processed ${numRows} rows in ${elapsed}ms`);
}

/** ---------- Optional: Slack notify with retry ---------- **/
function postSlack(url, payload) {
  const res = withRetry(() => UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  }));
  const code = res.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Slack HTTP ' + code + ': ' + res.getContentText());
  }
}

/** ---------- Utilities ---------- **/
function resetCursor() {
  const startRow = CONFIG.HEADER_ROW + 1;
  setPropSafe_(CONFIG.CURSOR_KEY, startRow);
  console.log('Cursor reset to row ' + startRow);
}
