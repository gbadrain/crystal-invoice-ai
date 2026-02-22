'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Zap,
  CheckCircle,
  ExternalLink,
  CreditCard,
  PartyPopper,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { FREE_INVOICE_LIMIT } from '@/lib/plans'
import { cn } from '@/utils/cn'

interface Props {
  isPro: boolean
  hasStripeCustomer: boolean
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string | null
}

function Card({
  title,
  description,
  footer,
  children,
  className,
}: {
  title: string
  description: string
  footer?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl shadow-lg shadow-slate-950/40 bg-slate-900/70 ring-1 ring-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300',
        className
      )}
    >
      <div className="p-6 sm:p-8">
        <h3 className="text-lg font-semibold leading-6 text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800">
          {footer}
        </div>
      )}
    </div>
  )
}

export function BillingClient({
  isPro,
  hasStripeCustomer,
  cancelAtPeriodEnd,
  currentPeriodEnd,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<
    'checkout' | 'portal' | 'cancel' | 'reactivate' | null
  >(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const searchParams = useSearchParams()
  const [banner, setBanner] = useState<'success' | 'canceled' | null>(null)

  useEffect(() => {
    if (searchParams?.get('success') === '1') setBanner('success')
    else if (searchParams?.get('canceled') === '1') setBanner('canceled')
  }, [searchParams])

  const handleAction = async (
    type: 'checkout' | 'portal' | 'cancel' | 'reactivate'
  ) => {
    setLoading(true)
    setAction(type)
    let url = ''
    let options: RequestInit = { method: 'POST' }

    try {
      switch (type) {
        case 'checkout':
          url = '/api/stripe/checkout'
          break
        case 'portal':
          url = '/api/stripe/portal'
          break
        case 'cancel':
          url = '/api/stripe/cancel'
          setShowCancelConfirm(false)
          break
        case 'reactivate':
          url = '/api/stripe/cancel'
          options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reactivate: true }),
          }
          break
      }

      const res = await fetch(url, options)
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else if (type === 'cancel' || type === 'reactivate') {
        router.refresh()
      } else {
        alert(data.error || 'An error occurred. Please try again.')
      }
    } catch {
      alert('A network error occurred. Please try again.')
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  return (
    <div className="space-y-8 fade-in scale-in">
      {/* Banners */}
      {banner === 'success' && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 shadow-md">
          <PartyPopper className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-green-300">
              Welcome to Pro!
            </h4>
            <p className="text-xs text-green-400/70 mt-0.5">
              Your account is upgraded. Enjoy unlimited invoices and AI features.
            </p>
          </div>
          <button
            onClick={() => setBanner(null)}
            className="ml-auto text-green-400/50 hover:text-green-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
      {banner === 'canceled' && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800 border border-slate-700 shadow-md">
          <XCircle className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-sm text-slate-300">
            Payment was canceled. No charge was made.
          </p>
          <button
            onClick={() => setBanner(null)}
            className="ml-auto text-slate-400/50 hover:text-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Plan Card */}
      <Card
        title="Your Plan"
        description={
          isPro
            ? 'You have access to all Pro features.'
            : `You are on the Free plan. You can create up to ${FREE_INVOICE_LIMIT} invoices.`
        }
      >
        <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="font-semibold text-white flex items-center gap-3">
              <span>{isPro ? 'Pro' : 'Free'} Plan</span>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  isPro
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-slate-400/10 text-slate-300'
                )}
              >
                Current
              </span>
            </h4>
            <p className="text-slate-300 mt-1">
              {isPro ? '$9 / month' : '$0 / month'}
            </p>
          </div>
          {!isPro && (
            <button
              onClick={() => handleAction('checkout')}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg text-sm font-semibold py-2.5 px-5 bg-crystal-600 text-white hover:bg-crystal-500 disabled:opacity-50 shadow-lg shadow-crystal-600/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              {loading && action === 'checkout' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Upgrade to Pro
            </button>
          )}
        </div>
      </Card>

      {/* Subscription Management */}
      {isPro && hasStripeCustomer && (
        <Card
          title="Subscription Management"
          description={
            cancelAtPeriodEnd
              ? `Your plan is scheduled to be canceled on ${currentPeriodEnd}. You can reactivate it below.`
              : 'Manage your billing details, view payment history, or cancel your Pro plan.'
          }
        >
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleAction('portal')}
              disabled={loading}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-md text-sm font-semibold py-2 px-4 bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              {loading && action === 'portal' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              <span>Billing Portal</span>
              <ExternalLink className="ml-2 h-4 w-4" />
            </button>
            {cancelAtPeriodEnd ? (
              <button
                onClick={() => handleAction('reactivate')}
                disabled={loading}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-md text-sm font-semibold py-2 px-4 bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                {loading && action === 'reactivate' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Reactivate Plan
              </button>
            ) : (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={loading}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-md text-sm font-semibold py-2 px-4 bg-red-900/50 text-red-300 hover:bg-red-900/80 disabled:opacity-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                {loading && action === 'cancel' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Cancel Plan
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Cancel confirmation dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="rounded-xl shadow-lg bg-slate-900 ring-1 ring-slate-800 max-w-sm w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-white mb-1">
                  Cancel Pro Plan
                </h3>
                <p className="text-sm text-slate-400">
                  You'll keep Pro access until{' '}
                  <strong className="text-slate-200">
                    {currentPeriodEnd ?? 'the end of your billing period'}
                  </strong>
                  .
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Keep Plan
              </button>
              <button
                onClick={() => handleAction('cancel')}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                {loading && action === 'cancel' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
