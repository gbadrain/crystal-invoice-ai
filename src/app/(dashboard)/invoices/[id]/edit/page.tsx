'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2, AlertCircle } from 'lucide-react'
import { AIGenerator } from '@/components/invoice/AIGenerator'
import { PDFDownloadButton } from '@/components/invoice/PDFDownloadButton'
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
  Invoice,
} from '@/utils/invoice-types'
import type { ParsedInvoice } from '@/utils/ai-parser'

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function dueDateISO(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}

interface EditInvoicePageProps {
  params: { id: string }
}

export default function EditInvoicePage({ params }: EditInvoicePageProps) {
  const router = useRouter()
  const { id } = params

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

  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const response = await fetch(`/api/invoices/${id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: Invoice = await response.json()

        setClient(data.client || client)
        setMetadata(data.metadata || metadata)
        setLineItems(data.lineItems || lineItems)
        setLogo(data.logo)
        setTaxRate(data.summary?.taxRate || 0)
        setDiscountRate(data.summary?.discountRate || 0)
        setNotes(data.notes || '')
      } catch (err) {
        setFetchError('Failed to load invoice.')
        console.error('Error fetching invoice:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchInvoice()
    } else {
      setIsLoading(false)
      setFetchError('No invoice ID provided.')
    }
  }, [id])

  const summary = useMemo(
    () => calculateSummary(lineItems, taxRate, discountRate),
    [lineItems, taxRate, discountRate]
  )

  function handleAIGenerate(parsed: ParsedInvoice) {
    setClient(parsed.client)
    setMetadata(parsed.metadata)
    setLineItems(parsed.lineItems)
    setTaxRate(parsed.taxRate)
    setDiscountRate(parsed.discountRate)
    setNotes(parsed.notes)
    // Logo is intentionally NOT overwritten
  }

  const currentInvoice: Invoice = useMemo(() => ({
    _id: id, // Include ID for update
    logo,
    client,
    metadata,
    lineItems,
    summary,
    notes,
  }), [id, logo, client, metadata, lineItems, summary, notes])

  async function handleSaveInvoice() {
    setIsSaving(true)
    setSaveError(null)
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentInvoice),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      router.push('/invoices') // Redirect to invoice list after saving
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save invoice.')
      console.error('Error saving invoice:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-crystal-400" />
        <p className="ml-3 text-lg text-white/70">Loading invoice...</p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="ml-3 text-lg text-red-400 mt-3">{fetchError}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Edit Invoice</h1>
          <p className="text-white/50 text-sm">
            Modify an existing invoice
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PDFDownloadButton invoice={currentInvoice} />
          <button
            type="button"
            onClick={handleSaveInvoice}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-crystal-600 text-white text-sm font-medium hover:bg-crystal-700 transition-colors shadow-lg shadow-crystal-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{saveError}</p>
        </div>
      )}

      {/* Form sections */}
      <div className="space-y-6">
        {/* AI Generator */}
        <AIGenerator onGenerate={handleAIGenerate} />

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
