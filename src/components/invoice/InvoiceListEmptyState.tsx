'use client'

import Link from 'next/link'
import { FilePlus, Inbox } from 'lucide-react'

export function InvoiceListEmptyState() {
  return (
    <div className="text-center fade-in">
      <Inbox className="mx-auto h-12 w-12 text-slate-400 animate-float" aria-hidden="true" />
      <h3 className="mt-2 text-lg font-semibold text-white">No invoices found</h3>
      <p className="mt-1 text-sm text-slate-400">
        Get started by creating a new invoice.
      </p>
      <div className="mt-6">
        <Link
          href="/invoices/new"
          className="inline-flex items-center rounded-md bg-crystal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-crystal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crystal-600"
        >
          <FilePlus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          New Invoice
        </Link>
      </div>
    </div>
  )
}
