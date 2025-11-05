import { Request, Response, NextFunction } from 'express'

/**
 * Simple in-memory rate limiter
 * For production, use Redis-backed rate limiting (e.g., express-rate-limit with Redis store)
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const limitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  windowMs: number  // Time window in milliseconds
  maxRequests: number  // Max requests per window
  keyGenerator?: (req: Request) => string  // Custom key generation
}

export function rateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyGenerator } = config

  return (req: Request, res: Response, next: NextFunction) => {
    // Generate rate limit key (default: IP address)
    const key = keyGenerator ? keyGenerator(req) : req.ip || 'unknown'
    const now = Date.now()

    // Get or create entry
    let entry = limitStore.get(key)
    
    if (!entry || now > entry.resetAt) {
      // Create new window
      entry = {
        count: 0,
        resetAt: now + windowMs
      }
      limitStore.set(key, entry)
    }

    // Increment count
    entry.count++

    // Set rate limit headers
    const remaining = Math.max(0, maxRequests - entry.count)
    const resetSeconds = Math.ceil((entry.resetAt - now) / 1000)
    
    res.setHeader('X-RateLimit-Limit', maxRequests)
    res.setHeader('X-RateLimit-Remaining', remaining)
    res.setHeader('X-RateLimit-Reset', resetSeconds)

    // Check if over limit
    if (entry.count > maxRequests) {
      return res.status(429).json({
        status: 'error',
        agent: 'gateway',
        timestamp: new Date().toISOString(),
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Limit: ${maxRequests} requests per ${windowMs / 1000} seconds.`,
          details: {
            retryAfter: resetSeconds
          }
        }
      })
    }

    next()
  }
}

/**
 * Cleanup old entries periodically
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of limitStore.entries()) {
    if (now > entry.resetAt) {
      limitStore.delete(key)
    }
  }
}, 60000) // Clean every minute
