import type {
  ClientInfo,
  InvoiceMetadata,
  LineItem,
  InvoiceSummary,
} from './invoice-types'
import {
  calculateLineAmount,
  calculateSummary,
  generateInvoiceNumber,
} from './invoice-calculations'

/**
 * The shape returned by the AI endpoint (raw, untrusted).
 * Every field is optional because AI output is unpredictable.
 */
interface RawAIInvoice {
  client?: Partial<ClientInfo>
  metadata?: Partial<InvoiceMetadata>
  lineItems?: Array<Partial<LineItem>>
  taxRate?: number
  discountRate?: number
  notes?: string
}

/**
 * Sanitized result ready to merge into form state.
 * Excludes `logo` — the form must preserve its own logo state.
 */
export interface ParsedInvoice {
  client: ClientInfo
  metadata: InvoiceMetadata
  lineItems: LineItem[]
  summary: InvoiceSummary
  taxRate: number
  discountRate: number
  notes: string
}

function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number') return String(value)
  return fallback
}

function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function addDaysISO(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) {
    const fallback = new Date()
    fallback.setDate(fallback.getDate() + days)
    return fallback.toISOString().split('T')[0]
  }
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function isValidISODate(value: unknown): boolean {
  if (typeof value !== 'string') return false
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value).getTime())
}

function parseClient(raw: unknown): ClientInfo {
  const src = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<ClientInfo>
  return {
    name: safeString(src.name),
    email: safeString(src.email),
    address: safeString(src.address),
    phone: safeString(src.phone),
  }
}

function parseMetadata(raw: unknown): InvoiceMetadata {
  const src = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<InvoiceMetadata>

  const issueDate = isValidISODate(src.issueDate) ? src.issueDate! : todayISO()
  const dueDate = isValidISODate(src.dueDate) ? src.dueDate! : addDaysISO(issueDate, 30)
  const invoiceNumber = safeString(src.invoiceNumber) || generateInvoiceNumber()

  const validStatuses = ['draft', 'sent', 'paid', 'overdue'] as const
  const status = validStatuses.includes(src.status as typeof validStatuses[number])
    ? (src.status as InvoiceMetadata['status'])
    : 'draft'

  return { invoiceNumber, issueDate, dueDate, status }
}

function parseLineItems(raw: unknown): LineItem[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [{
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    }]
  }

  return raw.map((item) => {
    const src = (typeof item === 'object' && item !== null ? item : {}) as Partial<LineItem>
    const quantity = Math.max(0, safeNumber(src.quantity, 1))
    const rate = Math.max(0, safeNumber(src.rate, 0))
    const amount = calculateLineAmount(quantity, rate)

    return {
      id: crypto.randomUUID(),
      description: safeString(src.description, 'Untitled item'),
      quantity,
      rate,
      amount,
    }
  })
}

/**
 * Takes raw AI output and produces a fully validated, recalculated Invoice.
 * This is the safety boundary — nothing from the AI reaches the form unchecked.
 */
export function parseAIResponse(raw: unknown): ParsedInvoice {
  const src = (typeof raw === 'object' && raw !== null ? raw : {}) as RawAIInvoice

  const client = parseClient(src.client)
  const metadata = parseMetadata(src.metadata)
  const lineItems = parseLineItems(src.lineItems)

  const taxRate = Math.max(0, Math.min(100, safeNumber(src.taxRate, 0)))
  const discountRate = Math.max(0, Math.min(100, safeNumber(src.discountRate, 0)))

  // Always recalculate — never trust AI-provided totals
  const summary = calculateSummary(lineItems, taxRate, discountRate)

  const notes = safeString(src.notes)

  return {
    client,
    metadata,
    lineItems,
    summary,
    taxRate,
    discountRate,
    notes,
  }
}
