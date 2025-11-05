# 🚀 Deploy Now - Live Production in 5 Minutes

**Quick deployment commands for Render.com and Fly.io with pre-configured secrets.**

---

## Option 1: Render.com (Recommended - Fastest)

### Step 1: Generate API Keys

```bash
# Generate 3 secure API keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Save output as: API_KEY_1, API_KEY_2, API_KEY_3
```

### Step 2: Deploy via Render Dashboard

1. **Go to**: https://dashboard.render.com
2. **New** → **Blueprint**
3. **Connect Repository**: Select your GitHub repo
4. **Blueprint Path**: `society/render.yaml`
5. **Set Environment Variables**:

```env
NODE_ENV=production
PORT=4000
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
API_KEYS=YOUR_KEY_1,YOUR_KEY_2,YOUR_KEY_3
```

6. **Click**: "Apply Blueprint"

### Step 3: Verify Deployment

```bash
# Health check (should return {"ok": true})
curl https://asknewton-society.onrender.com/health

# Test with API key
curl -X POST https://asknewton-society.onrender.com/gateway \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY_1" \
  -d '{
    "channel": "web",
    "intent": "concierge",
    "message": "What health plans do you offer?"
  }'
```

**Done!** Your service is live at: `https://asknewton-society.onrender.com`

---

## Option 2: Fly.io (Recommended - Best Scaling)

### Step 1: Install Fly CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Step 2: Login and Initialize

```bash
fly auth login

# Navigate to society directory
cd society

# Launch app (follow prompts)
fly launch --config fly.toml --name asknewton-society
```

When prompted:
- **Region**: Choose closest to your users (sjc, ord, iad)
- **Postgres**: No (we'll connect to existing Neon)
- **Redis**: Yes (optional, recommended for caching)
- **Deploy now**: No (set secrets first)

### Step 3: Set Secrets

```bash
# Generate API keys
KEY1=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
KEY2=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
KEY3=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Set all secrets at once
fly secrets set \
  OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE \
  API_KEYS=$KEY1,$KEY2,$KEY3 \
  NODE_ENV=production

# Optional: Connect to existing database
fly secrets set DATABASE_URL="postgresql://user:pass@host/db"
```

### Step 4: Deploy

```bash
# Deploy to production
fly deploy

# Wait for deployment to complete...
# App will be available at: https://asknewton-society.fly.dev
```

### Step 5: Verify

```bash
# Health check
fly status
curl https://asknewton-society.fly.dev/health

# Test endpoint
curl -X POST https://asknewton-society.fly.dev/gateway \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $KEY1" \
  -d @example-requests/concierge.json
```

### Step 6: Monitor

```bash
# View logs
fly logs

# Scale if needed
fly scale count 2          # Run 2 instances
fly scale memory 512       # Increase to 512MB

# SSH into container
fly ssh console
```

**Done!** Your service is live at: `https://asknewton-society.fly.dev`

---

## Environment Variables Reference

### Required (Both Platforms)

```env
# OpenAI API Key (from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Environment
NODE_ENV=production

# Port (auto-set by platform usually)
PORT=4000  # Render uses this
# PORT=8080  # Fly.io uses this internally

# API Authentication (generate 3 secure keys)
API_KEYS=key1_here,key2_here,key3_here
```

### Optional (Production Enhancements)

```env
# Database (connect to existing Neon/Supabase)
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis (for caching and distributed rate limiting)
REDIS_URL=redis://default:password@host:6379

# Covered California API (for real plan data)
COVERED_CA_API_KEY=your_ca_api_key_here

# Rate Limiting (defaults shown)
RATE_LIMIT_WINDOW_MS=60000        # 1 minute
RATE_LIMIT_MAX_REQUESTS=60        # 60 requests per minute

# Logging
LOG_LEVEL=info                     # debug, info, warn, error
```

---

## Secure API Key Generation Script

Create this file for team use:

```bash
#!/bin/bash
# generate-keys.sh - Generate secure API keys for Society service

echo "🔑 Generating 3 secure API keys..."
echo ""

KEY1=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
KEY2=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
KEY3=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

echo "Key 1 (Main App): $KEY1"
echo "Key 2 (WhatsApp): $KEY2"
echo "Key 3 (Internal): $KEY3"
echo ""
echo "Comma-separated for API_KEYS env var:"
echo "$KEY1,$KEY2,$KEY3"
echo ""
echo "⚠️  Store these securely in your password manager!"
echo "💡 Use Key 1 for main app, Key 2 for WhatsApp, Key 3 for internal tools"
```

Usage:
```bash
chmod +x generate-keys.sh
./generate-keys.sh > api-keys.txt  # Save output
```

---

## Cost Calculator

### Render.com

| Component | Plan | Cost/Month |
|-----------|------|------------|
| Web Service | Starter | $7 |
| Redis (optional) | Starter | $7 |
| **Total** | | **$7-14** |

**OpenAI Usage** (GPT-4o-mini):
- 1,000 requests: ~$0.20
- 10,000 requests: ~$2.00
- 100,000 requests: ~$20.00

**Grand Total**: $9-34/mo (depends on traffic)

### Fly.io

| Component | Spec | Cost/Month |
|-----------|------|------------|
| VM (shared-cpu-1x) | 256MB RAM | $1.94 |
| Redis (256MB) | Optional | $3 |
| Bandwidth | 100GB free | $0 (under limit) |
| **Total** | | **$2-5** |

**OpenAI Usage**: Same as above

**Grand Total**: $4-25/mo (more cost-effective at scale)

---

## Quick Deployment Comparison

| Feature | Render | Fly.io |
|---------|--------|--------|
| **Setup Time** | 5 min | 10 min |
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cost (Low Traffic)** | $7/mo | $2/mo |
| **Cost (High Traffic)** | $14/mo | $5-10/mo |
| **Auto-Scaling** | Manual | Automatic |
| **Global Edge** | ❌ | ✅ |
| **SSL** | ✅ Auto | ✅ Auto |
| **CLI Required** | ❌ | ✅ |
| **Best For** | MVP/Simple | Scale/Advanced |

**Recommendation**: 
- Start with **Render** (faster setup, dashboard-based)
- Migrate to **Fly.io** when you hit 50k+ requests/month

---

## Post-Deployment Checklist

- [ ] Health endpoint responding (`/health`)
- [ ] API key authentication working (401 without key)
- [ ] Rate limiting active (429 after 60 req/min)
- [ ] Concierge agent tested
- [ ] Coverage Advisor agent tested
- [ ] Error responses validated
- [ ] Logs configured and readable
- [ ] API keys stored in password manager
- [ ] Team notified of new endpoint
- [ ] Integration with main app planned

---

## Next: Integrate with Main App

After deployment, connect your main AskNewton app:

1. Add Society endpoint to environment variables:
```env
# In main app .env
VITE_SOCIETY_API_URL=https://asknewton-society.onrender.com
SOCIETY_API_KEY=your_key_1_here
```

2. See `INTEGRATION_READY.md` for complete integration code

3. Test end-to-end flow:
   - User completes wizard → Gets 3 plan recommendations
   - User sends WhatsApp message → Gets instant AI response

---

## Troubleshooting

### "Health check failing"
```bash
# Check service logs
fly logs  # or Render dashboard
# Verify PORT env var matches platform (4000 for Render, 8080 for Fly)
```

### "401 Unauthorized"
```bash
# Verify API key is set correctly
curl -H "X-API-Key: WRONG_KEY" https://your-url.com/health
# Should return 401
```

### "OpenAI errors"
```bash
# Check API key and quota
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### "Out of memory"
```bash
# Increase memory (Fly.io)
fly scale memory 512

# Upgrade plan (Render)
# Dashboard → Settings → Change to Standard plan
```

---

## 🎉 You're Live!

Once deployed, your Society of Mind service is:
- ✅ Serving AI-powered health insurance guidance
- ✅ Auto-scaling with traffic
- ✅ Secured with API key authentication
- ✅ Monitoring via platform dashboards
- ✅ Ready for integration with main app

**Service URL**: Save this for integration
- Render: `https://asknewton-society.onrender.com`
- Fly.io: `https://asknewton-society.fly.dev`

**Next Steps**: Integrate with wizard → See `INTEGRATION_READY.md`
