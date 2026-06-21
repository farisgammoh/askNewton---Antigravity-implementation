# askNewton — AI-Native Health Insurance Guidance for Immigrants, Expats & Nomads

*Fast, personalized health-insurance guidance for newcomers to the United States.*

askNewton helps travelers, students, digital nomads, and new residents understand U.S. health insurance in minutes. It does not sell or underwrite insurance; it provides guidance and navigation. This repository contains the full askNewton codebase: frontend, backend APIs, and the recommendation engine.

---

## Features

- **Deterministic plan recommendations** — recommendations come from a rules-based decision engine, not from a language model. The LLM layer explains and communicates results; it never invents the recommendation.
- **Persona-specific workflows** for nomads, travelers, students, and new residents
- **WhatsApp advisor integration**
- **Cost tracking and token-usage logging**
- **Idempotent request engine**
- **Persona cache for cost optimization**
- **API** with webhooks, storage, and monitoring

---

## Architecture Overview

askNewton separates *what* is recommended from *how* it's explained:

- **Decision engine (deterministic):** Plan recommendations are produced by an auditable, rules-based engine. Given the same inputs, it returns the same outputs — which makes recommendations reproducible, testable, and explainable to users and regulators.
- **Explanation layer (LLM):** The language model translates the engine's deterministic output into clear, persona-appropriate guidance. It summarizes, clarifies, and answers follow-up questions, but does not choose plans.

- **Supporting agents (roadmap):** Planned Evaluator and Verifier agents will validate inputs and check generated explanations against the engine's output for consistency.

This split is intentional: keeping the recommendation logic deterministic is what makes the product defensible and auditable.

---

## Tech Stack

### Frontend
- React + TypeScript
- Wouter (routing)
- Vite
- shadcn/ui

### Backend
- Node.js / Express
- drizzle-orm
- PostgreSQL (Neon)
- OpenAI API (explanation layer)
- ElevenLabs webhooks

### AI Layer
- Deterministic recommendation engine
- Persona matrix
- Multi-agent orchestration *(roadmap — see Architecture Overview)*

---

## Repository Structure

```
apps-script/      # Utility scripts & automations
attached_assets/  # Assets for docs & marketing
client/           # Frontend (React)
  src/
    components/   # UI + marketing components
    data/         # Personas, FAQs
    pages/        # Landing + persona pages
    styles/       # Global CSS
data/             # Seeds, migrations
docs/             # Architecture, runbooks, integration guides
lib/              # Helpers, utils, logging
public/           # Static assets
server/           # Backend APIs, webhooks, storage
shared/           # Types, validation schemas
society/          # AI agent orchestration
test/ , tests/    # Automated test suites
```

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start development
```bash
npm run dev
```
Frontend → http://localhost:5000

### 3. Production build
```bash
npm run build
npm start
```

---

## Environment Variables

Copy `.env.example` → `.env`:

```
OPENAI_API_KEY=
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
SESSION_SECRET=
VITE_WHATSAPP_NUMBER=
HUBSPOT_PORTAL_ID=
HUBSPOT_CLIENT_SECRET=
ELEVEN_INIT_SECRET=
ELEVEN_END_SECRET=
```

> `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `SESSION_SECRET` are **required** — the server will not start without them.

Secrets must be configured in your deployment environment — **never committed to the repository.**

---

## Adding a New Persona

1. Add persona → `client/src/data/personas.ts`
2. Add FAQs → `client/src/data/faqs.ts`
3. Create page → `client/src/pages/<persona>.tsx`
4. Add route → `client/src/App.tsx`
5. Update navigation
6. Add SEO entry → `public/sitemap.xml`

---

## Monitoring & Observability

- Token-level OpenAI usage logging
- Cost monitoring (`openaiCallLog`)
- Idempotent request handling (`requestLog`)
- Webhook tracing (HubSpot, ElevenLabs)
- Health endpoints
- Persona cache hit tracking

---

## Testing
```bash
npm run test
```

---

## Deployment

| Layer        | Platform (target)            |
|--------------|--------------|
| Frontend     | Vercel / Replit Deploy       |
| Backend API  | Replit Deploy                |
| Database     | PostgreSQL (Neon)            |
| Edge caching | Cloudflare (optional)        |

---

## License

**Proprietary — All rights reserved.**

This source code is the confidential and proprietary property of askNewton. It is not open source. No license, express or implied, is granted to copy, modify, distribute, sublicense, or create derivative works. Unauthorized use, reproduction, or distribution is prohibited.
