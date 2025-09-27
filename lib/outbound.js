// lib/outbound.js
import { CircuitBreaker, withRetry, deadlineSignal } from './resilience.js';

// Import metrics at module level
import * as metrics from './metrics.js';
import { rateLimitedRequest } from './rate-limiter.js';

const breakers = {
  slack: new CircuitBreaker({ 
    name: 'slack', 
    failureThreshold: 4, 
    successThreshold: 2, 
    cooldownMs: 15_000,
    onOpen: (cb) => {
      console.warn(`[circuit:${cb.name}] OPENED`);
      metrics.inc('circuit_open');
    },
    onClose: (cb) => console.log(`[circuit:${cb.name}] CLOSED`)
  }),
  zapier: new CircuitBreaker({ 
    name: 'zapier', 
    failureThreshold: 4, 
    successThreshold: 2, 
    cooldownMs: 15_000,
    onOpen: (cb) => {
      console.warn(`[circuit:${cb.name}] OPENED`);
      metrics.inc('circuit_open');
    },
    onClose: (cb) => console.log(`[circuit:${cb.name}] CLOSED`)
  }),
  hubspot: new CircuitBreaker({ 
    name: 'hubspot', 
    failureThreshold: 4, 
    successThreshold: 2, 
    cooldownMs: 20_000,
    onOpen: (cb) => {
      console.warn(`[circuit:${cb.name}] OPENED`);
      metrics.inc('circuit_open');
    },
    onClose: (cb) => console.log(`[circuit:${cb.name}] CLOSED`)
  }),
  elevenlabs: new CircuitBreaker({ 
    name: 'elevenlabs', 
    failureThreshold: 4, 
    successThreshold: 2, 
    cooldownMs: 20_000,
    onOpen: (cb) => {
      console.warn(`[circuit:${cb.name}] OPENED`);
      metrics.inc('circuit_open');
    },
    onClose: (cb) => console.log(`[circuit:${cb.name}] CLOSED`)
  }),
};

function getBreaker(dest) {
  return breakers[dest] || (breakers[dest] = new CircuitBreaker({ 
    name: dest,
    onOpen: (cb) => {
      console.warn(`[circuit:${cb.name}] OPENED`);
      metrics.inc('circuit_open');
    },
    onClose: (cb) => console.log(`[circuit:${cb.name}] CLOSED`)
  }));
}

export async function postJson({ url, dest = 'generic', body, headers = {}, timeoutMs = 8000, fetchImpl, useRateLimit = true }) {
  const breaker = getBreaker(dest);
  if (!breaker.canRequest()) {
    const err = new Error(`[breaker:${dest}] OPEN`);
    err.code = 'CIRCUIT_OPEN';
    throw err;
  }

  const doFetch = async () => {
    const controller = deadlineSignal(timeoutMs);
    try {
      const res = await (fetchImpl || fetch)(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        const e = new Error(`HTTP ${res.status} ${res.statusText} ${txt}`.trim());
        e.status = res.status;
        throw e;
      }
      breaker.recordSuccess();
      return res.json().catch(() => ({}));
    } catch (err) {
      breaker.recordFailure();
      throw err;
    }
  };

  const retryWithFetch = () => withRetry(doFetch, {
    attempts: 5,
    baseMs: 300,
    factor: 2.2,
    jitter: true,
  });

  // Apply rate limiting if enabled
  if (useRateLimit) {
    return rateLimitedRequest(dest, retryWithFetch, { 
      tokens: 1, 
      timeoutMs: Math.min(timeoutMs, 30000) // Cap rate limit timeout
    });
  } else {
    return retryWithFetch();
  }
}

export function breakerStates() {
  return Object.values(breakers).map(b => b.getState());
}