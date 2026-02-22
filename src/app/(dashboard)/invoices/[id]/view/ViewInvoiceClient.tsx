'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Loader2,
  FileText,
  User,
  Send,
  Edit,
  Check,
  DollarSign,
} from 'lucide-react'
import type { Invoice } from '@/utils/invoice-types'
import { PDFDownloadButton } from '@/components/invoice/PDFDownloadButton'
import { StatusBadge } from '@/components/StatusBadge'
import { cn } from '@/utils/cn'

export function ViewInvoiceClient({ initialInvoice }: { initialInvoice: Invoice }) {
  const [invoice, setInvoice] = useState(initialInvoice)
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [sendError, setSendError] = useState<string | null>(null)
  const [isPaying, setIsPaying] = useState(false)
  const router = useRouter()

  const { _id: id, client, metadata, lineItems, summary, notes } = invoice

  const handleSendToClient = async () => {
    setSendState('sending')
    setSendError(null)
    try {
      const res = await fetch(`/api/invoices/${id}/send`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setSendError(data.error ?? 'Failed to send email.')
        setSendState('error')
      } else {
        setSendState('sent')
        setInvoice((prev) => ({
          ...prev!,
          metadata: { ...prev!.metadata, status: 'pending' },
        }))
      }
    } catch {
      setSendError('A network error occurred.')
      setSendState('error')
    }
  }

  const handleMarkAsPaid = async () => {
    setIsPaying(true)
    try {
      const response = await fetch(`/api/invoices/${id}/pay`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to mark as paid')
      setInvoice((prev) => ({
        ...prev!,
        metadata: { ...prev!.metadata, status: 'paid' },
      }))
    } catch (err) {
      console.error(err)
      alert('There was an error marking the invoice as paid.')
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="fade-in">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <Link
          href="/invoices"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Invoices</span>
        </Link>
        <div className="mt-4 sm:mt-0 flex items-center gap-3 flex-wrap">
          {sendError && (
            <span className="text-xs text-red-400">{sendError}</span>
          )}
          <button
            onClick={handleSendToClient}
            disabled={sendState === 'sending' || sendState === 'sent'}
            className="inline-flex items-center justify-center rounded-md text-sm font-semibold py-2 px-4 bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Send className="w-4 h-4 mr-2" />
            {sendState === 'sending'
              ? 'Sending…'
              : sendState === 'sent'
              ? 'Sent'
              : 'Send to Client'}
          </button>

          {metadata.status === 'pending' && (
            <button
              onClick={handleMarkAsPaid}
              disabled={isPaying}
              className="inline-flex items-center justify-center rounded-md text-sm font-semibold py-2 px-4 bg-green-600 text-white hover:bg-green-500 disabled:opacity-60 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              {isPaying ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Mark as Paid
            </button>
          )}
          <PDFDownloadButton invoice={invoice} />
          <Link
            href={`/invoices/${id}/edit`}
            className="inline-flex items-center justify-center rounded-lg text-sm font-semibold py-2 px-4 bg-crystal-600 text-white hover:bg-crystal-500 shadow-lg shadow-crystal-600/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      <div className="rounded-xl shadow-lg shadow-slate-950/40 bg-slate-900/70 ring-1 ring-slate-800 p-8 md:p-12 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Invoice {metadata.invoiceNumber}
            </h1>
            <p className="text-slate-400">
              Issued on {metadata.issueDate}
            </p>
          </div>
          <StatusBadge status={metadata.status} size="md" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="rounded-lg bg-slate-800/50 p-6 border border-slate-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <h2 className="text-base font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-crystal-400" /> Billed To
            </h2>
            <p className="font-bold text-white">{client.name}</p>
            <p className="text-slate-300">{client.address}</p>
            <p className="text-slate-300">{client.email}</p>
            <p className="text-slate-300">{client.phone}</p>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-6 border border-slate-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <h2 className="text-base font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-crystal-400" /> Invoice Details
            </h2>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-slate-400">Invoice Number:</span>
                <span className="font-medium text-white">{metadata.invoiceNumber}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400">Issue Date:</span>
                <span className="font-medium text-white">{metadata.issueDate}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400">Due Date:</span>
                <span className="font-medium text-white">{metadata.dueDate}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-10 overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-700">
              <tr>
                <th className="text-left text-sm font-semibold text-slate-400 uppercase py-3 pr-3">Description</th>
                <th className="text-right text-sm font-semibold text-slate-400 uppercase py-3 px-3">Qty</th>
                <th className="text-right text-sm font-semibold text-slate-400 uppercase py-3 px-3">Rate</th>
                <th className="text-right text-sm font-semibold text-slate-400 uppercase py-3 pl-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 pr-3 text-white font-medium">{item.description}</td>
                  <td className="text-right py-4 px-3 text-slate-300">{item.quantity}</td>
                  <td className="text-right py-4 px-3 text-slate-300">${item.rate.toFixed(2)}</td>
                  <td className="text-right py-4 pl-3 font-medium text-white">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-10">
          <div className="w-full md:w-2/5 lg:w-1/3">
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-slate-400">Subtotal:</span>
                <span className="font-medium text-white">${summary.subtotal.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400">Tax ({summary.taxRate}%):</span>
                <span className="font-medium text-white">${summary.taxAmount.toFixed(2)}</span>
              </li>
              {summary.discountAmount > 0 && (
                <li className="flex justify-between">
                  <span className="text-slate-400">Discount ({summary.discountRate}%):</span>
                  <span className="font-medium text-white">-${summary.discountAmount.toFixed(2)}</span>
                </li>
              )}
            </ul>
            <div className="border-t border-slate-700 my-3"></div>
            <div className="flex justify-between">
              <span className="text-lg font-bold text-white">Total:</span>
              <span className="text-lg font-bold text-white">${summary.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {notes && (
          <div>
            <h3 className="text-base font-semibold text-white mb-2">Notes</h3>
            <p className="text-slate-300 rounded-lg bg-slate-800/50 p-4 border border-slate-700 text-sm shadow-md">{notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
