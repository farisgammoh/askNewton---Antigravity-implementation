# AskNewton Lead Notifier - Operations Guide (v3)

## Quick Smoke Test (2 minutes)

### 1. Manual Run Test
```
Apps Script IDE → Select myFunction → Click Run
```
✅ **Expected**: Processes a small chunk, advances cursor, completes without errors

### 2. Health Check
```bash
curl -s https://YOUR_WEB_APP_URL | jq
```
✅ **Expected**:
```json
{
  "sheet": "Leads",
  "cursor": 152,
  "lastRow": 200,
  "pending": 48,
  "time": "2025-01-07T12:34:56.789Z"
}
```

### 3. Debug Endpoint
```bash
curl -s "https://YOUR_WEB_APP_URL?path=debug" | jq
```
✅ **Expected**: Detailed status including dual state storage, config, and last error

### 4. Failure Simulation (Optional)
- Temporarily set invalid `SLACK_WEBHOOK_URL`
- Run `myFunction`
- ✅ **Expected**: Retries Slack, still checkpoints, exits cleanly

---

## What "Good" Looks Like

### ✅ Healthy Execution Patterns
- **Execution time**: 30-60 seconds per run (well under 3-minute limit)
- **Cursor advancement**: Moves 20-100 rows per run
- **Health endpoint**: Shows cursor steadily catching `lastRow`
- **Resilience**: If Google hiccups, next run resumes automatically

### 🚨 Warning Signs
- Executions timeout (`DEADLINE_EXCEEDED`)
- Cursor stuck for >3 consecutive runs
- Frequent "INTERNAL" errors despite v3 hardening
- State sheet cursor and Properties cursor diverge significantly

---

## Final Checklist

### ✅ Configuration
- [ ] **Sheets API enabled**: Services → "Google Sheets API" → Added
- [ ] **Single trigger**: One time-based trigger on `myFunction` every 7 minutes
- [ ] **State sheet exists**: Hidden tab named "State" with cursor in A1
- [ ] **CONFIG validated**:
  - `SHEET_ID` matches your spreadsheet
  - `SHEET_NAME` matches your data tab
  - `COL_COUNT` = actual number of columns
  - `NOTIFY_STATUS_COL_INDEX` points to correct status column

### ✅ Deployment
- [ ] **Web app deployed**: Deploy → New deployment → Web app
- [ ] **Permissions set**: Execute as "Me", Access "Anyone" (or your domain)
- [ ] **URLs saved**: Both `/health` and `?path=debug` endpoints tested

---

## Optional: Simple Alerting

Add failure streak detection without external tools:

```javascript
// Add to end of myFunction() try block (success path):
try {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('FAIL_STREAK', '0');
} catch (e) {}

// Add to myFunction() catch block:
catch (err) {
  try {
    const props = PropertiesService.getScriptProperties();
    const streak = Number(props.getProperty('FAIL_STREAK') || 0) + 1;
    props.setProperty('FAIL_STREAK', String(streak));
    
    if (streak >= 3 && CONFIG.SLACK_WEBHOOK_URL) {
      // Alert after 3 consecutive failures
      postSlack(CONFIG.SLACK_WEBHOOK_URL, {
        text: `🚨 Lead Notifier failing (streak: ${streak})\nError: ${err.message}\nCursor: ${State.getCursor()}`
      });
    }
  } catch (e) {}
  throw err;
}
```

---

## Rollback Strategy

### If Sheets Advanced Service becomes unavailable:

**Option 1: Quick disable (emergency)**
```javascript
// Temporarily comment out Advanced Service, use editor layer:
function sheetsValuesGet_(spreadsheetId, rangeA1) {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  return sheet.getRange(rangeA1).getValues();
}
```

**Option 2: Revert to v2**
- Restore previous version from `apps-script/` directory
- Keep dual state storage (it's universally helpful)
- Re-enable after platform stabilizes

---

## Runbook

### Symptom: "INTERNAL" / "Please try again"
**Action**: Do nothing—v3 will retry via Advanced Service  
**Validation**: Check health endpoint; next run should progress  
**Escalation**: If persists >5 runs, check Google Apps Script status page

### Symptom: Cursor not moving for >3 runs
**Action**:
1. Lower `CHUNK_ROWS` to 60
2. Ensure only ONE trigger exists (delete duplicates)
3. Manually run `myFunction` and check logs

**Validation**: Cursor advances in debug endpoint

### Symptom: Slack failures only
**Action**: Verify webhook URL in CONFIG  
**Impact**: Low—script continues processing rows and marks status  
**Data loss**: None (row status still updated)

### Symptom: Dual state mismatch
**Action**:
```javascript
// Run in Apps Script console:
State.setCursor(152); // Set to known good value
```
**Validation**: Both Properties and State sheet should match

### Symptom: Execution timeout (>3 minutes)
**Action**:
1. Reduce `CHUNK_ROWS` to 50
2. Reduce `CHECKPOINT_EVERY` to 10
3. Lower `TIME_BUDGET_MS` to 150000 (2.5 minutes)

---

## Monitoring Commands

### Quick Health Check
```bash
# Basic status
curl -s https://YOUR_WEB_APP_URL

# Pretty print
curl -s https://YOUR_WEB_APP_URL | jq '.'

# Watch progress (run every 30s)
watch -n 30 'curl -s https://YOUR_WEB_APP_URL | jq ".cursor, .pending"'
```

### Debug Deep Dive
```bash
# Full debug info
curl -s "https://YOUR_WEB_APP_URL?path=debug" | jq '.'

# Check state consistency
curl -s "https://YOUR_WEB_APP_URL?path=debug" | jq '.state'

# View last error
curl -s "https://YOUR_WEB_APP_URL?path=debug" | jq '.lastError'
```

### Apps Script Logs
```
Apps Script IDE → Executions → Filter by Status/Time
```
Look for:
- ✅ `Processed X rows in Yms` (success)
- ⚠️ `Retry #N in Xms: ...` (transient, auto-recovered)
- 🚨 Multiple consecutive failures (needs attention)

---

## Performance Baselines

### Normal Operations
- **Execution time**: 30-60s for 100 rows
- **Memory usage**: <50MB
- **API calls**: ~3-5 per run (batch operations)
- **Checkpoints**: Every 20 rows

### During Platform Instability
- **Execution time**: 60-120s (with retries)
- **Retry attempts**: 1-3 per I/O operation
- **Still completes**: Yes (graceful degradation)

### Emergency Thresholds
- ⚠️ Execution >2 minutes: Consider reducing chunk size
- 🚨 Execution >3 minutes: Will timeout, check logs
- 🚨 Cursor stuck >10 runs: Manual intervention needed

---

## Success Metrics

### Daily Operations
- [ ] Cursor = lastRow (fully caught up)
- [ ] Zero execution failures in last 24 hours
- [ ] Health endpoint responding <500ms
- [ ] State sheet and Properties in sync

### Weekly Review
- [ ] Average execution time <60s
- [ ] Retry rate <5% of operations
- [ ] No manual interventions required
- [ ] All leads properly notified

---

## Quick Reference

| Endpoint | URL | Purpose |
|----------|-----|---------|
| Health | `https://YOUR_URL` | Basic status check |
| Debug | `https://YOUR_URL?path=debug` | Detailed diagnostics |

| Config | Default | Adjust If... |
|--------|---------|--------------|
| CHUNK_ROWS | 100 | Platform unstable (↓50) |
| CHECKPOINT_EVERY | 20 | Frequent failures (↓10) |
| TIME_BUDGET_MS | 180000 | Timeouts (↓150000) |

| State | Location | Reliability |
|-------|----------|-------------|
| Properties | ScriptProperties | Fast, can fail |
| State Sheet | Hidden tab | Slower, more reliable |
| Dual Read | Both checked | Maximum resilience |
