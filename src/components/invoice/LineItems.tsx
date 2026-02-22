'use client'

import { Trash2, Plus } from 'lucide-react'
import type { LineItem } from '@/utils/invoice-types'
import { calculateLineAmount, formatCurrency } from '@/utils/invoice-calculations'
import { cn } from '@/utils/cn'

interface LineItemsProps {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
}

const inputClass = "block w-full rounded-md border-0 bg-slate-800/60 py-2.5 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-crystal-500 sm:text-sm sm:leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500"

export function LineItems({ items, onChange }: LineItemsProps) {
  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    const updated = items.map((item) => {
      if (item.id !== id) return item
      const patched = { ...item, [field]: value }
      if (field === 'quantity' || field === 'rate') {
        patched.amount = calculateLineAmount(
          field === 'quantity' ? (value as number) : patched.quantity,
          field === 'rate' ? (value as number) : patched.rate
        )
      }
      return patched
    })
    onChange(updated)
  }

  function addItem() {
    onChange([
      ...items,
      { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, amount: 0 },
    ])
  }

  function removeItem(id: string) {
    if (items.length <= 1) return
    onChange(items.filter((item) => item.id !== id))
  }

  return (
    <div className="rounded-xl shadow-lg shadow-slate-950/40 bg-slate-900/70 ring-1 ring-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Line Items</h3>
        
        <div className="space-y-4">
          {/* Header for larger screens */}
          <div className="hidden sm:grid grid-cols-[1fr_80px_120px_120px_40px] gap-4 px-1">
            <span className="text-xs font-medium text-slate-400 uppercase">Description</span>
            <span className="text-xs font-medium text-slate-400 uppercase text-center">Qty</span>
            <span className="text-xs font-medium text-slate-400 uppercase text-right">Rate</span>
            <span className="text-xs font-medium text-slate-400 uppercase text-right">Amount</span>
            <span />
          </div>

          {/* Rows */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr_80px_120px_120px_40px] gap-4 items-start bg-slate-900/50 p-4 rounded-lg ring-1 ring-slate-800">
                {/* Description */}
                <div className="sm:col-span-1">
                  <label htmlFor={`desc-${index}`} className="sm:hidden text-xs font-medium text-slate-400 mb-1">Description</label>
                  <input
                    id={`desc-${index}`}
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                    className={inputClass}
                  />
                </div>
                
                {/* Quantity */}
                <div className="sm:col-span-1">
                  <label htmlFor={`qty-${index}`} className="sm:hidden text-xs font-medium text-slate-400 mb-1">Quantity</label>
                  <input
                    id={`qty-${index}`}
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', Math.max(0, Number(e.target.value)))}
                    min={0}
                    className={cn(inputClass, "text-center")}
                  />
                </div>

                {/* Rate */}
                <div className="sm:col-span-1">
                  <label htmlFor={`rate-${index}`} className="sm:hidden text-xs font-medium text-slate-400 mb-1">Rate</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-slate-400 sm:text-sm">$</span>
                    </div>
                    <input
                      id={`rate-${index}`}
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', Math.max(0, Number(e.target.value)))}
                      min={0}
                      step={0.01}
                      className={cn(inputClass, "text-right pl-7")}
                    />
                  </div>
                </div>

                {/* Amount */}
                <div className="sm:col-span-1 text-right">
                  <label className="sm:hidden text-xs font-medium text-slate-400 mb-1">Amount</label>
                  <div className="text-sm font-medium text-slate-300 px-3 py-2.5">
                    {formatCurrency(item.amount)}
                  </div>
                </div>

                {/* Remove button */}
                <div className="sm:col-span-1 flex items-center justify-end sm:justify-center sm:pt-8">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Remove item</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800">
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-md text-sm font-semibold py-2 px-3 text-crystal-400 hover:bg-slate-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>
    </div>
  )
}
