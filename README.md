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
- **Lead capture** — `/api/leads` (Postgres if `DATABASE_URL` is set, else a local
  `db.json` fallback — never commit real lead data to that file) and `/api/waitlist`
  (Airtable + HubSpot). These are currently two separate paths; see open items below.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the Insurance Brain test suite:

```bash
npm test
```

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | `/api/explain` | Claude explanation layer. Falls back to a static template if unset. |
| `DATABASE_URL` | `lib/db.ts` | Postgres connection string. Falls back to local `db.json` if unset. |
| `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, `AIRTABLE_WAITLIST_TABLE` | `/api/waitlist` | Airtable upsert target for waitlist signups. |
| `HUBSPOT_TOKEN` / `HUBSPOT_ACCESS_TOKEN` | `lib/crm.ts`, `/api/waitlist` | HubSpot CRM contact/call sync. |
| `BACKEND_BEARER_TOKEN` | `lib/crm.ts` (`verifyElevenLabsAuth`) | Shared secret authenticating inbound ElevenLabs webhook/API calls. |
| `ZAPIER_HOOK_URL` | `lib/crm.ts` (`zapMirror`) | Optional event mirror to Zapier. Skipped if unset. |

## Deploy

Deployed on Vercel. All deploys, secrets, and infra changes are handled by the
founder — this repo does not contain deploy automation.
