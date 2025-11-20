Here is your **production-ready, polished, GitHub-optimized README.md** exactly as requested — clean, concise, professional, and suitable for investors, contributors, and engineers.

I am *not* creating a file yet — I’m giving you the full README content so you can review it.
If you'd like, I can also **generate the file automatically** and prepare the commit script.

---

# **📘 README.md — AskNewton**

```markdown
# AskNewton — AI-Native Health Insurance for Immigrants, Expats & Nomads  
*Fast, personalized health-insurance guidance for newcomers to the United States.*

AskNewton helps Travelers, Students, Digital Nomads, and new Residents understand U.S. health insurance in minutes.  
This repository contains the full Replit-native AskNewton codebase: frontend, backend APIs, and the multi-agent “Society of Mind” engine.

---

## 🚀 Features

- **AI-powered plan recommendations** (GPT-5 architecture)  
- **Persona-specific workflows** for Nomads, Travelers, and Students  
- **WhatsApp advisor integration**  
- **Cost-tracking + OpenAI token usage logging**  
- **Idempotent request engine**  
- **Persona cache for cost optimization**  
- **Production-ready API with webhooks, storage, and monitoring**

---

## 🧱 Tech Stack

### Frontend
- React + TypeScript  
- Wouter router  
- Vite  
- shadcn/ui  

### Backend
- Node.js / Express  
- drizzle-orm  
- Neon Serverless Postgres  
- OpenAI API  
- ElevenLabs Webhooks  
- Replit-native runtime  

### AI Layer
- AskNewton “Society of Mind”  
- Persona matrix  
- Multi-agent orchestration (Evaluator, Recommender, Verifier)

---

## 📁 Repository Structure

```

apps-script/          # Utility scripts & automations
attached_assets/      # Assets for docs & marketing
client/               # Frontend (React)
src/
components/       # Marketing + UI components
data/             # Personas, FAQs
pages/            # Landing + persona pages
styles/           # Global CSS
data/                 # Seeds, migrations
docs/                 # Architecture, runbooks, integration guides
lib/                  # Helpers, utils, logging
public/               # Static assets
server/               # Backend APIs, webhooks, storage
shared/               # Types, validation schemas
society/              # AI agent orchestration system
tests/                # Automated test suite

````

---

## ⚙️ Getting Started

### 1. Install dependencies
```bash
npm install
````

### 2. Start development

```bash
npm run dev
```

Frontend → [http://localhost:5000](http://localhost:5000)
Backend → auto-managed (Replit runtime)

### 3. Production build

```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

Copy `.env.example` → `.env`:

```
OPENAI_API_KEY=
DATABASE_URL=
VITE_WHATSAPP_NUMBER=
HUBSPOT_PORTAL_ID=
HUBSPOT_CLIENT_SECRET=
ELEVEN_INIT_SECRET=
ELEVEN_END_SECRET=
```

Secrets must be set in Replit, Vercel, Fly.io, or GitHub Actions — **never committed**.

---

## 🧠 Adding a New Persona (5-Minute Workflow)

1. Add persona → `client/src/data/personas.ts`
2. Add FAQs → `client/src/data/faqs.ts`
3. Create page → `client/src/pages/<persona>.tsx`
4. Add route → `client/src/App.tsx`
5. Update navigation
6. Add SEO entry → `public/sitemap.xml`

Built-in components make persona creation extremely fast.

---

## 📈 Monitoring & Observability

This repo includes:

* Token-level OpenAI usage logging
* Cost monitoring (`openaiCallLog`)
* Idempotent request handling (`requestLog`)
* Webhook tracing (HubSpot, ElevenLabs)
* Health endpoints
* Persona cache hit tracking

---

## 🧪 Testing

```bash
npm run test
```

---

## 🚀 Deployment

Supported platforms:

| Layer        | Platform                 |
| ------------ | ------------------------ |
| Frontend     | Vercel / Replit Deploy   |
| Backend API  | Fly.io / Replit Deploy   |
| Database     | Neon Serverless Postgres |
| Edge caching | Cloudflare (optional)    |

---

## 🤝 Contributing

1. Fork
2. Branch
3. Commit
4. PR

Please include screenshots or logs when relevant.

---

## 📄 License

MIT License.
Attribution appreciated but not required.
