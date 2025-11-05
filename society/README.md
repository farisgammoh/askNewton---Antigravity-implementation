# AskNewton Society of Mind (TypeScript)

Multi-agent AI system for health insurance guidance, built with Express + Zod + OpenAI + BullMQ.

## Architecture

### Layers
1. **Interface layer**: Web app, WhatsApp, SMS → single Gateway/API
2. **Agent layer**: Specialized agents (onboarding, plan advice, claims, etc.)
3. **Orchestrator layer**: Router + Guardrails + Memory + Tools registry
4. **Data layer**: Postgres (+pgvector), object storage, audit logs
5. **Workflow layer**: Long-running jobs (quotes, prior-auth, claims follow-ups)

### Current Agents

**Customer-Facing:**
- 🚪 **Onboarding Agent** - Identity & residency capture (integrate with existing wizard)
- 💡 **Coverage Advisor Agent** - Plan recommendations with LLM explanations
- 💬 **Concierge Agent** - Omni-channel Q&A, health insurance tutor

**Coming Soon:**
- 📋 Claims Helper Agent
- 🧮 Eligibility & Subsidy Agent
- 🏥 Network & Pricing Agent
- 🔐 Compliance & Governance Agent
- And 8+ more operational agents...

## Quick Start

### 1. Setup Environment
```bash
cd society
cp .env.example .env
# Edit .env with your values:
# - OPENAI_API_KEY (required)
# - DATABASE_URL (optional for now)
# - REDIS_URL (optional for now)
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Server starts on port **4000** (main AskNewton app is on 5000).

### 4. Test Endpoints

**Health Check:**
```bash
curl http://localhost:4000/health
```

**Coverage Recommendation:**
```bash
curl -X POST http://localhost:4000/gateway \
  -H "Content-Type: application/json" \
  -d @example-requests/coverage.json
```

**Concierge Chat:**
```bash
curl -X POST http://localhost:4000/gateway \
  -H "Content-Type: application/json" \
  -d @example-requests/concierge.json
```

## Project Structure

```
society/
├── src/
│   ├── index.ts                 # Express Gateway
│   ├── orchestrator/
│   │   └── router.ts           # Planner/Router (intent detection)
│   ├── agents/
│   │   ├── concierge.ts        # Customer service agent
│   │   └── coverageAdvisor.ts  # Plan recommendation agent
│   ├── schemas/
│   │   ├── intakeProfile.ts    # User intake data contract
│   │   └── recommendation.ts   # Plan recommendation contract
│   ├── tools/
│   │   ├── planCatalog.ts      # Plan database (stub - replace with real data)
│   │   └── providerDir.ts      # Provider network lookup
│   ├── queue/
│   │   └── queue.ts            # BullMQ setup for async jobs
│   └── utils/
│       └── openai.ts           # OpenAI client
└── example-requests/           # Sample payloads for testing
```

## Data Contracts

### IntakeProfile@v1
User information collected from intake wizard:
```typescript
{
  person: { age, email, ... },
  residency: { state, zip, visa_status, student },
  household: { size, dependents, income_range },
  doctors: string[],
  medications: string[],
  budget_usd_monthly: number,
  preferences: { mental_health, pcp_required }
}
```

### PlanRecommendationSet@v1
Coverage advisor output with 3 plan recommendations:
```typescript
{
  shortlist: [{
    plan_id, name,
    monthly_premium, oop_max, est_annual_cost,
    in_network_hits: string[],
    pros_cons: { pros, cons },
    explanation: string  // LLM-generated plain English
  }]
}
```

## Integration with Main AskNewton App

### Option 1: Direct Integration
From your existing intake wizard, POST to Society gateway:
```typescript
// After wizard completion:
const response = await fetch('http://localhost:4000/gateway', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    intent: 'coverage_recommendation',
    intake: {
      person: { age: formData.age, email: formData.email },
      residency: { state: 'CA', zip: formData.zip },
      household: { size: 1, dependents: 0 },
      doctors: formData.doctors || [],
      medications: [],
      budget_usd_monthly: formData.budget
    }
  })
})
const recommendations = await response.json()
```

### Option 2: WhatsApp Integration
Point your WhatsApp webhook to `/gateway` with intent: `concierge`:
```json
{
  "channel": "whatsapp",
  "intent": "concierge",
  "message": "I need health insurance for my family",
  "context": { "phone": "+1234567890" }
}
```

## Next Steps (10-Day Sprint)

### Days 1-2
- [ ] Replace `planCatalog.ts` stub with real Covered CA/ACA plan data
- [ ] Add pgvector table for plan document embeddings
- [ ] Improve plan matching logic with more filters

### Days 3-4
- [ ] Add PHI/consent guardrails at router level
- [ ] Implement exact/fuzzy provider name matching
- [ ] Add audit logging for all agent interactions

### Days 5-6
- [ ] Benefits Navigator stub (in-network appointment assist)
- [ ] BullMQ jobs for async quote retrieval
- [ ] Add retry logic and error handling

### Days 7-8
- [ ] Doc IQ Agent v0 (ID/EOB OCR → structured JSON)
- [ ] Instrument metrics (quote time, CSAT, plan-accept rate)
- [ ] Add request/response logging

### Days 9-10
- [ ] API auth (JWT per channel)
- [ ] Role-based tool access
- [ ] Admin console to view recommendations + logs

## Development

### Build for Production
```bash
npm run build
npm start
```

### Type Checking
```bash
npx tsc --noEmit
```

### Adding New Agents
1. Create `src/agents/yourAgent.ts` with `handle()` method
2. Add schema to `src/schemas/` if needed
3. Register in `src/orchestrator/router.ts`
4. Add example request to `example-requests/`

### Adding New Tools
1. Create `src/tools/yourTool.ts` with typed function
2. Import in relevant agent
3. (Optional) Register for OpenAI function calling

## OpenAI Function Calling Pattern

```typescript
// Define tool
export async function checkEligibility(age: number, state: string) {
  // ... implementation
  return { eligible: true, reason: 'Meets criteria' }
}

// In agent:
const tools = [{
  type: 'function',
  function: {
    name: 'checkEligibility',
    description: 'Check if user is eligible for coverage',
    parameters: {
      type: 'object',
      properties: {
        age: { type: 'number' },
        state: { type: 'string' }
      }
    }
  }
}]

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...],
  tools
})
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 4000) |
| `OPENAI_API_KEY` | Yes | OpenAI API key for LLM calls |
| `DATABASE_URL` | No | Postgres connection string |
| `REDIS_URL` | No | Redis connection for BullMQ |
| `NODE_ENV` | No | development/production |

## Monitoring

### Health Endpoint
```bash
curl http://localhost:4000/health
# Response: {"ok": true, "service": "asknewton-society"}
```

### Logs
All agent interactions are logged to console with structured format:
```
[2025-01-07 12:34:56] Router: coverage_recommendation intent detected
[2025-01-07 12:34:57] CoverageAdvisor: Processing intake for age 28, zip 94103
[2025-01-07 12:34:59] CoverageAdvisor: Generated 3 recommendations
```

## Roadmap

### Phase 1 (Current) - MVP
- ✅ Gateway + Router infrastructure
- ✅ Concierge agent
- ✅ Coverage Advisor agent
- ⏳ Integration with main AskNewton app
- ⏳ Real plan data integration

### Phase 2 - Claims & Benefits
- Claims Helper agent
- Benefits Navigator agent
- Network & Pricing agent
- Growth/CRM agent

### Phase 3 - MGA Ready
- Eligibility/Subsidy agent
- Underwriting/Risk agent
- Compliance/Governance agent
- Multi-state expansion
- SOC2/HIPAA maturity

## Support

For questions or issues:
- Check existing issues in the main AskNewton repository
- Review agent logs for debugging
- Test with example requests first
