import { NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { checkPassword } from '@/lib/password'

/**
 * POST /api/auth/reset
 *
 * Accepts { token, newPassword }.
 * - Hashes the raw token and looks it up in the DB.
 * - Validates the token hasn't expired.
 * - Validates the new password passes strength rules.
 * - Updates the user's passwordHash.
 * - Deletes the token (one-time use).
 * - Returns { ok: true } on success.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, newPassword } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ message: 'Invalid or missing reset token.' }, { status: 400 })
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ message: 'New password is required.' }, { status: 400 })
    }

    // Validate password strength (same rules as signup)
    const { isValid } = checkPassword(newPassword)
    if (!isValid) {
      return NextResponse.json(
        { message: 'Password must be ≥ 8 chars and include uppercase, lowercase, a number, and a symbol.' },
        { status: 422 }
      )
    }

    // Hash the raw token to look it up in the DB
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } })

    if (!resetToken) {
      return NextResponse.json({ message: 'Invalid or expired reset link.' }, { status: 400 })
    }

    if (resetToken.expiresAt < new Date()) {
      // Clean up the expired token
      await prisma.passwordResetToken.delete({ where: { tokenHash } })
      return NextResponse.json({ message: 'This reset link has expired. Please request a new one.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: resetToken.email } })

    if (!user) {
      // Token exists but user was deleted — clean up
      await prisma.passwordResetToken.delete({ where: { tokenHash } })
      return NextResponse.json({ message: 'Invalid or expired reset link.' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Update password and delete token in a transaction (atomic)
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      prisma.passwordResetToken.delete({ where: { tokenHash } }),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('reset error:', error)
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 })
  }
}
