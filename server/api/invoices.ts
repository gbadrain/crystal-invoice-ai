import { Router, type Request, type Response } from 'express'
import { getAllInvoices, getInvoiceById, addInvoice, updateInvoice, deleteInvoice } from '../lib/mock-db'

export const invoiceRoutes = Router()

// GET /api/invoices — list all invoices
invoiceRoutes.get('/', async (_req: Request, res: Response) => {
  try {
    const invoices = await getAllInvoices()
    res.json({ total: invoices.length, invoices })
  } catch (error) {
    console.error('[invoices] GET / error:', error)
    res.status(500).json({ error: 'Failed to fetch invoices' })
  }
})

// GET /api/invoices/:id — single invoice
invoiceRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const invoice = await getInvoiceById(req.params.id)
    if (invoice) {
      res.json(invoice)
    } else {
      res.status(404).json({ error: 'Invoice not found' })
    }
  } catch (error) {
    console.error('[invoices] GET /:id error:', error)
    res.status(500).json({ error: 'Failed to fetch invoice' })
  }
})

// POST /api/invoices — create new invoice
invoiceRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const invoice = await addInvoice(req.body)
    console.log('[invoices] Created invoice:', invoice._id)
    res.status(201).json({ success: true, invoice })
  } catch (error) {
    console.error('[invoices] POST / error:', error)
    res.status(500).json({ error: 'Failed to create invoice' })
  }
})

// PUT /api/invoices/:id — update invoice
invoiceRoutes.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await updateInvoice(req.params.id, req.body)
    if (updated) {
      res.json({ success: true, invoice: updated })
    } else {
      res.status(404).json({ error: 'Invoice not found' })
    }
  } catch (error) {
    console.error('[invoices] PUT /:id error:', error)
    res.status(500).json({ error: 'Failed to update invoice' })
  }
})

// DELETE /api/invoices/:id — delete invoice
invoiceRoutes.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await deleteInvoice(req.params.id)
    if (deleted) {
      res.status(204).send()
    } else {
      res.status(404).json({ error: 'Invoice not found' })
    }
  } catch (error) {
    console.error('[invoices] DELETE /:id error:', error)
    res.status(500).json({ error: 'Failed to delete invoice' })
  }
})
