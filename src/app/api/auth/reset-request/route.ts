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
 * Email sending priority (first configured wins):
 *   1. Gmail SMTP  — set EMAIL_USER + EMAIL_PASS (Gmail App Password) in .env
 *                    Works immediately, no domain verification needed.
 *   2. Resend      — set RESEND_API_KEY + a verified domain in .env
 *                    onboarding@resend.dev only delivers to your Resend account email.
 *   3. Dev fallback — amber on-screen link (no email sent, dev only)
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

async function sendEmail(to: string, resetUrl: string): Promise<void> {
  const subject = 'Reset your Crystal Invoice password'
  const html = buildResetEmail(to, resetUrl)

  // ── Option 1: Gmail SMTP (works with any Gmail, no domain needed) ──────────
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.default.createTransport({
      host: process.env.EMAIL_HOST ?? 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT ?? 587),
      secure: false, // STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password (not your login password)
      },
    })
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? `Crystal Invoice <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })
    console.log(`[Crystal Invoice] Reset email sent via Gmail SMTP to ${to}`)
    return
  }

  // ── Option 2: Resend (requires a verified domain — onboarding@resend.dev  ──
  // only delivers to the Resend account owner's own email address)           ──
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? 'Crystal Invoice <onboarding@resend.dev>',
      to,
      subject,
      html,
    })
    console.log(`[Crystal Invoice] Reset email sent via Resend to ${to}`)
    return
  }

  console.warn('[Crystal Invoice] No email provider configured — set EMAIL_USER+EMAIL_PASS or RESEND_API_KEY in .env')
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

      // Always log to server console
      console.log(`\n[Crystal Invoice] Password reset link for ${email}:\n  ${resetUrl}\n`)

      // Attempt real email delivery (silently fails — never exposed to client)
      sendEmail(email, resetUrl).catch((err) =>
        console.error('[Crystal Invoice] Failed to send reset email:', err.message)
      )

    }

    // Always respond with ok:true — never reveal whether the email was registered
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('reset-request error:', error)
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 })
  }
}
