'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, PlusCircle, DollarSign, Clock, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'
import type { Invoice } from '@/utils/invoice-types'
import { DashboardPageSkeleton } from '@/components/DashboardPageSkeleton'

function StatCard({
  icon,
  title,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode
  title: string
  value: string | number
  sub?: string
  accent?: 'green' | 'yellow' | 'red' | 'crystal'
}) {
  const accentBorder = {
    green: 'border-green-500/20',
    yellow: 'border-yellow-500/20',
    red: 'border-red-500/20',
    crystal: 'border-crystal-500/20',
  }[accent ?? 'crystal']

  return (
    <div className={`glass-card p-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ${accentBorder}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <p className="text-xs text-white/40 uppercase tracking-wider font-medium">{title}</p>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  )
}

const STATUS_DOT: Record<string, string> = {
  paid: 'bg-green-400',
  pending: 'bg-yellow-400',
  overdue: 'bg-red-400',
  draft: 'bg-white/30',
}

export function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/invoices')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => setInvoices(data.invoices ?? []))
      .catch(() => setError('Failed to load invoices.'))
      .finally(() => setIsLoading(false))
  }, [])

  const paidInvoices = invoices.filter((i) => i.metadata?.status === 'paid')
  const pendingInvoices = invoices.filter((i) => i.metadata?.status === 'pending')
  const overdueInvoices = invoices.filter((i) => i.metadata?.status === 'overdue')

  const totalRevenue = paidInvoices.reduce((s, i) => s + (i.summary?.total ?? 0), 0)
  const unpaidAmount = [...pendingInvoices, ...overdueInvoices].reduce(
    (s, i) => s + (i.summary?.total ?? 0),
    0
  )

  if (isLoading) {
    return <DashboardPageSkeleton />
  }

  return (
    <div className="fade-in slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-white/40 text-sm">Your invoicing activity at a glance.</p>
        </div>
        <Link
          href="/invoices/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-crystal-600 text-white text-sm font-medium hover:bg-crystal-700 transition-colors shadow-lg shadow-crystal-600/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          New Invoice
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          icon={<FileText className="w-4 h-4 text-crystal-400" />}
          title="Total"
          value={isLoading ? '—' : invoices.length}
          sub="invoices"
          accent="crystal"
        />
        <StatCard
          icon={<CheckCircle className="w-4 h-4 text-green-400" />}
          title="Paid"
          value={isLoading ? '—' : paidInvoices.length}
          sub="invoices"
          accent="green"
        />
        <StatCard
          icon={<Clock className="w-4 h-4 text-yellow-400" />}
          title="Pending"
          value={isLoading ? '—' : pendingInvoices.length}
          sub="invoices"
          accent="yellow"
        />
        <StatCard
          icon={<AlertCircle className="w-4 h-4 text-red-400" />}
          title="Overdue"
          value={isLoading ? '—' : overdueInvoices.length}
          sub="invoices"
          accent="red"
        />
        <StatCard
          icon={<DollarSign className="w-4 h-4 text-green-400" />}
          title="Revenue"
          value={isLoading ? '—' : `${totalRevenue.toFixed(2)}`}
          sub="collected"
          accent="green"
        />
      </div>

      {/* Unpaid outstanding banner (only if > 0) */}
      {!isLoading && unpaidAmount > 0 && (
        <div className="mb-6 flex items-center gap-3 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-md">
          <TrendingUp className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">
            <span className="font-bold">${unpaidAmount.toFixed(2)}</span> outstanding across{' '}
            {pendingInvoices.length + overdueInvoices.length} unpaid invoice
            {pendingInvoices.length + overdueInvoices.length !== 1 ? 's' : ''}.
          </span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && invoices.length === 0 && (
        <div className="glass-panel p-16 flex flex-col items-center justify-center text-center gap-4 rounded-xl shadow-lg">
          <FileText className="w-12 h-12 text-white/15" />
          <div>
            <p className="text-white/60 font-medium">No invoices yet</p>
            <p className="text-white/30 text-sm mt-1">Create your first invoice to get started.</p>
          </div>
          <Link
            href="/invoices/new"
            className="mt-2 flex items-center gap-2 px-5 py-2 rounded-lg bg-crystal-600 text-white text-sm font-medium hover:bg-crystal-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            New Invoice
          </Link>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="glass-panel p-8 text-center text-red-400 text-sm rounded-xl shadow-lg"></div>
      )}

      {/* Recent invoices */}
      {!isLoading && invoices.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Recent Invoices</h2>
            <Link href="/invoices" className="text-xs text-crystal-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="glass-panel divide-y divide-white/[0.06] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            {invoices.slice(0, 6).map((inv) => (
              <Link
                key={inv._id}
                href={`/invoices/${inv._id}/view`}
                className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[inv.metadata?.status ?? 'draft'] ?? 'bg-white/20'}`}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {inv.metadata?.invoiceNumber || 'Draft'}
                    </p>
                    <p className="text-xs text-white/40">{inv.client?.name || 'No client'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    ${(inv.summary?.total ?? 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-white/40 capitalize">{inv.metadata?.status ?? 'draft'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
