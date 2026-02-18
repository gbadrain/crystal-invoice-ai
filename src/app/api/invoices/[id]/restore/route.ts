import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InvoiceStatus } from '@prisma/client'
import { getAuthUserId, formatInvoice } from '../../_helpers'

type RouteContext = { params: Promise<{ id: string }> }

// POST /api/invoices/[id]/restore — restore a soft-deleted invoice
export async function POST(request: Request, context: RouteContext) {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result
  const { id } = await context.params

  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId, status: InvoiceStatus.trashed },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found in trash or cannot be restored.' }, { status: 404 })
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status: invoice.originalStatus || InvoiceStatus.draft,
        originalStatus: null,
        deletedAt: null,
      },
    })

    return NextResponse.json({ success: true, invoice: formatInvoice(updated) })
  } catch (error) {
    console.error('Error restoring invoice:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
