// lib/rate-limiter.js - Rate-aware tuning with per-destination token buckets
import * as metrics from './metrics.js';

class TokenBucket {
  constructor(capacity, refillRate, refillPeriodMs = 1000) {
    this.capacity = capacity;          // Maximum tokens
    this.tokens = capacity;            // Current tokens
    this.refillRate = refillRate;      // Tokens added per period
    this.refillPeriodMs = refillPeriodMs; // Refill period in ms
    this.lastRefill = Date.now();
  }

  // Attempt to consume tokens
  consume(count = 1) {
    this.refill();
    
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    
    return false;
  }

  // Get current token count
  available() {
    this.refill();
    return this.tokens;
  }

  // Get time until next token available
  timeUntilToken() {
    this.refill();
    if (this.tokens >= 1) return 0;
    
    const tokensNeeded = 1;
    const timePerToken = this.refillPeriodMs / this.refillRate;
    return Math.ceil(timePerToken);
  }

  // Refill tokens based on time elapsed
  refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    
    if (elapsed >= this.refillPeriodMs) {
      const periods = Math.floor(elapsed / this.refillPeriodMs);
      const tokensToAdd = periods * this.refillRate;
      
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  // Get bucket status
  getStatus() {
    this.refill();
    return {
      tokens: this.tokens,
      capacity: this.capacity,
      refillRate: this.refillRate,
      utilizationPercent: ((this.capacity - this.tokens) / this.capacity * 100).toFixed(1)
    };
  }
}

class RateLimiter {
  constructor() {
    this.buckets = new Map();
    this.config = {
      // Default rate limits per destination
      slack: { capacity: 1, refillRate: 1, refillPeriodMs: 1000 }, // 1 req/sec
      zapier: { capacity: 5, refillRate: 1, refillPeriodMs: 2000 }, // 30 req/min
      hubspot: { capacity: 10, refillRate: 10, refillPeriodMs: 10000 }, // 100 req/sec burst, 10/sec sustained
      elevenlabs: { capacity: 3, refillRate: 1, refillPeriodMs: 1000 }, // 3 req/sec burst
      generic: { capacity: 5, refillRate: 5, refillPeriodMs: 1000 }, // Default for unknown destinations
      
      // Special high-volume destinations
      webhook_generic: { capacity: 50, refillRate: 25, refillPeriodMs: 1000 }, // 25 req/sec
      internal: { capacity: 100, refillRate: 100, refillPeriodMs: 1000 } // No effective limit
    };
  }

  // Get or create token bucket for destination
  getBucket(destination) {
    if (!this.buckets.has(destination)) {
      const config = this.config[destination] || this.config.generic;
      this.buckets.set(destination, new TokenBucket(
        config.capacity,
        config.refillRate,
        config.refillPeriodMs
      ));
    }
    return this.buckets.get(destination);
  }

  // Check if request can proceed (non-blocking)
  canProceed(destination, tokens = 1) {
    const bucket = this.getBucket(destination);
    return bucket.available() >= tokens;
  }

  // Attempt to acquire tokens (blocking until available)
  async acquire(destination, tokens = 1, timeoutMs = 30000) {
    const bucket = this.getBucket(destination);
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      if (bucket.consume(tokens)) {
        metrics.inc('rate_limiter_acquired');
        return true;
      }

      // Wait for next token
      const waitTime = Math.min(bucket.timeUntilToken(), 100); // Max 100ms wait
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    metrics.inc('rate_limiter_timeout');
    throw new Error(`Rate limit timeout for ${destination} after ${timeoutMs}ms`);
  }

  // Try to acquire immediately, return false if not available
  tryAcquire(destination, tokens = 1) {
    const bucket = this.getBucket(destination);
    const acquired = bucket.consume(tokens);
    
    if (acquired) {
      metrics.inc('rate_limiter_acquired');
    } else {
      metrics.inc('rate_limiter_rejected');
    }
    
    return acquired;
  }

  // Update rate limit configuration
  setRateLimit(destination, capacity, refillRate, refillPeriodMs = 1000) {
    this.config[destination] = { capacity, refillRate, refillPeriodMs };
    
    // Reset existing bucket to apply new config
    if (this.buckets.has(destination)) {
      this.buckets.delete(destination);
    }
  }

  // Get rate limit status for all destinations
  getStatus() {
    const status = {};
    
    // Include configured destinations
    for (const [dest, config] of Object.entries(this.config)) {
      const bucket = this.getBucket(dest);
      status[dest] = {
        ...bucket.getStatus(),
        config
      };
    }
    
    return status;
  }

  // Get status for specific destination
  getDestinationStatus(destination) {
    const bucket = this.getBucket(destination);
    return {
      destination,
      ...bucket.getStatus(),
      config: this.config[destination] || this.config.generic
    };
  }

  // Clear all buckets (for testing)
  reset() {
    this.buckets.clear();
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

// Enhanced outbound request wrapper with rate limiting
export async function rateLimitedRequest(destination, requestFn, options = {}) {
  const { 
    tokens = 1,
    timeoutMs = 30000,
    retryOnRateLimit = true,
    maxRetries = 3
  } = options;

  let attempts = 0;
  
  while (attempts <= maxRetries) {
    try {
      // Try to acquire tokens
      const acquired = await rateLimiter.acquire(destination, tokens, timeoutMs);
      
      if (acquired) {
        // Execute the request
        return await requestFn();
      }
      
    } catch (error) {
      if (error.message.includes('Rate limit timeout')) {
        attempts++;
        metrics.inc('rate_limiter_timeout');
        
        if (attempts > maxRetries || !retryOnRateLimit) {
          throw new Error(`Rate limit exceeded for ${destination} after ${attempts} attempts`);
        }
        
        // Exponential backoff for retries
        const backoffMs = Math.min(1000 * Math.pow(2, attempts - 1), 10000);
        console.warn(`[rate-limit] Backing off ${destination} for ${backoffMs}ms (attempt ${attempts})`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error(`Failed to acquire rate limit for ${destination} after ${maxRetries} retries`);
}

// Middleware for rate-limiting webhook endpoints
export function rateLimitMiddleware(destination = 'webhook_generic', tokens = 1) {
  return async (req, res, next) => {
    try {
      const canProceed = rateLimiter.tryAcquire(destination, tokens);
      
      if (canProceed) {
        next();
      } else {
        const bucket = rateLimiter.getBucket(destination);
        const waitTime = bucket.timeUntilToken();
        
        res.status(429).json({
          ok: false,
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(waitTime / 1000),
          destination
        });
      }
      
    } catch (error) {
      console.error(`Rate limiting error for ${destination}:`, error);
      metrics.inc('rate_limiter_errors');
      next(); // Allow request to proceed on rate limiter error
    }
  };
}

export { TokenBucket };