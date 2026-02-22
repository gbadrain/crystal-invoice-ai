/**
 * Shared Resend email client.
 *
 * Usage:
 *   import { sendEmail } from '@/lib/resend'
 *   await sendEmail({ to: 'user@example.com', subject: 'Hello', html: '<p>Hi</p>' })
 *
 * Falls back gracefully if RESEND_API_KEY is not configured.
 */

import { Resend } from 'resend'

const FROM =
  process.env.RESEND_FROM ??
  'Crystal Invoice AI <onboarding@resend.dev>'

let _client: Resend | null = null
function getClient(): Resend {
  if (!_client) _client = new Resend(process.env.RESEND_API_KEY!)
  return _client
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  attachments?: Array<{ filename: string; content: Buffer }>
}

/**
 * Send an email via Resend.
 * Returns `{ ok: true }` on success or `{ ok: false, error }` on failure.
 * Never throws — callers can fire-and-forget safely.
 */
export async function sendEmail(
  opts: SendEmailOptions
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[resend] RESEND_API_KEY not set — email skipped.')
    return { ok: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const resend = getClient()
    await resend.emails.send({
      from: opts.from ?? FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      ...(opts.attachments?.length ? { attachments: opts.attachments } : {}),
    })
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[resend] Send failed:', message)
    return { ok: false, error: message }
  }
}
