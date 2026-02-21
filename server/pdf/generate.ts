import { Router, type Request, type Response } from 'express'
import puppeteer from 'puppeteer'
import crypto from 'crypto'
import { buildInvoiceHTML } from '../../src/utils/pdf-template'

export const pdfRoutes = Router()

// In-memory store for generated PDFs (keyed by token, auto-expires)
const pdfStore = new Map<string, { buffer: Buffer; filename: string; expires: number }>()

// Clean expired entries every 60 seconds
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of pdfStore) {
    if (now > entry.expires) pdfStore.delete(key)
  }
}, 60_000)

async function renderPDF(invoice: Record<string, unknown>): Promise<Buffer> {
  const html = buildInvoiceHTML(invoice as any)
  console.log('[PDF] HTML built, length:', html.length)

  const browser = await puppeteer.launch({
    headless: 'new' as any,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
    ],
  })
  console.log('[PDF] Browser launched, pid:', browser.process()?.pid)

  try {
    const page = await browser.newPage()
    await page.emulateMediaType('print')
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 })
    console.log('[PDF] Page content set, rendering PDF...')

    const pdfUint8 = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', right: '16mm', bottom: '16mm', left: '16mm' },
      timeout: 30000,
    })
    console.log('[PDF] Raw output type:', pdfUint8.constructor.name, 'byteLength:', pdfUint8.byteLength)

    const pdfBuffer = Buffer.from(pdfUint8.buffer, pdfUint8.byteOffset, pdfUint8.byteLength)
    console.log('[PDF] Buffer length:', pdfBuffer.length, 'first 5 bytes:', JSON.stringify(pdfBuffer.subarray(0, 5).toString()))

    return pdfBuffer
  } finally {
    await browser.close()
    console.log('[PDF] Browser closed')
  }
}

function servePDF(res: Response, pdfBuffer: Buffer, filename: string) {
  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': pdfBuffer.length,
    'Cache-Control': 'no-store',
  })
  res.end(pdfBuffer)
}

// ── POST /generate — returns a download token (used by React client) ──
pdfRoutes.post('/generate', async (req: Request, res: Response) => {
  try {
    const invoice = req.body
    console.log('[PDF POST] Received body keys:', Object.keys(invoice || {}))

    if (!invoice || typeof invoice !== 'object') {
      res.status(400).json({ error: 'Invalid invoice data.' })
      return
    }
    if (!Array.isArray(invoice.lineItems)) {
      res.status(400).json({ error: 'Invoice must include lineItems array.' })
      return
    }

    const pdfBuffer = await renderPDF(invoice)

    if (pdfBuffer.length < 5 || pdfBuffer.subarray(0, 5).toString() !== '%PDF-') {
      console.error('[PDF POST] Invalid PDF output:', pdfBuffer.length, 'bytes')
      res.status(500).json({ error: 'PDF generation produced an invalid file.' })
      return
    }

    // Store the PDF with a unique token (expires in 5 minutes)
    const token = crypto.randomUUID()
    const invoiceNumber = invoice.metadata?.invoiceNumber || 'draft'
    const filename = `invoice-${invoiceNumber}.pdf`
    pdfStore.set(token, {
      buffer: pdfBuffer,
      filename,
      expires: Date.now() + 5 * 60 * 1000,
    })

    console.log('[PDF POST] Stored PDF:', token, '-', pdfBuffer.length, 'bytes')

    // Return the download URL instead of raw binary
    res.json({ downloadUrl: `/api/pdf/download/${token}` })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[PDF POST] Error:', message)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF. Please try again.' })
    }
  }
})

// ── GET /download/:token — serves the actual PDF binary (browser-native) ──
pdfRoutes.get('/download/:token', (req: Request, res: Response) => {
  const { token } = req.params
  const entry = pdfStore.get(token)

  if (!entry) {
    res.status(404).json({ error: 'PDF not found or expired. Please generate again.' })
    return
  }

  // Delete after serving (one-time download)
  pdfStore.delete(token)

  console.log('[PDF DOWNLOAD] Serving:', token, '-', entry.buffer.length, 'bytes')
  servePDF(res, entry.buffer, entry.filename)
})

// ── GET /test — open http://localhost:3001/api/pdf/test in your browser ──
pdfRoutes.get('/test', async (_req: Request, res: Response) => {
  try {
    console.log('[PDF TEST] Generating test PDF...')
    const testInvoice = {
      client: { name: 'Test Client', email: 'test@example.com', address: '123 Main St', phone: '555-0100' },
      metadata: { invoiceNumber: 'INV-TEST-001', issueDate: '2026-02-15', dueDate: '2026-03-17', status: 'draft' },
      lineItems: [
        { id: '1', description: 'Web Development', quantity: 10, rate: 150, amount: 1500 },
        { id: '2', description: 'Design Work', quantity: 5, rate: 120, amount: 600 },
      ],
      summary: { subtotal: 2100, taxRate: 10, taxAmount: 210, discountRate: 0, discountAmount: 0, total: 2310 },
      notes: 'Thank you for your business! Net 30.',
    }

    const pdfBuffer = await renderPDF(testInvoice)
    servePDF(res, pdfBuffer, 'test-invoice.pdf')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[PDF TEST] Error:', message)
    res.status(500).json({ error: message })
  }
})
