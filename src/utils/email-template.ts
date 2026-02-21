/**
 * buildInvoiceEmailHTML
 *
 * Generates a production-ready, table-based HTML invoice email.
 * All CSS is inline so it renders correctly in Gmail, Outlook, iPhone Mail, etc.
 * CSS class styles in <head> act as a fallback — Outlook uses inline styles.
 */

type LineItem = {
  description: string
  quantity: number
  rate: number
  amount: number
}

type InvoiceEmailData = {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  status: string
  clientName: string
  clientEmail: string | null
  clientAddress: string | null
  clientPhone: string | null
  lineItems: unknown
  subtotal: number
  taxRate: number
  taxAmount: number
  discountRate: number
  discountAmount: number
  total: number
  notes: string | null
  logo: string | null
  user: { email: string }
}

function money(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function statusBadge(status: string): string {
  const map: Record<string, { bg: string; color: string }> = {
    draft:   { bg: '#f1f5f9', color: '#64748b' },
    pending: { bg: '#fef3c7', color: '#92400e' },
    paid:    { bg: '#dcfce7', color: '#15803d' },
    overdue: { bg: '#fee2e2', color: '#b91c1c' },
  }
  const s = status.toLowerCase()
  const { bg, color } = map[s] ?? map.draft
  return `<span style="display:inline-block;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;background:${bg};color:${color};">${s}</span>`
}

function esc(v: string | null | undefined): string {
  if (!v) return ''
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function buildInvoiceEmailHTML(invoice: InvoiceEmailData, appUrl: string, logoSrc?: string | null): string {
  const items = (invoice.lineItems as LineItem[]) ?? []

  const lineItemRows = items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding:12px 16px;font-size:14px;color:#1e293b;border-bottom:1px solid #f1f5f9;">${esc(item.description) || 'Item'}</td>
      <td style="padding:12px 16px;font-size:14px;color:#64748b;text-align:center;border-bottom:1px solid #f1f5f9;">${item.quantity}</td>
      <td style="padding:12px 16px;font-size:14px;color:#64748b;text-align:right;border-bottom:1px solid #f1f5f9;">${money(item.rate)}</td>
      <td style="padding:12px 16px;font-size:14px;color:#0f172a;font-weight:600;text-align:right;border-bottom:1px solid #f1f5f9;">${money(item.amount)}</td>
    </tr>`).join('')

  // logoSrc: pass 'cid:invoice-logo' when using Resend inline attachment,
  // or omit to fall back to brand text (data: URIs are blocked by Gmail/Outlook)
  const resolvedLogo = logoSrc ?? null
  const logoHTML = resolvedLogo
    ? `<img src="${resolvedLogo}" alt="Logo" style="max-height:90px;max-width:240px;object-fit:contain;display:block;" />`
    : `<span style="font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">
        <span style="color:#c4b5fd;">Crystal</span> Invoice AI
       </span>`

  const viewUrl = `${appUrl}/invoices/${invoice.id}/view`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Invoice ${esc(invoice.invoiceNumber)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card (max 600px) -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">

          <!-- ── HEADER: Purple brand bar ── -->
          <tr>
            <td style="background:#6d5fd4;padding:28px 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    ${logoHTML}
                  </td>
                  <td style="vertical-align:middle;text-align:right;">
                    <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.6);margin-bottom:4px;">Invoice</div>
                    <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">${esc(invoice.invoiceNumber)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── STATUS + DATE STRIP ── -->
          <tr>
            <td style="background:#ede9fe;padding:12px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:13px;color:#5b21b6;">
                    Issued <strong>${esc(invoice.issueDate)}</strong>
                    &nbsp;·&nbsp;
                    Due <strong>${esc(invoice.dueDate)}</strong>
                  </td>
                  <td style="text-align:right;">
                    ${statusBadge(invoice.status)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── BILL TO + INVOICE DETAILS ── -->
          <tr>
            <td style="padding:32px 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Bill To -->
                  <td width="50%" style="vertical-align:top;padding-right:24px;">
                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#94a3b8;margin-bottom:10px;">Billed To</div>
                    <div style="font-size:16px;font-weight:700;color:#0f172a;margin-bottom:4px;">${esc(invoice.clientName)}</div>
                    ${invoice.clientEmail  ? `<div style="font-size:13px;color:#64748b;margin-bottom:2px;">${esc(invoice.clientEmail)}</div>`  : ''}
                    ${invoice.clientPhone  ? `<div style="font-size:13px;color:#64748b;margin-bottom:2px;">${esc(invoice.clientPhone)}</div>`  : ''}
                    ${invoice.clientAddress ? `<div style="font-size:13px;color:#64748b;">${esc(invoice.clientAddress)}</div>` : ''}
                  </td>

                  <!-- Invoice Details -->
                  <td width="50%" style="vertical-align:top;text-align:right;">
                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#94a3b8;margin-bottom:10px;">From</div>
                    <div style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:2px;">${esc(invoice.user.email)}</div>
                    <div style="font-size:13px;color:#94a3b8;margin-top:8px;">via Crystal Invoice AI</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── DIVIDER ── -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:#f1f5f9;"></div>
            </td>
          </tr>

          <!-- ── LINE ITEMS TABLE ── -->
          <tr>
            <td style="padding:28px 40px 0;">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#94a3b8;margin-bottom:12px;">Services &amp; Items</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;">
                <!-- Table header -->
                <tr style="background:#f8fafc;">
                  <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;border-bottom:1px solid #e2e8f0;">Description</th>
                  <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;border-bottom:1px solid #e2e8f0;width:60px;">Qty</th>
                  <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;border-bottom:1px solid #e2e8f0;width:90px;">Rate</th>
                  <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;border-bottom:1px solid #e2e8f0;width:90px;">Amount</th>
                </tr>
                ${lineItemRows || `<tr><td colspan="4" style="padding:20px;text-align:center;color:#94a3b8;font-size:13px;">No items</td></tr>`}
              </table>
            </td>
          </tr>

          <!-- ── SUMMARY BOX ── -->
          <tr>
            <td style="padding:20px 40px 28px;">
              <table width="260" cellpadding="0" cellspacing="0" border="0" style="margin-left:auto;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:16px 20px 0;">
                    ${invoice.discountAmount > 0 ? `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
                      <tr>
                        <td style="font-size:13px;color:#64748b;">Subtotal</td>
                        <td style="font-size:13px;color:#1e293b;font-weight:500;text-align:right;">${money(invoice.subtotal)}</td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
                      <tr>
                        <td style="font-size:13px;color:#64748b;">Discount (${invoice.discountRate}%)</td>
                        <td style="font-size:13px;color:#ef4444;font-weight:500;text-align:right;">-${money(invoice.discountAmount)}</td>
                      </tr>
                    </table>` : ''}
                    ${invoice.taxAmount > 0 ? `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
                      <tr>
                        <td style="font-size:13px;color:#64748b;">Tax (${invoice.taxRate}%)</td>
                        <td style="font-size:13px;color:#1e293b;font-weight:500;text-align:right;">${money(invoice.taxAmount)}</td>
                      </tr>
                    </table>` : ''}
                  </td>
                </tr>
                <!-- Total row -->
                <tr>
                  <td style="padding:12px 20px 16px;">
                    <div style="height:1px;background:#e2e8f0;margin-bottom:14px;"></div>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size:15px;font-weight:700;color:#0f172a;">Total Due</td>
                        <td style="font-size:22px;font-weight:800;color:#6d5fd4;text-align:right;letter-spacing:-0.5px;">${money(invoice.total)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${invoice.notes ? `
          <!-- ── NOTES ── -->
          <tr>
            <td style="padding:0 40px 28px;">
              <div style="background:#fafafa;border-left:3px solid #6d5fd4;border-radius:0 8px 8px 0;padding:14px 16px;">
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:6px;">Notes</div>
                <div style="font-size:13px;color:#475569;line-height:1.6;">${esc(invoice.notes)}</div>
              </div>
            </td>
          </tr>` : ''}

          <!-- ── CTA BUTTON ── -->
          <tr>
            <td align="center" style="padding:8px 40px 36px;">
              <a href="${viewUrl}"
                 style="display:inline-block;padding:14px 36px;background:#6d5fd4;color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.2px;">
                View &amp; Download Invoice →
              </a>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <div style="font-size:13px;font-weight:700;letter-spacing:-0.3px;margin-bottom:4px;">
                <span style="color:#6d5fd4;">Crystal</span><span style="color:#0f172a;"> Invoice AI</span>
              </div>
              <div style="font-size:11px;color:#94a3b8;">
                This invoice was sent via Crystal Invoice AI · <a href="${appUrl}" style="color:#6d5fd4;text-decoration:none;">${appUrl.replace(/^https?:\/\//, '')}</a>
              </div>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>`
}
