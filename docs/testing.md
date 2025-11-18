# Testing Guide

This document explains how to run, structure, and extend the testing environment for AskNewton.  
It covers webhook testing, agent testing, OpenAI cost-control tests, integration tests, and manual verification flows.

AskNewton uses a lightweight but powerful testing setup built around:

- **Node + TypeScript**
- **Custom test scripts (`test/` folder)**
- **Raw-body + HMAC webhook tests**
- **Replit-hosted integration environment**
- **curl-based manual verification**
- **Automated logging + event storage**

---

# 🧪 1. Testing Philosophy

AskNewton’s testing approach follows three rules:

### **1. Test the real system, not mocks**
For critical components (webhooks, agents, HMAC, cost controls), we test against the actual running code.

### **2. Deterministic and idempotent**
Every test run should:
- produce predictable results  
- clean up after itself  
- safely ignore duplicates  
- never break production  

### **3. Tests should be runnable from anywhere**
You can run tests from:
- Replit Shell  
- Local machine  
- External CI (GitHub Actions – coming soon)  

---

# 📂 2. Test Directory Structure

```

test/
init.sh
end.sh
agent.test.js
webhook.test.js
load.test.js
health.test.js

tests/
sample_payloads/
init.json
end.json
malformed.json

````

### Folder Purpose

| Folder | Description |
|--------|-------------|
| `test/` | Executable test scripts + integration tests |
| `tests/` | Sample webhook bodies + malformed payloads |
| `test/*.sh` | Shell scripts for ElevenLabs webhook calls |
| `test/*.js` | Node-based automatic tests |

---

# ⚙️ 3. Setup Before Running Tests

### **3.1 Install dependencies**
```bash
npm install
````

### **3.2 Export your Replit host**

Find your Replit URL:

```
https://<your-repl-name>.replit.app
```

Then:

```bash
export REPL_HOST="https://<your-repl>.replit.app"
```

Replit automatically injects secrets, so no need to export HMAC keys manually.

---

# 🔊 4. Webhook Tests (Critical)

## 4.1 Automatic Tests (Node)

Run both webhook tests:

```bash
npm run test:init
npm run test:end
```

Each script:

* Loads a known JSON body
* Generates the correct HMAC
* Sends it to your running webhook server
* Verifies HTTP 200 + JSON response
* Logs the event ID in memory

---

# 📤 4.2 Manual Testing with curl

### **Conversation-init**

```bash
BODY='{"ping":"init"}'
SIG=$(printf "$BODY" | openssl dgst -sha256 -hmac "$ELEVEN_INIT_SECRET" -hex | awk '{print $2}')

curl -X POST "$REPL_HOST/webhooks/eleven/conversation-init" \
  -H "Content-Type: application/json" \
  -H "x-elevenlabs-signature: $SIG" \
  -d "$BODY"
```

### **Conversation-end**

```bash
BODY='{"ping":"end"}'
SIG=$(printf "$BODY" | openssl dgst -sha256 -hmac "$ELEVEN_END_SECRET" -hex | awk '{print $2}')

curl -X POST "$REPL_HOST/webhooks/eleven/conversation-end" \
  -H "Content-Type: application/json" \
  -H "x-elevenlabs-signature: $SIG" \
  -d "$BODY"
```

### Expected output:

```json
{ "ok": true }
```

---

# 🔁 5. Idempotency Tests

Run the same event **3–5 times**:

```bash
npm run test:init
npm run test:init
npm run test:init
```

Then check:

```
GET /events
```

Expected behavior:

* only **1 entry** stored
* duplicates **ignored**
* no errors

This proves signature validation + event ID de-duplication works.

---

# 💬 6. Agent Testing

Located in:

```
test/agent.test.js
```

These tests validate:

### **Agent orchestration**

* persona selection
* cost-control validation
* message routing
* expected return types

### Run:

```bash
node test/agent.test.js
```

---

# 📈 7. OpenAI Cost-Control Tests

Located in:

```
test/load.test.js
```

These tests check:

* caching layer returns hits
* idempotency key prevents duplicate OpenAI calls
* usage logs are written correctly
* cost estimates do not exceed thresholds

Run:

```bash
node test/load.test.js
```

Expected output:

```
Cache HIT rate > 70%
All calls logged successfully
```

---

# ❤️‍🩹 8. Health & Liveness Tests

## Check liveness:

```bash
curl "$REPL_HOST/healthz"
```

Expect:

```json
{ "ok": true, "service": "asknewton-webhooks" }
```

## Check version:

```bash
curl "$REPL_HOST/version"
```

## Check recent webhook events:

```bash
curl "$REPL_HOST/events"
```

---

# 🔒 9. Negative Security Tests

To confirm security hardening, test the following:

### ❌ Wrong signature:

```bash
curl -X POST "$REPL_HOST/webhooks/eleven/conversation-init" \
  -H "x-elevenlabs-signature: WRONG" \
  -d '{"bad":"json"}'
```

Expect:

```
401 Unauthorized
```

### ❌ Malformed JSON:

```bash
curl -X POST "$REPL_HOST/webhooks/eleven/conversation-init" \
  -H "Content-Type: application/json" \
  -d '{"incomplete":}'
```

Expect:

```
400 Invalid JSON
```

### ❌ Wrong secret:

Change `ELEVEN_INIT_SECRET` temporarily and retest.
Expect all webhook tests to **fail signature verification**.

These tests ensure:

* HMAC validation
* raw-body integrity
* input sanitization
* error security

---

# 🚦 10. Full Test Suite (One Command)

Once all scripts are in place:

```bash
npm test
```

This runs:

* agent tests
* webhook tests
* security tests
* load/cost tests
* health checks

---

# 🧭 11. CI/CD Testing (Coming Soon)

We are preparing GitHub Actions workflows:

```
.github/workflows/test.yml
```

This will include:

* webhook signature tests
* agent orchestration tests
* OpenAI cost simulations
* Replit API integration checks
* publishing pipeline verification

---

# 🎯 Final Notes

AskNewton’s testing stack validates:

✔ Webhook correctness
✔ Signature + HMAC security
✔ Idempotency and deduplication
✔ Agent correctness
✔ Cost-control logic
✔ Infrastructure health
