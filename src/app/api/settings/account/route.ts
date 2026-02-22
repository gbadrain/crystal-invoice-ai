import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '../../invoices/_helpers'

// DELETE /api/settings/account — permanently delete user and all data
export async function DELETE(req: NextRequest) {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result

  const body = await req.json().catch(() => ({})) as {
    password?: unknown
    confirmation?: unknown
  }

  if (body.confirmation !== 'DELETE') {
    return NextResponse.json({ error: 'You must type DELETE to confirm.' }, { status: 400 })
  }

  if (!body.password || typeof body.password !== 'string') {
    return NextResponse.json({ error: 'Password is required.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, email: true },
  })

  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

  const passwordMatch = await bcrypt.compare(body.password, user.passwordHash)
  if (!passwordMatch) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 400 })
  }

  // Log before deleting (orphaned after user deletion, fine since no FK)
  await prisma.auditLog.create({
    data: { userId, action: 'account.delete', meta: { email: user.email } },
  })

  // Delete invoices then user in a transaction
  await prisma.$transaction([
    prisma.invoice.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ])

  return NextResponse.json({ ok: true })
}
