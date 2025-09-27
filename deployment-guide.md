# Multi-Region Deployment Guide

## Production Deployment Options

### 1. Fly.io Deployment (Recommended)

**Setup:**
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Create app
fly launch --name asknewton-webhooks --region ord

# Set secrets
fly secrets set ADMIN_TOKEN="$(openssl rand -hex 32)"
fly secrets set ELEVEN_INIT_SECRET="your_elevenlabs_init_secret"
fly secrets set ELEVEN_END_SECRET="your_elevenlabs_end_secret" 
fly secrets set SLACK_WEBHOOK_URL="your_slack_webhook_url"

# Deploy
fly deploy
```

**fly.toml configuration:**
```toml
app = "asknewton-webhooks"
primary_region = "ord"

[build]
  image = "node:20-alpine"
  [build.args]
    NODE_ENV = "production"

[env]
  NODE_ENV = "production"
  PORT = "3000"

[[services]]
  internal_port = 3000
  protocol = "tcp"
  
  [[services.ports]]
    handlers = ["http"]
    port = 80
    
  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
    
  [services.concurrency]
    type = "connections"
    hard_limit = 1000
    soft_limit = 800

[[services.http_checks]]
  interval = "10s"
  method = "GET" 
  path = "/healthz"
  timeout = "5s"

[mounts]
  source = "webhook_data"
  destination = "/app/data"
```

### 2. Render Deployment

**render.yaml:**
```yaml
services:
  - type: web
    name: asknewton-webhooks
    env: node
    buildCommand: npm ci
    startCommand: node server.js
    plan: starter
    region: oregon
    envVars:
      - key: NODE_ENV
        value: production
      - key: ADMIN_TOKEN
        generateValue: true
      - key: ELEVEN_INIT_SECRET
        sync: false
      - key: ELEVEN_END_SECRET
        sync: false
      - key: SLACK_WEBHOOK_URL
        sync: false
    healthCheckPath: /healthz
    
  - type: pserv
    name: webhook-postgres
    plan: starter
    region: oregon
    databaseName: webhooks
    databaseUser: webhookuser
```

### 3. Google Cloud Run

```bash
# Build and push image
docker build -t gcr.io/your-project/asknewton-webhooks .
docker push gcr.io/your-project/asknewton-webhooks

# Deploy
gcloud run deploy asknewton-webhooks \
  --image gcr.io/your-project/asknewton-webhooks \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --concurrency 1000 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production \
  --set-secrets ADMIN_TOKEN=webhook-admin-token:latest,ELEVEN_INIT_SECRET=eleven-init:latest
```

## Multi-Region Architecture

### Active-Passive Setup
```
┌─── Region 1 (Primary) ────┐    ┌─── Region 2 (Backup) ────┐
│  Load Balancer            │    │  Load Balancer           │
│  ├── Webhook Server A     │    │  ├── Webhook Server C    │
│  ├── Webhook Server B     │    │  ├── Webhook Server D    │
│  └── SQLite + Backup      │◄──►│  └── SQLite + Sync       │
└───────────────────────────┘    └──────────────────────────┘
```

### Database Replication Options

**Option 1: SQLite with Litestream**
```bash
# Install Litestream
curl -fsSL https://litestream.io/install.sh | sh

# Configure replication
litestream replicate data/webhooks.db s3://your-bucket/webhooks.db
```

**Option 2: PostgreSQL**
```javascript
// Update db.js to use PostgreSQL in production
const db = process.env.NODE_ENV === 'production' 
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : sqlite('data/webhooks.db');
```

## Load Balancing & CDN

### Cloudflare Setup
1. **DNS**: Point webhook domains to multiple regions
2. **Load Balancing**: Configure health checks on `/healthz`
3. **Failover**: Automatic failover to backup regions
4. **Rate Limiting**: Protect against webhook spam

### Health Check Configuration
```javascript
// Enhanced health check for load balancers
app.get('/health/detailed', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.3.0',
    region: process.env.FLY_REGION || process.env.RENDER_REGION || 'unknown',
    database: 'connected',
    queue: 'processing',
    breakers: breakerStates().filter(b => b.state === 'OPEN').length,
    uptime: process.uptime()
  };
  
  // Check database connectivity
  try {
    await db.get("SELECT 1");
  } catch (err) {
    health.status = 'unhealthy';
    health.database = 'error';
  }
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

## Environment-Specific Configurations

### Development
```env
NODE_ENV=development
PORT=3000
ADMIN_TOKEN=dev_token_12345
LOG_LEVEL=debug
```

### Staging
```env
NODE_ENV=staging
PORT=3000
ADMIN_TOKEN=secure_staging_token
SLACK_WEBHOOK_URL=https://hooks.slack.com/staging
LOG_LEVEL=info
```

### Production
```env
NODE_ENV=production
PORT=3000
ADMIN_TOKEN=ultra_secure_production_token
SLACK_WEBHOOK_URL=https://hooks.slack.com/production
LOG_LEVEL=error
METRICS_RETENTION_DAYS=30
```

## Monitoring & Alerting

### Prometheus + Grafana Stack
```yaml
# monitoring-stack.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports: ["9090:9090"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      
  grafana:
    image: grafana/grafana
    ports: ["3001:3000"]
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

  alertmanager:
    image: prom/alertmanager
    ports: ["9093:9093"]
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
```

### Key Metrics to Monitor
- `asknewton_circuit_open_total` - Circuit breaker failures
- `asknewton_outbound_failed_total` - Delivery failures  
- `asknewton_retry_exhausted_total` - Dead letter queue growth
- `asknewton_events_total` - Webhook volume
- Response time percentiles (p95, p99)
- Memory and CPU utilization

## Security Hardening

### Production Checklist
- [ ] Generate cryptographically secure `ADMIN_TOKEN`
- [ ] Enable HTTPS/TLS termination
- [ ] Configure rate limiting (1000 req/min per IP)
- [ ] Set up IP allowlisting for admin endpoints
- [ ] Enable request logging and monitoring
- [ ] Implement log rotation and retention policies
- [ ] Regular security updates and dependency scanning
- [ ] Database encryption at rest
- [ ] Network-level isolation between services

### Example Nginx Configuration
```nginx
upstream webhook_servers {
    server webhook1:3000 max_fails=3 fail_timeout=30s;
    server webhook2:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl http2;
    server_name webhooks.asknewton.com;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=webhooks:10m rate=100r/m;
    
    location /webhooks/ {
        limit_req zone=webhooks burst=20 nodelay;
        proxy_pass http://webhook_servers;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /admin/ {
        # Restrict admin access
        allow 10.0.0.0/8;
        deny all;
        
        proxy_pass http://webhook_servers;
    }
}
```

This deployment guide provides comprehensive coverage for taking your webhook server from development to production-ready multi-region deployment with enterprise-grade reliability.