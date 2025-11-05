# Deployment Guide

Complete deployment instructions for the AskNewton Society of Mind service.

---

## Quick Deploy Options

### Option 1: Render.com (Recommended for MVP)

**Cost**: $7/month (Starter plan) + $7/month for Redis (optional)

**Steps:**

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Add Society of Mind service"
   git push origin main
   ```

2. **Deploy via Render Dashboard**
   - Go to https://render.com
   - New → Blueprint
   - Connect repository
   - Select `society/render.yaml`
   - Click "Apply"

3. **Set Environment Variables**
   - In Render dashboard, go to your service
   - Environment tab
   - Set `OPENAI_API_KEY` (from OpenAI dashboard)
   - Optionally customize auto-generated `API_KEYS`

4. **Verify Deployment**
   ```bash
   curl https://asknewton-society.onrender.com/health
   # Should return: {"ok": true, "service": "asknewton-society"}
   ```

---

### Option 2: Fly.io (Recommended for Scale)

**Cost**: $0-5/month (free tier available), scales with usage

**Steps:**

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly**
   ```bash
   fly auth login
   ```

3. **Launch Application**
   ```bash
   cd society
   fly launch --config fly.toml
   # Accept defaults or customize
   ```

4. **Set Secrets**
   ```bash
   fly secrets set OPENAI_API_KEY=sk-...
   fly secrets set API_KEYS=key1,key2,key3
   fly secrets set DATABASE_URL=postgresql://...
   ```

5. **Deploy**
   ```bash
   fly deploy
   ```

6. **Verify**
   ```bash
   curl https://asknewton-society.fly.dev/health
   ```

---

### Option 3: Docker Compose (Local Testing)

**Steps:**

1. **Set Environment Variables**
   ```bash
   cd society
   cp .env.example .env
   # Edit .env with your OPENAI_API_KEY
   ```

2. **Start Services**
   ```bash
   docker-compose up -d
   ```

3. **Verify**
   ```bash
   curl http://localhost:4000/health
   ```

4. **View Logs**
   ```bash
   docker-compose logs -f society
   ```

5. **Stop Services**
   ```bash
   docker-compose down
   ```

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o-mini | `sk-proj-...` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `4000` (8080 on Fly.io) |

### Production Required

| Variable | Description | Example |
|----------|-------------|---------|
| `API_KEYS` | Comma-separated API keys for auth | `key1,key2,key3` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Uses Neon from main app |
| `REDIS_URL` | Redis connection string | In-memory fallback |
| `COVERED_CA_API_KEY` | Covered California API key | Mock data |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `60000` (1 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `60` |

---

## Build and Run Locally

### Using Node.js

```bash
cd society

# Install dependencies
npm install

# Run tests
npx tsx src/tests/agentResponse.test.ts
npx tsx src/tests/e2e.test.ts

# Start in development mode
npm run dev

# Build for production
npm run build

# Start production build
npm start
```

### Using Docker

```bash
cd society

# Build image
docker build -t asknewton-society:v1.1.1 .

# Run container
docker run -p 4000:4000 \
  -e OPENAI_API_KEY=sk-... \
  -e NODE_ENV=production \
  asknewton-society:v1.1.1

# Or with all env vars from file
docker run -p 4000:4000 --env-file .env asknewton-society:v1.1.1
```

---

## Post-Deployment Checklist

### Verification Steps

- [ ] Health check responds: `GET /health`
- [ ] API key protection works (401 without key)
- [ ] Rate limiting responds with 429 after limit
- [ ] Concierge agent works with example payload
- [ ] Coverage advisor works with example payload
- [ ] Error responses return proper AgentResponse format
- [ ] Logs are structured and readable
- [ ] Metrics are being collected (if configured)

### Test Requests

**Health Check:**
```bash
curl https://your-domain.com/health
```

**Concierge (with API key):**
```bash
curl -X POST https://your-domain.com/gateway \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key-here" \
  -d @example-requests/concierge.json
```

**Coverage Recommendation:**
```bash
curl -X POST https://your-domain.com/gateway \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key-here" \
  -d @example-requests/coverage.json
```

---

## Monitoring Setup

### Option 1: Render Built-in

Render provides automatic metrics:
- CPU/Memory usage
- Request rates
- Response times
- Error rates

Access via: Dashboard → Your Service → Metrics

### Option 2: External (DataDog, New Relic, etc.)

**Add to Dockerfile:**
```dockerfile
# Install DD agent
RUN npm install dd-trace --save
```

**Update src/index.ts:**
```typescript
import tracer from 'dd-trace'
tracer.init({
  service: 'asknewton-society',
  env: process.env.NODE_ENV
})
```

### Option 3: Prometheus + Grafana

**Add prometheus client:**
```bash
npm install prom-client
```

**Expose metrics endpoint** (already configured in fly.toml):
```typescript
import promClient from 'prom-client'
const register = new promClient.Registry()

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})
```

---

## Scaling Strategies

### Horizontal Scaling

**Render:**
```yaml
# In render.yaml
numInstances: 3 # Run 3 instances
```

**Fly.io:**
```bash
fly scale count 3
```

### Vertical Scaling

**Render:**
- Upgrade from Starter ($7) → Standard ($25) → Pro ($85)
- More CPU, RAM, dedicated resources

**Fly.io:**
```bash
fly scale vm shared-cpu-2x # 2 CPUs, 512MB RAM
fly scale memory 1024      # 1GB RAM
```

### Auto-Scaling (Fly.io)

Already configured in `fly.toml`:
```toml
[scaling]
  min_count = 1
  max_count = 5
```

Scales based on:
- Request concurrency (soft limit: 200)
- CPU/memory usage
- Custom metrics

---

## Rollback Procedure

### Render

1. Go to Dashboard → Your Service → Deploys
2. Find last good deploy
3. Click "Redeploy"

### Fly.io

```bash
# List releases
fly releases

# Rollback to previous
fly releases rollback
```

### Docker

```bash
# Tag stable version
docker tag asknewton-society:v1.1.1 asknewton-society:stable

# Rollback
docker pull asknewton-society:stable
docker run ... asknewton-society:stable
```

---

## Cost Optimization

### Tier Comparison

| Service | Free Tier | Starter | Standard |
|---------|-----------|---------|----------|
| **Render** | ❌ | $7/mo | $25/mo |
| **Fly.io** | 3 shared VMs free | ~$5/mo | ~$20/mo |
| **Railway** | $5 credit/mo | Pay-as-you-go | Pay-as-you-go |

### Cost Breakdown (100k requests/month)

**Render (Starter + Redis):**
- Service: $7/mo
- Redis: $7/mo
- **Total: $14/mo**

**Fly.io (1 VM + Redis):**
- VM (256MB): $1.94/mo
- Redis: $3/mo
- Data transfer: ~$1/mo
- **Total: ~$6/mo**

### OpenAI Costs

- GPT-4o-mini: $0.150 per 1M input tokens, $0.600 per 1M output tokens
- Average request: ~500 input + 200 output tokens = $0.00019
- **100k requests/month**: ~$19/mo

**Total Monthly Cost (100k requests):**
- Infrastructure: $6-14/mo
- OpenAI: $19/mo
- **Grand Total: $25-33/mo**

---

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
# Render
render logs <service-id>

# Fly.io
fly logs

# Docker
docker logs <container-id>
```

**Common issues:**
- Missing `OPENAI_API_KEY`
- Port mismatch (4000 vs 8080)
- Out of memory (upgrade plan)

### 500 Errors

**Check:**
1. OpenAI API quota
2. Database connection
3. Redis connection (if used)
4. Error logs for stack traces

### Rate Limiting Issues

**Adjust limits:**
```bash
# Increase from 60 to 120 req/min
fly secrets set RATE_LIMIT_MAX_REQUESTS=120
```

### Performance Issues

**Optimize:**
1. Add Redis for caching
2. Enable HTTP/2 and compression
3. Use CDN for static assets
4. Horizontal scale (more instances)

---

## Security Hardening

### Production Checklist

- [ ] API keys rotated regularly
- [ ] HTTPS enforced
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] Helmet.js headers added
- [ ] Request logging (no PII/PHI)
- [ ] Error messages sanitized
- [ ] Dependencies updated (npm audit)
- [ ] Secrets in environment (not code)
- [ ] Database connection encrypted

### Add Helmet.js

```bash
npm install helmet
```

```typescript
import helmet from 'helmet'
app.use(helmet())
```

### Add CORS

```bash
npm install cors
```

```typescript
import cors from 'cors'
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}))
```

---

## Next Steps After Deployment

1. **Monitor for 24 hours** - Watch error rates, response times
2. **Test all agents** - Concierge, Coverage Advisor
3. **Integrate with main app** - Follow INTEGRATION.md
4. **Add real plan data** - Follow PLAN_DATA_INTEGRATION.md
5. **Set up alerts** - Error rate >5%, latency >10s
6. **Document API keys** - Store securely in password manager
7. **Schedule weekly reviews** - Check logs, costs, performance

---

## Support

- **Documentation**: README.md, QUICKSTART.md, INTEGRATION.md
- **Tests**: `npm test` or `npx tsx src/tests/e2e.test.ts`
- **Logs**: Check service logs for errors and debugging
- **Health Check**: Always start with `GET /health`

**Deployment Status**: ✅ Production Ready (v1.1.1)
