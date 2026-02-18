import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/auth/reset-request
 *
 * Accepts { email }.
 * Always returns { ok: true } regardless of whether the email exists —
 * this prevents user enumeration (an attacker cannot tell which emails are registered).
 *
 * If the email IS registered:
 *   - A one-time token is created (SHA-256 hash stored; raw token only in URL)
 *   - In production: email is sent via Resend (RESEND_API_KEY must be set in .env)
 *   - In development: the reset URL is also returned in the response as `devResetUrl`
 *     so you can test the flow without a real inbox.
 *
 * Setup (production):
 *   1. Sign up at https://resend.com (free: 3000 emails/month)
 *   2. Add a verified sending domain
 *   3. Create an API key → set RESEND_API_KEY in .env
 *   4. Set RESEND_FROM in .env  e.g. "Crystal Invoice <noreply@yourdomain.com>"
 */

function buildResetEmail(email: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1d2e;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
              <span style="font-size:20px;font-weight:700;letter-spacing:-0.5px;">
                <span style="color:#7c6ee0;">Crystal</span>
                <span style="color:rgba(255,255,255,0.8);"> Invoice</span>
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:#ffffff;">
                Reset your password
              </h1>
              <p style="margin:0 0 8px;font-size:15px;color:rgba(255,255,255,0.55);line-height:1.6;">
                We received a request to reset the password for
                <strong style="color:rgba(255,255,255,0.75);">${email}</strong>.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:rgba(255,255,255,0.55);line-height:1.6;">
                Click the button below to choose a new password.
                This link expires in <strong style="color:rgba(255,255,255,0.75);">30 minutes</strong>.
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#6d5fd4;border-radius:10px;">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.2px;">
                      Reset password →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;color:rgba(255,255,255,0.3);line-height:1.5;">
                If the button above doesn't work, copy and paste this URL into your browser:
              </p>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.25);word-break:break-all;">
                ${resetUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25);line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email —
                your password won't change. This link expires in 30 minutes and can only
                be used once.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : ''

    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 })
    }

    // Generate a 32-byte (256-bit) random token — cryptographically secure
    const rawToken = crypto.randomBytes(32).toString('hex')
    // Store the SHA-256 hash; the raw token lives only in the reset URL
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      // One-at-a-time policy: remove any existing reset token for this email
      await prisma.passwordResetToken.deleteMany({ where: { email } })

      // Store the hash + expiry
      await prisma.passwordResetToken.create({ data: { email, tokenHash, expiresAt } })

      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset/${rawToken}`

      if (process.env.NODE_ENV === 'production') {
        // ── Send the real email via Resend ───────────────────────────────────
        // Instantiated lazily so a missing RESEND_API_KEY in dev never crashes
        // the module at import time.
        try {
          const { Resend } = await import('resend')
          const resend = new Resend(process.env.RESEND_API_KEY)
          await resend.emails.send({
            from: process.env.RESEND_FROM ?? 'Crystal Invoice <onboarding@resend.dev>',
            to: email,
            subject: 'Reset your Crystal Invoice password',
            html: buildResetEmail(email, resetUrl),
          })
        } catch (emailError) {
          // Log the send failure but don't expose it to the client
          console.error('[Crystal Invoice] Failed to send reset email:', emailError)
        }
      } else {
        // Development: log to console and include in response for easy testing
        console.log(`\n[Crystal Invoice] Password reset link for ${email}:\n  ${resetUrl}\n`)
        return NextResponse.json({ ok: true, devResetUrl: resetUrl })
      }
    }

    // Always respond with ok:true — never reveal whether the email was registered
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('reset-request error:', error)
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 })
  }
}
