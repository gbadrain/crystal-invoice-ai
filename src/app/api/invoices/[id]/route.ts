import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InvoiceStatus } from '@prisma/client'
import { getAuthUserId, formatInvoice } from '../_helpers'

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/invoices/[id] — single invoice
export async function GET(request: Request, context: RouteContext) {
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

    return NextResponse.json(formatInvoice(invoice))
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// PUT /api/invoices/[id] — update invoice
export async function PUT(request: Request, context: RouteContext) {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result
  const { id } = await context.params

  try {
    const existing = await prisma.invoice.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const body = await request.json()
    const { client, metadata, lineItems, summary, notes } = body

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        clientName: client.name,
        clientEmail: client.email || null,
        clientAddress: client.address || null,
        clientPhone: client.phone || null,
        invoiceNumber: metadata.invoiceNumber,
        issueDate: metadata.issueDate,
        dueDate: metadata.dueDate,
        status: (metadata.status || existing.status) as InvoiceStatus,
        lineItems: lineItems,
        subtotal: summary.subtotal,
        taxRate: summary.taxRate,
        taxAmount: summary.taxAmount,
        discountRate: summary.discountRate,
        discountAmount: summary.discountAmount,
        total: summary.total,
        notes: notes || null,
      },
    })

    return NextResponse.json({ success: true, invoice: formatInvoice(updated) })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE /api/invoices/[id] — soft delete (move to trash)
export async function DELETE(request: Request, context: RouteContext) {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result
  const { id } = await context.params

  // Check for ?force=true (permanent delete of a single invoice)
  const { searchParams } = new URL(request.url)
  const force = searchParams.get('force') === 'true'

  try {
    if (force) {
      // Permanent delete
      const deleted = await prisma.invoice.deleteMany({
        where: { id, userId },
      })
      if (deleted.count === 0) {
        return NextResponse.json({ error: 'Invoice not found for permanent deletion.' }, { status: 404 })
      }
      return new NextResponse(null, { status: 204 })
    }

    // Soft delete
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId, status: { not: InvoiceStatus.trashed } },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found to move to trash.' }, { status: 404 })
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        originalStatus: invoice.status,
        status: InvoiceStatus.trashed,
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, invoice: formatInvoice(updated) })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
