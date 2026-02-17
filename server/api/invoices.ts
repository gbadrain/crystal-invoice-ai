import { Router, type Request, type Response } from 'express'
import {
  getAllInvoices,
  getInvoiceById,
  addInvoice,
  updateInvoice,
  softDeleteInvoice,
  restoreInvoice,
  permanentDeleteInvoice,
  permanentDeleteAllTrashed,
  restoreAllTrashed
} from '../lib/mock-db'

export const invoiceRoutes = Router()

// GET /api/invoices — list invoices (excluding trashed by default)
invoiceRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const includeTrashed = req.query.status === 'trashed';
    const invoices = await getAllInvoices(includeTrashed);
    res.json({ total: invoices.length, invoices });
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

// DELETE /api/invoices?forceAll=true — permanently delete all trashed invoices
invoiceRoutes.delete('/', async (req: Request, res: Response) => {
  if (req.query.forceAll !== 'true') {
    return res.status(400).json({ error: 'Missing ?forceAll=true query parameter.' });
  }
  try {
    const count = await permanentDeleteAllTrashed();
    res.json({ success: true, deleted: count });
  } catch (error) {
    console.error('[invoices] DELETE / (forceAll) error:', error);
    res.status(500).json({ error: 'Failed to empty trash.' });
  }
});

// POST /api/invoices/restoreAll — restore all trashed invoices
invoiceRoutes.post('/restoreAll', async (req: Request, res: Response) => {
  try {
    const count = await restoreAllTrashed();
    res.json({ success: true, restored: count });
  } catch (error) {
    console.error('[invoices] POST /restoreAll error:', error);
    res.status(500).json({ error: 'Failed to restore all.' });
  }
});

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

// DELETE /api/invoices/:id — soft or permanent delete
invoiceRoutes.delete('/:id', async (req: Request, res: Response) => {
  const { force } = req.query;

  if (force === 'true') {
    // Permanent delete
    try {
      const deleted = await permanentDeleteInvoice(req.params.id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Invoice not found for permanent deletion.' });
      }
    } catch (error) {
      console.error('[invoices] PERMANENT DELETE /:id error:', error);
      res.status(500).json({ error: 'Failed to permanently delete invoice.' });
    }
  } else {
    // Soft delete
    try {
      const trashedInvoice = await softDeleteInvoice(req.params.id);
      if (trashedInvoice) {
        res.json({ success: true, invoice: trashedInvoice });
      } else {
        res.status(404).json({ error: 'Invoice not found to move to trash.' });
      }
    } catch (error) {
      console.error('[invoices] SOFT DELETE /:id error:', error);
      res.status(500).json({ error: 'Failed to move invoice to trash.' });
    }
  }
});

// POST /api/invoices/:id/restore — restore a soft-deleted invoice
invoiceRoutes.post('/:id/restore', async (req: Request, res: Response) => {
    try {
        const restoredInvoice = await restoreInvoice(req.params.id);
        if (restoredInvoice) {
            res.json({ success: true, invoice: restoredInvoice });
        } else {
            res.status(404).json({ error: 'Invoice not found in trash or cannot be restored.' });
        }
    } catch (error) {
        console.error('[invoices] POST /:id/restore error:', error);
        res.status(500).json({ error: 'Failed to restore invoice.' });
    }
});