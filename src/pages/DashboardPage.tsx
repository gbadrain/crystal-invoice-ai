'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, PlusCircle, DollarSign, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import type { Invoice } from '@/utils/invoice-types'

export function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const response = await fetch(`/api/invoices`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setInvoices(data.invoices || [])
      } catch (err) {
        setError('Failed to fetch invoices.')
        console.error('Error fetching invoices:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvoices()
  }, [])

  const totalInvoices = invoices.length
  const paidCount = invoices.filter(inv => inv.metadata?.status === 'paid').length
  const pendingCount = invoices.filter(inv => inv.metadata?.status === 'pending').length
  const overdueCount = invoices.filter(inv => inv.metadata?.status === 'overdue').length
  const totalRevenue = invoices
    .filter(inv => inv.metadata?.status === 'paid')
    .reduce((sum, inv) => sum + (inv.summary?.total || 0), 0)

  const StatCard = ({ icon, title, value, isLoading, error }: { icon: React.ReactNode, title: string, value: string | number, isLoading: boolean, error?: string | null }) => (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <p className="text-sm text-white/50 uppercase tracking-wider">
          {title}
        </p>
      </div>
      {isLoading ? (
        <p className="text-3xl font-bold">...</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : (
        <p className="text-3xl font-bold">{value}</p>
      )}
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-white/60">An overview of your invoice activity.</p>
        </div>
        <Link
          href="/invoices/new"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-crystal-600 text-white text-sm font-medium hover:bg-crystal-700 transition-colors shadow-lg shadow-crystal-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          New Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          icon={<FileText className="w-5 h-5 text-crystal-400" />}
          title="Total Invoices"
          value={totalInvoices}
          isLoading={isLoading}
          error={error}
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-green-400" />}
          title="Paid Invoices"
          value={paidCount}
          isLoading={isLoading}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-yellow-400" />}
          title="Pending Invoices"
          value={pendingCount}
          isLoading={isLoading}
        />
        <StatCard
          icon={<XCircle className="w-5 h-5 text-red-400" />}
          title="Overdue Invoices"
          value={overdueCount}
          isLoading={isLoading}
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-green-400" />}
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          isLoading={isLoading}
        />
      </div>

      {!isLoading && invoices.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white/90">Recent Invoices</h2>
            <Link href="/invoices" className="text-sm text-crystal-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="glass-panel divide-y divide-white/10">
            {invoices.slice(0, 5).map((inv) => (
              <div key={inv._id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    {inv.metadata?.invoiceNumber || 'Draft'}
                  </p>
                  <p className="text-xs text-white/50">{inv.client?.name || 'No client'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    ${(inv.summary?.total || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-white/50 capitalize">{inv.metadata?.status || 'draft'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}