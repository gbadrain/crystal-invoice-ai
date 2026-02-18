'use client'

import { Suspense, useState, useRef, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Inner component must be separate so useSearchParams() can be wrapped in Suspense
function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Honour any ?callbackUrl= passed by requireUser redirects; default to '/'
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const justRegistered = searchParams.get('success') === '1'
  const resetSuccess = searchParams.get('resetSuccess') === '1'

  // Refs let us read the real DOM value at submit time.
  // Safari Touch ID and most password managers write directly to the DOM node
  // without firing React's synthetic onChange, so React state stays empty.
  // Falling back to ref.current.value captures those autofilled values.
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Prefer React state; fall back to DOM value for autofill (Touch ID, password managers)
    const emailVal = email || emailRef.current?.value || ''
    const passwordVal = password || passwordRef.current?.value || ''

    if (!emailVal || !passwordVal) {
      setError('Email and password are required.')
      return
    }

    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: emailVal,
        password: passwordVal,
      })

      if (result?.ok) {
        // router.refresh() flushes the Next.js 14 Router Cache so the
        // very next navigation sees the fresh session cookie on the server.
        // Without this, the server component at the target route may still
        // read a stale (unauthenticated) RSC payload and redirect away.
        router.refresh()
        router.push(callbackUrl)
      } else {
        setError(result?.error || 'Invalid email or password.')
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
          <p className="text-sm text-white/40">Sign in to your account</p>
        </div>

        {justRegistered && (
          <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
            Account created! Please sign in below.
          </div>
        )}

        {resetSuccess && (
          <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
            Password updated! Sign in with your new password.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white/70 mb-1.5"
            >
              Email address
            </label>
            <input
              ref={emailRef}
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/70"
              >
                Password
              </label>
              <Link
                href="/auth/reset-request"
                className="text-xs text-white/35 hover:text-crystal-400 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              ref={passwordRef}
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 bg-white/[0.07] border border-white/15 rounded-lg text-white placeholder-white/25 focus:outline-none focus:border-crystal-500 focus:ring-1 focus:ring-crystal-500 transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-crystal-600 hover:bg-crystal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-crystal-500 focus:ring-offset-2 focus:ring-offset-transparent mt-2"
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-center text-white/40">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="text-crystal-400 hover:text-crystal-300 font-medium transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
