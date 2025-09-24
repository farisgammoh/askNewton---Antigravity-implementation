import express from "express";
import crypto from "crypto";

const app = express();

// --- Config ---
const PORT = process.env.PORT || 3000;
const MAX_EVENTS = 200; // cap in-memory store

// --- Raw body & size limit for HMAC ---
app.use(express.json({
  limit: "1mb",
  verify: (req, _res, buf) => { req.rawBody = buf; }
}));

// --- In-memory event store (for debugging + idempotency) ---
const seenIds = new Set();
const events = []; // [{id, type, ts, path, body}]

function recordEvent({ id, type, path, body }) {
  const ts = new Date().toISOString();
  events.unshift({ id, type, ts, path, body });
  if (events.length > MAX_EVENTS) events.pop();
}

// --- HMAC helpers ---
const CANDIDATE_HEADERS = [
  "x-elevenlabs-signature",
  "x-signature",
  "x-webhook-signature",
  "x-hub-signature"
];

function getSignatureHeader(req) {
  return CANDIDATE_HEADERS.map(h => req.get(h)).find(Boolean) || "";
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
      return res.status(500).json({ ok: false, error: `${secretEnvKey} missing` });
    }
    if (!verifyHmac(req, secret)) {
      return res.status(401).json({ ok: false, error: "Invalid signature" });
    }
    next();
  };
}

// --- Idempotency helper ---
// If payload contains `id` or `event_id`, skip duplicates
function idempotency(req, res, next) {
  const id = req.body?.id || req.body?.event_id;
  if (!id) return next();
  if (seenIds.has(id)) {
    return res.json({ ok: true, duplicate: true });
  }
  seenIds.add(id);
  next();
}

// --- Webhooks ---
app.post(
  "/webhooks/eleven/conversation-init",
  guard("ELEVEN_INIT_SECRET"),
  idempotency,
  (req, res) => {
    // Optional: enforce a simple shape
    const id = req.body?.id || req.body?.event_id || `init-${Date.now()}`;
    recordEvent({
      id,
      type: "conversation-init",
      path: req.path,
      body: req.body
    });
    // TODO: kick off your own async processing if needed
    res.json({ ok: true });
  }
);

app.post(
  "/webhooks/eleven/conversation-end",
  guard("ELEVEN_END_SECRET"),
  idempotency,
  (req, res) => {
    const id = req.body?.id || req.body?.event_id || `end-${Date.now()}`;
    recordEvent({
      id,
      type: "conversation-end",
      path: req.path,
      body: req.body
    });
    res.json({ ok: true });
  }
);

// --- Health & diagnostics ---
app.get("/healthz", (_req, res) => res.json({ ok: true, service: "asknewton-webhooks" }));
app.get("/version", (_req, res) => res.json({ version: "1.0.0" }));

// VERY basic read-only events viewer (trimmed bodies for safety)
app.get("/events", (_req, res) => {
  const trimmed = events.map(e => ({
    id: e.id,
    type: e.type,
    ts: e.ts,
    path: e.path,
    // Avoid dumping large/PII-heavy payloads:
    body_preview: JSON.stringify(e.body ?? {}).slice(0, 600)
  }));
  res.json({ count: trimmed.length, items: trimmed });
});

app.listen(PORT, () => {
  console.log(`asknewton-webhooks listening on :${PORT}`);
});