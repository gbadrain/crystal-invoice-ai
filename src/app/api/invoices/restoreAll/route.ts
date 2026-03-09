import { NextResponse } from 'next/server'
import { type InvoiceStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '../_helpers'

// POST /api/invoices/restoreAll — restore all trashed invoices
export async function POST() {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result

  try {
    const trashed = await prisma.invoice.findMany({
      where: { userId, status: 'trashed' },
    })

    if (trashed.length === 0) {
      return NextResponse.json({ success: true, restored: 0 })
    }

    await prisma.$transaction(
      trashed.map((inv: { id: string; originalStatus: InvoiceStatus | null }) =>
        prisma.invoice.update({
          where: { id: inv.id },
          data: {
            status: inv.originalStatus || 'draft',
            originalStatus: null,
            deletedAt: null,
          },
        })
      )
    )

    return NextResponse.json({ success: true, restored: trashed.length })
  } catch (error) {
    console.error('Error restoring all:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
