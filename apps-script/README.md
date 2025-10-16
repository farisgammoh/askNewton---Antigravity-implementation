# AskNewton Lead Notifier - Apps Script Setup (v3)

## Purpose

AskNewton_Lead_Notifier reads new rows from a Google Sheet, sends optional notifications (e.g., Slack), and marks each lead as processed—safely. It uses locks, retries, and a checkpoint cursor so transient Google errors don't break runs or lose work.

**v3 enhancements** use the Sheets Advanced Service API to bypass editor-layer storage errors and implement dual state storage for maximum reliability.

## Setup (5-7 minutes)

### 1. Enable Google Sheets API (v3 Required):

- In Apps Script editor, click **Services** (+ icon on left sidebar)
- Find **Google Sheets API** and click **Add**
- This enables the Advanced Service for resilient I/O

### 2. In Apps Script:

- Create a new script or open the existing one at [script.google.com](https://script.google.com)
- Paste the contents of `AskNewton_Lead_Notifier.gs` into your script editor
- Set `CONFIG.SHEET_ID` to your spreadsheet ID (found in the spreadsheet URL)
- **(Optional)** Set `CONFIG.SLACK_WEBHOOK_URL` if you want Slack notifications
- If your sheet layout differs, adjust `COL_COUNT` and column indexes

### 3. Triggers:

- Go to **Triggers** → **Add Trigger**
- Choose `myFunction`, select a **time-based** schedule
- Prefer an "odd" cadence (e.g., **every 7 minutes**) to avoid platform contention

### 4. (Optional) Deploy Health Endpoint:

- Click **Deploy** → **New deployment**
- Type: **Web app**
- Execute as: **Me**
- Who has access: **Anyone** (or your domain)
- This creates a `/health` endpoint showing cursor status

## How it's hardened (v3 Ultra-Resilient)

**Core resilience (v1-v2):**
- **Locking**: Prevents overlapping runs (LockService)
- **Retries**: Exponential backoff with jitter on all I/O
- **Checkpointing**: Resume from last processed row after failures
- **Start jitter**: 0.8-2.5 second random delay to avoid contention

**v3 Advanced hardening:**
- **Sheets Advanced Service API**: Bypasses editor-layer "storage handle" errors
- **Dual state storage**: Properties service + dedicated State sheet for redundancy
- **Smaller chunks**: 100 rows max per run (down from 150)
- **Frequent checkpoints**: Every 20 rows (down from 25)
- **Time budget**: Gracefully exits before 3-minute limit
- **Health endpoint**: Web app for monitoring cursor status

## Operations

- **First run**: Use **Run** → `myFunction` once to authorize
- **To replay from the top**: Run `resetCursor()` (or delete the `LEADS_CURSOR` property)
- **Logs & errors**: Check the Executions panel for retries and progress

## Common tweaks

- **Write-back status column**: Change `NOTIFY_STATUS_COL_INDEX`
- **Filter criteria**: Add guards in the loop (e.g., skip if email missing)
- **External APIs**: Wrap any `UrlFetchApp.fetch` calls with `withRetry`

## Configuration Reference

```javascript
const CONFIG = {
  SHEET_ID: 'PUT_YOUR_SHEET_ID_HERE',     // Get from spreadsheet URL
  SHEET_NAME: 'Leads',                    // Sheet tab name
  HEADER_ROW: 1,                          // Row number with headers
  START_COL: 1,                           // First column to read
  COL_COUNT: 8,                           // Total columns to read/write
  CURSOR_KEY: 'LEADS_CURSOR',             // Property name for checkpoint
  SLACK_WEBHOOK_URL: '',                  // Slack webhook (optional)
  NOTIFY_STATUS_COL_INDEX: 8,             // Column for "NOTIFIED" status
  CHUNK_ROWS: 100,                        // Max rows per run (v3: optimized for stability)
  CHECKPOINT_EVERY: 20,                   // Checkpoint frequency (v3: more frequent)
  STATE_SHEET: 'State',                   // Fallback state sheet (v3)
  STATE_RANGE: 'A1',                      // Cursor cell in State sheet (v3)
  TIME_BUDGET_MS: 180000,                 // 3 min max execution time (v3)
};
```

## Typical Sheet Structure

| Timestamp | Name | Phone | Email | Source | Note | Assigned To | Status |
|-----------|------|-------|-------|--------|------|-------------|--------|
| Row 1 (headers) | | | | | | | |
| Row 2+ (data) | | | | | | | |

The script processes rows starting from row 2, updates the Status column, and checkpoints progress.

## Performance Tuning

If you experience persistent errors during platform instability:

### Reduce chunk size (if extreme instability)
```javascript
CONFIG.CHUNK_ROWS = 50;   // Process even fewer rows per run
CONFIG.CHECKPOINT_EVERY = 10;  // Checkpoint more frequently
```

**Note**: v3 already uses optimized values (100 rows, checkpoint every 20)

### Adjust trigger timing
- Use odd intervals (e.g., every 7 or 11 minutes)
- Avoid top-of-hour schedules when Google platform load is high
- If errors persist in bursts, temporarily increase interval to 15 minutes

### Monitor execution

**Via Logs:**
```javascript
// The script logs processing time - watch for patterns:
// "Processed 100 rows in 1800ms" (normal)
// "Processed 100 rows in 5000ms" (platform slowdown)
```

**Via Health Endpoint (if deployed):**
```bash
curl https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
# Returns: {"sheet":"Leads","cursor":152,"lastRow":200,"pending":49,"time":"2025-01-..."}
```

## v3 Features

### Sheets Advanced Service API
The v3 version uses `Sheets.Spreadsheets.Values` API calls instead of `SpreadsheetApp`:
- **More reliable**: Bypasses editor-layer storage handle errors
- **Better performance**: Direct API calls with retry logic
- **Batch operations**: Efficient multi-range reads/writes

### Dual State Storage
Cursor position is stored in **two places**:
1. **ScriptProperties** (fast, but can fail transiently)
2. **State sheet** (hidden tab in your spreadsheet, more reliable)

If one fails, the other keeps the script running. The State sheet is auto-created on first run.

### Health Endpoint
Deploy as a web app to get real-time status:
```json
{
  "sheet": "Leads",
  "cursor": 152,
  "lastRow": 200,
  "pending": 49,
  "time": "2025-01-07T12:34:56.789Z"
}
```

Perfect for external monitoring or quick status checks without opening the Apps Script editor.

## Troubleshooting

### "INTERNAL" or "Please wait and try again" errors
- These are transient Google platform issues (often from Sheets/Properties storage)
- **v3 specifically eliminates these** by:
  - **Using Sheets Advanced Service API** instead of editor-layer calls
  - **Dual state storage** (Properties + State sheet) for redundancy
  - **Smaller chunks** (100 rows) to reduce storage load
  - **More frequent checkpoints** (every 20 rows) to minimize lost work
  - **Time budget** to exit gracefully before timeout
- The retry logic uses exponential backoff on all I/O
- Check execution logs to see Advanced Service API calls working

### Script runs but nothing happens
- Verify `SHEET_ID` is correct
- Check that sheet name matches `CONFIG.SHEET_NAME`
- Run `resetCursor()` to start from the beginning

### Duplicate processing
- Make sure only ONE trigger is configured
- The lock prevents overlapping runs
- Check that cursor is advancing (view Script Properties)

### Slack notifications not working
- Verify `SLACK_WEBHOOK_URL` is set correctly
- Check execution logs for HTTP error codes
- Test webhook URL directly with curl

## Advanced Usage

### Custom Processing Logic

Modify the processing loop in `mainJob()`:

```javascript
for (let i = 0; i < values.length; i++) {
  const row = values[i];
  const [timestamp, name, phone, email, source, note, assignedTo, status] = row;
  
  // Your custom logic here
  if (!status && email) {
    // Process new leads with email
    // ... your code ...
    row[7] = 'PROCESSED'; // Update status column
  }
}
```

### Multiple External APIs

Wrap all external calls with `withRetry`:

```javascript
function callWebhook(url, data) {
  return withRetry(() => UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(data),
    muteHttpExceptions: true
  }));
}
```

### Dry Run Mode

Add a dry run flag to test without writes:

```javascript
const CONFIG = {
  // ... other config ...
  DRY_RUN: true, // Set to false for production
};

// In mainJob(), wrap writes:
if (!CONFIG.DRY_RUN) {
  withRetry(() => range.setValues(values));
}
```

## Integration with AskNewton Webhook Server

This Apps Script can work alongside your webhook server:

1. **Sheet receives leads** from your web forms
2. **Apps Script notifies Slack** about new leads  
3. **Apps Script can call your webhook server** for additional processing:

```javascript
function notifyWebhookServer(leadData) {
  const webhookUrl = 'https://your-webhook-server.com/api/lead-notification';
  
  withRetry(() => UrlFetchApp.fetch(webhookUrl, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    payload: JSON.stringify(leadData),
    muteHttpExceptions: true
  }));
}
```
