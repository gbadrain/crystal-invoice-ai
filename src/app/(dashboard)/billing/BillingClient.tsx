'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Zap, CheckCircle, ExternalLink, CreditCard, PartyPopper, XCircle } from 'lucide-react'
import { FREE_INVOICE_LIMIT } from '@/lib/plans'

interface Props {
  isPro: boolean
  hasStripeCustomer: boolean
}

export function BillingClient({ isPro, hasStripeCustomer }: Props) {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const [banner, setBanner] = useState<'success' | 'canceled' | null>(null)

  useEffect(() => {
    if (searchParams.get('success') === '1') setBanner('success')
    else if (searchParams.get('canceled') === '1') setBanner('canceled')
  }, [searchParams])

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Could not start checkout. Please try again.')
      }
    } catch (err) {
      alert('Network error. Please try again.')
      console.error('[Upgrade]', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePortal = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Could not open billing portal. Please try again.')
      }
    } catch (err) {
      alert('Network error. Please try again.')
      console.error('[Portal]', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Post-payment banners */}
      {banner === 'success' && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
          <PartyPopper className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-300">Welcome to Pro!</p>
            <p className="text-xs text-green-400/70 mt-0.5">Your account has been upgraded. Enjoy unlimited invoices and all Pro features.</p>
          </div>
          <button onClick={() => setBanner(null)} className="ml-auto text-green-400/50 hover:text-green-300"><XCircle className="w-4 h-4" /></button>
        </div>
      )}
      {banner === 'canceled' && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
          <XCircle className="w-5 h-5 text-white/40 mt-0.5 shrink-0" />
          <p className="text-sm text-white/50">Payment was canceled — no charge was made.</p>
          <button onClick={() => setBanner(null)} className="ml-auto text-white/30 hover:text-white/50"><XCircle className="w-4 h-4" /></button>
        </div>
      )}

      {/* Current Plan */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Current Plan</p>
            <h2 className="text-xl font-bold text-white">
              {isPro ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-crystal-400" />
                  Pro — Unlimited
                </span>
              ) : (
                'Free'
              )}
            </h2>
          </div>
          {isPro && (
            <span className="px-3 py-1 rounded-full bg-crystal-600/20 border border-crystal-500/20 text-crystal-300 text-xs font-semibold">
              Active
            </span>
          )}
        </div>

        <ul className="space-y-2 mb-6">
          {isPro ? (
            <>
              <PlanFeature text="Unlimited invoices" active />
              <PlanFeature text="AI invoice generation" active />
              <PlanFeature text="PDF export" active />
              <PlanFeature text="Priority support" active />
            </>
          ) : (
            <>
              <PlanFeature text={`Up to ${FREE_INVOICE_LIMIT} invoices`} active />
              <PlanFeature text="PDF export" active />
              <PlanFeature text="AI invoice generation" />
              <PlanFeature text="Unlimited invoices" />
            </>
          )}
        </ul>

        {isPro ? (
          hasStripeCustomer ? (
            <button
              onClick={handlePortal}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {loading ? 'Opening portal…' : 'Manage Subscription'}
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : null
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">$9</span>
              <span className="text-white/40 text-sm">/month</span>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4" />
              {loading ? 'Redirecting to Stripe…' : 'Upgrade to Pro'}
            </button>
            <p className="text-xs text-white/30 text-center">
              Secure payment via Stripe · Cancel anytime
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function PlanFeature({ text, active = false }: { text: string; active?: boolean }) {
  return (
    <li className={`flex items-center gap-2 text-sm ${active ? 'text-white/70' : 'text-white/20 line-through'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-crystal-400' : 'bg-white/20'}`} />
      {text}
    </li>
  )
}
