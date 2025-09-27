// lib/resilience.js
class CircuitBreaker {
  constructor({
    failureThreshold = 5,       // consecutive failures to OPEN
    successThreshold = 2,       // successes in HALF_OPEN to CLOSE
    cooldownMs = 20_000,        // how long to stay OPEN
    name = 'default',
    onOpen = () => {},
    onHalfOpen = () => {},
    onClose = () => {},
  } = {}) {
    this.name = name;
    this.failureThreshold = failureThreshold;
    this.successThreshold = successThreshold;
    this.cooldownMs = cooldownMs;

    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.nextAttemptAt = 0;

    this.onOpen = onOpen;
    this.onHalfOpen = onHalfOpen;
    this.onClose = onClose;
  }

  canRequest() {
    if (this.state === 'CLOSED') return true;
    const now = Date.now();
    if (this.state === 'OPEN' && now >= this.nextAttemptAt) {
      this.state = 'HALF_OPEN';
      this.successes = 0;
      this.onHalfOpen(this);
      return true;
    }
    return this.state === 'HALF_OPEN';
  }

  recordSuccess() {
    if (this.state === 'CLOSED') return;
    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this._close();
      }
    }
  }

  recordFailure() {
    if (this.state === 'HALF_OPEN') {
      // immediate OPEN on failure in half-open
      return this._open();
    }
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this._open();
    }
  }

  _open() {
    this.state = 'OPEN';
    this.nextAttemptAt = Date.now() + this.cooldownMs;
    this.failures = 0;
    this.successes = 0;
    this.onOpen(this);
  }

  _close() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.onClose(this);
  }

  getState() {
    return { name: this.name, state: this.state, nextAttemptAt: this.nextAttemptAt };
  }
}

function defaultTransientCheck(err) {
  const msg = (err && (err.message || err.toString()) || '').toLowerCase();
  return (
    msg.includes('timeout') ||
    msg.includes('econnreset') ||
    msg.includes('fetch failed') ||
    msg.includes('temporarily unavailable') ||
    msg.includes('internal server error') ||
    msg.includes('bad gateway') ||
    msg.includes('service unavailable') ||
    msg.includes('gateway timeout') ||
    msg.includes('rate limit') ||
    msg.includes('throttle')
  );
}

export async function withRetry(fn, {
  attempts = 5,
  baseMs = 250,
  factor = 2.0,
  jitter = true,
  isTransient = defaultTransientCheck,
  onRetry = (err, i, delay) => console.warn(`[retry] #${i+1} in ${delay}ms: ${err && err.message}`)
} = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const isLast = i === attempts - 1;
      if (!isTransient(err) || isLast) throw err;
      const delay = Math.round(baseMs * Math.pow(factor, i) * (jitter ? (0.5 + Math.random()) : 1));
      onRetry(err, i, delay);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw lastErr;
}

export function deadlineSignal(ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(`Timeout after ${ms}ms`), ms);
  // caller should clearTimeout via finally if needed; here we rely on GC after abort
  return ctrl;
}

export function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

export { CircuitBreaker, defaultTransientCheck };