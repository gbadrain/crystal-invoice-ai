import { Router } from 'express'

export const pdfRoutes = Router()

pdfRoutes.post('/generate', (_req, res) => {
  res.json({ message: 'PDF generation not yet implemented' })
})
