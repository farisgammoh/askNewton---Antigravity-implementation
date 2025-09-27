import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import { initDb, insertEvent, listEvents, getEventById } from "./db.js";
import { enqueue, workerLoop, stopWorker, replayFailed, getQueueStats } from "./lib/queue.js";
import { breakerStates } from "./lib/outbound.js";
import { withRetry } from "./lib/resilience.js";
import * as metrics from "./lib/metrics.js";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Enhanced Slack Alert with Resilience ---
async function sendSlackAlert(message) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return;
  
  try {
    await withRetry(async () => {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) throw new Error(`Slack API error: ${res.status}`);
    }, {
      attempts: 3,
      baseMs: 200,
      onRetry: (err, i, delay) => console.warn(`[slack] Retry ${i+1} in ${delay}ms: ${err.message}`)
    });
  } catch (err) {
    console.error("Slack alert failed after retries:", err.message);
    metrics.inc('errors_total');
  }
}

// --- Raw body for HMAC ---
app.use(express.json({
  limit: "2mb",
  verify: (req, _res, buf) => { req.rawBody = buf; }
}));

// --- Static assets for UI ---
app.use("/public", express.static(path.join(__dirname, "public")));

// --- HMAC verification ---
const SIG_HEADERS = [
  "x-elevenlabs-signature",
  "x-signature",
  "x-webhook-signature",
  "x-hub-signature"
];

function getSignatureHeader(req) {
  return SIG_HEADERS.map(h => req.get(h)).find(Boolean) || "";
}

function verifyHmac(req, secret) {
  const sigHeader = getSignatureHeader(req);
  const computed = crypto
    .createHmac("sha256", secret)
    .update(req.rawBody || Buffer.from(""))
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(sigHeader));
  } catch {
    return false;
  }
}

function guard(secretEnvKey) {
  return (req, res, next) => {
    const secret = process.env[secretEnvKey];
    if (!secret) {
      sendSlackAlert(`🚨 Missing secret: ${secretEnvKey}`);
      metrics.inc('errors_total');
      return res.status(500).json({ ok: false, error: `${secretEnvKey} missing` });
    }
    if (!verifyHmac(req, secret)) {
      sendSlackAlert(`⚠️ Invalid signature on ${req.path}`);
      metrics.inc('invalid_signature_total');
      return res.status(401).json({ ok: false, error: "Invalid signature" });
    }
    next();
  };
}

// Admin/Events authentication guard
function adminGuard(req, res, next) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return res.status(500).json({ ok: false, error: "Admin access not configured" });
  }
  
  const authHeader = req.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token || token !== adminToken) {
    return res.status(401).json({ ok: false, error: "Unauthorized - invalid admin token" });
  }
  
  next();
}

// --- Business processing stub (extend as needed) ---
async function processEvent({ type, body, eventId }, db) {
  // TODO: Add your business logic here
  console.log(`[process] Processing ${type} event: ${eventId}`);
  
  // Example: enqueue outbound deliveries for processed events
  if (process.env.SLACK_WEBHOOK_URL) {
    await enqueue(db, {
      eventId,
      dest: 'slack',
      url: process.env.SLACK_WEBHOOK_URL,
      payload: {
        text: `📥 Processed ${type} event: ${eventId}`,
        blocks: [{
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Event Type:* ${type}\n*Event ID:* ${eventId}\n*Timestamp:* ${new Date().toISOString()}`
          }
        }]
      }
    });
    metrics.inc('queue_enqueued');
  }
  
  return { processed: true, type, eventId };
}

// === DB init ===
let db;
initDb()
  .then((d) => { 
    db = d; 
    console.log("SQLite ready");
    // Start queue worker
    workerLoop(db, { tickMs: 1500 });
  })
  .catch((err) => {
    console.error("DB init failed:", err);
    process.exit(1);
  });

// Helper: attempts to insert and tells if it was duplicate
async function insertOrDetectDuplicate({ id, type, path, body }) {
  const existing = await getEventById(db, id);
  if (existing) return { duplicate: true };
  await insertEvent(db, { id, type, path, body });
  return { duplicate: false };
}

// --- Enhanced Webhooks with Resilience ---
app.post("/webhooks/eleven/conversation-init",
  guard("ELEVEN_INIT_SECRET"),
  async (req, res) => {
    const id = req.body?.id || req.body?.event_id || `init-${Date.now()}`;
    
    try {
      const { duplicate } = await insertOrDetectDuplicate({
        id, type: "conversation-init", path: req.path, body: req.body
      });

      if (duplicate) {
        metrics.inc('duplicates_total');
        return res.json({ ok: true, duplicate: true });
      }

      metrics.inc('events_total');
      
      // Process event with resilience
      processEvent({ 
        type: "conversation-init", 
        body: req.body, 
        eventId: id 
      }, db).catch(err => {
        metrics.inc('errors_total');
        sendSlackAlert(`🔥 Processing error (init): ${err.message}`);
      });
      
      res.json({ ok: true, eventId: id });
    } catch (err) {
      console.error('Webhook error:', err);
      metrics.inc('errors_total');
      res.status(500).json({ ok: false, error: 'Processing failed' });
    }
  }
);

app.post("/webhooks/eleven/conversation-end",
  guard("ELEVEN_END_SECRET"),
  async (req, res) => {
    const id = req.body?.id || req.body?.event_id || `end-${Date.now()}`;
    
    try {
      const { duplicate } = await insertOrDetectDuplicate({
        id, type: "conversation-end", path: req.path, body: req.body
      });

      if (duplicate) {
        metrics.inc('duplicates_total');
        return res.json({ ok: true, duplicate: true });
      }

      metrics.inc('events_total');
      
      // Process event with resilience
      processEvent({ 
        type: "conversation-end", 
        body: req.body, 
        eventId: id 
      }, db).catch(err => {
        metrics.inc('errors_total');
        sendSlackAlert(`🔥 Processing error (end): ${err.message}`);
      });
      
      res.json({ ok: true, eventId: id });
    } catch (err) {
      console.error('Webhook error:', err);
      metrics.inc('errors_total');
      res.status(500).json({ ok: false, error: 'Processing failed' });
    }
  }
);

// --- Health / Version ---
app.get("/healthz", (_req, res) => res.json({ ok: true, service: "asknewton-webhooks" }));
app.get("/version", (_req, res) => res.json({ version: "1.3.0" }));

// --- Enhanced Health Check for Resilience ---
app.get("/health/resilience", async (_req, res) => {
  try {
    const breakers = breakerStates();
    const queueStats = await getQueueStats(db);
    const metricsSnapshot = metrics.snapshot();
    
    res.json({
      ok: true,
      breakers,
      queue: queueStats,
      metrics: metricsSnapshot,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- JSON Events API (DB-backed) - Protected ---
app.get("/events", adminGuard, async (req, res) => {
  const { type, q, limit = "100" } = req.query;
  try {
    const items = await listEvents(db, { 
      type: type ? String(type) : undefined, 
      q: q ? String(q) : undefined, 
      limit: String(limit) 
    });
    res.json({ count: items.length, items });
  } catch (err) {
    metrics.inc('errors_total');
    sendSlackAlert(`🔥 /events error: ${err.message}`);
    res.status(500).json({ ok: false, error: "DB error" });
  }
});

// --- Pretty UI for Events - Protected ---
app.get("/events/ui", adminGuard, (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "events.html"));
});

// --- Replay by id (reads full body from DB) - Protected ---
app.post("/events/replay/:id", adminGuard, async (req, res) => {
  const { id } = req.params;
  try {
    const evt = await getEventById(db, id);
    if (!evt) return res.status(404).json({ ok: false, error: "Not found" });
    
    const result = await processEvent({ 
      type: evt.type, 
      body: JSON.parse(evt.body),
      eventId: evt.id 
    }, db);
    
    res.json({ ok: true, replayed: id, result });
  } catch (err) {
    metrics.inc('errors_total');
    sendSlackAlert(`🔥 Replay error ${id}: ${err.message}`);
    res.status(500).json({ ok: false, error: "Replay failed" });
  }
});

// --- Admin: Replay failed queue items - Protected ---
app.post("/admin/replay-failed", adminGuard, async (req, res) => {
  try {
    const { ids = [] } = req.body;
    const count = await replayFailed(db, ids);
    res.json({ ok: true, replayed: count });
  } catch (err) {
    metrics.inc('errors_total');
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- Admin: Queue management - Protected ---
app.get("/admin/queue", adminGuard, async (req, res) => {
  try {
    const stats = await getQueueStats(db);
    const failed = await db.all(`
      SELECT id, event_id, destination, attempts, last_error, created_at 
      FROM outbound_attempts 
      WHERE status = 'failed' 
      ORDER BY created_at DESC 
      LIMIT 50
    `);
    res.json({ stats, failed });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- Enhanced Prometheus Metrics ---
app.get("/metrics", (_req, res) => {
  res.type("text/plain").send(metrics.getPrometheusMetrics());
});

// --- Error handler with resilience ---
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  metrics.inc('errors_total');
  sendSlackAlert(`🔥 Error on ${req.path}: ${err.message}`);
  res.status(500).json({ ok: false, error: "Server error" });
});

// --- Graceful shutdown ---
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down gracefully...');
  stopWorker();
  setTimeout(() => {
    console.log('💥 Force exit');
    process.exit(0);
  }, 2000);
});

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  stopWorker();
  setTimeout(() => {
    console.log('💥 Force exit');
    process.exit(0);
  }, 2000);
});

app.listen(PORT, () => {
  console.log(`🚀 asknewton-webhooks v1.3.0 listening on :${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health/resilience`);
  console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
  console.log(`🎛️  Admin: http://localhost:${PORT}/admin/queue`);
});