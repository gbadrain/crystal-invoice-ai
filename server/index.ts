import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { invoiceRoutes } from './api/invoices'
import { aiRoutes } from './api/ai/generate'
import { pdfRoutes } from './pdf/generate'

const app = express()

app.use(cors({ origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' }))
app.use(express.json({ limit: '10mb' }))

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/api/invoices', invoiceRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/pdf', pdfRoutes)

// Global error handler — must be registered after all routes
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Express] Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.EXPRESS_PORT || 3001

app.listen(PORT, () => {
  console.log(`Crystal Invoice API running on port ${PORT}`)
})
