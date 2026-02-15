'use client'

import type { InvoiceSummary as InvoiceSummaryType } from '@/utils/invoice-types'
import { formatCurrency } from '@/utils/invoice-calculations'

interface InvoiceSummaryProps {
  summary: InvoiceSummaryType
  taxRate: number
  discountRate: number
  onTaxRateChange: (rate: number) => void
  onDiscountRateChange: (rate: number) => void
}

export function InvoiceSummary({
  summary,
  taxRate,
  discountRate,
  onTaxRateChange,
  onDiscountRateChange,
}: InvoiceSummaryProps) {
  return (
    <div className="glass-panel p-6">
      <h2 className="text-lg font-semibold mb-4 text-white/90">Summary</h2>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/50">Subtotal</span>
          <span className="text-sm text-white/80 font-medium">
            {formatCurrency(summary.subtotal)}
          </span>
        </div>

        {/* Discount */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/50">Discount</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={discountRate}
                onChange={(e) => onDiscountRateChange(parseFloat(e.target.value) || 0)}
                className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-right focus:outline-none focus:border-crystal-500/50 transition-colors"
              />
              <span className="text-xs text-white/40">%</span>
            </div>
          </div>
          <span className="text-sm text-red-400/80 font-medium">
            {summary.discountAmount > 0 ? `−${formatCurrency(summary.discountAmount)}` : formatCurrency(0)}
          </span>
        </div>

        {/* Tax */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/50">Tax</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={taxRate}
                onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
                className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-right focus:outline-none focus:border-crystal-500/50 transition-colors"
              />
              <span className="text-xs text-white/40">%</span>
            </div>
          </div>
          <span className="text-sm text-white/80 font-medium">
            {formatCurrency(summary.taxAmount)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-2" />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-white">Total</span>
          <span className="text-xl font-bold text-crystal-300">
            {formatCurrency(summary.total)}
          </span>
        </div>
      </div>
    </div>
  )
}
