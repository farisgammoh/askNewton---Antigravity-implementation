import 'dotenv/config'
import express from 'express'
import { router } from './orchestrator/router.js'

const app = express()
app.use(express.json({ limit: '5mb' }))

app.get('/health', (_req, res) => res.json({ ok: true }))

// Gateway endpoint for any channel (web, WhatsApp webhook, etc.)
app.post('/gateway', async (req, res) => {
  try {
    const result = await router.handle(req.body)
    res.json(result)
  } catch (e:any) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Gateway listening on :${PORT}`))
