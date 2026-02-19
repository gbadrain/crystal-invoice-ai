import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InvoiceStatus } from '@prisma/client'
import { getAuthUserId } from '../_helpers'
import { FREE_INVOICE_LIMIT } from '@/lib/plans'

// GET /api/invoices/usage — returns current invoice count vs free limit
export async function GET() {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isPro: true } })
  const isPro = user?.isPro ?? false

  const count = await prisma.invoice.count({
    where: { userId, status: { not: InvoiceStatus.trashed } },
  })

  return NextResponse.json({
    count,
    limit: isPro ? null : FREE_INVOICE_LIMIT, // null = unlimited
    isPro,
    isAtLimit: isPro ? false : count >= FREE_INVOICE_LIMIT,
  })
}
