'use client'

import { Download, Loader2, AlertCircle } from 'lucide-react'
import { usePDF } from '@/ai/usePDF'
import type { Invoice } from '@/utils/invoice-types'

interface PDFDownloadButtonProps {
  invoice: Invoice
  locked?: boolean
}

export function PDFDownloadButton({ invoice, locked = false }: PDFDownloadButtonProps) {
  const { generatePDF, isLoading, error } = usePDF()

  if (locked) {
    return (
      <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium cursor-not-allowed" title="Upgrade to Pro to download PDFs">
        <Download className="w-4 h-4 opacity-50" />
        <span>Download PDF</span>
        <span className="text-xs bg-amber-500/20 px-1.5 py-0.5 rounded font-semibold">Pro</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => generatePDF(invoice)}
        disabled={isLoading}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download PDF
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center gap-1.5 text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  )
}
