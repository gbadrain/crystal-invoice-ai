import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId, formatInvoice } from '../../_helpers'
import { Resend } from 'resend'
import { buildInvoiceEmailHTML } from '@/utils/email-template'

const EXPRESS_URL =
  process.env.NEXT_PUBLIC_EXPRESS_URL ||
  'https://crystal-invoice-ai-production.up.railway.app'

// POST /api/invoices/[id]/send — email the invoice to the client
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email service not configured. Add RESEND_API_KEY to .env.' }, { status: 503 })
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: params.id, userId },
    include: { user: { select: { email: true } } },
  })

  if (!invoice) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
  if (!invoice.clientEmail) {
    return NextResponse.json({ error: 'Client has no email address. Add one before sending.' }, { status: 422 })
  }

  const appUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const from = process.env.RESEND_FROM ?? 'Crystal Invoice <noreply@crystalinvoice.com>'

  // Use a versioned public HTTPS URL for the logo.
  // Gmail proxies and caches images by URL — adding ?v=<timestamp> busts the cache
  // every time the invoice is updated (updatedAt changes on every save).
  const logoV = invoice.updatedAt.getTime()
  const logoSrc = invoice.logo ? `${appUrl}/api/public/logo/${invoice.id}?v=${logoV}` : null
  const html = buildInvoiceEmailHTML(invoice, appUrl, logoSrc)

  // Generate PDF from Railway and attach it to the email
  let pdfAttachment: { filename: string; content: Buffer } | null = null
  try {
    const formatted = formatInvoice(invoice)
    const genRes = await fetch(`${EXPRESS_URL}/api/pdf/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatted),
    })
    if (genRes.ok) {
      const { downloadUrl } = await genRes.json()
      if (downloadUrl) {
        const pdfRes = await fetch(`${EXPRESS_URL}${downloadUrl}`)
        if (pdfRes.ok) {
          const buf = await pdfRes.arrayBuffer()
          pdfAttachment = {
            filename: `Invoice-${invoice.invoiceNumber}.pdf`,
            content: Buffer.from(buf),
          }
        }
      }
    }
  } catch (err) {
    // PDF generation failed — send HTML-only email, no attachment
    console.error('[Send invoice] PDF generation failed, sending without attachment:', err)
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      from,
      to: invoice.clientEmail,
      subject: `Invoice ${invoice.invoiceNumber} from ${invoice.user.email}`,
      html,
      ...(pdfAttachment ? { attachments: [pdfAttachment] } : {}),
    })

    // Promote draft → pending after sending
    if (invoice.status === 'draft') {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'pending' },
      })
    }

    return NextResponse.json({ success: true, hasPdf: !!pdfAttachment })
  } catch (err) {
    console.error('[Send invoice] Resend error:', err)
    return NextResponse.json({ error: 'Failed to send email. Check your Resend configuration.' }, { status: 500 })
  }
}
