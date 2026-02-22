import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '../../invoices/_helpers'

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'INR']

// GET /api/settings/invoice-defaults
export async function GET() {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { invoiceCurrency: true, invoiceDueDays: true, invoiceFooter: true },
  })

  return NextResponse.json(
    user ?? { invoiceCurrency: 'USD', invoiceDueDays: 30, invoiceFooter: null }
  )
}

// PATCH /api/settings/invoice-defaults
export async function PATCH(req: NextRequest) {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result

  const body = await req.json()
  const { invoiceCurrency, invoiceDueDays, invoiceFooter } = body as {
    invoiceCurrency?: unknown
    invoiceDueDays?: unknown
    invoiceFooter?: unknown
  }

  const data: Record<string, unknown> = {}

  if (invoiceCurrency !== undefined) {
    if (typeof invoiceCurrency !== 'string' || !SUPPORTED_CURRENCIES.includes(invoiceCurrency))
      return NextResponse.json({ error: 'Invalid currency.' }, { status: 400 })
    data.invoiceCurrency = invoiceCurrency
  }

  if (invoiceDueDays !== undefined) {
    const days = Number(invoiceDueDays)
    if (!Number.isInteger(days) || days < 1 || days > 365)
      return NextResponse.json({ error: 'Due days must be between 1 and 365.' }, { status: 400 })
    data.invoiceDueDays = days
  }

  if (invoiceFooter !== undefined) {
    if (invoiceFooter !== null && typeof invoiceFooter !== 'string')
      return NextResponse.json({ error: 'Invalid footer.' }, { status: 400 })
    const trimmed = typeof invoiceFooter === 'string' ? invoiceFooter.trim().slice(0, 500) : null
    data.invoiceFooter = trimmed || null
  }

  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })

  await prisma.user.update({ where: { id: userId }, data })

  await prisma.auditLog.create({
    data: { userId, action: 'invoice_defaults.update' },
  })

  return NextResponse.json({ ok: true })
}
