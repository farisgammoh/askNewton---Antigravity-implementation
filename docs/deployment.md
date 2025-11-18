# Deployment Guide

This document describes how to run and deploy the AskNewton application, with a focus on the ElevenLabs webhook service and Replit autoscale environment.

---

## 🧑‍💻 Local Development

### 1. Prerequisites
- Node.js ≥ 18  
- npm (comes with Node)  
- Git (optional but recommended)

### 2. Clone the repository

```bash
git clone https://github.com/farisgammoh/asknewton.git
cd asknewton
````

### 3. Install dependencies

```bash
npm install
```

### 4. Run the development server

```bash
npm start
```

By default, the app listens on `PORT` (defaults to `3000` if not set).

Health check:

```bash
curl http://localhost:3000/healthz
# → { "ok": true, "service": "asknewton-webhooks" }
```

---

## ☁️ Replit Deployment

AskNewton is configured to run on Replit’s autoscale environment.

### 1. Import the repository

You can either:

* Create a new Repl from the GitHub repo (`asknewton`), or
* Connect an existing Repl to the GitHub repository.

Replit will:

* Detect the `npm` project
* Install dependencies
* Use the configured start command (usually `npm start`)

### 2. Configure Secrets (Environment Variables)

In Replit:

1. Open the **Secrets** panel (Environment variables).
2. Add the following:

Required:

* `ELEVEN_INIT_SECRET` – HMAC key for `conversation-init` webhook
* `ELEVEN_END_SECRET` – HMAC key for `conversation-end` webhook

Optional:

* `PORT` – Port to listen on (Replit normally injects this automatically)

> **Never** commit secrets to Git. Keep them only in Replit Secrets or your local `.env` (excluded from Git).

### 3. Deploy / Publish

Once the app is running and tested:

1. Go to the **Deploy** / **Publishing** tab in Replit.
2. Choose the deployment type (Autoscale).
3. Deploy the app.

Replit will:

* Build the container
* Start the Node.js server
* Assign a public URL, e.g.:
  `https://<your-repl>.replit.app`

Use that URL when configuring ElevenLabs webhooks.

---

## 🔊 Configuring ElevenLabs Webhooks

In the ElevenLabs console, create two HMAC webhooks pointing to your Replit URL:

* `https://<your-repl>.replit.app/webhooks/eleven/conversation-init`

  * Secret: `ELEVEN_INIT_SECRET`

* `https://<your-repl>.replit.app/webhooks/eleven/conversation-end`

  * Secret: `ELEVEN_END_SECRET`

Use **Send Test Event** in ElevenLabs to confirm both return **200 OK**.

---

## 🔁 Updating a Deployment

When you change code:

1. Commit & push to GitHub **or** commit directly in Replit.
2. If you’re using GitHub as the source of truth, pull latest changes into Replit.
3. Redeploy from the **Deploy / Publishing** tab.

Recommended flow:

```bash
# Local
git add .
git commit -m "Describe change"
git push origin main
```

Then in Replit: **Pull from GitHub** → redeploy.

---

## 🧪 Post-Deployment Checks

After each deployment:

1. **Health check**

   ```bash
   curl https://<your-repl>.replit.app/healthz
   ```

2. **Webhook tests**

   ```bash
   export REPL_HOST="https://<your-repl>.replit.app"
   npm run test:init
   npm run test:end
   ```

3. **Events endpoint**

   ```bash
   curl https://<your-repl>.replit.app/events
   ```

You should see recent, trimmed webhook events.

---

## 🌐 Future Hosting Options

Although Replit is the primary runtime, the app can be ported to:

* Vercel (Node serverless or Edge functions)
* AWS (Lambda + API Gateway or ECS/Fargate)
* Render / Railway / Fly.io
* Traditional VPS (Docker or bare Node)

Porting requires:

* Respecting `PORT` from environment
* Providing equivalent secret management
* Ensuring raw-body parsing for webhooks is preserved

---

## 📌 Deployment Checklist

* [ ] All environment variables set in Replit Secrets
* [ ] `/healthz` returns `ok: true`
* [ ] ElevenLabs webhooks configured with correct URL + secrets
* [ ] `npm run test:init` and `npm run test:end` succeed
* [ ] `/events` shows recent, valid events

```
::contentReference[oaicite:0]{index=0}
```

