# Quick Start: AskNewton Society of Mind

Get the AI agent system running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- OpenAI API key
- (Optional) PostgreSQL database
- (Optional) Redis instance

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd society
npm install
```

Or use the install script:
```bash
cd society
./install.sh
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```env
PORT=4000
OPENAI_API_KEY=sk-...your-key-here...
```

### 3. Start the Server

```bash
npm run dev
```

You should see:
```
🧠 AskNewton Society of Mind gateway listening on :4000
```

### 4. Test It Works

**Health Check:**
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{"ok": true, "service": "asknewton-society"}
```

**Test Concierge Agent:**
```bash
curl -X POST http://localhost:4000/gateway \
  -H "Content-Type: application/json" \
  -d '{"intent":"concierge","message":"What insurance plans do you offer?"}'
```

Expected response:
```json
{
  "agent": "concierge",
  "reply": "I can help you find the right health insurance plan..."
}
```

**Test Coverage Advisor:**
```bash
curl -X POST http://localhost:4000/gateway \
  -H "Content-Type: application/json" \
  -d @example-requests/coverage.json
```

Expected response:
```json
{
  "shortlist": [
    {
      "plan_id": "p1",
      "name": "Nomad Bronze 4500",
      "monthly_premium": 320,
      "oop_max": 9000,
      "est_annual_cost": 3840,
      "in_network_hits": ["Dr. Lee"],
      "pros_cons": {...},
      "explanation": "..."
    },
    ...
  ]
}
```

## What's Next?

### Immediate (This Week)

1. **Replace mock plans** - Update `src/tools/planCatalog.ts` with real Covered CA plan data
2. **Connect to main app** - See [INTEGRATION.md](./INTEGRATION.md) for details
3. **Add real provider data** - Update `src/tools/providerDir.ts`

### Short Term (Days 3-7)

4. **Add authentication** - Implement API key validation in gateway
5. **Add logging** - Structured logging for all agent interactions
6. **Add metrics** - Track response times, success rates

### Medium Term (Week 2-3)

7. **Add more agents** - Claims Helper, Benefits Navigator
8. **Add pgvector** - For semantic search over plan documents
9. **Add BullMQ jobs** - For async quote processing

## Troubleshooting

### Error: "Cannot find module 'openai'"

**Solution:** Run `npm install` in the `society/` directory

### Error: "OpenAI API key not found"

**Solution:** Set `OPENAI_API_KEY` in `society/.env`

### Error: "Port 4000 already in use"

**Solution:** Change `PORT` in `.env` or kill the process using port 4000:
```bash
lsof -ti:4000 | xargs kill -9
```

### No response from agents

**Solution:** 
1. Check server logs for errors
2. Verify OpenAI API key is valid
3. Test with example requests first

## File Structure Reference

```
society/
├── src/
│   ├── index.ts              # ← Entry point
│   ├── orchestrator/
│   │   └── router.ts         # ← Routes requests to agents
│   ├── agents/
│   │   ├── concierge.ts      # ← Chat agent
│   │   └── coverageAdvisor.ts # ← Plan recommendations
│   ├── schemas/
│   │   ├── intakeProfile.ts  # ← User data schema
│   │   └── recommendation.ts # ← Plan output schema
│   ├── tools/
│   │   ├── planCatalog.ts    # ← Plan database (mock)
│   │   └── providerDir.ts    # ← Provider lookup (mock)
│   ├── queue/
│   │   └── queue.ts          # ← BullMQ setup
│   └── utils/
│       └── openai.ts         # ← OpenAI client
├── example-requests/         # ← Test payloads
├── package.json              # ← Dependencies
├── tsconfig.json             # ← TypeScript config
└── .env                      # ← Your config (create this!)
```

## Common Tasks

### Add a New Agent

1. Create `src/agents/yourAgent.ts`:
```typescript
export const yourAgent = {
  async handle(input: any) {
    // Your logic here
    return { agent: 'yourAgent', result: '...' }
  }
}
```

2. Register in `src/orchestrator/router.ts`:
```typescript
import { yourAgent } from '../agents/yourAgent.js'

// In router.handle():
case 'your_intent':
  return await yourAgent.handle(data)
```

3. Test with curl:
```bash
curl -X POST http://localhost:4000/gateway \
  -H "Content-Type: application/json" \
  -d '{"intent":"your_intent","message":"test"}'
```

### Update Plan Data

Edit `src/tools/planCatalog.ts`:
```typescript
const MOCK_PLANS: Plan[] = [
  { 
    id: 'p1', 
    name: 'Your Plan Name', 
    metal: 'Gold', 
    premium: 450, 
    oop_max: 5000, 
    network: ['Dr. Smith', 'Dr. Jones'] 
  },
  // Add more plans...
]
```

### View Logs

All logs go to console. For structured logging, add:
```bash
npm run dev 2>&1 | tee logs/society.log
```

## Support

- **README.md** - Full documentation
- **INTEGRATION.md** - Connect to main AskNewton app
- **example-requests/** - Sample API calls

Ready to build? Start with the Coverage Advisor and iterate from there! 🚀
