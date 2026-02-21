import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '../../_helpers'
import { Resend } from 'resend'
import { buildInvoiceEmailHTML } from '@/utils/email-template'

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

  const html = buildInvoiceEmailHTML(invoice, appUrl)

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      from,
      to: invoice.clientEmail,
      subject: `Invoice ${invoice.invoiceNumber} from ${invoice.user.email}`,
      html,
    })

    // Update status to pending if it was draft
    if (invoice.status === 'draft') {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'pending' },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Send invoice] Resend error:', err)
    return NextResponse.json({ error: 'Failed to send email. Check your Resend configuration.' }, { status: 500 })
  }
}
