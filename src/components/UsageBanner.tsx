'use client'

import { useEffect, useState } from 'react'
import { Zap, CheckCircle } from 'lucide-react'

interface Usage {
  count: number
  limit: number | null // null = unlimited (Pro)
  isPro: boolean
  isAtLimit: boolean
}

export function UsageBanner() {
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchUsage = () => {
    fetch('/api/invoices/usage')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setUsage(data) })
      .catch(() => {})
  }

  useEffect(() => { fetchUsage() }, [])

  // Refresh instantly when an invoice is saved
  useEffect(() => {
    window.addEventListener('invoice-saved', fetchUsage)
    return () => window.removeEventListener('invoice-saved', fetchUsage)
  }, [])

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      // silently fail — user will see nothing happen
    } finally {
      setLoading(false)
    }
  }

  if (!usage) return null

  // Pro users: show a compact "Pro plan" badge
  if (usage.isPro) {
    return (
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-crystal-600/10 border border-crystal-500/20">
          <CheckCircle className="w-3.5 h-3.5 text-crystal-400" />
          <span className="text-xs font-semibold text-crystal-300">Pro Plan — Unlimited</span>
        </div>
      </div>
    )
  }

  const limit = usage.limit ?? 3
  const pct = Math.min((usage.count / limit) * 100, 100)

  return (
    <div className="px-3 py-4 border-t border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/40">
          {usage.count} / {limit} free invoices
        </span>
        {usage.isAtLimit && (
          <span className="text-xs font-semibold text-amber-400">Limit reached</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all ${
            usage.isAtLimit ? 'bg-amber-500' : 'bg-crystal-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Upgrade CTA */}
      <button
        onClick={handleUpgrade}
        disabled={loading || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold transition-all hover:bg-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Zap className="w-3.5 h-3.5" />
        {loading ? 'Redirecting…' : 'Upgrade to Pro — Unlimited'}
      </button>
    </div>
  )
}
