import 'dotenv/config'
import express from 'express'
import { router } from './orchestrator/router.js'
import { apiKeyAuth, validateChannel } from './middleware/auth.js'
import { rateLimiter } from './middleware/rateLimiter.js'

const app = express()
app.use(express.json({ limit: '5mb' }))

// Health check (no auth required)
app.get('/health', (_req, res) => res.json({ 
  ok: true, 
  service: 'asknewton-society',
  version: '1.0.0',
  timestamp: new Date().toISOString()
}))

// Gateway endpoint with security middleware
app.post('/gateway', 
  rateLimiter({
    windowMs: 60000, // 1 minute
    maxRequests: 60  // 60 requests per minute per IP
  }),
  apiKeyAuth,
  validateChannel,
  async (req, res) => {
    try {
      const result = await router.handle(req.body)
      res.json(result)
    } catch (e: any) {
      console.error('[Gateway] Unhandled error:', e)
      res.status(500).json({ 
        status: 'error',
        agent: 'gateway',
        timestamp: new Date().toISOString(),
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        }
      })
    }
  }
)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`🧠 AskNewton Society of Mind gateway listening on :${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Auth: ${process.env.API_KEYS ? 'Enabled' : 'Disabled (dev mode)'}`)
})
