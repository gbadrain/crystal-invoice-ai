'use client'

import { useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Check, X, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { checkPassword, PASSWORD_RULES } from '@/lib/password'

const STRENGTH_COLORS = [
  'bg-white/10',    // 0 — empty
  'bg-red-500',     // 1
  'bg-orange-400',  // 2
  'bg-yellow-400',  // 3
  'bg-blue-400',    // 4
  'bg-emerald-400', // 5 — all good
]

function SuccessBanner() {
  const params = useSearchParams()
  if (params?.get('success') !== '1') return null
  return (
    <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-green-500/10 border border-green-500/20">
      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
      <p className="text-sm text-green-300">Password changed successfully.</p>
    </div>
  )
}

export function ChangePasswordForm() {
  // Uncontrolled refs — Touch ID / password manager autofill safe
  const currentPasswordRef = useRef<HTMLInputElement>(null)
  const newPasswordRef     = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  // Controlled state only for the live strength meter
  const [newPasswordValue, setNewPasswordValue] = useState('')
  const [touched, setTouched]                   = useState(false)

  // Eye toggles
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Form state
  const [error, setError]           = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const strength = checkPassword(newPasswordValue)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const currentPassword = currentPasswordRef.current?.value || ''
    const newPassword     = newPasswordRef.current?.value || ''
    const confirmPassword = confirmPasswordRef.current?.value || ''

    if (!currentPassword) {
      setError('Please enter your current password.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    if (!strength.isValid) {
      setTouched(true)
      setError('New password does not meet strength requirements.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      window.location.href = '/settings/password?success=1'
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Change Password</h1>
        <p className="text-white/60">Update your account password. You'll need your current password to confirm.</p>
      </div>

      {/* Success banner — reads ?success=1 from URL */}
      <Suspense fallback={null}>
        <SuccessBanner />
      </Suspense>

      <div className="glass-panel p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* Current password */}
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-white/70 mb-1.5">
              Current password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="current-password"
                ref={currentPasswordRef}
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white/[0.07] border border-white/15 rounded-lg text-white placeholder-white/25 text-sm focus:outline-none focus:border-crystal-500 focus:ring-1 focus:ring-crystal-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-white/70 mb-1.5">
              New password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="new-password"
                ref={newPasswordRef}
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                onChange={(e) => {
                  setNewPasswordValue(e.target.value)
                  if (!touched && e.target.value.length > 0) setTouched(true)
                }}
                className="w-full pl-10 pr-10 py-2.5 bg-white/[0.07] border border-white/15 rounded-lg text-white placeholder-white/25 text-sm focus:outline-none focus:border-crystal-500 focus:ring-1 focus:ring-crystal-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Live strength meter — appears once user starts typing */}
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

          {/* Confirm new password */}
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-white/70 mb-1.5">
              Confirm new password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirm-password"
                ref={confirmPasswordRef}
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white/[0.07] border border-white/15 rounded-lg text-white placeholder-white/25 text-sm focus:outline-none focus:border-crystal-500 focus:ring-1 focus:ring-crystal-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-crystal-600 hover:bg-crystal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-crystal-500 focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating…
              </>
            ) : (
              'Update password'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
