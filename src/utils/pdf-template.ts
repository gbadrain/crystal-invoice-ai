import type { Invoice } from './invoice-types'

function esc(str: string | undefined | null): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function money(amount: number | undefined | null): string {
  const val = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val)
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function statusBadge(status: string | undefined): string {
  const s = status || 'draft'
  const colors: Record<string, string> = {
    draft: '#64748b',
    sent: '#3b82f6',
    paid: '#22c55e',
    overdue: '#ef4444',
  }
  const color = colors[s] || colors.draft
  return `<span style="
    display: inline-block;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: white;
    background: ${color};
  ">${esc(s)}</span>`
}

export function buildInvoiceHTML(invoice: Invoice): string {
  const client = invoice.client || { name: '', email: '', address: '', phone: '' }
  const meta = invoice.metadata || { invoiceNumber: '', issueDate: '', dueDate: '', status: 'draft' }
  const items = Array.isArray(invoice.lineItems) ? invoice.lineItems : []
  const summary = invoice.summary || { subtotal: 0, taxRate: 0, taxAmount: 0, discountRate: 0, discountAmount: 0, total: 0 }
  const notes = invoice.notes || ''
  const logo = invoice.logo || ''

  const lineItemRows = items.length > 0
    ? items.map((item, i) => `
        <tr style="${i % 2 === 0 ? 'background: #fafbfc;' : ''}">
          <td style="padding: 10px 12px; border-bottom: 1px solid #eef0f3; font-size: 13px; color: #1e293b;">
            ${esc(item.description) || 'Untitled item'}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eef0f3; font-size: 13px; color: #475569; text-align: center;">
            ${typeof item.quantity === 'number' ? item.quantity : 0}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eef0f3; font-size: 13px; color: #475569; text-align: right;">
            ${money(item.rate)}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eef0f3; font-size: 13px; color: #1e293b; text-align: right; font-weight: 500;">
            ${money(item.amount)}
          </td>
        </tr>
      `).join('')
    : `<tr>
        <td colspan="4" style="padding: 24px; text-align: center; color: #94a3b8; font-size: 13px;">
          No line items
        </td>
      </tr>`

  const logoHTML = logo
    ? `<img src="${logo}" alt="Logo" style="max-height: 60px; max-width: 180px; object-fit: contain;" />`
    : `<div style="font-size: 22px; font-weight: 700; color: #4c6ef5; letter-spacing: -0.5px;">Crystal Invoice</div>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${esc(meta.invoiceNumber)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1e293b;
      background: white;
      padding: 48px;
      max-width: 800px;
      margin: 0 auto;
    }
    @media print {
      body { padding: 32px; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <table style="width: 100%; margin-bottom: 40px;">
    <tr>
      <td style="vertical-align: top; width: 50%;">
        ${logoHTML}
      </td>
      <td style="vertical-align: top; text-align: right; width: 50%;">
        <div style="font-size: 28px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 6px;">
          INVOICE
        </div>
        <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">
          ${esc(meta.invoiceNumber) || '—'}
        </div>
        <div style="margin-top: 8px;">
          ${statusBadge(meta.status)}
        </div>
      </td>
    </tr>
  </table>

  <!-- Dates + Client -->
  <table style="width: 100%; margin-bottom: 32px;">
    <tr>
      <td style="vertical-align: top; width: 50%;">
        <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px;">
          Bill To
        </div>
        <div style="font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 4px;">
          ${esc(client.name) || '—'}
        </div>
        ${client.email ? `<div style="font-size: 13px; color: #475569; margin-bottom: 2px;">${esc(client.email)}</div>` : ''}
        ${client.phone ? `<div style="font-size: 13px; color: #475569; margin-bottom: 2px;">${esc(client.phone)}</div>` : ''}
        ${client.address ? `<div style="font-size: 13px; color: #475569;">${esc(client.address)}</div>` : ''}
      </td>
      <td style="vertical-align: top; text-align: right; width: 50%;">
        <table style="margin-left: auto;">
          <tr>
            <td style="padding: 3px 16px 3px 0; font-size: 12px; color: #94a3b8; text-align: right;">Issue Date</td>
            <td style="padding: 3px 0; font-size: 13px; color: #1e293b; font-weight: 500;">${formatDate(meta.issueDate)}</td>
          </tr>
          <tr>
            <td style="padding: 3px 16px 3px 0; font-size: 12px; color: #94a3b8; text-align: right;">Due Date</td>
            <td style="padding: 3px 0; font-size: 13px; color: #1e293b; font-weight: 500;">${formatDate(meta.dueDate)}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Line Items Table -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <thead>
      <tr style="background: #f1f5f9;">
        <th style="padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; border-bottom: 2px solid #e2e8f0;">
          Description
        </th>
        <th style="padding: 10px 12px; text-align: center; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; border-bottom: 2px solid #e2e8f0; width: 80px;">
          Qty
        </th>
        <th style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; border-bottom: 2px solid #e2e8f0; width: 110px;">
          Rate
        </th>
        <th style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; border-bottom: 2px solid #e2e8f0; width: 110px;">
          Amount
        </th>
      </tr>
    </thead>
    <tbody>
      ${lineItemRows}
    </tbody>
  </table>

  <!-- Summary -->
  <table style="width: 300px; margin-left: auto; margin-bottom: 32px;">
    <tr>
      <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Subtotal</td>
      <td style="padding: 6px 0; font-size: 13px; color: #1e293b; text-align: right; font-weight: 500;">${money(summary.subtotal)}</td>
    </tr>
    ${summary.discountRate > 0 ? `
    <tr>
      <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Discount (${summary.discountRate}%)</td>
      <td style="padding: 6px 0; font-size: 13px; color: #ef4444; text-align: right; font-weight: 500;">-${money(summary.discountAmount)}</td>
    </tr>
    ` : ''}
    ${summary.taxRate > 0 ? `
    <tr>
      <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Tax (${summary.taxRate}%)</td>
      <td style="padding: 6px 0; font-size: 13px; color: #1e293b; text-align: right; font-weight: 500;">${money(summary.taxAmount)}</td>
    </tr>
    ` : ''}
    <tr>
      <td colspan="2" style="padding: 8px 0 0 0;"><div style="border-top: 2px solid #e2e8f0;"></div></td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-size: 16px; font-weight: 700; color: #0f172a;">Total</td>
      <td style="padding: 8px 0; font-size: 16px; font-weight: 700; color: #4c6ef5; text-align: right;">${money(summary.total)}</td>
    </tr>
  </table>

  <!-- Notes -->
  ${notes ? `
  <div style="margin-bottom: 40px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
    <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 6px;">Notes</div>
    <div style="font-size: 13px; color: #475569; line-height: 1.6; white-space: pre-wrap;">${esc(notes)}</div>
  </div>
  ` : ''}

  <!-- Footer -->
  <div style="text-align: center; padding-top: 32px; border-top: 1px solid #e2e8f0;">
    <div style="font-size: 11px; color: #94a3b8;">
      Generated by <strong style="color: #4c6ef5;">Crystal Invoice AI</strong>
    </div>
  </div>

</body>
</html>`
}
