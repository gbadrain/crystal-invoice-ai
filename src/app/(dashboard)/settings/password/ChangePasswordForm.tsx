'use client'

import { useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Eye,
  EyeOff,
  Check,
  X,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { checkPassword, PASSWORD_RULES } from '@/lib/password'
import { cn } from '@/utils/cn'

const STRENGTH_COLORS = [
  'bg-slate-700', // 0 — empty
  'bg-red-500', // 1
  'bg-orange-400', // 2
  'bg-yellow-400', // 3
  'bg-blue-400', // 4
  'bg-emerald-400', // 5 — all good
]

function SuccessBanner() {
  const params = useSearchParams()
  if (params?.get('success') !== '1') return null
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-6">
      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
      <div>
        <h4 className="text-sm font-semibold text-green-300">
          Password Updated
        </h4>
        <p className="text-xs text-green-400/70 mt-0.5">
          Your password has been changed successfully.
        </p>
      </div>
    </div>
  )
}

export function ChangePasswordForm() {
  const currentPasswordRef = useRef<HTMLInputElement>(null)
  const newPasswordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  const [newPasswordValue, setNewPasswordValue] = useState('')
  const [touched, setTouched] = useState(false)

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const strength = checkPassword(newPasswordValue)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const currentPassword = currentPasswordRef.current?.value || ''
    const newPassword = newPasswordRef.current?.value || ''
    const confirmPassword = confirmPasswordRef.current?.value || ''

    if (!currentPassword) {
      setError('Please enter your current password.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.')
      return
    }
    if (!strength.isValid) {
      setTouched(true)
      setError('The new password does not meet the strength requirements.')
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
      setError('A network error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Suspense fallback={null}>
        <SuccessBanner />
      </Suspense>

      <div className="rounded-xl shadow-lg shadow-slate-950/40 bg-slate-900/70 ring-1 ring-slate-800">
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <label
                htmlFor="current-password"
                className="block text-sm font-medium leading-6 text-slate-300"
              >
                Current password
              </label>
              <div className="relative mt-2">
                <input
                  id="current-password"
                  ref={currentPasswordRef}
                  type={showCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="block w-full rounded-md border-0 bg-slate-800/60 py-2.5 pl-4 pr-10 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-crystal-500 sm:text-sm sm:leading-6"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium leading-6 text-slate-300"
              >
                New password
              </label>
              <div className="relative mt-2">
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
                  className="block w-full rounded-md border-0 bg-slate-800/60 py-2.5 pl-4 pr-10 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-crystal-500 sm:text-sm sm:leading-6"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {touched && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((seg) => (
                      <div
                        key={seg}
                        className={cn(
                          'h-1.5 flex-1 rounded-full transition-colors duration-300',
                          strength.score >= seg
                            ? STRENGTH_COLORS[strength.score]
                            : 'bg-slate-700'
                        )}
                      />
                    ))}
                  </div>
                  <ul className="space-y-1">
                    {PASSWORD_RULES.map(({ key, label }) => {
                      const passing = strength.checks[key]
                      return (
                        <li
                          key={key}
                          className="flex items-center gap-2 text-xs"
                        >
                          {passing ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          )}
                          <span
                            className={
                              passing ? 'text-slate-400' : 'text-slate-500'
                            }
                          >
                            {label}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium leading-6 text-slate-300"
              >
                Confirm new password
              </label>
              <div className="relative mt-2">
                <input
                  id="confirm-password"
                  ref={confirmPasswordRef}
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="block w-full rounded-md border-0 bg-slate-800/60 py-2.5 pl-4 pr-10 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-crystal-500 sm:text-sm sm:leading-6"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                  aria-label={
                    showConfirm ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex flex-col sm:flex-row-reverse sm:items-center sm:justify-between gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-lg text-sm font-semibold py-2.5 px-5 bg-crystal-600 text-white hover:bg-crystal-500 disabled:opacity-50 shadow-lg shadow-crystal-600/20 transition-colors"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Password
            </button>
            {error && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </>
  )
}
