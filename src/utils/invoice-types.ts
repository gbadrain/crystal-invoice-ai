export interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface ClientInfo {
  name: string
  email: string
  address: string
  phone: string
}

export interface InvoiceMetadata {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  status: 'draft' | 'pending' | 'paid' | 'overdue'
}

export interface InvoiceSummary {
  subtotal: number
  taxRate: number
  taxAmount: number
  discountRate: number
  discountAmount: number
  total: number
}

export interface Invoice {
  _id?: string // Added for mock database compatibility
  logo?: string
  client: ClientInfo
  metadata: InvoiceMetadata
  lineItems: LineItem[]
  summary: InvoiceSummary
  notes: string
}
