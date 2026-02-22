'use client'

import type { InvoiceSummary as InvoiceSummaryType } from '@/utils/invoice-types'
import { formatCurrency } from '@/utils/invoice-calculations'
import { cn } from '@/utils/cn'

interface InvoiceSummaryProps {
  summary: InvoiceSummaryType
  taxRate: number
  discountRate: number
  onTaxRateChange: (rate: number) => void
  onDiscountRateChange: (rate: number) => void
}

const inputClass = "block w-24 rounded-md border-0 bg-slate-800/60 py-2 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-crystal-500 sm:text-sm sm:leading-6 text-right focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500"

export function InvoiceSummary({
  summary,
  taxRate,
  discountRate,
  onTaxRateChange,
  onDiscountRateChange,
}: InvoiceSummaryProps) {
  return (
    <div className="rounded-xl shadow-lg shadow-slate-950/40 bg-slate-900/70 ring-1 ring-slate-800 h-full hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white">Summary</h3>
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Subtotal</span>
            <span className="text-sm font-medium text-slate-200">
              {formatCurrency(summary.subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Discount</span>
              <div className="relative">
                <input
                  type="number"
                  value={discountRate}
                  onChange={(e) => onDiscountRateChange(Math.max(0, Math.min(100, Number(e.target.value))))}
                  min={0} max={100}
                  className={cn(inputClass, "pr-6")}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <span className="text-slate-400 sm:text-sm">%</span>
                </div>
              </div>
            </div>
            {summary.discountAmount > 0 && (
              <span className="text-sm font-medium text-red-400">
                -{formatCurrency(summary.discountAmount)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Tax</span>
              <div className="relative">
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => onTaxRateChange(Math.max(0, Math.min(100, Number(e.target.value))))}
                  min={0} max={100}
                  className={cn(inputClass, "pr-6")}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <span className="text-slate-400 sm:text-sm">%</span>
                </div>
              </div>
            </div>
            {summary.taxAmount > 0 && (
              <span className="text-sm font-medium text-slate-200">
                {formatCurrency(summary.taxAmount)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800">
        <div className="flex items-baseline justify-between">
          <span className="text-base font-semibold text-white">Total</span>
          <span className="text-2xl font-bold text-crystal-400">
            {formatCurrency(summary.total)}
          </span>
        </div>
      </div>
    </div>
  )
}
