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

const inputClass =
  'w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white text-right focus:outline-none focus:border-crystal-500/50 focus:ring-1 focus:ring-crystal-500/30 transition-colors'

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/50">Discount</span>
            <input
              type="number"
              value={discountRate}
              onChange={(e) => onDiscountRateChange(Math.max(0, Math.min(100, Number(e.target.value))))}
              min={0}
              max={100}
              className={inputClass}
            />
            <span className="text-xs text-white/30">%</span>
          </div>
          {summary.discountAmount > 0 && (
            <span className="text-sm text-red-400 font-medium">
              -{formatCurrency(summary.discountAmount)}
            </span>
          )}
        </div>

        {/* Tax */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/50">Tax</span>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => onTaxRateChange(Math.max(0, Math.min(100, Number(e.target.value))))}
              min={0}
              max={100}
              className={inputClass}
            />
            <span className="text-xs text-white/30">%</span>
          </div>
          {summary.taxAmount > 0 && (
            <span className="text-sm text-white/80 font-medium">
              {formatCurrency(summary.taxAmount)}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-white">Total</span>
            <span className="text-lg font-bold text-crystal-400">
              {formatCurrency(summary.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
