import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '../../invoices/_helpers'

// GET /api/settings/audit-log — last 20 audit events for current user
export async function GET() {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result

  const logs = await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, action: true, meta: true, createdAt: true },
  })

  return NextResponse.json({ logs })
}
