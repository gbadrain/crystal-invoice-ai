import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InvoiceStatus } from '@prisma/client'
import { getAuthUserId, formatInvoice } from '../../_helpers'

type RouteContext = { params: Promise<{ id: string }> }

// POST /api/invoices/[id]/pay — mark invoice as paid
export async function POST(request: Request, context: RouteContext) {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result
  const { id } = await context.params

  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.paid },
    })

    return NextResponse.json({ success: true, invoice: formatInvoice(updated) })
  } catch (error) {
    console.error('Error marking invoice as paid:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
