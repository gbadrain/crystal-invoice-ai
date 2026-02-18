import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InvoiceStatus } from '@prisma/client'
import { getAuthUserId } from '../_helpers'

// POST /api/invoices/restoreAll — restore all trashed invoices
export async function POST() {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result

  try {
    const trashed = await prisma.invoice.findMany({
      where: { userId, status: InvoiceStatus.trashed },
    })

    if (trashed.length === 0) {
      return NextResponse.json({ success: true, restored: 0 })
    }

    await prisma.$transaction(
      trashed.map((inv) =>
        prisma.invoice.update({
          where: { id: inv.id },
          data: {
            status: inv.originalStatus || InvoiceStatus.draft,
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
