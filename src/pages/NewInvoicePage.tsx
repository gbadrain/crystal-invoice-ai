'use client'

import { useState, useMemo } from 'react'
import { FileText } from 'lucide-react'
import { LogoUploader } from '@/components/invoice/LogoUploader'
import { ClientInfo } from '@/components/invoice/ClientInfo'
import { InvoiceMetadata } from '@/components/invoice/InvoiceMetadata'
import { LineItems } from '@/components/invoice/LineItems'
import { InvoiceSummary } from '@/components/invoice/InvoiceSummary'
import {
  generateInvoiceNumber,
  calculateSummary,
} from '@/utils/invoice-calculations'
import type {
  ClientInfo as ClientInfoType,
  InvoiceMetadata as InvoiceMetadataType,
  LineItem,
} from '@/utils/invoice-types'

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function dueDateISO(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}

export function NewInvoicePage() {
  const [client, setClient] = useState<ClientInfoType>({
    name: '',
    email: '',
    address: '',
    phone: '',
  })

  const [metadata, setMetadata] = useState<InvoiceMetadataType>({
    invoiceNumber: generateInvoiceNumber(),
    issueDate: todayISO(),
    dueDate: dueDateISO(),
    status: 'draft',
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    },
  ])

  const [logo, setLogo] = useState<string | undefined>(undefined)
  const [taxRate, setTaxRate] = useState(0)
  const [discountRate, setDiscountRate] = useState(0)
  const [notes, setNotes] = useState('')

  const summary = useMemo(
    () => calculateSummary(lineItems, taxRate, discountRate),
    [lineItems, taxRate, discountRate]
  )

  function handleSaveDraft() {
    const invoice = {
      logo,
      client,
      metadata,
      lineItems,
      summary,
      notes,
    }
    // TODO: Send to API
    console.log('Invoice draft:', invoice)
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">New Invoice</h1>
          <p className="text-white/50 text-sm">
            Create a new invoice for your client
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveDraft}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-crystal-600 text-white text-sm font-medium hover:bg-crystal-700 transition-colors shadow-lg shadow-crystal-600/20"
        >
          <FileText className="w-4 h-4" />
          Save Draft
        </button>
      </div>

      {/* Form sections */}
      <div className="space-y-6">
        {/* Logo uploader */}
        <LogoUploader logo={logo} onChange={setLogo} />

        {/* Client + Metadata side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ClientInfo client={client} onChange={setClient} />
          <InvoiceMetadata metadata={metadata} onChange={setMetadata} />
        </div>

        {/* Line Items */}
        <LineItems items={lineItems} onChange={setLineItems} />

        {/* Summary + Notes side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notes */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold mb-4 text-white/90">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment terms, thank you message, or additional notes..."
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-crystal-500/50 focus:ring-1 focus:ring-crystal-500/30 transition-colors resize-none"
            />
          </div>

          {/* Summary */}
          <InvoiceSummary
            summary={summary}
            taxRate={taxRate}
            discountRate={discountRate}
            onTaxRateChange={setTaxRate}
            onDiscountRateChange={setDiscountRate}
          />
        </div>
      </div>
    </div>
  )
}
