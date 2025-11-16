import { Request, Response, NextFunction, RequestHandler } from "express";
import { storage } from "../storage";
import { makeRequestHash } from "../lib/hash";

// Only reuse cached responses within this time window
const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Idempotency middleware to prevent duplicate expensive operations
 * Caches responses based on request hash for a short time window
 */
export function withIdempotency(handler: RequestHandler): RequestHandler {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const hash = makeRequestHash({
        method: req.method,
        path: req.path,
        body: req.body,
        userId: (req as any).userId || null
      });
      
      const storageInstance = await storage();
      
      // Check for existing cached response
      if (storageInstance.getRequestLog) {
        const existing = await storageInstance.getRequestLog(hash);
        
        if (existing) {
          const age = Date.now() - new Date(existing.createdAt!).getTime();
          
          if (age <= MAX_AGE_MS) {
            console.log(`⚡ Idempotency cache hit (age: ${Math.round(age / 1000)}s)`);
            return res.json({
              ...(existing.responseJson as any),
              fromIdempotentCache: true,
            });
          }
        }
      }
      
      // Intercept res.json to cache the response
      const originalJson = res.json.bind(res);
      
      (res as any).json = async (body: any) => {
        // Store response in cache for future duplicate requests
        if (storageInstance.createRequestLog) {
          try {
            await storageInstance.createRequestLog({
              requestHash: hash,
              responseJson: body
            });
            console.log(`💾 Cached idempotent response (hash: ${hash.substring(0, 8)}...)`);
          } catch (e) {
            console.error("Failed to store request log:", e);
          }
        }
        
        return originalJson(body);
      };
      
      return handler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}
