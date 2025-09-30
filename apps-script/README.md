# AskNewton Lead Notifier - Apps Script Setup

## Purpose

AskNewton_Lead_Notifier reads new rows from a Google Sheet, sends optional notifications (e.g., Slack), and marks each lead as processed—safely. It uses locks, retries, and a checkpoint cursor so transient Google errors don't break runs or lose work.

## Setup (5 minutes)

### 1. In Apps Script:

- Create a new script or open the existing one at [script.google.com](https://script.google.com)
- Paste the contents of `AskNewton_Lead_Notifier.gs` into your script editor
- Set `CONFIG.SHEET_ID` to your spreadsheet ID (found in the spreadsheet URL)
- **(Optional)** Set `CONFIG.SLACK_WEBHOOK_URL` if you want Slack notifications
- If your sheet layout differs, adjust `COL_COUNT` and column indexes

### 2. Triggers:

- Go to **Triggers** → **Add Trigger**
- Choose `myFunction`, select a **time-based** schedule
- Prefer an "odd" cadence (e.g., **every 7 minutes**) to avoid platform contention

## How it's hardened

- **Locking**: Prevents overlapping runs (LockService)
- **Retries**: Exponential backoff with jitter on all I/O (Sheets, Properties, UrlFetch)
- **Checkpointing**: Stores the last processed row in ScriptProperties so a mid-run failure resumes where it left off
- **Batching**: Single `getValues()` and `setValues()`; no per-cell loops

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
};
```

## Typical Sheet Structure

| Timestamp | Name | Phone | Email | Source | Note | Assigned To | Status |
|-----------|------|-------|-------|--------|------|-------------|--------|
| Row 1 (headers) | | | | | | | |
| Row 2+ (data) | | | | | | | |

The script processes rows starting from row 2, updates the Status column, and checkpoints progress.

## Troubleshooting

### "INTERNAL" or "Please wait and try again" errors
- These are transient Google platform issues
- The retry logic automatically handles them with exponential backoff
- Check execution logs to see retry attempts

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
