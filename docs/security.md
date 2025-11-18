# Security Guidelines

This document outlines the security model, best practices, and required controls for the AskNewton platform. It covers API hardening, webhook validation, secrets management, access control, and operational monitoring. These standards apply to all contributors and environments (local, Replit, GitHub, production).

---

# 🔐 1. Core Security Principles

AskNewton adheres to the following security pillars:

### **1. Zero-Trust Architecture**
Every inbound event, request, or credential must be authenticated and verified.

### **2. Least Privilege**
Only the minimum necessary privileges are granted to processes, agents, API keys, and developers.

### **3. Defense in Depth**
Multiple layers of protection:
- HMAC signing  
- Raw-body validation  
- Idempotency  
- Rate limits  
- Error sanitization  
- Monitoring & logging  

### **4. No Secrets in Code**
Secrets must **never** be committed to GitHub or stored inside repository files.

### **5. Auditability**
All key actions—webhook deliveries, errors, payloads, and agent operations—are logged and can be inspected.

---

# 🔑 2. Environment & Secrets Management

All secrets must be stored in **Replit → Secrets**, or in `.env` locally (excluded from git).

Required secrets:

| Key | Purpose |
|-----|---------|
| `ELEVEN_INIT_SECRET` | HMAC key for ElevenLabs conversation-init |
| `ELEVEN_END_SECRET` | HMAC key for conversation-end |
| `OPENAI_API_KEY` | Used by all AI agents |
| `STRIPE_SECRET_KEY` | Billing flows |
| `HUBSPOT_API_KEY` | CRM automations |
| `REPLIT_DB_URL` (optional) | External persistence |

**Never store:**
- API keys inside JSON files  
- Secrets inside the client folder  
- Tokens inside logs  
- `.env` checked into Git  

If a secret is ever leaked → **immediately rotate it**.

---

# 🛡️ 3. Webhook Security (ElevenLabs)

Webhook security is one of the most critical parts of AskNewton.

### **3.1 Raw Body Capture**

Webhook signature validation requires capturing the body *before* JSON parsing:

```ts
app.use(express.raw({ type: "*/*" }));
````

Never remove or modify this middleware.

### **3.2 HMAC Signature Verification**

For each webhook:

1. Retrieve the `x-elevenlabs-signature` header
2. Generate your own HMAC using the correct secret
3. Compare using constant-time comparison:

```ts
crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))
```

### **3.3 Idempotency Controls**

To prevent replay or duplicate processing:

* If payload includes `id` or `event_id`
* Maintain an in-memory or Redis-set of processed IDs
* Drop duplicates silently

### **3.4 Required 200 Response**

ElevenLabs will retry on failure → risking event storms.

Respond with:

```json
{ "ok": true }
```

after validation, even if internal logic fails (log errors separately).

---

# 🔒 4. API & Backend Security

### **4.1 Do NOT expose internal endpoints**

Endpoints like:

* `/events` (debug logs)
* `/version`
* `/debug/*`

should be restricted or disabled in production.

### **4.2 CORS and method restrictions**

The API must explicitly validate:

* Allowed methods
* Allowed origins
* Allowed content types

### **4.3 Rate Limiting**

Use per-IP rate limits for:

* Public APIs
* Anonymous requests
* Login / identity endpoints

Rate limiting is optional on Replit but mandatory on production infra.

### **4.4 Error Sanitization**

Never leak server internals:

Bad ❌

```
TypeError: Cannot read property 'x' of undefined at /server/webhooks.js:21
```

Good ✔️

```
Webhook validation failed.
```

All stack traces should only appear in internal logs.

---

# 🔧 5. Secure Coding Standards

### **5.1 Never trust user input**

Every inbound request is untrusted:

* Validate schema
* Strip unexpected fields
* Enforce types

### **5.2 Avoid dynamic execution patterns**

Avoid:

* `eval`
* dynamic `require`
* executing user-provided code

### **5.3 Safe JSON parsing**

Wrap all parsing in try/catch:

```ts
let data;
try {
  data = JSON.parse(rawBody.toString());
} catch (err) {
  return res.status(400).json({ ok: false, error: "Invalid JSON" });
}
```

### **5.4 Logging best practices**

Do not log:

* API keys
* Secrets
* Authorization headers
* Bearer tokens
* Full webhook bodies (unless scrubbed)

---

# 🗄️ 6. Data Storage & Privacy

### **6.1 In-Memory Storage Warning**

`/events` uses in-memory storage only for debugging.

**Do NOT rely on this for production.**

Recommended production stores:

* Redis
* DynamoDB
* Postgres (via Supabase)

### **6.2 Minimal data retention**

* Store only what is needed
* Avoid storing raw audio or PII unless explicitly required
* Automatically truncate debug logs

### **6.3 GDPR-style policies**

Even if not required legally:

* Provide “delete my data” capability
* Avoid retaining identifiable data by default

---

# 🚨 7. Monitoring & Incident Response

AskNewton logs:

* webhook events
* errors
* timestamps
* agents executed
* retries
* OpenAI usage metrics

Monitoring includes:

* Latency
* Error rates
* Signature failures
* Duplicate event IDs
* Cost tracking for AI calls

### **7.1 Incident Response Workflow**

If suspicious behavior occurs:

1. Disable all inbound webhooks
2. Rotate secrets
3. Check `/events` logs
4. Rebuild & redeploy
5. File an internal report

---

# 🛡️ 8. Authentication & Access Control (Future)

Upcoming features will include:

* OAuth for admin dashboards
* Token-based identity for agents
* Role-based permissions
* Audit logs for human administrators

---

# 🔚 Final Notes

AskNewton follows modern security-by-default design:

✔ HMAC everywhere
✔ No secrets in code
✔ Constant-time comparison
✔ Idempotent-by-design webhooks
✔ Minimal data retention
✔ Strict error sanitization
✔ Monitoring + logging activated

If expanding to AWS, Vercel, or production cloud environments, additional policies will be added (WAF, TLS cert rotation, KMS encryption, etc.).


```

