'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertCircle, Trash2, RotateCw, ShieldAlert } from 'lucide-react'
import type { Invoice } from '@/utils/invoice-types'
import { cn } from '@/utils/cn'
import { StatusBadge } from '@/components/StatusBadge'

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  isDestructive,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText: string
  isDestructive: boolean
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel p-8 rounded-2xl max-w-md w-full border border-white/20">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
            <ShieldAlert className={`w-6 h-6 ${isDestructive ? 'text-red-400' : 'text-blue-400'}`} />
          </div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <p className="text-white/70 mb-8">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'px-6 py-2 rounded-xl text-white font-semibold transition-colors',
              isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}


export default function TrashPage() {
  const router = useRouter()
  const [trashedInvoices, setTrashedInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [bulkActioning, setBulkActioning] = useState(false)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalConfig, setModalConfig] = useState<{
    onConfirm: () => void,
    title: string,
    message: string,
    confirmText: string,
    isDestructive: boolean
  } | null>(null)

  const fetchTrashedInvoices = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/invoices?status=trashed`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setTrashedInvoices(data.invoices || [])
    } catch (err) {
      setError('Failed to fetch trashed invoices.')
      console.error('Error fetching invoices:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTrashedInvoices()
  }, [fetchTrashedInvoices])

  const notifyTrashUpdated = () => window.dispatchEvent(new Event('trash-updated'))

  const handleRestore = async (id: string) => {
    setActioningId(id)
    try {
      await fetch(`/api/invoices/${id}/restore`, { method: 'POST' })
      setTrashedInvoices(prev => prev.filter(inv => inv._id !== id))
      router.refresh()
      notifyTrashUpdated()
    } catch (err) {
      alert('Failed to restore invoice.')
    } finally {
      setActioningId(null)
    }
  }

  const handlePermanentDelete = async (id: string) => {
    setActioningId(id)
    try {
      await fetch(`/api/invoices/${id}?force=true`, { method: 'DELETE' })
      setTrashedInvoices(prev => prev.filter(inv => inv._id !== id))
      setIsModalOpen(false)
      router.refresh()
      notifyTrashUpdated()
    } catch (err) {
      alert('Failed to permanently delete invoice.')
    } finally {
      setActioningId(null)
    }
  }

  const handleEmptyTrash = async () => {
    setBulkActioning(true)
    try {
      await fetch(`/api/invoices?forceAll=true`, { method: 'DELETE' })
      setTrashedInvoices([])
      setIsModalOpen(false)
      router.refresh()
      notifyTrashUpdated()
    } catch (err) {
      alert('Failed to empty trash.')
    } finally {
      setBulkActioning(false)
    }
  }

  const handleRestoreAll = async () => {
    setBulkActioning(true)
    try {
      await fetch(`/api/invoices/restoreAll`, { method: 'POST' })
      setTrashedInvoices([])
      router.refresh()
      notifyTrashUpdated()
    } catch (err) {
      alert('Failed to restore all.')
    } finally {
      setBulkActioning(false)
    }
  }

  const openConfirmationModal = (id: string) => {
    setModalConfig({
      onConfirm: () => handlePermanentDelete(id),
      title: 'Permanent Delete',
      message: 'Are you sure you want to permanently delete this invoice? This action cannot be undone.',
      confirmText: 'Yes, Delete',
      isDestructive: true,
    })
    setIsModalOpen(true)
  }

  const openEmptyTrashModal = () => {
    setModalConfig({
      onConfirm: handleEmptyTrash,
      title: 'Empty Trash',
      message: `Are you sure you want to permanently delete all ${trashedInvoices.length} trashed invoice(s)? This action cannot be undone.`,
      confirmText: 'Yes, Empty Trash',
      isDestructive: true,
    })
    setIsModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(10vh-10rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-crystal-400" />
        <p className="ml-3 text-lg text-white/70">Loading Trash...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(10vh-10rem)]">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="ml-3 text-lg text-red-400 mt-3">{error}</p>
        <button onClick={fetchTrashedInvoices} className="mt-4 px-4 py-2 rounded-xl bg-crystal-600 text-white hover:bg-crystal-700">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      {modalConfig && (
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          {...modalConfig}
        />
      )}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Trash Bin</h1>
          <p className="text-white/50 text-sm">Invoices here will be permanently deleted after 30 days.</p>
        </div>
        {trashedInvoices.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={handleRestoreAll}
              disabled={bulkActioning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {bulkActioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
              Restore All
            </button>
            <button
              onClick={openEmptyTrashModal}
              disabled={bulkActioning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {bulkActioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Empty Trash
            </button>
          </div>
        )}
      </div>

      {trashedInvoices.length === 0 ? (
        <div className="glass-panel p-8 text-center text-white/50">
          <p className="text-lg">The trash bin is empty.</p>
        </div>
      ) : (
        <div className="glass-panel">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Original Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Date Trashed</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {trashedInvoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white/70">{invoice.metadata?.invoiceNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">{invoice.client?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">${invoice.summary?.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                    {invoice.metadata.originalStatus && <StatusBadge status={invoice.metadata.originalStatus} size="sm" />}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                    {invoice.deletedAt ? new Date(invoice.deletedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRestore(invoice._id!)}
                      disabled={actioningId === invoice._id}
                      className="text-green-400 hover:text-green-300 mr-4 disabled:opacity-50"
                      title="Restore"
                    >
                      {actioningId === invoice._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCw className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => openConfirmationModal(invoice._id!)}
                      disabled={actioningId === invoice._id}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50"
                      title="Delete Permanently"
                    >
                      {actioningId === invoice._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
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
