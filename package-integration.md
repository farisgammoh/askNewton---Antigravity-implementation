# Integration Guide: Running Enhanced Webhook Server

## Quick Start (Development)

### Option 1: One-Command Launch (Recommended)
```bash
# Start both services with one command
node start-with-webhooks.js
```
This launches:
- Main AskNewton app on port 5000
- Enhanced webhook server on port 3000 
- Secure random admin token generated for development (if not set)
- Graceful shutdown handling

### Option 2: Manual Start
```bash
# Terminal 1: Main app
npm run dev

# Terminal 2: Webhook server
PORT=3000 ADMIN_TOKEN=your_token node server.js
```

## Production Integration

For production deployment, add to your package.json scripts (requires user approval):

```json
{
  "scripts": {
    "start:full": "node start-with-webhooks.js",
    "start:webhooks": "node server.js"
  }
}
```

## Environment Setup

Create `.env` file with:
```bash
# Required for webhook functionality
ELEVEN_INIT_SECRET=your_elevenlabs_init_secret
ELEVEN_END_SECRET=your_elevenlabs_end_secret

# Required for admin access (generate secure token in production)
ADMIN_TOKEN=secure_random_token_in_production

# Optional
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

## Verification Commands

```bash
# Check both services are running
curl http://localhost:5000/healthz  # Main app
curl http://localhost:3000/healthz  # Webhook server

# Test admin access (requires ADMIN_TOKEN)
curl -H "Authorization: Bearer your_token" \
  http://localhost:3000/admin/queue

# View comprehensive health
curl http://localhost:3000/health/resilience

# Monitor metrics
curl http://localhost:3000/metrics
```

This integration approach:
- ✅ Preserves existing workflow (`npm run dev` still works)
- ✅ Provides simple unified startup option
- ✅ Handles graceful shutdown of both services
- ✅ Sets sensible defaults for development
- ✅ Requires no changes to core package.json