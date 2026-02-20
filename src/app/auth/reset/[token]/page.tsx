'use client'

import { useState, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { checkPassword, PASSWORD_RULES } from '@/lib/password'

const STRENGTH_COLORS = [
  'bg-white/10',    // 0 — empty
  'bg-red-500',     // 1
  'bg-orange-400',  // 2
  'bg-yellow-400',  // 3
  'bg-blue-400',    // 4
  'bg-emerald-400', // 5 — all good
]

export default function ResetPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const token = typeof params?.token === 'string' ? params.token : ''

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const strength = checkPassword(password)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!strength.isValid) {
      setTouched(true)
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Something went wrong. Please try again.')
        return
      }

      // Redirect to sign-in with a success banner
      router.push('/auth/signin?resetSuccess=1')
    } catch {
      setError('Unable to reach the server. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-panel p-8 w-full max-w-md text-center space-y-4">
          <p className="text-white/60">Invalid reset link.</p>
          <Link href="/auth/reset-request" className="text-crystal-400 hover:text-crystal-300 text-sm">
            Request a new one →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-panel p-8 w-full max-w-md space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Set a new password</h1>
          <p className="text-sm text-white/40 mt-1">
            Choose a strong password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password field */}
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-white/70 mb-1.5">
              New password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (!touched && e.target.value.length > 0) setTouched(true)
                }}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 bg-white/[0.07] border border-white/15 rounded-lg text-white placeholder-white/25 text-sm focus:outline-none focus:border-crystal-500 focus:ring-1 focus:ring-crystal-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength bar */}
            {touched && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((seg) => (
                    <div
                      key={seg}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        strength.score >= seg ? STRENGTH_COLORS[strength.score] : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>

                {/* Requirement checklist */}
                <ul className="space-y-1">
                  {PASSWORD_RULES.map(({ key, label }) => {
                    const passing = strength.checks[key]
                    return (
                      <li key={key} className="flex items-center gap-2 text-xs">
                        {passing ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                        )}
                        <span className={passing ? 'text-white/60' : 'text-white/30'}>{label}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}{' '}
              {error.includes('expired') && (
                <Link href="/auth/reset-request" className="underline hover:text-red-300">
                  Request a new link
                </Link>
              )}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || (touched && !strength.isValid)}
            className="w-full py-2.5 bg-crystal-600 hover:bg-crystal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-crystal-500 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            {isLoading ? 'Updating…' : 'Update password'}
          </button>
        </form>

        <p className="text-center text-sm text-white/30 pt-4 border-t border-white/10">
          Remembered it?{' '}
          <Link href="/auth/signin" className="text-crystal-400 hover:text-crystal-300 transition-colors">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}
