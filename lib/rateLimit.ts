import { NextRequest, NextResponse } from 'next/server';

/**
 * In-memory, per-instance rate limiter. This is a best-effort guard against
 * casual abuse and runaway cost, not a distributed rate limiter — on Vercel
 * each serverless instance has its own memory, so a determined attacker
 * spread across many cold starts/regions can exceed these limits. If real
 * abuse shows up, replace this with a shared store (Upstash Redis / Vercel
 * KV) behind the same checkRateLimit() signature.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

// Periodically forget old buckets so this Map doesn't grow unbounded across
// a long-lived warm instance.
const MAX_BUCKETS = 50_000;

export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'unknown';
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    if (buckets.size > MAX_BUCKETS) {
      const oldestKey = buckets.keys().next().value;
      if (oldestKey !== undefined) buckets.delete(oldestKey);
    }
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.ceil((existing.windowStart + windowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Convenience wrapper for route handlers: returns a 429 NextResponse if the
 * caller is over the limit, or null if the request should proceed.
 */
export function rateLimitOrResponse(
  req: NextRequest,
  routeKey: string,
  opts: { limit: number; windowMs: number }
): NextResponse | null {
  const ip = getClientIp(req);
  const { allowed, retryAfterSeconds } = checkRateLimit(`${routeKey}:${ip}`, opts);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    );
  }

  return null;
}
