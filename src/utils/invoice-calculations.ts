import type { LineItem, InvoiceSummary } from './invoice-types'

export function calculateLineAmount(quantity: number, rate: number): number {
  return Math.round(quantity * rate * 100) / 100
}

export function calculateSummary(
  lineItems: LineItem[],
  taxRate: number,
  discountRate: number
): InvoiceSummary {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const discountAmount = Math.round(subtotal * (discountRate / 100) * 100) / 100
  const afterDiscount = subtotal - discountAmount
  const taxAmount = Math.round(afterDiscount * (taxRate / 100) * 100) / 100
  const total = Math.round((afterDiscount + taxAmount) * 100) / 100

  return {
    subtotal,
    taxRate,
    taxAmount,
    discountRate,
    discountAmount,
    total,
  }
}

export function generateInvoiceNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `INV-${year}${month}-${random}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
