'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle, FileText, Calendar, Hash, User, Mail, Phone, MapPin, DollarSign, Send } from 'lucide-react'
import type { Invoice } from '@/utils/invoice-types'
import { PDFDownloadButton } from '@/components/invoice/PDFDownloadButton'
import { StatusBadge } from '@/components/StatusBadge'

export default function ViewInvoicePage() {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [sendError, setSendError] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    if (id) {
      fetchInvoice()
    }
  }, [id])

  async function fetchInvoice() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/invoices/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Invoice not found.')
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } else {
        const data = await response.json()
        setInvoice(data)
      }
    } catch (err) {
      setError('Failed to fetch invoice details.')
      console.error('Error fetching invoice:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
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
        fetchInvoice() // refresh status if draft → pending
      }
    } catch {
      setSendError('Network error. Please try again.')
      setSendState('error')
    }
  }

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    try {
      const response = await fetch(`/api/invoices/${id}/pay`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to mark as paid');
      }
      router.refresh()
      fetchInvoice(); // Refetch to show updated status
    } catch (err) {
      console.error(err);
      alert('There was an error marking the invoice as paid.');
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(10vh-10rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-crystal-400" />
        <p className="ml-3 text-lg text-white/70">Loading invoice details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(10vh-10rem)]">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="ml-3 text-lg text-red-400 mt-3">{error}</p>
        <Link href="/invoices" className="mt-4 px-4 py-2 rounded-xl bg-crystal-600 text-white hover:bg-crystal-700">
          Back to Invoices
        </Link>
      </div>
    )
  }

  if (!invoice) {
    return null; // Or some other placeholder
  }

  const { client, metadata, lineItems, summary, notes } = invoice;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Link href="/invoices" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Invoices
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          {sendError && (
            <span className="text-xs text-red-400">{sendError}</span>
          )}
          {/* Send to client */}
          <button
            onClick={handleSendToClient}
            disabled={sendState === 'sending' || sendState === 'sent'}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {sendState === 'sending' ? 'Sending…' : sendState === 'sent' ? 'Sent ✓' : 'Send to Client'}
          </button>

          {metadata.status === 'pending' && (
            <button onClick={handleMarkAsPaid} className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
              Mark as Paid
            </button>
          )}
          <PDFDownloadButton invoice={invoice} />
          <Link href={`/invoices/${id}/edit`} className="px-4 py-2 rounded-xl bg-crystal-600 text-white text-sm font-medium hover:bg-crystal-700 transition-colors">
            Edit Invoice
          </Link>
        </div>
      </div>

      <div className="glass-panel p-8 md:p-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Invoice {metadata.invoiceNumber}</h1>
            <p className="text-white/50">Issued on {metadata.issueDate}</p>
          </div>
          <StatusBadge status={metadata.status} />
        </div>

        {/* Client and Invoice Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="glass-panel-inner p-6">
            <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-crystal-400" /> Billed To</h2>
            <p className="font-bold text-white">{client.name}</p>
            <p className="text-white/70">{client.address}</p>
            <p className="text-white/70">{client.email}</p>
            <p className="text-white/70">{client.phone}</p>
          </div>
          <div className="glass-panel-inner p-6">
             <h2 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-crystal-400" /> Invoice Details</h2>
            <div className="flex justify-between py-1">
              <span className="text-white/70">Invoice Number:</span>
              <span className="font-medium text-white">{metadata.invoiceNumber}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-white/70">Issue Date:</span>
              <span className="font-medium text-white">{metadata.issueDate}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-white/70">Due Date:</span>
              <span className="font-medium text-white">{metadata.dueDate}</span>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-10">
          <table className="min-w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left text-sm font-semibold text-white/50 uppercase py-3">Description</th>
                <th className="text-right text-sm font-semibold text-white/50 uppercase py-3">Quantity</th>
                <th className="text-right text-sm font-semibold text-white/50 uppercase py-3">Rate</th>
                <th className="text-right text-sm font-semibold text-white/50 uppercase py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map(item => (
                <tr key={item.id} className="border-b border-white/5">
                  <td className="py-4 text-white">{item.description}</td>
                  <td className="text-right py-4 text-white/70">{item.quantity}</td>
                  <td className="text-right py-4 text-white/70">${item.rate.toFixed(2)}</td>
                  <td className="text-right py-4 font-medium text-white">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-10">
          <div className="w-full md:w-1/3">
            <div className="flex justify-between py-2">
              <span className="text-white/70">Subtotal:</span>
              <span className="font-medium text-white">${summary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-white/70">Tax ({summary.taxRate}%):</span>
              <span className="font-medium text-white">${summary.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-white/70">Discount ({summary.discountRate}%):</span>
              <span className="font-medium text-white">-${summary.discountAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/10 my-2"></div>
            <div className="flex justify-between py-2">
              <span className="text-lg font-bold text-white">Total:</span>
              <span className="text-lg font-bold text-white">${summary.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div>
            <h3 className="text-md font-semibold text-white/90 mb-2">Notes</h3>
            <p className="text-white/70 glass-panel-inner p-4">{notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
