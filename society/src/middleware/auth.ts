import { Request, Response, NextFunction } from 'express'

/**
 * Simple API key authentication middleware
 * For production, consider JWT tokens or OAuth
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string
  const validKeys = (process.env.API_KEYS || '').split(',').filter(Boolean)

  // Skip auth in development if no keys configured
  if (process.env.NODE_ENV === 'development' && validKeys.length === 0) {
    console.warn('[Auth] Running without API key protection in development')
    return next()
  }

  if (!apiKey) {
    return res.status(401).json({
      status: 'error',
      agent: 'gateway',
      timestamp: new Date().toISOString(),
      error: {
        code: 'MISSING_API_KEY',
        message: 'API key required. Include X-API-Key header.'
      }
    })
  }

  if (!validKeys.includes(apiKey)) {
    return res.status(403).json({
      status: 'error',
      agent: 'gateway',
      timestamp: new Date().toISOString(),
      error: {
        code: 'INVALID_API_KEY',
        message: 'Invalid API key'
      }
    })
  }

  next()
}

/**
 * Channel validation middleware
 * Ensures requests from different channels are properly identified
 */
export function validateChannel(req: Request, res: Response, next: NextFunction) {
  const validChannels = ['web', 'whatsapp', 'sms', 'email', 'api']
  const channel = req.body?.channel

  if (channel && !validChannels.includes(channel)) {
    return res.status(400).json({
      status: 'error',
      agent: 'gateway',
      timestamp: new Date().toISOString(),
      error: {
        code: 'INVALID_CHANNEL',
        message: `Invalid channel. Must be one of: ${validChannels.join(', ')}`,
        details: { provided: channel, valid: validChannels }
      }
    })
  }

  next()
}
