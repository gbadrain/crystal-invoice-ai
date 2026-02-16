'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusCircle, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react'
import type { Invoice } from '@/utils/invoice-types' // Assuming Invoice type is defined here

const API_BASE = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL.replace(':3000', ':3001')
  : 'http://localhost:3001'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  async function fetchInvoices() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/api/invoices`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setInvoices(data.invoices) // Assuming API returns { totalInvoices: number, invoices: Invoice[] }
    } catch (err) {
      setError('Failed to fetch invoices.')
      console.error('Error fetching invoices:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`${API_BASE}/api/invoices/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove the deleted invoice from the state
      setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice._id !== id));
    } catch (err) {
      setError('Failed to delete invoice.');
      console.error('Error deleting invoice:', err);
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(10vh-10rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-crystal-400" />
        <p className="ml-3 text-lg text-white/70">Loading invoices...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(10vh-10rem)]">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="ml-3 text-lg text-red-400 mt-3">{error}</p>
        <button onClick={fetchInvoices} className="mt-4 px-4 py-2 rounded-xl bg-crystal-600 text-white hover:bg-crystal-700">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Invoices</h1>
          <p className="text-white/50 text-sm">Manage your client invoices</p>
        </div>
        <Link
          href="/invoices/new"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-crystal-600 text-white text-sm font-medium hover:bg-crystal-700 transition-colors shadow-lg shadow-crystal-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          New Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="glass-panel p-8 text-center text-white/50">
          <p className="text-lg">No invoices found.</p>
          <p className="mt-2">Start by creating a <Link href="/invoices/new" className="text-crystal-400 hover:underline">new invoice</Link>.</p>
        </div>
      ) : (
        <div className="glass-panel">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {invoices.map((invoice) => (
                <tr key={invoice._id?.toString()}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {invoice.metadata?.invoiceNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                    {invoice.client?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                    {invoice.metadata?.issueDate || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                    {invoice.metadata?.dueDate || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {invoice.summary?.total ? `$${invoice.summary.total.toFixed(2)}` : '$0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${invoice.metadata?.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                      ${invoice.metadata?.status === 'sent' ? 'bg-blue-100 text-blue-800' : ''}
                      ${invoice.metadata?.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                      ${invoice.metadata?.status === 'overdue' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {invoice.metadata?.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/invoices/${invoice._id?.toString()}/edit`} className="text-crystal-400 hover:text-crystal-600 mr-4">
                      <Edit className="w-5 h-5 inline-block" />
                    </Link>
                    <button
                      onClick={() => handleDelete(invoice._id?.toString() || '')}
                      disabled={deletingId === invoice._id?.toString()}
                      className="text-red-400 hover:text-red-600"
                    >
                      {deletingId === invoice._id?.toString() ? (
                        <Loader2 className="w-5 h-5 animate-spin inline-block" />
                      ) : (
                        <Trash2 className="w-5 h-5 inline-block" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
