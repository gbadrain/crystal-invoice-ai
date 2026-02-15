'use client'

import { Trash2, Plus } from 'lucide-react'
import type { LineItem } from '@/utils/invoice-types'
import { calculateLineAmount, formatCurrency } from '@/utils/invoice-calculations'

interface LineItemsProps {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
}

export function LineItems({ items, onChange }: LineItemsProps) {
  function addItem() {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    }
    onChange([...items, newItem])
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id))
  }

  function updateItem(id: string, field: keyof LineItem, value: string | number) {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item

        const updated = { ...item, [field]: value }

        if (field === 'quantity' || field === 'rate') {
          const qty = field === 'quantity' ? Number(value) : item.quantity
          const rate = field === 'rate' ? Number(value) : item.rate
          updated.quantity = qty
          updated.rate = rate
          updated.amount = calculateLineAmount(qty, rate)
        }

        return updated
      })
    )
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white/90">Line Items</h2>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-crystal-600/20 text-crystal-300 border border-crystal-500/20 text-sm font-medium hover:bg-crystal-600/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Table header */}
      <div className="hidden sm:grid grid-cols-[1fr_100px_120px_120px_40px] gap-3 mb-2 px-1">
        <span className="text-xs text-white/40 uppercase tracking-wider">Description</span>
        <span className="text-xs text-white/40 uppercase tracking-wider">Qty</span>
        <span className="text-xs text-white/40 uppercase tracking-wider">Rate</span>
        <span className="text-xs text-white/40 uppercase tracking-wider">Amount</span>
        <span />
      </div>

      {/* Line item rows */}
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-white/30 text-center py-8">
            No items yet. Click &quot;Add Item&quot; to get started.
          </p>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-1 sm:grid-cols-[1fr_100px_120px_120px_40px] gap-3 items-center bg-white/[0.03] border border-white/[0.06] rounded-xl p-3"
          >
            {/* Description */}
            <div>
              <label className="sm:hidden block text-xs text-white/40 mb-1">Description</label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                placeholder="Service or product description"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-crystal-500/50 transition-colors"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="sm:hidden block text-xs text-white/40 mb-1">Qty</label>
              <input
                type="number"
                min="0"
                step="1"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-right focus:outline-none focus:border-crystal-500/50 transition-colors"
              />
            </div>

            {/* Rate */}
            <div>
              <label className="sm:hidden block text-xs text-white/40 mb-1">Rate</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.rate}
                onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-right focus:outline-none focus:border-crystal-500/50 transition-colors"
              />
            </div>

            {/* Amount (read-only) */}
            <div>
              <label className="sm:hidden block text-xs text-white/40 mb-1">Amount</label>
              <div className="px-3 py-2 text-sm text-white/70 text-right font-medium">
                {formatCurrency(item.amount)}
              </div>
            </div>

            {/* Remove */}
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors justify-self-end sm:justify-self-center"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
