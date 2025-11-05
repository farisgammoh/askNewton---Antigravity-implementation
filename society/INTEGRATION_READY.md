# 🔌 Integration Ready - Connect to Main AskNewton App

**Complete integration code to connect Society of Mind service with your main AskNewton California application.**

---

## Overview

This guide shows you how to integrate the Society service into your existing AskNewton app to provide:

1. **Wizard → Coverage Recommendations**: AI-powered plan suggestions after intake
2. **WhatsApp → Concierge Chat**: Intelligent conversational support
3. **Real-time Plan Matching**: Personalized insurance recommendations

---

## Step 1: Environment Variables

Add to main app's `.env`:

```env
# Society of Mind API
VITE_SOCIETY_API_URL=https://asknewton-society.onrender.com
SOCIETY_API_KEY=your_generated_key_1_here

# For local development
# VITE_SOCIETY_API_URL=http://localhost:4000
```

**Note**: `VITE_` prefix is required for frontend access

---

## Step 2: Create Society Client Utility

Create `client/src/lib/societyClient.ts`:

```typescript
/**
 * Society of Mind API Client
 * Handles communication with the AI agent service
 */

interface SocietyRequest {
  channel: 'web' | 'whatsapp' | 'sms';
  intent: 'concierge' | 'coverage_recommendation';
  message?: string;
  intake?: any;
}

interface SocietyResponse {
  status: 'success' | 'error' | 'partial';
  agent: string;
  channel?: string;
  timestamp: string;
  metadata?: {
    processing_time_ms?: number;
    model_used?: string;
    routing_confidence?: number;
    plans_considered?: number;
    plans_returned?: number;
  };
  payload?: any;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

class SocietyClient {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_SOCIETY_API_URL || 'http://localhost:4000';
    this.apiKey = import.meta.env.VITE_SOCIETY_API_KEY || '';
  }

  private async request(data: SocietyRequest): Promise<SocietyResponse> {
    const response = await fetch(`${this.baseURL}/gateway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Society API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get AI-powered plan recommendations based on intake profile
   */
  async getCoverageRecommendations(intakeData: any): Promise<SocietyResponse> {
    // Map main app's lead schema to Society's intake schema
    const intake = {
      person: {
        first_name: intakeData.name?.split(' ')[0],
        last_name: intakeData.name?.split(' ').slice(1).join(' '),
        age: intakeData.age || 30, // Default if not provided
        email: intakeData.email
      },
      residency: {
        state: 'CA',
        zip: intakeData.zip || '90001',
        visa_status: intakeData.status !== 'Other' ? intakeData.status : undefined,
        student: intakeData.persona === 'student'
      },
      household: {
        size: intakeData.dependents === 'none' ? 1 : 
               intakeData.dependents === 'partner' ? 2 :
               intakeData.dependents === 'family' ? 4 : 1,
        dependents: intakeData.dependents === 'none' ? 0 :
                   intakeData.dependents === 'partner' ? 1 :
                   intakeData.dependents === 'family' ? 3 : 0
      },
      doctors: [],
      medications: [],
      preferences: {
        mental_health: intakeData.budgetOrNetwork?.includes('mental'),
        pcp_required: true
      }
    };

    return this.request({
      channel: 'web',
      intent: 'coverage_recommendation',
      intake
    });
  }

  /**
   * Get conversational response from Concierge agent
   */
  async chat(message: string, channel: 'web' | 'whatsapp' | 'sms' = 'web'): Promise<SocietyResponse> {
    return this.request({
      channel,
      intent: 'concierge',
      message
    });
  }

  /**
   * Check if Society service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const societyClient = new SocietyClient();
export type { SocietyResponse };
```

---

## Step 3: Integrate with Wizard

Update `client/src/components/IntakeWizard.tsx`:

```typescript
import { societyClient, type SocietyResponse } from "@/lib/societyClient";
import { useState } from "react";

// Add state for recommendations
const [recommendations, setRecommendations] = useState<SocietyResponse | null>(null);
const [loadingRecommendations, setLoadingRecommendations] = useState(false);

// Update the submit mutation
const submitMutation = useMutation({
  mutationFn: async (data: LeadFormData) => {
    // 1. Submit lead to main app
    const leadResult = await apiRequest("/api/lead", {
      method: "POST",
      body: JSON.stringify(data)
    });

    // 2. Get AI-powered recommendations from Society
    try {
      setLoadingRecommendations(true);
      const recs = await societyClient.getCoverageRecommendations(data);
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      // Don't fail the whole submission if recommendations fail
    } finally {
      setLoadingRecommendations(false);
    }

    return leadResult;
  },
  onSuccess: () => {
    toast({
      title: "Success!",
      description: "Your information has been submitted. Generating personalized recommendations..."
    });
    // Show recommendations page instead of immediate redirect
    setCurrentStep(steps.length); // Go to recommendations step
  },
  onError: (error: Error) => {
    toast({
      title: "Error",
      description: error.message || "Failed to submit. Please try again.",
      variant: "destructive"
    });
  }
});

// Add a recommendations display step after the final step
{currentStep === steps.length && (
  <Card>
    <CardHeader>
      <CardTitle>Your Personalized Plan Recommendations</CardTitle>
    </CardHeader>
    <CardContent>
      {loadingRecommendations ? (
        <div className="text-center py-8">
          <p>Analyzing your needs and finding the best plans...</p>
        </div>
      ) : recommendations?.status === 'success' ? (
        <div className="space-y-4">
          <p className="text-muted-foreground mb-4">
            {recommendations.payload.explanation}
          </p>
          
          {recommendations.payload.shortlist.map((plan: any, index: number) => (
            <Card key={index} className="p-4">
              <h3 className="font-semibold text-lg mb-2">{plan.plan_name}</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Premium:</span>
                  <span className="font-semibold">${plan.premium_usd_monthly}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span>{plan.network_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Match Score:</span>
                  <span className="font-semibold">{Math.round(plan.match_score * 100)}%</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{plan.why_recommended}</p>
            </Card>
          ))}

          <Button 
            className="w-full mt-4" 
            onClick={() => window.open('https://wa.me/1234567890', '_blank')}
            data-testid="button-whatsapp-connect"
          >
            Continue on WhatsApp to Complete Enrollment
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          <p>We'll send you personalized recommendations via email shortly.</p>
          <Button onClick={() => setLocation('/thank-you')} className="mt-4">
            Continue
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
)}
```

---

## Step 4: Integrate with WhatsApp

Update `server/routes.ts` - `/api/message` endpoint:

```typescript
// Replace the existing OpenAI call with Society Concierge
app.post("/api/message", async (req, res) => {
  try {
    const { From, Body, To } = req.body;
    
    if (!From || !Body || !To) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const isWhatsApp = From.startsWith("whatsapp:");
    const channel = isWhatsApp ? "whatsapp" : "sms";
    
    console.log(`📱 Received ${channel} message from ${From.substring(0,3)}***`);

    // Forward to webhook
    const webhookUrl = process.env.WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel,
            from: From,
            to: To,
            message: Body,
            timestamp: new Date().toISOString()
          })
        });
        console.log(`📡 Message forwarded to webhook`);
      } catch (error) {
        console.error('Webhook error:', error);
      }
    }

    // Generate smart response using Society Concierge
    let followUp = "Thanks for reaching out! We'll help you find the best health insurance options.";
    
    if (isWhatsApp && !Body.toLowerCase().includes("stop")) {
      try {
        // Call Society of Mind service
        const societyResponse = await fetch(
          `${process.env.SOCIETY_API_URL || 'http://localhost:4000'}/gateway`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': process.env.SOCIETY_API_KEY || ''
            },
            body: JSON.stringify({
              channel: 'whatsapp',
              intent: 'concierge',
              message: Body
            })
          }
        );

        if (societyResponse.ok) {
          const result = await societyResponse.json();
          if (result.status === 'success' && result.payload?.reply) {
            followUp = result.payload.reply;
            console.log(`🤖 Society Concierge response (${result.metadata?.processing_time_ms}ms)`);
          }
        }
      } catch (error) {
        console.error('Society API error:', error);
        // Fallback to default message
      }
    }

    // Send response via Twilio
    if (twilioClient) {
      try {
        await twilioClient.messages.create({
          body: followUp,
          from: To,
          to: From
        });
        console.log(`✅ Response sent via ${channel}`);
      } catch (error) {
        console.error('Twilio send error:', error);
      }
    }

    res.status(200).json({ success: true, message: "Message processed" });
  } catch (error) {
    console.error('Message processing error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

Add to server's `.env`:

```env
SOCIETY_API_URL=https://asknewton-society.onrender.com
SOCIETY_API_KEY=your_generated_key_1_here
```

---

## Step 5: Optional - Create Recommendations Page

Create `client/src/pages/RecommendationsPage.tsx`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { societyClient } from "@/lib/societyClient";

export default function RecommendationsPage() {
  const [, setLocation] = useLocation();

  // Get lead ID from URL params or session storage
  const leadId = new URLSearchParams(window.location.search).get('leadId');

  const { data: lead } = useQuery({
    queryKey: ['/api/leads', leadId],
    enabled: !!leadId
  });

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations', leadId],
    queryFn: async () => {
      if (!lead) return null;
      return societyClient.getCoverageRecommendations(lead);
    },
    enabled: !!lead
  });

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Analyzing your needs and finding the best plans...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!recommendations || recommendations.status !== 'success') {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p>We'll send you personalized recommendations via email shortly.</p>
            <Button onClick={() => setLocation('/thank-you')} className="mt-4">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Personalized Plan Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            {recommendations.payload.explanation}
          </p>

          <div className="grid gap-4">
            {recommendations.payload.shortlist.map((plan: any, index: number) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{plan.plan_name}</CardTitle>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${plan.premium_usd_monthly}</div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Network:</span>{' '}
                      <span className="font-medium">{plan.network_type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Match Score:</span>{' '}
                      <span className="font-medium">{Math.round(plan.match_score * 100)}%</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">{plan.why_recommended}</p>
                  </div>

                  {plan.next_steps && (
                    <div className="text-sm">
                      <span className="font-medium">Next Steps:</span> {plan.next_steps}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-4">
            <Button 
              className="flex-1" 
              onClick={() => window.open('https://wa.me/1234567890', '_blank')}
              data-testid="button-whatsapp-enroll"
            >
              Continue on WhatsApp
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setLocation('/thank-you')}
            >
              I'll Review Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

Register in `client/src/App.tsx`:

```typescript
import RecommendationsPage from "@/pages/RecommendationsPage";

// Add route
<Route path="/recommendations" component={RecommendationsPage} />
```

---

## Step 6: Testing Integration

### Test Coverage Recommendations

```bash
# Start Society service (in society/ directory)
npm run dev

# Start main app (in root directory)
npm run dev

# Complete the wizard and check browser console
# Should see Society API call and recommendations display
```

### Test WhatsApp Integration

```bash
# Use Twilio console to send test message
# Or use curl to simulate webhook:

curl -X POST http://localhost:5000/api/message \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+15555551234&To=whatsapp:+15555555678&Body=What plans do you offer for students?"

# Check response uses Society Concierge
```

---

## Integration Checklist

- [ ] Environment variables set (frontend and backend)
- [ ] Society client utility created
- [ ] Wizard updated to fetch recommendations
- [ ] WhatsApp endpoint updated to use Concierge
- [ ] Test recommendations display correctly
- [ ] Test WhatsApp responses are intelligent
- [ ] Error handling for Society API failures
- [ ] Fallback messages for when Society is down
- [ ] Loading states while fetching recommendations

---

## Monitoring Integration Health

Add to `server/routes.ts`:

```typescript
// Health check that includes Society status
app.get("/api/health", async (req, res) => {
  const health = {
    app: "ok",
    database: "checking",
    society: "checking"
  };

  // Check database
  try {
    const storageInstance = await storage();
    await storageInstance.getLeads(); // Simple query
    health.database = "ok";
  } catch {
    health.database = "error";
  }

  // Check Society service
  try {
    const response = await fetch(`${process.env.SOCIETY_API_URL}/health`, {
      signal: AbortSignal.timeout(5000)
    });
    health.society = response.ok ? "ok" : "error";
  } catch {
    health.society = "error";
  }

  const allOk = Object.values(health).every(v => v === "ok");
  res.status(allOk ? 200 : 503).json(health);
});
```

---

## Cost Impact

**Before Integration:**
- Main app: $7/mo (Render) + OpenAI usage
- Total: ~$10-15/mo

**After Integration:**
- Main app: $7/mo
- Society service: $7/mo
- OpenAI usage: ~$20/mo (100k requests)
- **Total: ~$34/mo**

**ROI:**
- Faster, more accurate recommendations
- Unified AI experience across channels
- Extensible for future agents (Claims, Benefits)
- Production-grade error handling and monitoring

---

## Troubleshooting

### "Cannot connect to Society API"

Check:
1. Society service is running
2. `SOCIETY_API_URL` environment variable is set
3. API key is valid
4. Network connectivity (CORS, firewall)

### "Recommendations not showing"

Check:
1. Browser console for errors
2. Society service logs
3. Intake data mapping (lead → intake schema)
4. OpenAI API key is set in Society

### "WhatsApp responses are slow"

Optimization:
1. Add Redis caching to Society
2. Use shorter OpenAI timeouts
3. Implement async processing with BullMQ
4. Consider regional deployment closer to users

---

## Next Steps

1. ✅ Deploy Society service (see DEPLOY_NOW.md)
2. ✅ Add integration code (this guide)
3. Test with beta users
4. Monitor error rates and response times
5. Gather feedback on recommendation quality
6. Iterate on prompts and matching logic

---

**Integration Status**: ✅ Ready to Implement

**Estimated Integration Time**: 2-3 hours  
**Deployment Time**: 10 minutes  
**Total Time to Production**: Half day
