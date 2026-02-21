'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { Zap, CheckCircle, ExternalLink, CreditCard, PartyPopper, XCircle, AlertTriangle } from 'lucide-react'
import { FREE_INVOICE_LIMIT } from '@/lib/plans'

interface Props {
  isPro: boolean
  hasStripeCustomer: boolean
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string | null
}

export function BillingClient({ isPro, hasStripeCustomer, cancelAtPeriodEnd, currentPeriodEnd }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [localCancelAtPeriodEnd, setLocalCancelAtPeriodEnd] = useState(cancelAtPeriodEnd)
  const searchParams = useSearchParams()
  const [banner, setBanner] = useState<'success' | 'canceled' | null>(null)

  useEffect(() => {
    if (searchParams.get('success') === '1') setBanner('success')
    else if (searchParams.get('canceled') === '1') setBanner('canceled')
  }, [searchParams])

  const formattedEndDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

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
    } catch {
      alert('Network error. Please try again.')
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
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelPlan = async () => {
    setLoading(true)
    setShowCancelConfirm(false)
    try {
      const res = await fetch('/api/stripe/cancel', { method: 'POST' })
      const data = await res.json()
      if (data.cancelAtPeriodEnd !== undefined) {
        setLocalCancelAtPeriodEnd(true)
        router.refresh()
      } else {
        alert(data.error || 'Could not cancel subscription. Please try again.')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReactivate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactivate: true }),
      })
      const data = await res.json()
      if (data.cancelAtPeriodEnd !== undefined) {
        setLocalCancelAtPeriodEnd(false)
        router.refresh()
      } else {
        alert(data.error || 'Could not reactivate subscription. Please try again.')
      }
    } catch {
      alert('Network error. Please try again.')
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

      {/* Scheduled cancellation warning */}
      {isPro && localCancelAtPeriodEnd && formattedEndDate && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300">Plan cancellation scheduled</p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              Your Pro access continues until <strong>{formattedEndDate}</strong>. After that your account switches to Free.
            </p>
          </div>
          <button
            onClick={handleReactivate}
            disabled={loading}
            className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
          >
            Keep Pro
          </button>
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
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              localCancelAtPeriodEnd
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                : 'bg-crystal-600/20 border-crystal-500/20 text-crystal-300'
            }`}>
              {localCancelAtPeriodEnd ? 'Cancels ' + formattedEndDate : 'Active'}
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
          hasStripeCustomer && (
            <div className="flex flex-wrap gap-3">
              {/* Manage card / invoices */}
              <button
                onClick={handlePortal}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                {loading ? 'Opening…' : 'Manage Subscription'}
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              {/* Cancel or reactivate */}
              {!localCancelAtPeriodEnd ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-400/70 text-sm hover:bg-red-500/10 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  Cancel Plan
                </button>
              ) : (
                <button
                  onClick={handleReactivate}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-crystal-500/20 text-crystal-300 text-sm hover:bg-crystal-500/10 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Reactivating…' : 'Keep Pro'}
                </button>
              )}
            </div>
          )
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

      {/* Cancel confirmation dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-panel rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Cancel Pro plan?</h3>
                <p className="text-sm text-white/50">
                  You'll keep Pro access until{' '}
                  <strong className="text-white/70">{formattedEndDate ?? 'end of billing period'}</strong>.
                  After that your account switches to Free and you'll be limited to {FREE_INVOICE_LIMIT} invoices.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                Keep Pro
              </button>
              <button
                onClick={handleCancelPlan}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                {loading ? 'Cancelling…' : 'Yes, cancel plan'}
              </button>
            </div>
          </div>
        </div>
      )}
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
