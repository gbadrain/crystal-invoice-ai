'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ResetRequestPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Something went wrong. Please try again.')
        return
      }

      // Always show the "check email" screen — even if the address isn't registered.
      // This prevents user enumeration (attacker can't probe which emails exist).
      setSubmitted(true)

      // Dev only: API echoes the link so we can click it without a real inbox
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl)
      }
    } catch {
      setError('Unable to reach the server. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── "Check your email" confirmation screen ────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-panel p-8 w-full max-w-md space-y-6">

          {/* Icon + heading */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-crystal-600/20 border border-crystal-500/30 flex items-center justify-center">
                <Mail className="w-7 h-7 text-crystal-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Check your inbox</h1>
              <p className="text-sm text-white/50 mt-2 leading-relaxed">
                If <span className="text-white/75 font-medium">{email}</span> is
                registered, a reset link is on its way. It expires in{' '}
                <span className="text-white/75">30 minutes</span>.
              </p>
            </div>
          </div>

          {/* Dev helper — NOT shown in production */}
          {devResetUrl && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                Dev mode — reset link
              </p>
              <a
                href={devResetUrl}
                className="text-xs text-amber-300 break-all hover:text-amber-200 underline"
              >
                {devResetUrl}
              </a>
            </div>
          )}

          {/* "Didn't get it?" tips */}
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Didn&apos;t receive it?
            </p>
            <ul className="space-y-2.5">
              {[
                'Check your spam or junk folder',
                'Make sure you typed the correct email address',
                'Wait a minute — delivery can take up to 60 seconds',
                "If you're not sure which email you used, try a different one below",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm text-white/50">
                  <CheckCircle2 className="w-4 h-4 text-crystal-500/60 mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-1">
            {/* Try a different email — resets the form client-side, no API call */}
            <button
              onClick={() => {
                setSubmitted(false)
                setDevResetUrl(null)
                setEmail('')
              }}
              className="w-full py-2.5 bg-white/[0.07] hover:bg-white/[0.11] border border-white/10 text-white/70 hover:text-white text-sm font-medium rounded-lg transition-colors"
            >
              Try a different email
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to sign in
              </Link>
              <Link
                href="/auth/signup"
                className="text-crystal-400 hover:text-crystal-300 transition-colors"
              >
                Create an account →
              </Link>
            </div>
          </div>

        </div>
      </div>
    )
  }

  // ── Request form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-panel p-8 w-full max-w-md space-y-6">

        <div>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
          <h1 className="text-xl font-semibold text-white">Forgot your password?</h1>
          <p className="text-sm text-white/40 mt-1">
            Enter your email and we&apos;ll send a reset link if that address is registered.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-white/70 mb-1.5">
              Email address
            </label>
            <input
              id="reset-email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 bg-white/[0.07] border border-white/15 rounded-lg text-white placeholder-white/25 text-sm focus:outline-none focus:border-crystal-500 focus:ring-1 focus:ring-crystal-500 transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full py-2.5 bg-crystal-600 hover:bg-crystal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-crystal-500 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            {isLoading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        {/* Not registered? */}
        <p className="text-center text-sm text-white/30 pt-2 border-t border-white/10">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-crystal-400 hover:text-crystal-300 transition-colors">
            Sign up for free
          </Link>
        </p>

      </div>
    </div>
  )
}
