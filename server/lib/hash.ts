import crypto from "crypto";

/**
 * Utility for creating stable, deterministic JSON strings for hashing
 * Recursively sorts all nested objects and arrays to ensure identical inputs
 * always produce identical hashes, preventing cache misses from key order differences
 */
export function stableStringify(value: unknown): string {
  if (value === null || value === undefined) {
    return JSON.stringify(value);
  }
  
  if (typeof value !== 'object') {
    return JSON.stringify(value);
  }
  
  if (Array.isArray(value)) {
    // Recursively sort array elements
    return '[' + value.map(item => stableStringify(item)).join(',') + ']';
  }
  
  // Sort object keys recursively
  const sortedKeys = Object.keys(value).sort();
  const pairs: string[] = [];
  
  for (const key of sortedKeys) {
    const val = (value as any)[key];
    pairs.push(JSON.stringify(key) + ':' + stableStringify(val));
  }
  
  return '{' + pairs.join(',') + '}';
}

/**
 * Create SHA-256 hash from input string
 */
export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Create hash for persona caching based on generation inputs
 */
export function makePersonaInputHash(input: {
  count?: number;
  config?: unknown;
  email?: string;
}): string {
  return sha256(stableStringify(input));
}

/**
 * Create hash for request idempotency
 */
export function makeRequestHash(req: {
  method: string;
  path: string;
  body?: any;
  userId?: string | null;
}): string {
  return sha256(
    stableStringify({
      method: req.method,
      path: req.path,
      body: req.body ?? null,
      userId: req.userId ?? null,
    })
  );
}
