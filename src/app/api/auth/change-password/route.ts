import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkPassword } from '@/lib/password'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { currentPassword?: string; newPassword?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  // Fetch the authenticated user
  const user = await prisma.user.findUnique({ where: { id: session.user!.id as string } })
  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  }

  // Verify current password
  const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!passwordMatch) {
    return NextResponse.json({ error: 'Incorrect current password.' }, { status: 400 })
  }

  // Server-side strength validation (same rules as client — src/lib/password.ts)
  const { isValid } = checkPassword(newPassword)
  if (!isValid) {
    return NextResponse.json(
      { error: 'New password does not meet strength requirements.' },
      { status: 422 }
    )
  }

  // Hash and persist
  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: session.user!.id as string },
    data: { passwordHash },
  })

  return NextResponse.json({ ok: true })
}
