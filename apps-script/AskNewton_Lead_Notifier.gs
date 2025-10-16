/***********************
 * AskNewton_Lead_Notifier (Hardened v3)
 * - Locking to prevent overlaps
 * - Exponential backoff retries (I/O)
 * - Checkpoint cursor to resume safely
 * - v2: Resilient sheet reopening, props handling, start jitter
 * - v3: Sheets Advanced Service API, dual state storage, health endpoint
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
  CHUNK_ROWS: 100,                        // smaller chunk for rough periods (v3)
  CHECKPOINT_EVERY: 20,                   // more frequent checkpoints (v3)
  STATE_SHEET: 'State',                   // fallback state tab (v3)
  STATE_RANGE: 'A1',                      // cursor cell in State sheet (v3)
  TIME_BUDGET_MS: 180000,                 // 3 min max execution time
};

// Unified backoff options (slightly shorter to stay under time cap)
const RETRY_OPTS = { attempts: 5, baseMs: 300, factor: 2.0, jitter: true };

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

/** ---------- v3: Sheets Advanced Service wrappers ---------- **/
function sheetsValuesGet_(spreadsheetId, rangeA1) {
  return withRetry(() => {
    const resp = Sheets.Spreadsheets.Values.get(spreadsheetId, rangeA1);
    return resp.values || [];
  }, RETRY_OPTS);
}

function sheetsValuesBatchGet_(spreadsheetId, ranges) {
  return withRetry(() => {
    const resp = Sheets.Spreadsheets.Values.batchGet(spreadsheetId, { ranges });
    return resp.valueRanges || [];
  }, RETRY_OPTS);
}

function sheetsValuesUpdate_(spreadsheetId, rangeA1, values) {
  return withRetry(() => {
    return Sheets.Spreadsheets.Values.update(
      { values }, spreadsheetId, rangeA1,
      { valueInputOption: 'RAW' }
    );
  }, RETRY_OPTS);
}

function sheetsValuesBatchUpdate_(spreadsheetId, data) {
  return withRetry(() => {
    return Sheets.Spreadsheets.Values.batchUpdate(
      {
        data: data.map(d => ({ range: d.range, values: d.values })),
        valueInputOption: 'RAW'
      },
      spreadsheetId
    );
  }, RETRY_OPTS);
}

function sheetsGetLastRow_(sheetId, sheetName) {
  // read column A to detect last non-empty row without calling editor-layer APIs
  const colA = sheetsValuesGet_(sheetId, `${sheetName}!A:A`);
  // find last index with a value
  for (let i = colA.length - 1; i >= 0; i--) {
    if (colA[i] && colA[i].length && String(colA[i][0]).trim() !== '') {
      return i + 1; // 1-based row
    }
  }
  return 1; // only header
}

/** ---------- v3: State store with dual backends (Properties → Sheet) ---------- **/
const State = {
  getCursor() {
    // 1) try PropertiesService
    try {
      const props = PropertiesService.getScriptProperties();
      const v = withRetry(() => props.getProperty(CONFIG.CURSOR_KEY), RETRY_OPTS);
      if (v) return Number(v);
    } catch (e) {/* ignore */}
    // 2) fallback to State sheet
    ensureStateSheet_();
    const v = sheetsValuesGet_(CONFIG.SHEET_ID, `${CONFIG.STATE_SHEET}!${CONFIG.STATE_RANGE}`);
    const s = (v[0] && v[0][0]) ? Number(v[0][0]) : NaN;
    return Number.isFinite(s) ? s : (CONFIG.HEADER_ROW + 1);
  },
  setCursor(n) {
    // write both (props first, then sheet)
    try {
      const props = PropertiesService.getScriptProperties();
      withRetry(() => props.setProperty(CONFIG.CURSOR_KEY, String(n)), RETRY_OPTS);
    } catch (e) {/* ignore */}
    ensureStateSheet_();
    sheetsValuesUpdate_(CONFIG.SHEET_ID, `${CONFIG.STATE_SHEET}!${CONFIG.STATE_RANGE}`, [[ String(n) ]]);
  }
};

function ensureStateSheet_() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    let sh = ss.getSheetByName(CONFIG.STATE_SHEET);
    if (!sh) {
      sh = ss.insertSheet(CONFIG.STATE_SHEET);
      sh.getRange(CONFIG.STATE_RANGE).setValue(CONFIG.HEADER_ROW + 1); // init cursor
      sh.hideSheet();
    }
  } catch (e) {
    // if editor-layer open fails transiently, try again later; State writes still succeed via Advanced Service
  }
}

/** ---------- Entrypoint (trigger target) ---------- **/
function myFunction() {
  const lock = tryAcquireLock(20000);
  if (!lock) { console.warn('No lock — exiting to avoid overlap.'); return; }
  try {
    Utilities.sleep(800 + Math.floor(Math.random() * 1700)); // 0.8–2.5s jitter
    mainJob_v3();
  } finally {
    lock.releaseLock();
  }
}

/** ---------- Main (v3): Advanced Service + chunking + dual-state ---------- **/
function mainJob_v3() {
  const startTs = Date.now();
  const headerRow = CONFIG.HEADER_ROW;
  const cursor = State.getCursor();                  // resilient state read
  const lastRow = sheetsGetLastRow_(CONFIG.SHEET_ID, CONFIG.SHEET_NAME);
  if (lastRow < cursor) { console.log('No new rows.'); return; }

  const rowsRemaining = lastRow - cursor + 1;
  const numRows = Math.min(rowsRemaining, CONFIG.CHUNK_ROWS);

  // Build A1 range once (avoid editor-layer range objects)
  const startCol = CONFIG.START_COL;
  const endCol = CONFIG.START_COL + CONFIG.COL_COUNT - 1;
  const rangeA1 = `${CONFIG.SHEET_NAME}!${colLetter_(startCol)}${cursor}:${colLetter_(endCol)}${cursor + numRows - 1}`;

  // Read chunk via Advanced Service
  const vRanges = sheetsValuesBatchGet_(CONFIG.SHEET_ID, [rangeA1]);
  const values = (vRanges[0] && vRanges[0].values) ? vRanges[0].values : [];

  const statusIdx = CONFIG.NOTIFY_STATUS_COL_INDEX - 1;

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    // normalize row length to COL_COUNT (Advanced Service may omit trailing empties)
    if (row.length < CONFIG.COL_COUNT) row.push(...Array(CONFIG.COL_COUNT - row.length).fill(''));

    if (!row[statusIdx]) {
      if (CONFIG.SLACK_WEBHOOK_URL) {
        postSlack(CONFIG.SLACK_WEBHOOK_URL, {
          text: `🆕 New lead: ${String(row[1]||'Unknown')} ${row[3] ? '('+row[3]+')' : ''}`
        });
      }
      row[statusIdx] = 'NOTIFIED';
    }

    // checkpoint often
    if (i > 0 && (i % CONFIG.CHECKPOINT_EVERY) === 0) {
      State.setCursor(cursor + i);
      if (Date.now() - startTs > CONFIG.TIME_BUDGET_MS) {
        // write partial via Advanced Service, then exit
        const partialA1 = `${CONFIG.SHEET_NAME}!${colLetter_(startCol)}${cursor}:${colLetter_(endCol)}${cursor + i}`;
        sheetsValuesUpdate_(CONFIG.SHEET_ID, partialA1, values.slice(0, i + 1));
        State.setCursor(cursor + i + 1);
        console.log('Time budget reached; exiting gracefully.');
        return;
      }
    }
  }

  // Write entire processed chunk via Advanced Service
  sheetsValuesUpdate_(CONFIG.SHEET_ID, rangeA1, values);
  State.setCursor(cursor + numRows);
  
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
function colLetter_(n) {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function resetCursor() {
  const startRow = CONFIG.HEADER_ROW + 1;
  State.setCursor(startRow);
  console.log('Cursor reset to row ' + startRow);
}

/** ---------- v3: Health & Debug endpoints (deploy as web app) ---------- **/
function doGet(e) {
  const path = e.parameter.path || 'health';
  
  if (path === 'debug') {
    return doGetDebug_();
  }
  
  // Default: health endpoint
  const cursor = State.getCursor();
  let lastRow = -1;
  try { lastRow = sheetsGetLastRow_(CONFIG.SHEET_ID, CONFIG.SHEET_NAME); } catch (e) {}
  const body = JSON.stringify({
    sheet: CONFIG.SHEET_NAME,
    cursor, 
    lastRow,
    pending: lastRow >= cursor ? (lastRow - cursor + 1) : 0,
    time: new Date().toISOString()
  });
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}

function doGetDebug_() {
  const props = PropertiesService.getScriptProperties();
  const cursor = State.getCursor();
  let lastRow = -1;
  let stateSheetCursor = 'N/A';
  let lastError = 'none';
  
  try { lastRow = sheetsGetLastRow_(CONFIG.SHEET_ID, CONFIG.SHEET_NAME); } catch (e) { lastError = e.message; }
  
  try {
    const v = sheetsValuesGet_(CONFIG.SHEET_ID, `${CONFIG.STATE_SHEET}!${CONFIG.STATE_RANGE}`);
    stateSheetCursor = (v[0] && v[0][0]) ? v[0][0] : 'empty';
  } catch (e) {}
  
  const body = JSON.stringify({
    sheet: CONFIG.SHEET_NAME,
    cursor,
    lastRow,
    pending: lastRow >= cursor ? (lastRow - cursor + 1) : 0,
    config: {
      chunkRows: CONFIG.CHUNK_ROWS,
      checkpointEvery: CONFIG.CHECKPOINT_EVERY,
      hasSlack: !!CONFIG.SLACK_WEBHOOK_URL
    },
    state: {
      propertiesCursor: props.getProperty(CONFIG.CURSOR_KEY) || 'none',
      stateSheetCursor: stateSheetCursor
    },
    lastError,
    time: new Date().toISOString()
  }, null, 2);
  
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}
