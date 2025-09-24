# AskNewton Webhooks (ElevenLabs)

Minimal Express server with HMAC verification for ElevenLabs webhooks.

## Endpoints
- `POST /webhooks/eleven/conversation-init`
- `POST /webhooks/eleven/conversation-end`
- `GET  /healthz` (liveness)
- `GET  /version` (build info)
- `GET  /events` (recent deliveries, trimmed)

## Env / Secrets (set in Replit → Secrets)
- `ELEVEN_INIT_SECRET` – HMAC secret for conversation-init
- `ELEVEN_END_SECRET` – HMAC secret for conversation-end
- `PORT` (optional, default 3000)

## Run
```bash
npm install
npm start
```

## Test (curl)

Set your host (Replit URL), then run tests:

```bash
export REPL_HOST="https://<your-repl>.replit.app"
# In Replit Shell, secrets are already in env
npm run test:init
npm run test:end
```

Or run manual one-liners:

```bash
BODY='{"ping":"init"}'
SIG=$(printf "$BODY" | openssl dgst -sha256 -hmac "$ELEVEN_INIT_SECRET" -hex | awk '{print $2}')
curl -X POST "$REPL_HOST/webhooks/eleven/conversation-init" -H "Content-Type: application/json" -H "x-elevenlabs-signature: $SIG" -d "$BODY"
```

## ElevenLabs Console

Create two HMAC webhooks:

**https://<your-repl>.replit.app/webhooks/eleven/conversation-init** → secret = ELEVEN_INIT_SECRET

**https://<your-repl>.replit.app/webhooks/eleven/conversation-end** → secret = ELEVEN_END_SECRET

Use **Send Test Event** to verify 200 OK responses.

**Make test scripts executable**
```bash
chmod +x test/init.sh
chmod +x test/end.sh
```

## Secrets to Add (Replit → Secrets)

**ELEVEN_INIT_SECRET** = <paste ElevenLabs generated secret for init>

**ELEVEN_END_SECRET** = <paste ElevenLabs generated secret for end>

**(optional) PORT** = 3000

## Run & Verify

```bash
npm install
npm start
```

Open: `GET /healthz` → should return `{ ok: true, service: "asknewton-webhooks" }`

Set `REPL_HOST="https://<your-repl>.replit.app"` and run:

```bash
npm run test:init
npm run test:end
```

Check `GET /events` to see recent deliveries (trimmed).

## Notes

- Uses raw body capture to compute HMAC exactly as sent.
- Constant-time compare via `crypto.timingSafeEqual`.
- Idempotency: if payload includes `id` or `event_id`, duplicates are auto-ignored.
- In-memory store is for debugging only—swap for a DB if you need persistence.