import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '../../_helpers'
import { Resend } from 'resend'

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

  const lineItems = invoice.lineItems as Array<{ description: string; quantity: number; rate: number; amount: number }>
  const appUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const from = process.env.RESEND_FROM ?? 'Crystal Invoice <noreply@crystalinvoice.com>'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0f172a; color:#e2e8f0; margin:0; padding:24px; }
    .card { background:#1e293b; border-radius:12px; padding:32px; max-width:600px; margin:0 auto; border:1px solid rgba(255,255,255,0.08); }
    h1 { color:#fff; font-size:24px; margin:0 0 4px; }
    .sub { color:#64748b; font-size:14px; margin:0 0 28px; }
    table { width:100%; border-collapse:collapse; font-size:14px; margin:20px 0; }
    th { text-align:left; padding:8px 0; color:#64748b; border-bottom:1px solid rgba(255,255,255,0.1); font-weight:500; }
    td { padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
    .text-right { text-align:right; }
    .total-row td { font-weight:700; font-size:16px; color:#fff; padding-top:16px; border-bottom:none; }
    .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600; text-transform:capitalize; }
    .badge-pending { background:#854d0e; color:#fef08a; }
    .badge-paid { background:#14532d; color:#86efac; }
    .badge-draft { background:#1e293b; color:#94a3b8; border:1px solid rgba(255,255,255,0.1); }
    .badge-overdue { background:#7f1d1d; color:#fca5a5; }
    .cta { display:inline-block; margin-top:24px; padding:12px 24px; background:#6366f1; color:#fff; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px; }
    .footer { margin-top:32px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.08); font-size:12px; color:#475569; text-align:center; }
  </style>
</head>
<body>
<div class="card">
  <h1>Invoice ${invoice.invoiceNumber}</h1>
  <p class="sub">From ${invoice.user.email} • Issued ${invoice.issueDate} • Due ${invoice.dueDate}</p>

  <div>
    <strong style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.05em">Billed To</strong>
    <p style="margin:6px 0 0;font-weight:600;color:#fff">${invoice.clientName}</p>
    ${invoice.clientAddress ? `<p style="margin:2px 0;color:#94a3b8;font-size:14px">${invoice.clientAddress}</p>` : ''}
    ${invoice.clientPhone ? `<p style="margin:2px 0;color:#94a3b8;font-size:14px">${invoice.clientPhone}</p>` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Rate</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${lineItems.map((item) => `
      <tr>
        <td>${item.description}</td>
        <td class="text-right">${item.quantity}</td>
        <td class="text-right">$${item.rate.toFixed(2)}</td>
        <td class="text-right">$${item.amount.toFixed(2)}</td>
      </tr>`).join('')}
      <tr style="height:8px"><td colspan="4"></td></tr>
      ${invoice.taxAmount > 0 ? `<tr><td colspan="3" style="color:#64748b;font-size:13px">Tax (${invoice.taxRate}%)</td><td class="text-right" style="color:#64748b">$${invoice.taxAmount.toFixed(2)}</td></tr>` : ''}
      ${invoice.discountAmount > 0 ? `<tr><td colspan="3" style="color:#64748b;font-size:13px">Discount (${invoice.discountRate}%)</td><td class="text-right" style="color:#64748b">-$${invoice.discountAmount.toFixed(2)}</td></tr>` : ''}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3">Total Due</td>
        <td class="text-right">$${invoice.total.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>

  ${invoice.notes ? `<p style="font-size:13px;color:#94a3b8;margin-top:16px"><strong style="color:#64748b">Notes:</strong> ${invoice.notes}</p>` : ''}

  <a href="${appUrl}/invoices/${invoice.id}/view" class="cta">View Invoice Online →</a>

  <div class="footer">Sent via <strong>Crystal Invoice</strong> · ${appUrl}</div>
</div>
</body>
</html>`

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
