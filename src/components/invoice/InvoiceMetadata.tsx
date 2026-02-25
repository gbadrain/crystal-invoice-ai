'use client'

import type { InvoiceMetadata as InvoiceMetadataType } from '@/utils/invoice-types'
import { cn } from '@/utils/cn'

const CURRENCIES = [
  { code: 'INR', label: '₹ INR — Indian Rupee' },
  { code: 'USD', label: '$ USD — US Dollar' },
  { code: 'EUR', label: '€ EUR — Euro' },
  { code: 'GBP', label: '£ GBP — British Pound' },
  { code: 'AED', label: 'AED — UAE Dirham' },
  { code: 'SGD', label: 'S$ SGD — Singapore Dollar' },
  { code: 'CAD', label: 'CA$ CAD — Canadian Dollar' },
  { code: 'AUD', label: 'A$ AUD — Australian Dollar' },
  { code: 'JPY', label: '¥ JPY — Japanese Yen' },
  { code: 'CHF', label: 'Fr CHF — Swiss Franc' },
]

interface InvoiceMetadataProps {
  metadata: InvoiceMetadataType
  onChange: (metadata: InvoiceMetadataType) => void
  currency: string
  onCurrencyChange: (currency: string) => void
}

const inputClass = "block w-full rounded-md border-0 bg-slate-800/60 py-2.5 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-crystal-500 sm:text-sm sm:leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500"
const labelClass = "block text-sm font-medium leading-6 text-slate-300"

export function InvoiceMetadata({ metadata, onChange, currency, onCurrencyChange }: InvoiceMetadataProps) {
  function update(field: keyof InvoiceMetadataType, value: string) {
    onChange({ ...metadata, [field]: value })
  }

  return (
    <div className="rounded-xl shadow-lg shadow-slate-950/40 bg-slate-900/70 ring-1 ring-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white">Invoice Details</h3>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          <div>
            <label htmlFor="invoice-number" className={labelClass}>Invoice Number</label>
            <div className="mt-2">
              <input
                id="invoice-number"
                type="text"
                value={metadata.invoiceNumber}
                readOnly
                className={cn(inputClass, "opacity-60 cursor-not-allowed")}
              />
            </div>
          </div>
          <div>
            <label htmlFor="invoice-status" className={labelClass}>Status</label>
            <div className="mt-2">
              <select
                id="invoice-status"
                value={metadata.status}
                onChange={(e) => update('status', e.target.value)}
                className={cn(inputClass, "pr-8")}
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="issue-date" className={labelClass}>Issue Date</label>
            <div className="mt-2">
              <input
                id="issue-date"
                type="date"
                value={metadata.issueDate}
                onChange={(e) => update('issueDate', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="due-date" className={labelClass}>Due Date</label>
            <div className="mt-2">
              <input
                id="due-date"
                type="date"
                value={metadata.dueDate}
                onChange={(e) => update('dueDate', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="invoice-currency" className={labelClass}>Currency</label>
            <div className="mt-2">
              <select
                id="invoice-currency"
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className={cn(inputClass, "pr-8")}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
                {!CURRENCIES.find((c) => c.code === currency) && (
                  <option value={currency}>{currency}</option>
                )}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
