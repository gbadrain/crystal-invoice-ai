import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { Invoice } from '@/utils/invoice-types'
import type { Invoice as PrismaInvoice } from '@prisma/client'

/**
 * Checks session and returns userId. Returns a NextResponse error if unauthorized.
 */
export async function getAuthUserId(): Promise<string | NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return session.user.id
}

/**
 * Maps a Prisma Invoice record to the frontend Invoice type.
 */
export function formatInvoice(inv: PrismaInvoice): Invoice {
  return {
    _id: inv.id,
    client: {
      name: inv.clientName,
      email: inv.clientEmail || '',
      address: inv.clientAddress || '',
      phone: inv.clientPhone || '',
    },
    metadata: {
      invoiceNumber: inv.invoiceNumber,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      status: inv.status.toLowerCase() as Invoice['metadata']['status'],
      originalStatus: inv.originalStatus?.toLowerCase() as Invoice['metadata']['originalStatus'],
    },
    lineItems: inv.lineItems as any,
    summary: {
      subtotal: inv.subtotal,
      taxRate: inv.taxRate,
      taxAmount: inv.taxAmount,
      discountRate: inv.discountRate,
      discountAmount: inv.discountAmount,
      total: inv.total,
    },
    notes: inv.notes || '',
    deletedAt: inv.deletedAt?.toISOString() || null,
  }
}
