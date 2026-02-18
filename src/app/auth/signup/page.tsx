'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { checkPassword, PASSWORD_RULES } from '@/lib/password'

const STRENGTH_COLORS = [
  'bg-white/10',       // 0 — nothing
  'bg-red-500',        // 1 — very weak
  'bg-orange-400',     // 2 — weak
  'bg-yellow-400',     // 3 — fair
  'bg-blue-400',       // 4 — good
  'bg-emerald-400',    // 5 — strong
]

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)  // true once the user has typed in the password field
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const strength = checkPassword(password)
  // Show the checklist as soon as the user starts typing
  const showChecklist = touched && password.length > 0

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setTouched(true)

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    if (!strength.isValid) {
      setError('Your password does not meet all requirements below.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        router.push('/auth/signin?success=1')
      } else {
        const data = await res.json()
        setError(data.message || 'Something went wrong.')
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative z-10 w-full max-w-md px-4">
      <div className="glass-panel p-8 space-y-6">

        {/* Branding */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-crystal-400">Crystal</span>{' '}
            <span className="text-white/80">Invoice</span>
          </h1>
          <p className="text-sm text-white/40">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 bg-white/[0.07] border border-white/15 rounded-lg text-white placeholder-white/25 focus:outline-none focus:border-crystal-500 focus:ring-1 focus:ring-crystal-500 transition-colors"
            />
          </div>

          {/* Password + strength */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
              Password
            </label>

            {/* Input with show/hide toggle */}
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setTouched(true) }}
                placeholder="Min. 8 characters"
                className="w-full px-3 py-2.5 pr-10 bg-white/[0.07] border border-white/15 rounded-lg text-white placeholder-white/25 focus:outline-none focus:border-crystal-500 focus:ring-1 focus:ring-crystal-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength bar + checklist */}
            {showChecklist && (
              <div className="mt-3 space-y-2.5">

                {/* 5-segment strength bar */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((seg) => (
                    <div
                      key={seg}
                      className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                        seg <= strength.score ? STRENGTH_COLORS[strength.score] : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>

                {/* Rule checklist */}
                <ul className="space-y-1">
                  {PASSWORD_RULES.map(({ key, label }) => (
                    <li key={key} className="flex items-center gap-2 text-xs">
                      {strength.checks[key] ? (
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="w-3 h-3 text-red-400/60 shrink-0" />
                      )}
                      <span className={strength.checks[key] ? 'text-white/55' : 'text-white/30'}>
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || (touched && !strength.isValid)}
            className="w-full py-2.5 px-4 bg-crystal-600 hover:bg-crystal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-crystal-500 focus:ring-offset-2 focus:ring-offset-transparent mt-1"
          >
            {isLoading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-center text-white/40">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-crystal-400 hover:text-crystal-300 font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
