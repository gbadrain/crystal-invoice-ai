'use client'

import { useRef, useState } from 'react'
import { signOut } from 'next-auth/react'
import { AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react'

export function DeleteAccountForm() {
  const [confirmation, setConfirmation] = useState('')
  const passwordRef = useRef<HTMLInputElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isReady = confirmation === 'DELETE'

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const password = passwordRef.current?.value ?? ''
    if (!password) {
      setError('Please enter your password.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/settings/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation, password }),
      })
      if (res.ok) {
        await signOut({ callbackUrl: '/' })
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string }
        setError(data.error ?? 'Deletion failed. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl shadow-lg ring-1 ring-red-500/30 bg-red-500/5 overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-red-500/20">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <h2 className="text-base font-semibold text-red-300">Delete account</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            This will permanently delete your account and all associated invoices. This action
            cannot be undone and your data cannot be recovered.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleDelete} className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
              className="block w-full rounded-md border-0 bg-slate-800/60 py-2.5 px-4 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirm with your password
            </label>
            <div className="relative">
              <input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="block w-full rounded-md border-0 bg-slate-800/60 py-2.5 pl-4 pr-10 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isReady || loading}
            className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold py-2.5 px-5 bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-900/20 transition-all duration-200"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Permanently delete my account
          </button>
        </form>
      </div>
    </div>
  )
}
