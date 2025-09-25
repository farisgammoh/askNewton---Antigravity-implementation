import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import { initDb, insertEvent, listEvents, getEventById } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_EVENTS_COUNTER_ONLY = 200; // used for metrics only (DB stores all)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Slack Alert ---
async function sendSlackAlert(message) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message })
    });
  } catch (err) {
    console.error("Slack alert failed:", err.message);
  }
}

// --- Raw body for HMAC ---
app.use(express.json({
  limit: "1mb",
  verify: (req, _res, buf) => { req.rawBody = buf; }
}));

// --- Static assets for UI ---
app.use("/public", express.static(path.join(__dirname, "public")));

// --- Metrics (counters only; events now persisted in DB) ---
const metrics = {
  events_total: 0,
  duplicates_total: 0,
  invalid_signature_total: 0,
  errors_total: 0
};

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
      metrics.errors_total++;
      return res.status(500).json({ ok: false, error: `${secretEnvKey} missing` });
    }
    if (!verifyHmac(req, secret)) {
      sendSlackAlert(`⚠️ Invalid signature on ${req.path}`);
      metrics.invalid_signature_total++;
      return res.status(401).json({ ok: false, error: "Invalid signature" });
    }
    next();
  };
}

// --- Business processing stub (extend as needed) ---
async function processEvent({ type, body }) {
  // TODO: push to queue / forward to AskNewton app asynchronously
  return { processed: true, type };
}

// === DB init ===
let db;
initDb()
  .then((d) => { db = d; console.log("SQLite ready"); })
  .catch((err) => {
    console.error("DB init failed:", err);
    process.exit(1);
  });

// --- DB-backed idempotency + record ---
async function recordIfNew({ id, type, path, body }) {
  // Attempt insert (INSERT OR IGNORE). If exists, treat as duplicate.
  await insertEvent(db, { id, type, path, body });
  // Check whether it exists now (it always will) but we need to detect duplicate:
  const row = await getEventById(db, id);
  // If ts is within ~1s and metrics bump happened twice? Simpler: count duplicates by trying a second insert?
  // We'll detect duplicate by checking if request body had an id AND insertion didn't increase events_total.
  // For counters, we'll look up whether row.ts is very recent AND we just processed same id after another within same runtime.
  // Practical approach: we increment events_total only when we **process**; duplicates return flag to caller.
  return row; // Always returns row; caller decides if duplicate based on prior existence if needed
}

// Helper: attempts to insert and tells if it was duplicate via changes()
async function insertOrDetectDuplicate({ id, type, path, body }) {
  // Try a manual check first — duplicates are when ID already exists
  const existing = await getEventById(db, id);
  if (existing) return { duplicate: true };

  await insertEvent(db, { id, type, path, body });
  return { duplicate: false };
}

// --- Webhooks ---
app.post("/webhooks/eleven/conversation-init",
  guard("ELEVEN_INIT_SECRET"),
  async (req, res) => {
    const id = req.body?.id || req.body?.event_id || `init-${Date.now()}`;
    const { duplicate } = await insertOrDetectDuplicate({
      id, type: "conversation-init", path: req.path, body: req.body
    });

    if (duplicate) {
      metrics.duplicates_total++;
      return res.json({ ok: true, duplicate: true });
    }

    metrics.events_total++;
    processEvent({ type: "conversation-init", body: req.body }).catch(err => {
      metrics.errors_total++; sendSlackAlert(`🔥 Processing error (init): ${err.message}`);
    });
    res.json({ ok: true });
  }
);

app.post("/webhooks/eleven/conversation-end",
  guard("ELEVEN_END_SECRET"),
  async (req, res) => {
    const id = req.body?.id || req.body?.event_id || `end-${Date.now()}`;
    const { duplicate } = await insertOrDetectDuplicate({
      id, type: "conversation-end", path: req.path, body: req.body
    });

    if (duplicate) {
      metrics.duplicates_total++;
      return res.json({ ok: true, duplicate: true });
    }

    metrics.events_total++;
    processEvent({ type: "conversation-end", body: req.body }).catch(err => {
      metrics.errors_total++; sendSlackAlert(`🔥 Processing error (end): ${err.message}`);
    });
    res.json({ ok: true });
  }
);

// --- Health / Version ---
app.get("/healthz", (_req, res) => res.json({ ok: true, service: "asknewton-webhooks" }));
app.get("/version", (_req, res) => res.json({ version: "1.2.0" }));

// --- JSON Events API (DB-backed) ---
app.get("/events", async (req, res) => {
  const { type, q, limit = "100" } = req.query;
  try {
    const items = await listEvents(db, { type: type ? String(type) : undefined, q: q ? String(q) : undefined, limit: String(limit) });
    res.json({ count: items.length, items });
  } catch (err) {
    metrics.errors_total++; sendSlackAlert(`🔥 /events error: ${err.message}`);
    res.status(500).json({ ok: false, error: "DB error" });
  }
});

// --- Pretty UI for Events (unchanged) ---
app.get("/events/ui", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "events.html"));
});

// --- Replay by id (reads full body from DB) ---
app.post("/events/replay/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const evt = await getEventById(db, id);
    if (!evt) return res.status(404).json({ ok: false, error: "Not found" });
    const result = await processEvent({ type: evt.type, body: JSON.parse(evt.body) });
    res.json({ ok: true, replayed: id, result });
  } catch (err) {
    metrics.errors_total++; sendSlackAlert(`🔥 Replay error ${id}: ${err.message}`);
    res.status(500).json({ ok: false, error: "Replay failed" });
  }
});

// --- Prometheus metrics (unchanged) ---
app.get("/metrics", (_req, res) => {
  res.type("text/plain").send(
    [
      "# HELP asknewton_events_total Total accepted events",
      "# TYPE asknewton_events_total counter",
      `asknewton_events_total ${metrics.events_total}`,
      "# HELP asknewton_duplicates_total Total duplicate events",
      "# TYPE asknewton_duplicates_total counter",
      `asknewton_duplicates_total ${metrics.duplicates_total}`,
      "# HELP asknewton_invalid_signature_total Invalid signature attempts",
      "# TYPE asknewton_invalid_signature_total counter",
      `asknewton_invalid_signature_total ${metrics.invalid_signature_total}`,
      "# HELP asknewton_errors_total Processing/server errors",
      "# TYPE asknewton_errors_total counter",
      `asknewton_errors_total ${metrics.errors_total}`
    ].join("\n")
  );
});

// --- Error handler ---
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  metrics.errors_total++;
  sendSlackAlert(`🔥 Error on ${req.path}: ${err.message}`);
  res.status(500).json({ ok: false, error: "Server error" });
});

app.listen(PORT, () => {
  console.log(`asknewton-webhooks listening on :${PORT}`);
});