import express from 'express'
import cors from 'cors'
import { invoiceRoutes } from './api/invoices'
import { pdfRoutes } from './pdf/generate'

const app = express()

app.use(cors({ origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' }))
app.use(express.json())

app.use('/api/invoices', invoiceRoutes)
app.use('/api/pdf', pdfRoutes)

const PORT = process.env.EXPRESS_PORT || 3001

app.listen(PORT, () => {
  console.log(`Crystal Invoice API running on port ${PORT}`)
})
