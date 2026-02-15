'use client'

import type { InvoiceMetadata as InvoiceMetadataType } from '@/utils/invoice-types'

interface InvoiceMetadataProps {
  metadata: InvoiceMetadataType
  onChange: (metadata: InvoiceMetadataType) => void
}

const statusOptions: InvoiceMetadataType['status'][] = ['draft', 'sent', 'paid', 'overdue']

export function InvoiceMetadata({ metadata, onChange }: InvoiceMetadataProps) {
  function update(field: keyof InvoiceMetadataType, value: string) {
    onChange({ ...metadata, [field]: value })
  }

  return (
    <div className="glass-panel p-6">
      <h2 className="text-lg font-semibold mb-4 text-white/90">Invoice Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/50 mb-1.5">Invoice Number</label>
          <input
            type="text"
            value={metadata.invoiceNumber}
            onChange={(e) => update('invoiceNumber', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-crystal-500/50 focus:ring-1 focus:ring-crystal-500/30 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1.5">Status</label>
          <select
            value={metadata.status}
            onChange={(e) => update('status', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-crystal-500/50 focus:ring-1 focus:ring-crystal-500/30 transition-colors appearance-none"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status} className="bg-slate-800 text-white">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1.5">Issue Date</label>
          <input
            type="date"
            value={metadata.issueDate}
            onChange={(e) => update('issueDate', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-crystal-500/50 focus:ring-1 focus:ring-crystal-500/30 transition-colors [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="block text-sm text-white/50 mb-1.5">Due Date</label>
          <input
            type="date"
            value={metadata.dueDate}
            onChange={(e) => update('dueDate', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-crystal-500/50 focus:ring-1 focus:ring-crystal-500/30 transition-colors [color-scheme:dark]"
          />
        </div>
      </div>
    </div>
  )
}
