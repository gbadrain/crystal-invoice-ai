import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InvoiceStatus } from '@prisma/client'
import { getAuthUserId, formatInvoice } from './_helpers'

// GET /api/invoices — list invoices (excludes trashed unless ?status=trashed)
export async function GET(request: Request) {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result

  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get('status')

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: statusFilter === 'trashed'
          ? InvoiceStatus.trashed
          : { not: InvoiceStatus.trashed },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = invoices.map(formatInvoice)
    return NextResponse.json({ total: formatted.length, invoices: formatted })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// POST /api/invoices — create new invoice
export async function POST(request: Request) {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result

  try {
    const body = await request.json()
    const { client, metadata, lineItems, summary, notes } = body

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        clientName: client.name,
        clientEmail: client.email || null,
        clientAddress: client.address || null,
        clientPhone: client.phone || null,
        invoiceNumber: metadata.invoiceNumber,
        issueDate: metadata.issueDate,
        dueDate: metadata.dueDate,
        status: (metadata.status || 'draft') as InvoiceStatus,
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

    return NextResponse.json({ success: true, invoice: formatInvoice(invoice) }, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE /api/invoices?forceAll=true — permanently delete all trashed invoices
export async function DELETE(request: Request) {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result

  const { searchParams } = new URL(request.url)
  if (searchParams.get('forceAll') !== 'true') {
    return NextResponse.json({ error: 'Missing ?forceAll=true query parameter.' }, { status: 400 })
  }

  try {
    const { count } = await prisma.invoice.deleteMany({
      where: { userId, status: InvoiceStatus.trashed },
    })

    return NextResponse.json({ success: true, deleted: count })
  } catch (error) {
    console.error('Error emptying trash:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
