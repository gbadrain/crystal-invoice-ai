'use client'

import { useState } from 'react'
import { Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { useInvoiceAI } from '@/ai/useInvoiceAI'
import type { ParsedInvoice } from '@/utils/ai-parser'

interface AIGeneratorProps {
  onGenerate: (invoice: ParsedInvoice) => void
}

const PLACEHOLDER = `Example: "I cleaned 3 HVAC units at $150 each for John Smith, john@smith.com, 123 Main St. Add 8% tax and a 5% loyalty discount."`

export function AIGenerator({ onGenerate }: AIGeneratorProps) {
  const [text, setText] = useState('')
  const { generateInvoiceFromText, isLoading, error } = useInvoiceAI()

  async function handleGenerate() {
    if (!text.trim() || isLoading) return

    const result = await generateInvoiceFromText(text.trim())
    if (result) {
      onGenerate(result)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div className="glass-panel p-6 border-crystal-500/20 bg-crystal-900/10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-crystal-400" />
        <h2 className="text-lg font-semibold text-white/90">Generate with AI</h2>
      </div>

      <p className="text-sm text-white/40 mb-3">
        Describe your invoice in plain English and let AI fill in the form.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={PLACEHOLDER}
        rows={3}
        disabled={isLoading}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-crystal-500/50 focus:ring-1 focus:ring-crystal-500/30 transition-colors resize-none disabled:opacity-50"
      />

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-white/25">
          {isLoading ? 'Generating...' : 'Cmd+Enter to generate'}
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!text.trim() || isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-crystal-600 text-white text-sm font-medium hover:bg-crystal-700 transition-colors shadow-lg shadow-crystal-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-crystal-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Invoice
            </>
          )}
        </button>
      </div>
    </div>
  )
}
