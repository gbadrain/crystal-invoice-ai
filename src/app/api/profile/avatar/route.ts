import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserId } from '../../invoices/_helpers'

// GET /api/profile/avatar — returns current user's avatarUrl
export async function GET() {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } })
  return NextResponse.json({ avatarUrl: user?.avatarUrl ?? null })
}

// PATCH /api/profile/avatar — save base64 avatar (max ~500KB)
export async function PATCH(req: NextRequest) {
  const result = await getAuthUserId()
  if (result instanceof NextResponse) return result
  const userId = result

  const { avatarUrl } = await req.json()

  if (avatarUrl !== null && typeof avatarUrl !== 'string') {
    return NextResponse.json({ error: 'Invalid avatarUrl.' }, { status: 400 })
  }

  // Guard against huge payloads (~500KB base64 limit)
  if (avatarUrl && avatarUrl.length > 700_000) {
    return NextResponse.json({ error: 'Image too large. Please use an image under 500KB.' }, { status: 413 })
  }

  try {
    await prisma.user.update({ where: { id: userId }, data: { avatarUrl } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[avatar] DB error:', err)
    return NextResponse.json({ error: 'Avatar could not be saved. Please restart the dev server and try again.' }, { status: 500 })
  }
}
