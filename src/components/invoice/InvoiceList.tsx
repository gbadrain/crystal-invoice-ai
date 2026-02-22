// src/components/invoice/InvoiceList.tsx
'use client'

import { useState, useMemo, useEffect, useTransition } from 'react'
import Link from 'next/link'
import {
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  Search,
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import type { Invoice } from '@/utils/invoice-types'
import { cn } from '@/utils/cn'
import { StatusBadge } from '@/components/StatusBadge'
import { InvoiceListEmptyState } from '@/components/invoice/InvoiceListEmptyState'
import { InvoiceListSkeleton } from '@/components/invoice/InvoiceListSkeleton'

type SortKey = 'metadata.issueDate' | 'summary.total' | 'metadata.status' | 'metadata.invoiceNumber' | 'client.name'
type SortDirection = 'asc' | 'desc'
const PAGE_SIZE = 10

export function InvoiceList({ initialInvoices }: { initialInvoices: Invoice[] }) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('metadata.issueDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setInvoices(initialInvoices)
  }, [initialInvoices])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to move this invoice to trash?')) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      startTransition(() => {
        setInvoices((prevInvoices) =>
          prevInvoices.filter((invoice) => invoice._id !== id)
        )
      })
      window.dispatchEvent(new Event('trash-updated'))
    } catch (err) {
      setError('Failed to delete invoice.')
      console.error('Error deleting invoice:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const filteredAndSortedInvoices = useMemo(() => {
    let result = invoices
      .filter((invoice) => {
        const searchTermLower = searchTerm.toLowerCase()
        const clientName = invoice.client?.name?.toLowerCase() || ''
        const invoiceNumber = invoice.metadata?.invoiceNumber?.toLowerCase() || ''
        return (
          clientName.includes(searchTermLower) ||
          invoiceNumber.includes(searchTermLower)
        )
      })
      .filter((invoice) => {
        return statusFilter === 'all' || invoice.metadata?.status === statusFilter
      })

    result.sort((a, b) => {
      const aValue = getNestedValue(a, sortKey)
      const bValue = getNestedValue(b, sortKey)

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0
    })

    return result
  }, [invoices, searchTerm, statusFilter, sortKey, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedInvoices.length / PAGE_SIZE)
  const paginatedInvoices = filteredAndSortedInvoices.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  function getNestedValue(obj: any, path: string) {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj)
    return value ?? ''
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
    setCurrentPage(1)
  }

  const SortableHeader = ({
    title,
    sortKey: key,
    className,
  }: {
    title: string
    sortKey: SortKey
    className?: string
  }) => (
    <th
      scope="col"
      className={cn(
        'px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white',
        className
      )}
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center">
        {title}
        {sortKey === key && (
          <span className="ml-2">
            {sortDirection === 'desc' ? (
              <ArrowDown className="w-3 h-3" />
            ) : (
              <ArrowUp className="w-3 h-3" />
            )}
          </span>
        )}
      </div>
    </th>
  )

  if (isPending) {
    return <InvoiceListSkeleton />
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Invoices</h1>
          <p className="mt-2 text-sm text-slate-400">
            A list of all the invoices in your account.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-2 rounded-lg bg-crystal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-crystal-600/20 hover:bg-crystal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <PlusCircle className="w-5 h-5" />
            <span>New Invoice</span>
          </Link>
        </div>
      </div>

      <div className="mb-6 p-4 rounded-xl bg-slate-900/70 ring-1 ring-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-grow w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search
                className="h-5 w-5 text-slate-400"
                aria-hidden="true"
              />
            </div>
            <input
              type="text"
              placeholder="Search by client or invoice #"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 bg-slate-800/60 py-2.5 pl-10 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-crystal-500 sm:text-sm sm:leading-6"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full sm:w-48 block rounded-md border-0 bg-slate-800/60 py-2.5 pl-4 pr-10 text-white ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-crystal-500 sm:text-sm sm:leading-6"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl shadow-lg shadow-slate-950/40 ring-1 ring-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900">
              <tr>
                <SortableHeader title="Invoice #" sortKey="metadata.invoiceNumber" />
                <SortableHeader title="Client" sortKey="client.name" />
                <SortableHeader title="Issue Date" sortKey="metadata.issueDate" />
                <SortableHeader title="Total" sortKey="summary.total" />
                <SortableHeader title="Status" sortKey="metadata.status" />
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/70">
              {paginatedInvoices.map((invoice) => (
                <tr key={invoice._id?.toString()} className="hover:bg-slate-800/40 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    <Link href={`/invoices/${invoice._id}/view`} className="hover:text-crystal-400 hover:underline">
                      {invoice.metadata?.invoiceNumber || 'N/A'}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{invoice.client?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{invoice.metadata?.issueDate || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{invoice.summary?.total != null ? `${invoice.summary.total.toFixed(2)}` : '$0.00'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <StatusBadge status={invoice.metadata?.status || 'draft'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-4">
                      <Link href={`/invoices/${invoice._id?.toString()}/edit`} className="text-slate-400 hover:text-crystal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                        <Edit className="w-5 h-5" />
                        <span className="sr-only">Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(invoice._id?.toString() || '')}
                        disabled={deletingId === invoice._id?.toString()}
                        className="text-slate-400 hover:text-red-400 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                      >
                        {deletingId === invoice._id?.toString() ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginatedInvoices.length === 0 && (
          <div className="p-12">
            <InvoiceListEmptyState />
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <nav
          className="flex items-center justify-between border-t border-slate-800 px-4 sm:px-6 py-3"
          aria-label="Pagination"
        >
          <div className="hidden sm:block">
            <p className="text-sm text-slate-400">
              Showing <span className="font-medium text-white">{(currentPage - 1) * PAGE_SIZE + 1}</span> to <span className="font-medium text-white">{Math.min(currentPage * PAGE_SIZE, filteredAndSortedInvoices.length)}</span> of{' '}
              <span className="font-medium text-white">{filteredAndSortedInvoices.length}</span> results
            </p>
          </div>
          <div className="flex flex-1 justify-between sm:justify-end">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-slate-700 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-slate-700 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}
