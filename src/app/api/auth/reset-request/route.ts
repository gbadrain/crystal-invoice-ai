import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/auth/reset-request
 *
 * Accepts { email }.
 * Always returns { ok: true } regardless of whether the email exists —
 * this prevents user enumeration (an attacker can't tell which emails are registered).
 *
 * In development (NODE_ENV !== 'production') the response also includes
 * { devResetUrl } so you can test the full flow without an email server.
 * The URL is also logged to the server console.
 *
 * Production email:
 *   Set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM in .env
 *   and replace the console.log block below with a real send (Nodemailer,
 *   Resend, SendGrid, AWS SES, etc.).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : ''

    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 })
    }

    // Generate a 32-byte (256-bit) random token — cryptographically secure
    const rawToken = crypto.randomBytes(32).toString('hex')
    // Hash the token before storing. The raw token lives only in the URL;
    // even if the DB is compromised, stored hashes can't be used to reset passwords.
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      // Remove any existing reset tokens for this address (one-at-a-time policy)
      await prisma.passwordResetToken.deleteMany({ where: { email } })

      // Store the hash + expiry
      await prisma.passwordResetToken.create({ data: { email, tokenHash, expiresAt } })

      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset/${rawToken}`

      // ── Production: send email here ─────────────────────────────────────────
      // Example (Nodemailer):
      //   const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, ... })
      //   await transporter.sendMail({
      //     from: process.env.SMTP_FROM,
      //     to: email,
      //     subject: 'Reset your Crystal Invoice password',
      //     html: `<p>Click to reset your password (expires in 30 min):</p>
      //            <p><a href="${resetUrl}">${resetUrl}</a></p>`,
      //   })
      // ────────────────────────────────────────────────────────────────────────

      console.log(`\n[Crystal Invoice] Password reset link for ${email}:\n  ${resetUrl}\n`)

      // Development: expose the URL in the response so you can click it directly
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({ ok: true, devResetUrl: resetUrl })
      }
    }

    // Always respond with ok:true (user enumeration prevention)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('reset-request error:', error)
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 })
  }
}
