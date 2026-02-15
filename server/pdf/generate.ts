import { Router, type Request, type Response } from 'express'
import puppeteer from 'puppeteer'
import { buildInvoiceHTML } from '../../src/utils/pdf-template'

export const pdfRoutes = Router()

pdfRoutes.post('/generate', async (req: Request, res: Response) => {
  let browser = null

  try {
    const invoice = req.body

    // Basic validation — ensure we have an object with expected shape
    if (!invoice || typeof invoice !== 'object') {
      res.status(400).json({ error: 'Invalid invoice data.' })
      return
    }

    if (!Array.isArray(invoice.lineItems)) {
      res.status(400).json({ error: 'Invoice must include lineItems array.' })
      return
    }

    // Build the HTML from the invoice object
    const html = buildInvoiceHTML(invoice)

    // Launch Puppeteer and render PDF
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '16mm',
        right: '16mm',
        bottom: '16mm',
        left: '16mm',
      },
    })

    await browser.close()
    browser = null

    // Return the PDF
    const invoiceNumber = invoice.metadata?.invoiceNumber || 'draft'
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoiceNumber}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    })
    res.send(pdfBuffer)
  } catch (err: unknown) {
    // Ensure browser is closed on error
    if (browser) {
      try { await browser.close() } catch { /* ignore cleanup errors */ }
    }

    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('PDF generation error:', message)
    res.status(500).json({ error: 'Failed to generate PDF. Please try again.' })
  }
})
