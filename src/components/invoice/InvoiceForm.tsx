'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2, AlertCircle, Save } from 'lucide-react'
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

function dueDateISO(days = 30): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

const initialClientState: ClientInfoType = { name: '', email: '', address: '', phone: '' }
const initialLineItemsState: LineItem[] = [{ id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, amount: 0 }]

interface InvoiceFormProps {
  initialInvoice?: Invoice
  initialDefaults?: { dueDays: number; footer: string; currency: string }
}

export function InvoiceForm({ initialInvoice, initialDefaults }: InvoiceFormProps) {
  const router = useRouter()
  const isEditMode = !!initialInvoice

  const initialMetadataState: InvoiceMetadataType = {
    invoiceNumber: generateInvoiceNumber(),
    issueDate: todayISO(),
    dueDate: dueDateISO(initialDefaults?.dueDays ?? 30),
    status: 'draft',
  }

  const [client, setClient] = useState<ClientInfoType>(initialInvoice?.client || initialClientState)
  const [metadata, setMetadata] = useState<InvoiceMetadataType>(initialInvoice?.metadata || initialMetadataState)
  const [lineItems, setLineItems] = useState<LineItem[]>(initialInvoice?.lineItems || initialLineItemsState)
  const [logo, setLogo] = useState<string | undefined>(initialInvoice?.logo)
  const [taxRate, setTaxRate] = useState(initialInvoice?.summary.taxRate || 0)
  const [discountRate, setDiscountRate] = useState(initialInvoice?.summary.discountRate || 0)
  const [notes, setNotes] = useState(
    initialInvoice ? (initialInvoice.notes || '') : (initialDefaults?.footer ?? '')
  )

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isAtLimit, setIsAtLimit] = useState(false)

  useEffect(() => {
    if (!isEditMode) {
      fetch('/api/invoices/usage')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => { if (data?.isAtLimit) setIsAtLimit(true) })
        .catch(() => {})
    }
  }, [isEditMode])

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
  }

  const currentInvoice: Invoice = useMemo(() => ({
    _id: initialInvoice?._id,
    logo,
    client,
    metadata,
    lineItems,
    summary,
    notes,
  }), [initialInvoice?._id, logo, client, metadata, lineItems, summary, notes])

  async function handleSave() {
    setIsSaving(true)
    setSaveError(null)

    const url = isEditMode ? `/api/invoices/${initialInvoice?._id}` : '/api/invoices'
    const method = isEditMode ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentInvoice),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 402) {
          setSaveError(errorData.error || 'Free invoice limit reached. Upgrade to Pro.')
          return
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const { invoice: saved } = await response.json()
      window.dispatchEvent(new Event('invoice-saved'))
      router.refresh()
      router.push(isEditMode ? `/invoices/${saved._id}/view` : '/invoices')
      alert(`Invoice ${isEditMode ? 'updated' : 'saved'} successfully!`)

    } catch (err: any) {
      setSaveError(err.message || `Failed to ${isEditMode ? 'update' : 'save'} invoice.`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {isEditMode ? 'Edit Invoice' : 'New Invoice'}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {isEditMode ? `Editing invoice ${metadata.invoiceNumber}` : 'Create a new invoice for your client.'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <PDFDownloadButton invoice={currentInvoice} locked={isAtLimit && !isEditMode} />
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || (isAtLimit && !isEditMode)}
            className="inline-flex items-center justify-center rounded-lg text-sm font-semibold py-2.5 px-5 bg-crystal-600 text-white hover:bg-crystal-500 disabled:opacity-50 shadow-lg shadow-crystal-600/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditMode ? 'Save Changes' : 'Save Draft'}
          </button>
        </div>
      </div>

      {isAtLimit && !isEditMode && (
        <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-md">
          <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-300">You&apos;ve reached your free limit. Upgrade to Pro for unlimited invoices and PDF downloads.</p>
        </div>
      )}

      {saveError && (
        <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 shadow-md">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{saveError}</p>
        </div>
      )}

      <div className="space-y-8">
        <AIGenerator onGenerate={handleAIGenerate} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <ClientInfo client={client} onChange={setClient} />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <LogoUploader logo={logo} onChange={setLogo} />
            <InvoiceMetadata metadata={metadata} onChange={setMetadata} />
          </div>
        </div>

        <LineItems items={lineItems} onChange={setLineItems} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="rounded-xl shadow-lg shadow-slate-950/40 bg-slate-900/70 ring-1 ring-slate-800 h-full hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white">Notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment terms, thank you message, etc."
                  rows={5}
                  className="mt-4 block w-full rounded-md border-0 bg-slate-800/60 py-2.5 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-crystal-500 sm:text-sm sm:leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500"
                />
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
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
    </div>
  )
}
