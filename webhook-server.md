# Enhanced AskNewton Webhook Server with Resilience Patterns

## Overview

The enhanced webhook server (`server.js`) now includes comprehensive resilience patterns:
- **Circuit Breakers**: Prevent cascading failures to external services
- **Retry Logic**: Exponential backoff with jitter for transient errors  
- **Durable Queue**: Database-backed delivery with dead letter queue (DLQ)
- **Enhanced Metrics**: Comprehensive Prometheus monitoring
- **Security**: Admin endpoints protected with Bearer token authentication

## Required Environment Variables

```bash
# Webhook Security (existing)
ELEVEN_INIT_SECRET=your_elevenlabs_init_secret
ELEVEN_END_SECRET=your_elevenlabs_end_secret
SLACK_WEBHOOK_URL=your_slack_webhook_url  # optional

# Admin Security (new)
ADMIN_TOKEN=your_secure_admin_token  # for /admin/* and /events* endpoints

# Server Configuration
PORT=3000  # optional, defaults to 3000
```

## Running the Server

### Development
```bash
# Run webhook server with resilience patterns
PORT=3000 node server.js
```

### Production Integration Options

**Option 1: Run alongside main app (recommended)**
```bash
# Terminal 1: Main AskNewton app
npm run dev

# Terminal 2: Webhook server  
PORT=3000 ADMIN_TOKEN=secure_random_token node server.js
```

**Option 2: Process manager (PM2)**
```bash
# Install PM2 globally
npm install -g pm2

# Start both services
pm2 start npm --name "asknewton-main" -- run dev
pm2 start server.js --name "asknewton-webhooks" -- --port 3000

# View status
pm2 list
pm2 logs asknewton-webhooks
```

## API Endpoints

### Public Endpoints
- `GET /healthz` - Basic health check
- `GET /version` - Server version (1.3.0)
- `POST /webhooks/eleven/conversation-init` - ElevenLabs init webhook (HMAC protected)
- `POST /webhooks/eleven/conversation-end` - ElevenLabs end webhook (HMAC protected)

### Monitoring Endpoints
- `GET /health/resilience` - Circuit breakers, queue stats, metrics
- `GET /metrics` - Prometheus metrics

### Protected Admin Endpoints (require `Authorization: Bearer <ADMIN_TOKEN>`)
- `GET /events` - List events (with search/filter)
- `GET /events/ui` - Events management UI
- `POST /events/replay/:id` - Replay specific event
- `GET /admin/queue` - Queue management dashboard
- `POST /admin/replay-failed` - Replay failed deliveries

## Security Usage Examples

```bash
# Set admin token
export ADMIN_TOKEN="secure_random_token_12345"

# Access protected endpoints
curl -H "Authorization: Bearer secure_random_token_12345" \
  http://localhost:3000/events?limit=10

curl -H "Authorization: Bearer secure_random_token_12345" \
  http://localhost:3000/admin/queue
```

## Circuit Breaker States

- **CLOSED**: Normal operation, requests allowed
- **OPEN**: Failing fast, requests blocked (cooldown period active)
- **HALF_OPEN**: Testing if service recovered, limited requests allowed

## Queue Management

The queue system automatically:
- Retries failed deliveries with exponential backoff (max 8 attempts)
- Moves permanently failed items to DLQ after max attempts
- Provides replay functionality for manual intervention

## Metrics Available

- `asknewton_events_total` - Total webhook events accepted
- `asknewton_duplicates_total` - Duplicate events blocked
- `asknewton_invalid_signature_total` - HMAC signature failures
- `asknewton_outbound_ok_total` - Successful outbound deliveries
- `asknewton_outbound_retry_total` - Retrying deliveries
- `asknewton_outbound_failed_total` - Permanently failed deliveries
- `asknewton_circuit_open_total` - Circuit breaker activations
- `asknewton_queue_enqueued_total` - Items added to queue
- `asknewton_queue_processed_total` - Items processed by worker

## Database Schema

Enhanced with `outbound_attempts` table for durable delivery tracking:
- Persistent queue survives server restarts
- Full audit trail of delivery attempts
- Configurable retry strategies per destination