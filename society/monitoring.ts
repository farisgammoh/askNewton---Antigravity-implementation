/**
 * Lightweight Monitoring Setup for Society of Mind
 * 
 * Features:
 * - Structured logging with Winston
 * - Health check monitoring
 * - Performance metrics tracking
 * - Error alerting via Slack webhook
 * 
 * Setup:
 * 1. Install winston: npm install winston @types/winston
 * 2. Import and use in index.ts
 * 3. Set SLACK_WEBHOOK_URL in environment
 * 
 * Note: This file is provided as a reference implementation.
 * Winston is not included by default to keep the base install lightweight.
 * Install it when you're ready to add production monitoring.
 */

// @ts-ignore - winston is an optional dependency
import winston from 'winston'

// ============================================================================
// 1. Structured Logging
// ============================================================================

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'asknewton-society',
    version: '1.1.2'
  },
  transports: [
    // Console output (for Render/Fly.io logs)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // Optional: Send to external log aggregator
    // new winston.transports.Http({
    //   host: 'logs.papertrailapp.com',
    //   port: 12345,
    //   path: '/api/events'
    // })
  ]
})

// ============================================================================
// 2. Performance Metrics
// ============================================================================

interface Metrics {
  requests_total: number
  requests_success: number
  requests_error: number
  avg_response_time_ms: number
  agent_calls: { [agent: string]: number }
  intents: { [intent: string]: number }
}

class MetricsCollector {
  private metrics: Metrics = {
    requests_total: 0,
    requests_success: 0,
    requests_error: 0,
    avg_response_time_ms: 0,
    agent_calls: {},
    intents: {}
  }
  
  private responseTimes: number[] = []

  recordRequest(success: boolean, timeMs: number, agent?: string, intent?: string) {
    this.metrics.requests_total++
    
    if (success) {
      this.metrics.requests_success++
    } else {
      this.metrics.requests_error++
    }

    this.responseTimes.push(timeMs)
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift() // Keep last 100
    }
    
    this.metrics.avg_response_time_ms = 
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length

    if (agent) {
      this.metrics.agent_calls[agent] = (this.metrics.agent_calls[agent] || 0) + 1
    }

    if (intent) {
      this.metrics.intents[intent] = (this.metrics.intents[intent] || 0) + 1
    }

    // Alert on high error rate
    const errorRate = this.metrics.requests_error / this.metrics.requests_total
    if (this.metrics.requests_total > 10 && errorRate > 0.1) {
      this.alertHighErrorRate(errorRate)
    }

    // Alert on slow responses
    if (timeMs > 10000) {
      this.alertSlowResponse(timeMs, agent, intent)
    }
  }

  getMetrics(): Metrics {
    return { ...this.metrics }
  }

  private async alertHighErrorRate(rate: number) {
    await this.sendSlackAlert({
      text: `🚨 High Error Rate: ${(rate * 100).toFixed(1)}%`,
      details: `Total: ${this.metrics.requests_total}, Errors: ${this.metrics.requests_error}`
    })
  }

  private async alertSlowResponse(timeMs: number, agent?: string, intent?: string) {
    await this.sendSlackAlert({
      text: `⏱️ Slow Response: ${timeMs}ms`,
      details: `Agent: ${agent}, Intent: ${intent}`
    })
  }

  private async sendSlackAlert(alert: { text: string; details?: string }) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL
    if (!webhookUrl) return

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: alert.text,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${alert.text}*\n${alert.details || ''}`
              }
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `Environment: ${process.env.NODE_ENV} | Timestamp: ${new Date().toISOString()}`
                }
              ]
            }
          ]
        })
      })
    } catch (error) {
      logger.error('Failed to send Slack alert', { error })
    }
  }
}

export const metrics = new MetricsCollector()

// ============================================================================
// 3. Request Logging Middleware
// ============================================================================

import { Request, Response, NextFunction } from 'express'

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now()

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  })

  // Override res.json to capture response
  const originalJson = res.json.bind(res)
  res.json = function(body: any) {
    const duration = Date.now() - startTime
    const success = res.statusCode < 400

    // Log response
    logger.info('Outgoing response', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      success
    })

    // Record metrics
    const agent = body?.agent
    const intent = req.body?.intent
    metrics.recordRequest(success, duration, agent, intent)

    return originalJson(body)
  }

  next()
}

// ============================================================================
// 4. Error Logging Middleware
// ============================================================================

export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    body: req.body
  })

  // Send alert for server errors
  if (res.statusCode >= 500) {
    metrics['sendSlackAlert']({
      text: `🔴 Server Error: ${err.message}`,
      details: `Path: ${req.method} ${req.path}\nError: ${err.stack?.split('\n')[0]}`
    })
  }

  res.status(res.statusCode || 500).json({
    status: 'error',
    agent: 'gateway',
    timestamp: new Date().toISOString(),
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message
    }
  })
}

// ============================================================================
// 5. Health Monitoring
// ============================================================================

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  uptime_seconds: number
  memory_usage_mb: number
  metrics: Metrics
  checks: {
    openai: boolean
    database?: boolean
    redis?: boolean
  }
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const memUsage = process.memoryUsage()
  
  const health: HealthStatus = {
    status: 'healthy',
    uptime_seconds: process.uptime(),
    memory_usage_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
    metrics: metrics.getMetrics(),
    checks: {
      openai: !!process.env.OPENAI_API_KEY
    }
  }

  // Check OpenAI connectivity
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      signal: AbortSignal.timeout(5000)
    })
    health.checks.openai = response.ok
  } catch {
    health.checks.openai = false
    health.status = 'degraded'
  }

  // Determine overall status
  const errorRate = health.metrics.requests_error / health.metrics.requests_total
  if (errorRate > 0.2 || !health.checks.openai) {
    health.status = 'unhealthy'
  } else if (errorRate > 0.1 || health.metrics.avg_response_time_ms > 5000) {
    health.status = 'degraded'
  }

  return health
}

// ============================================================================
// 6. Usage in Express App
// ============================================================================

/*
import express from 'express'
import { logger, requestLogger, errorLogger, getHealthStatus } from './monitoring'

const app = express()

// Add request logging
app.use(requestLogger)

// Your routes here
app.post('/gateway', ...)

// Health endpoint with detailed status
app.get('/health', async (req, res) => {
  const health = await getHealthStatus()
  res.status(health.status === 'healthy' ? 200 : 503).json(health)
})

// Metrics endpoint (for Prometheus/Datadog)
app.get('/metrics', (req, res) => {
  res.json(metrics.getMetrics())
})

// Error logging (must be last)
app.use(errorLogger)

// Log startup
logger.info('Society of Mind service starting', {
  port: process.env.PORT,
  env: process.env.NODE_ENV
})
*/

// ============================================================================
// 7. Environment Variables for Monitoring
// ============================================================================

/*
# Required for alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Optional
LOG_LEVEL=info  # debug, info, warn, error
NODE_ENV=production

# For external log aggregation (optional)
PAPERTRAIL_HOST=logs.papertrailapp.com
PAPERTRAIL_PORT=12345
*/
