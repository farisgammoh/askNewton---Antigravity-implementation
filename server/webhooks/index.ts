import express from 'express';
import { createHmac } from 'crypto';

const app = express();
const PORT = 3000;

const ELEVEN_INIT_SECRET = process.env.ELEVEN_INIT_SECRET;
const ELEVEN_END_SECRET = process.env.ELEVEN_END_SECRET;

const events: any[] = [];

function verifyHmac(secret: string | undefined, signature: string | undefined, body: string): boolean {
  if (!secret || !signature) {
    return false;
  }
  const hmac = createHmac('sha256', secret);
  hmac.update(body);
  const expectedSignature = hmac.digest('hex');
  return signature === expectedSignature;
}

app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

app.post('/webhooks/eleven/conversation-init', (req: any, res) => {
  const signature = req.headers['x-elevenlabs-signature'];
  const rawBody = req.rawBody || JSON.stringify(req.body);
  
  if (!verifyHmac(ELEVEN_INIT_SECRET, signature, rawBody)) {
    console.log('[webhooks] HMAC validation failed for conversation-init');
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  console.log('[webhooks] Conversation init:', req.body);
  events.push({
    type: 'conversation-init',
    timestamp: new Date().toISOString(),
    data: req.body
  });
  
  res.json({ status: 'received' });
});

app.post('/webhooks/eleven/conversation-end', (req: any, res) => {
  const signature = req.headers['x-elevenlabs-signature'];
  const rawBody = req.rawBody || JSON.stringify(req.body);
  
  if (!verifyHmac(ELEVEN_END_SECRET, signature, rawBody)) {
    console.log('[webhooks] HMAC validation failed for conversation-end');
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  console.log('[webhooks] Conversation end:', req.body);
  events.push({
    type: 'conversation-end',
    timestamp: new Date().toISOString(),
    data: req.body
  });
  
  res.json({ status: 'received' });
});

app.get('/healthz', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    hmacSecretsLoaded: {
      init: !!ELEVEN_INIT_SECRET,
      end: !!ELEVEN_END_SECRET
    }
  });
});

app.get('/events', (req, res) => {
  res.json({
    events,
    count: events.length
  });
});

app.listen(PORT, () => {
  console.log(`[webhooks] Listening on port ${PORT}`);
  console.log('asknewton-webhooks ready');
  if (ELEVEN_INIT_SECRET && ELEVEN_END_SECRET) {
    console.log('HMAC secrets loaded');
  } else {
    console.warn('WARNING: HMAC secrets not loaded');
    console.warn(`  ELEVEN_INIT_SECRET: ${ELEVEN_INIT_SECRET ? 'SET' : 'MISSING'}`);
    console.warn(`  ELEVEN_END_SECRET: ${ELEVEN_END_SECRET ? 'SET' : 'MISSING'}`);
  }
});
