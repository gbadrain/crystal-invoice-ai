
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { PlusCircle, Edit, Trash2, Loader2, AlertCircle, Search, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react'
import type { Invoice } from '@/utils/invoice-types'

const API_BASE = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL.replace(':3000', ':3001')
  : 'http://localhost:3001'

type SortKey = 'metadata.issueDate' | 'summary.total' | 'metadata.status';
type SortDirection = 'asc' | 'desc';
const PAGE_SIZE = 10;

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // State for filtering, searching, and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('metadata.issueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

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
      setInvoices(data.invoices || [])
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
      setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice._id !== id));
    } catch (err) {
      setError('Failed to delete invoice.');
      console.error('Error deleting invoice:', err);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredAndSortedInvoices = useMemo(() => {
    let result = invoices
      .filter(invoice => {
        const searchTermLower = searchTerm.toLowerCase();
        const clientName = invoice.client?.name?.toLowerCase() || '';
        const invoiceNumber = invoice.metadata?.invoiceNumber?.toLowerCase() || '';
        return clientName.includes(searchTermLower) || invoiceNumber.includes(searchTermLower);
      })
      .filter(invoice => {
        return statusFilter === 'all' || invoice.metadata?.status === statusFilter;
      });

    result.sort((a, b) => {
      const aValue = getNestedValue(a, sortKey);
      const bValue = getNestedValue(b, sortKey);

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [invoices, searchTerm, statusFilter, sortKey, sortDirection]);
  
  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedInvoices.length / PAGE_SIZE);
  const paginatedInvoices = filteredAndSortedInvoices.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const SortableHeader = ({ title, sortKey: key }: { title: string, sortKey: SortKey }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider cursor-pointer hover:text-white"
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center">
        {title}
        {sortKey === key && (
          <span className="ml-2">
            {sortDirection === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
          </span>
        )}
      </div>
    </th>
  );

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

      {/* Filter and Search Controls */}
      <div className="flex items-center justify-between mb-6 gap-4 glass-panel p-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            placeholder="Search by client or invoice #"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-crystal-500"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-crystal-500"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        </div>
      </div>

      {paginatedInvoices.length === 0 ? (
        <div className="glass-panel p-8 text-center text-white/50">
          <p className="text-lg">No invoices match your criteria.</p>
          <p className="mt-2">Try adjusting your search or filters.</p>
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
                <SortableHeader title="Issue Date" sortKey="metadata.issueDate" />
                <SortableHeader title="Total" sortKey="summary.total" />
                <SortableHeader title="Status" sortKey="metadata.status" />
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {paginatedInvoices.map((invoice) => (
                <tr key={invoice._id?.toString()}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                     <Link href={`/invoices/${invoice._id}/view`} className="hover:underline">
                        {invoice.metadata?.invoiceNumber || 'N/A'}
                     </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                    {invoice.client?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                    {invoice.metadata?.issueDate || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {invoice.summary?.total != null ? `$${invoice.summary.total.toFixed(2)}` : '$0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                      ${invoice.metadata?.status === 'paid' ? 'bg-green-200 text-green-900' : ''}
                      ${invoice.metadata?.status === 'pending' ? 'bg-yellow-200 text-yellow-900' : ''}
                      ${invoice.metadata?.status === 'draft' ? 'bg-gray-300 text-gray-900' : ''}
                      ${invoice.metadata?.status === 'overdue' ? 'bg-red-200 text-red-900' : ''}
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
                      className="text-red-400 hover:text-red-600 disabled:opacity-50"
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
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm rounded-md bg-white/10 text-white disabled:opacity-50 hover:bg-white/20"
          >
            Previous
          </button>
          <span className="text-sm text-white/50">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm rounded-md bg-white/10 text-white disabled:opacity-50 hover:bg-white/20"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
