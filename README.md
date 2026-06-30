# askNewton

askNewton is a proactive, multilingual AI insurance guidance product. A deterministic
rules engine (the "Insurance Brain") owns every recommendation, dollar figure, and
deadline; an LLM explanation layer only narrates that output in plain language and is
never allowed to invent or alter a number. askNewton is an informational guidance
service — not a licensed insurance producer or broker — operated by askNewton, Inc.,
part of the Newton Insurance plc family.

## Architecture

- **Insurance Brain** (`lib/brain/`) — deterministic TypeScript rules engine: enrollment
  window/deadline logic, ACA subsidy eligibility, plan ranking. Pure functions, no LLM
  calls, covered by `lib/brain/brain.test.ts`.
- **`/api/recommend`** — the only place a `Profile` is turned into a `BrainResult`. The
  client (`app/guide/page.tsx`) always calls this route; it never runs the Brain itself,
  so a `BrainResult` can't be forged client-side before being explained.
- **`/api/explain`** — sends a `BrainResult` to Claude with a system prompt that
  forbids inventing, altering, or recomputing any value; falls back to a deterministic
  template (`generateFallbackExplanation`) if `ANTHROPIC_API_KEY` is unset or the API
  call fails.
- **`app/webhooks/eleven/*`** — ElevenLabs voice webhooks (conversation start/end,
  transfer, voicemail), authenticated via `BACKEND_BEARER_TOKEN`, mirrored to HubSpot
  and optionally Zapier.
- **Lead capture** — `/api/leads` (reminders/consent logging; Postgres if `DATABASE_URL`
  is set, else a local `db.json` fallback — never commit real lead data to that file)
  and `/api/waitlist` (homepage signup). Airtable + HubSpot is the canonical CRM: both
  routes call the shared `upsertAirtableLead`/`upsertHubspotLead` helpers in
  `lib/crm.ts` so every lead lands in the same contact record regardless of entry
  point. `/api/leads`'s CRM sync is best-effort — the local/Postgres save is the
  source of truth for reminder scheduling and consent logs, so a CRM outage doesn't
  fail the request.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the test suite (Insurance Brain unit tests + API route tests):

```bash
npm test
npm run typecheck
```

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | `/api/explain` | Claude explanation layer. Falls back to a static template if unset. |
| `DATABASE_URL` | `lib/db.ts` | Postgres connection string. **Required in production** — `lib/db.ts` throws on first use instead of silently falling back to the ephemeral local `db.json` when `NODE_ENV=production` and this is unset. Optional in development/test. |
| `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, `AIRTABLE_WAITLIST_TABLE` | `/api/waitlist`, `/api/leads` | Airtable upsert target — the canonical CRM for every lead source. |
| `HUBSPOT_TOKEN` / `HUBSPOT_ACCESS_TOKEN` | `lib/crm.ts`, `/api/waitlist`, `/api/leads` | HubSpot CRM contact/call sync. |
| `BACKEND_BEARER_TOKEN` | `lib/crm.ts` (`verifyElevenLabsAuth`) | Shared secret authenticating inbound ElevenLabs webhook/API calls. |
| `ZAPIER_HOOK_URL` | `lib/crm.ts` (`zapMirror`) | Optional event mirror to Zapier. Skipped if unset. |
| `LOCAL_DB_PATH` | `lib/db.ts` | Test-only override for the local JSON DB fallback path, so tests never read/write the real `db.json`. Not meant to be set in dev/prod. |

## Rate limiting

`/api/explain` (calls the paid Anthropic API), `/api/leads`, and `/api/waitlist` are
rate-limited per IP via `lib/rateLimit.ts`. This is an **in-memory, per-instance**
limiter — a best-effort guard against casual abuse and runaway cost, not a distributed
rate limiter. On Vercel each serverless instance has its own memory, so limits aren't
shared across cold starts/regions. If real abuse shows up, replace it with a shared
store (Upstash Redis / Vercel KV) behind the same `checkRateLimit()` signature.

## CI

`.github/workflows/ci.yml` runs on every PR and push to `main`: `npm ci` → lint
(non-blocking, see below) → typecheck → test → build.

## Known gaps

- **Lint debt**: `npm run lint` currently reports ~25 pre-existing issues (mostly
  `@typescript-eslint/no-explicit-any` in catch blocks, a couple of unescaped JSX
  entities, one `react-hooks/set-state-in-effect` in `lib/i18n/LanguageContext.tsx`).
  None of these are new — CI runs lint as a non-blocking step until this is cleaned up
  and the gate can be turned strict.
- **Git history**: an early commit had real lead PII committed into `db.json`. Current
  `main` no longer has that data in the file, but it's still recoverable from history —
  scrubbing it requires a force-push, which is the founder's call to make and execute.
- **No error monitoring** (e.g. Sentry) wired in yet.

## Deploy

Deployed on Vercel. All deploys, secrets, and infra changes are handled by the
founder — this repo does not contain deploy automation.
