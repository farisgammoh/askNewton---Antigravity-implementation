# Integration Guide: AskNewton Society of Mind

This guide shows how to integrate the Society of Mind AI agents with your existing AskNewton California application.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     AskNewton Main App                       │
│                     (Port 5000)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ React Wizard │  │  WhatsApp    │  │  API Routes  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ HTTP POST        │ Webhook          │ Internal
          └──────────────────┴──────────────────┘
                             │
                             ▼
          ┌──────────────────────────────────────┐
          │  Society of Mind Gateway             │
          │  (Port 4000)                         │
          │  ┌────────────────────────────┐     │
          │  │  Router / Orchestrator     │     │
          │  └────────┬───────────────────┘     │
          │           │                          │
          │  ┌────────┴───────────┐             │
          │  │                    │             │
          │  ▼                    ▼             │
          │ ┌──────────┐    ┌──────────┐       │
          │ │Concierge │    │Coverage  │       │
          │ │  Agent   │    │Advisor   │       │
          │ └──────────┘    └──────────┘       │
          └──────────────────────────────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │   OpenAI    │
                      └─────────────┘
```

## Integration Methods

### Method 1: From React Intake Wizard

When a user completes the intake wizard, send their data to the Coverage Advisor agent to get plan recommendations.

#### 1. Add API call after wizard completion

In your `client/src/pages/IntakeWizard.tsx` (or similar):

```typescript
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@lib/queryClient'

// After wizard form submission
const handleComplete = async (formData: any) => {
  // Build IntakeProfile from wizard data
  const intakeProfile = {
    person: {
      age: parseInt(formData.age),
      email: formData.email
    },
    residency: {
      state: formData.state || 'CA',
      zip: formData.zipCode,
      student: formData.visaType === 'F-1' || formData.visaType === 'J-1',
      visa_status: formData.visaType
    },
    household: {
      size: parseInt(formData.householdSize) || 1,
      dependents: parseInt(formData.dependents) || 0,
      income_range: formData.incomeRange
    },
    doctors: formData.preferredDoctors || [],
    medications: formData.medications || [],
    budget_usd_monthly: formData.monthlyBudget ? parseInt(formData.monthlyBudget) : undefined,
    preferences: {
      mental_health: formData.needsMentalHealth,
      pcp_required: formData.needsPCP
    }
  }

  // Call Society of Mind gateway
  const recommendations = await apiRequest('/api/society/recommend', {
    method: 'POST',
    body: JSON.stringify({
      intent: 'coverage_recommendation',
      intake: intakeProfile
    })
  })

  // Show recommendations to user
  setRecommendations(recommendations.shortlist)
}
```

#### 2. Add backend proxy route

In your `server/routes.ts`:

```typescript
import express from 'express'
const router = express.Router()

// Proxy to Society of Mind service
router.post('/api/society/recommend', async (req, res) => {
  try {
    const societyUrl = process.env.SOCIETY_URL || 'http://localhost:4000'
    const response = await fetch(`${societyUrl}/gateway`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    })
    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Society API error:', error)
    res.status(500).json({ error: 'Failed to get recommendations' })
  }
})
```

#### 3. Display recommendations UI

Create a component to show the 3-plan comparison:

```typescript
// client/src/components/PlanRecommendations.tsx
interface PlanOption {
  plan_id: string
  name: string
  monthly_premium: number
  oop_max: number
  est_annual_cost: number
  in_network_hits: string[]
  pros_cons: { pros: string[], cons: string[] }
  explanation: string
}

export function PlanRecommendations({ plans }: { plans: PlanOption[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map(plan => (
        <Card key={plan.plan_id}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>
              ${plan.monthly_premium}/month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Out-of-Pocket Max</p>
                <p className="text-2xl font-bold">${plan.oop_max.toLocaleString()}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Estimated Annual Cost</p>
                <p className="text-lg">${plan.est_annual_cost.toLocaleString()}</p>
              </div>

              {plan.in_network_hits.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Your Doctors In-Network:</p>
                  <ul className="text-sm text-muted-foreground">
                    {plan.in_network_hits.map(doc => (
                      <li key={doc}>✓ {doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-sm text-muted-foreground">{plan.explanation}</p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="font-medium">Pros:</p>
                  <ul className="list-disc list-inside">
                    {plan.pros_cons.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Cons:</p>
                  <ul className="list-disc list-inside">
                    {plan.pros_cons.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" data-testid={`button-select-plan-${plan.plan_id}`}>
              Select Plan
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
```

---

### Method 2: WhatsApp Integration

Connect your WhatsApp webhook to the Concierge agent for conversational support.

#### 1. Update WhatsApp webhook handler

In your `server/routes.ts`:

```typescript
router.post('/webhooks/whatsapp', async (req, res) => {
  const { from, body: message } = req.body

  // Forward to Society Concierge agent
  const societyUrl = process.env.SOCIETY_URL || 'http://localhost:4000'
  const response = await fetch(`${societyUrl}/gateway`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: 'whatsapp',
      intent: 'concierge',
      message: message,
      context: { phone: from }
    })
  })

  const aiResponse = await response.json()

  // Send AI reply back via WhatsApp (using your existing Twilio setup)
  await sendWhatsAppMessage(from, aiResponse.reply)

  res.json({ success: true })
})
```

---

### Method 3: Direct API Integration

Call the Society gateway directly from any service:

```typescript
// Example: Background job to process new leads
async function processNewLead(leadId: string) {
  const lead = await db.leads.findById(leadId)
  
  const intakeProfile = {
    person: { age: lead.age, email: lead.email },
    residency: { state: lead.state, zip: lead.zip },
    household: { size: 1, dependents: 0 },
    doctors: [],
    medications: [],
    budget_usd_monthly: lead.budget
  }

  const response = await fetch('http://localhost:4000/gateway', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'coverage_recommendation',
      intake: intakeProfile
    })
  })

  const recommendations = await response.json()
  
  // Save recommendations to database
  await db.leadRecommendations.create({
    leadId,
    plans: recommendations.shortlist
  })
}
```

---

## Environment Setup

### Main App (.env)
```env
SOCIETY_URL=http://localhost:4000
```

### Society Service (society/.env)
```env
PORT=4000
OPENAI_API_KEY=your_key_here
DATABASE_URL=postgresql://...  # Share with main app
REDIS_URL=redis://localhost:6379  # Optional for now
```

---

## Testing Integration

### 1. Start both services

**Terminal 1 - Main AskNewton App:**
```bash
npm run dev  # Runs on port 5000
```

**Terminal 2 - Society Service:**
```bash
cd society
npm run dev  # Runs on port 4000
```

### 2. Test from main app

```bash
# From main app, proxy to society
curl -X POST http://localhost:5000/api/society/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "intent": "coverage_recommendation",
    "intake": {
      "person": {"age": 28, "email": "test@example.com"},
      "residency": {"state": "CA", "zip": "94103"},
      "household": {"size": 1, "dependents": 0},
      "doctors": ["Dr. Lee"],
      "medications": [],
      "budget_usd_monthly": 400
    }
  }'
```

### 3. Test Society directly

```bash
# Direct to society service
curl -X POST http://localhost:4000/gateway \
  -H "Content-Type: application/json" \n  -d @society/example-requests/coverage.json
```

---

## Deployment Considerations

### Production Setup

1. **Deploy Society service separately:**
   - Use Railway, Render, or Replit deployment
   - Set `SOCIETY_URL` in main app to production URL

2. **Shared resources:**
   - Both services can share the same Postgres database
   - Both services can share the same Redis instance

3. **Authentication:**
   - Add API key validation in gateway
   - Use internal service token for main app → society calls

### Scaling

- Society service is stateless and can scale horizontally
- Use Redis for shared session/cache if needed
- Consider rate limiting on gateway endpoint

---

## Troubleshooting

### Issue: Connection refused to port 4000
**Solution:** Ensure Society service is running: `cd society && npm run dev`

### Issue: OpenAI API errors
**Solution:** Check `OPENAI_API_KEY` is set in `society/.env`

### Issue: Plans not matching
**Solution:** Update `society/src/tools/planCatalog.ts` with real plan data

### Issue: Slow response times
**Solution:** 
- Check OpenAI API latency
- Add caching for plan catalog
- Consider using `gpt-4o-mini` instead of `gpt-4o`

---

## Next Steps

1. **Replace mock data:** Update `planCatalog.ts` with real Covered CA plans
2. **Add authentication:** Implement API key validation
3. **Add monitoring:** Log all agent interactions
4. **Enhance agents:** Add more sophisticated plan matching logic
5. **Add more agents:** Claims Helper, Benefits Navigator, etc.

## Support

For questions about integration:
- Review example requests in `society/example-requests/`
- Check Society service logs for errors
- Test endpoints individually before integration
