/***********************
 * AskNewton_Lead_Notifier (Hardened)
 * - Locking to prevent overlaps
 * - Exponential backoff retries (I/O)
 * - Checkpoint cursor to resume safely
 * - Batched sheet reads/writes
 * - Optional Slack notify with retry
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

/** ---------- Entrypoint (trigger target) ---------- **/
function myFunction() {
  const lock = tryAcquireLock(20000);
  if (!lock) { console.warn('No lock — exiting to avoid overlap.'); return; }
  try {
    mainJob();
  } finally {
    lock.releaseLock();
  }
}

/** ---------- Main job ---------- **/
function mainJob() {
  const p = PropertiesService.getScriptProperties();

  // Open spreadsheet & sheet with retries
  const ss = withRetry(() => SpreadsheetApp.openById(CONFIG.SHEET_ID));
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) throw new Error(`Sheet "${CONFIG.SHEET_NAME}" not found`);

  // Determine work window
  const headerRow = CONFIG.HEADER_ROW;
  const startRow = Number(withRetry(() => p.getProperty(CONFIG.CURSOR_KEY) || (headerRow + 1)));
  const lastRow = withRetry(() => sheet.getLastRow());
  if (lastRow < startRow) {
    console.log('No new rows to process.');
    return;
  }

  const numRows = lastRow - startRow + 1;
  const range = sheet.getRange(startRow, CONFIG.START_COL, numRows, CONFIG.COL_COUNT);
  const values = withRetry(() => range.getValues());

  // === YOUR LOGIC HERE ===
  // Assume columns: [ts, name, phone, email, source, note, assignedTo, status]
  // Modify as needed. Keep processing in-memory; avoid per-cell I/O.
  const statusIdx = CONFIG.NOTIFY_STATUS_COL_INDEX - 1; // convert to 0-based
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const email = String(row[3] || '').trim(); // example: email at col 4
    const name  = String(row[1] || '').trim();

    // Example: only notify new leads where status is blank
    if (!row[statusIdx]) {
      // Optional Slack notification
      if (CONFIG.SLACK_WEBHOOK_URL) {
        const payload = {
          text: `🆕 New lead: ${name || 'Unknown'} ${email ? `(${email})` : ''}`
        };
        postSlack(CONFIG.SLACK_WEBHOOK_URL, payload); // wrapped in retry
      }
      // mark as notified in-memory
      row[statusIdx] = 'NOTIFIED';
    }

    // checkpoint every 100 rows
    if (i > 0 && i % 100 === 0) {
      const checkpointRow = startRow + i;
      withRetry(() => p.setProperty(CONFIG.CURSOR_KEY, String(checkpointRow)));
    }
  }

  // Single batched write if we changed anything
  withRetry(() => range.setValues(values));
  SpreadsheetApp.flush();

  // Final checkpoint moves cursor beyond last processed row
  withRetry(() => p.setProperty(CONFIG.CURSOR_KEY, String(lastRow + 1)));
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
  const p = PropertiesService.getScriptProperties();
  const startRow = CONFIG.HEADER_ROW + 1;
  withRetry(() => p.setProperty(CONFIG.CURSOR_KEY, String(startRow)));
  console.log('Cursor reset to row ' + startRow);
}
