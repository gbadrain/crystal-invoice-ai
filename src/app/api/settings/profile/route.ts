import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '../../invoices/_helpers'

// GET /api/settings/profile — current user's profile fields
export async function GET() {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, companyName: true, avatarUrl: true },
  })

  return NextResponse.json(user ?? {})
}

// PATCH /api/settings/profile — update name, companyName, avatarUrl
export async function PATCH(req: NextRequest) {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result

  const body = await req.json()
  const { name, companyName, avatarUrl } = body as {
    name?: unknown
    companyName?: unknown
    avatarUrl?: unknown
  }

  const data: Record<string, unknown> = {}
  const changed: string[] = []

  if (name !== undefined) {
    if (typeof name !== 'string') return NextResponse.json({ error: 'Invalid name.' }, { status: 400 })
    const trimmed = name.trim().slice(0, 100)
    data.name = trimmed || null
    changed.push('name')
  }

  if (companyName !== undefined) {
    if (typeof companyName !== 'string')
      return NextResponse.json({ error: 'Invalid companyName.' }, { status: 400 })
    const trimmed = companyName.trim().slice(0, 100)
    data.companyName = trimmed || null
    changed.push('companyName')
  }

  if (avatarUrl !== undefined) {
    if (avatarUrl !== null && typeof avatarUrl !== 'string')
      return NextResponse.json({ error: 'Invalid avatarUrl.' }, { status: 400 })
    if (typeof avatarUrl === 'string' && avatarUrl.length > 700_000)
      return NextResponse.json({ error: 'Image too large. Max 500 KB.' }, { status: 413 })
    data.avatarUrl = avatarUrl
    changed.push('avatarUrl')
  }

  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })

  await prisma.user.update({ where: { id: userId }, data })

  await prisma.auditLog.create({
    data: { userId, action: 'profile.update', meta: { fields: changed } },
  })

  return NextResponse.json({ ok: true })
}
