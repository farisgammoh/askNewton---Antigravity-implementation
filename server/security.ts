import { type Express, type Request, type Response, type NextFunction } from "express";
import helmet from "helmet";
import cors, { type CorsOptions } from "cors";
import rateLimit from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";

export interface SecurityConfig {
  allowedOrigins?: string[];
  maxBodySize?: string;
  enableRateLimit?: boolean;
}

export function setupSecurityMiddleware(app: Express, config: SecurityConfig = {}) {
  const {
    allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5000', 'http://127.0.0.1:5000', 'https://*.replit.app', 'https://*.repl.co', 'https://*.replit.dev'],
    maxBodySize = '10mb',
    enableRateLimit = true
  } = config;

  // 1. Helmet - Security Headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https:", "wss:"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
    frameguard: { action: "deny" }
  }));

  // 2. CORS - Cross-Origin Resource Sharing
  const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      // Remove port number from origin for matching (Replit dev URLs include :5000)
      const originWithoutPort = origin.replace(/:\d+$/, '');
      
      // Check if origin matches allowed patterns
      const isAllowed = allowedOrigins.some(allowed => {
        if (allowed.includes('*')) {
          const pattern = allowed.replace(/\*/g, '.*');
          return new RegExp(`^${pattern}$`).test(originWithoutPort) || new RegExp(`^${pattern}$`).test(origin);
        }
        return allowed === origin || allowed === originWithoutPort;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`Blocked CORS request from unauthorized origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Admin-Key',
      'X-Requested-With',
      'Accept'
    ],
    maxAge: 86400
  };

  app.use(cors(corsOptions));
  
  // Handle preflight requests
  app.options('*', cors(corsOptions));

  // 3. Body Size Limits (already handled by express.json/urlencoded middleware)
  console.log(`Security middleware initialized with body size limit: ${maxBodySize}`);

  // 4. Base Rate Limiter - General protection
  if (enableRateLimit) {
    const generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/health' || req.path === '/api/health';
      }
    });

    app.use(generalLimiter);
    console.log('General rate limiting enabled: 100 requests per 15 minutes');
  }
}

// Specialized rate limiters for specific use cases
export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false
  });
};

// Rate limiter presets
export const rateLimiters = {
  // Strict rate limit for authentication endpoints
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true
  }),
  
  // Moderate rate limit for lead submission
  leadSubmission: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 submissions per hour per IP
    message: 'Too many lead submissions, please try again later.'
  }),
  
  // Strict rate limit for email sending
  email: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 emails per hour per IP
    message: 'Too many email requests, please try again later.'
  }),
  
  // Moderate rate limit for webhook endpoints
  webhook: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: 'Webhook rate limit exceeded, please slow down.'
  }),
  
  // Moderate rate limit for AI/generation endpoints
  aiGeneration: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 generations per hour
    message: 'Too many generation requests, please try again later.'
  })
};

// Centralized authentication middleware
export interface AuthConfig {
  headerName?: string;
  secretEnvVar?: string;
  allowedTokens?: string[];
  hmacSecret?: string;
  requireHmac?: boolean;
  timestampTolerance?: number; // seconds
}

export const createAuthMiddleware = (config: AuthConfig = {}) => {
  const {
    headerName = 'authorization',
    secretEnvVar = 'BACKEND_BEARER_TOKEN',
    allowedTokens = [],
    hmacSecret,
    requireHmac = false,
    timestampTolerance = 300 // 5 minutes default
  } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    // HMAC verification (if enabled)
    if (requireHmac || hmacSecret) {
      const signature = req.headers['x-signature'] as string;
      const timestamp = req.headers['x-timestamp'] as string;
      
      if (!signature || !timestamp) {
        console.warn(`Missing HMAC signature or timestamp from ${req.ip} to ${req.path}`);
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Request signature is required.'
        });
      }
      
      // Verify timestamp is valid and recent (prevents replay attacks)
      const requestTime = parseInt(timestamp, 10);
      const now = Math.floor(Date.now() / 1000);
      
      // Validate timestamp is a finite number and not in the future
      if (!Number.isFinite(requestTime) || requestTime > now + 60) {
        console.warn(`Invalid HMAC timestamp from ${req.ip} to ${req.path}`);
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Invalid request timestamp.'
        });
      }
      
      if (Math.abs(now - requestTime) > timestampTolerance) {
        console.warn(`HMAC timestamp too old from ${req.ip} to ${req.path}`);
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Request timestamp expired.'
        });
      }
      
      // Verify HMAC signature
      const secret = hmacSecret || process.env[secretEnvVar];
      if (!secret) {
        console.error('HMAC verification enabled but no secret configured');
        return res.status(500).json({ 
          error: 'Server configuration error'
        });
      }
      
      const crypto = require('crypto');
      const bodyString = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${bodyString}`)
        .digest('hex');
      
      // Use timing-safe comparison to prevent timing attacks
      const signatureBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');
      
      if (signatureBuffer.length !== expectedBuffer.length || 
          !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
        console.warn(`Invalid HMAC signature from ${req.ip} to ${req.path}`);
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Invalid request signature.'
        });
      }
      
      // HMAC verified successfully
      return next();
    }
    
    // Bearer token verification (fallback or alternative)
    const authHeader = req.headers[headerName.toLowerCase()];
    const token = typeof authHeader === 'string' 
      ? authHeader.replace(/^Bearer\s+/i, '') 
      : Array.isArray(authHeader) 
        ? authHeader[0]?.replace(/^Bearer\s+/i, '') 
        : '';

    const envSecret = process.env[secretEnvVar];
    
    // Check against environment variable secret
    if (envSecret && token === envSecret) {
      return next();
    }
    
    // Check against allowed tokens list
    if (allowedTokens.length > 0 && allowedTokens.includes(token)) {
      return next();
    }
    
    // Log unauthorized attempts (but don't expose what we're checking)
    console.warn(`Unauthorized ${headerName} attempt from ${req.ip} to ${req.path}`);
    
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Valid authentication is required to access this resource.'
    });
  };
};

// Admin authentication middleware
export const requireAdmin = createAuthMiddleware({
  headerName: 'x-admin-key',
  secretEnvVar: 'ADMIN_API_KEY'
});

// ElevenLabs webhook authentication (Bearer token + optional HMAC)
export const requireElevenLabsAuth = createAuthMiddleware({
  headerName: 'authorization',
  secretEnvVar: 'BACKEND_BEARER_TOKEN',
  requireHmac: false // Can be enabled if ElevenLabs supports HMAC signatures
});

// Webhook authentication with HMAC verification
export const requireWebhookWithHmac = createAuthMiddleware({
  headerName: 'x-signature',
  secretEnvVar: 'WEBHOOK_SECRET',
  requireHmac: true,
  timestampTolerance: 300 // 5 minutes
});

// Uniform error response utility
export interface ErrorResponse {
  error: string;
  message?: string;
  details?: any;
  statusCode?: number;
}

export const sendSecureError = (
  res: Response, 
  statusCode: number, 
  error: string, 
  message?: string,
  details?: any
) => {
  const response: ErrorResponse = {
    error,
    statusCode
  };

  if (message) {
    response.message = message;
  }

  // Only include details in development
  if (!isProduction && details) {
    response.details = details;
  }

  // Log full error server-side for debugging
  console.error(`[${statusCode}] ${error}${message ? `: ${message}` : ''}`, details || '');

  return res.status(statusCode).json(response);
};

// Webhook URL validation
export const validateWebhookUrl = (url: string): { valid: boolean; error?: string } => {
  if (!url) {
    return { valid: false, error: 'Webhook URL is required' };
  }

  if (!url.startsWith('https://')) {
    return { valid: false, error: 'Webhook URL must use HTTPS for security' };
  }

  try {
    new URL(url);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid webhook URL format' };
  }
};

// Generate HMAC signature for outgoing webhooks
export const generateWebhookSignature = (payload: any, secret: string, timestamp?: number): { signature: string; timestamp: number } => {
  const crypto = require('crypto');
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const bodyString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${ts}.${bodyString}`)
    .digest('hex');
  
  return { signature, timestamp: ts };
};

// Verify incoming webhook signature
export const verifyWebhookSignature = (
  body: any, 
  signature: string, 
  timestamp: string, 
  secret: string,
  toleranceSeconds: number = 300
): { valid: boolean; error?: string } => {
  if (!signature || !timestamp) {
    return { valid: false, error: 'Missing signature or timestamp' };
  }
  
  // Verify timestamp is valid and recent
  const requestTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  
  // Validate timestamp is a finite number and not in the future
  if (!Number.isFinite(requestTime) || requestTime > now + 60) {
    return { valid: false, error: 'Invalid timestamp format' };
  }
  
  if (Math.abs(now - requestTime) > toleranceSeconds) {
    return { valid: false, error: 'Timestamp too old - possible replay attack' };
  }
  
  // Verify signature with timing-safe comparison
  const crypto = require('crypto');
  const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${bodyString}`)
    .digest('hex');
  
  // Use timing-safe comparison to prevent timing attacks
  const signatureBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  
  if (signatureBuffer.length !== expectedBuffer.length || 
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return { valid: false, error: 'Invalid signature' };
  }
  
  return { valid: true };
};

// Input sanitization utilities
export const sanitizeInput = {
  // Remove potential XSS characters from strings
  text: (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // Validate and sanitize email
  email: (input: string): string => {
    return input.trim().toLowerCase();
  },

  // Validate and sanitize phone
  phone: (input: string): string => {
    return input.replace(/[^\d+\-() ]/g, '');
  },

  // Limit string length
  limitLength: (input: string, maxLength: number): string => {
    return input.substring(0, maxLength);
  }
};

// Request ID for tracking
export const addRequestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

console.log('Security module loaded');
