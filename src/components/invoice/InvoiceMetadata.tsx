'use client'

import type { InvoiceMetadata as InvoiceMetadataType } from '@/utils/invoice-types'

interface InvoiceMetadataProps {
  metadata: InvoiceMetadataType
  onChange: (metadata: InvoiceMetadataType) => void
}

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-crystal-500/50 focus:ring-1 focus:ring-crystal-500/30 transition-colors'

export function InvoiceMetadata({ metadata, onChange }: InvoiceMetadataProps) {
  function update(field: keyof InvoiceMetadataType, value: string) {
    onChange({ ...metadata, [field]: value })
  }

  return (
    <div className="glass-panel p-6">
      <h2 className="text-lg font-semibold mb-4 text-white/90">Invoice Details</h2>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-white/40 mb-1">Invoice Number</label>
          <input
            type="text"
            value={metadata.invoiceNumber}
            readOnly
            className={`${inputClass} opacity-60 cursor-not-allowed`}
          />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1">Issue Date</label>
          <input
            type="date"
            value={metadata.issueDate}
            onChange={(e) => update('issueDate', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1">Due Date</label>
          <input
            type="date"
            value={metadata.dueDate}
            onChange={(e) => update('dueDate', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1">Status</label>
          <select
            value={metadata.status}
            onChange={(e) => update('status', e.target.value)}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>
    </div>
  )
}
