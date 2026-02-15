'use client'

import { Trash2, Plus } from 'lucide-react'
import type { LineItem } from '@/utils/invoice-types'
import { calculateLineAmount } from '@/utils/invoice-calculations'

interface LineItemsProps {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
}

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-crystal-500/50 focus:ring-1 focus:ring-crystal-500/30 transition-colors'

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
      {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ])
  }

  function removeItem(id: string) {
    if (items.length <= 1) return
    onChange(items.filter((item) => item.id !== id))
  }

  return (
    <div className="glass-panel p-6">
      <h2 className="text-lg font-semibold mb-4 text-white/90">Line Items</h2>

      {/* Header */}
      <div className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-3 mb-2 px-1">
        <span className="text-xs text-white/40 uppercase tracking-wider">Description</span>
        <span className="text-xs text-white/40 uppercase tracking-wider text-center">Qty</span>
        <span className="text-xs text-white/40 uppercase tracking-wider text-right">Rate</span>
        <span className="text-xs text-white/40 uppercase tracking-wider text-right">Amount</span>
        <span />
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-3 items-center"
          >
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
              placeholder="Item description"
              className={inputClass}
            />
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(item.id, 'quantity', Math.max(0, Number(e.target.value)))}
              min={0}
              className={`${inputClass} text-center`}
            />
            <input
              type="number"
              value={item.rate}
              onChange={(e) => updateItem(item.id, 'rate', Math.max(0, Number(e.target.value)))}
              min={0}
              step={0.01}
              className={`${inputClass} text-right`}
            />
            <div className="text-sm text-white/70 text-right px-3 py-2">
              ${item.amount.toFixed(2)}
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              disabled={items.length <= 1}
              className="p-2 text-white/30 hover:text-red-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={addItem}
        className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-crystal-400 hover:bg-white/5 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Item
      </button>
    </div>
  )
}
