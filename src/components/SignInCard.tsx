'use client'

/**
 * Client-ONLY sign-in card.
 *
 * This file is intentionally loaded via next/dynamic({ ssr: false }) in
 * LandingPage.tsx.  That means Next.js NEVER includes this component's HTML
 * in the server-rendered payload — it renders fresh on the client only,
 * exactly the same way that /auth/signin's SignInForm renders client-only
 * thanks to its Suspense + useSearchParams() boundary.
 *
 * Why this matters for autofill:
 *   SSR'd inputs (value="") go through React hydration. Even with defaultValue,
 *   there are edge cases in Safari where hydration touches node.value and wipes
 *   autofill before the user can see it.  With ssr:false there is no server HTML
 *   to reconcile — the inputs are created fresh on the client, autofill writes
 *   to them freely, and refs read the live DOM value at submit time.
 *
 * Why window.location.href instead of router.push('/'):
 *   After signIn() succeeds we are still at '/'.  router.push('/') is a
 *   same-URL navigation — Next.js 14 Router Cache serves the current
 *   (unauthenticated) RSC payload and the user sees the landing page again,
 *   appearing "not logged in" even though the session cookie was set.
 *   window.location.href forces a full HTTP GET; the browser sends the fresh
 *   session cookie, the server runs getServerSession() and returns the
 *   Dashboard branch of src/app/page.tsx.
 */

import { useState, useRef, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function SignInCard() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Uncontrolled inputs: no value prop, no onChange.
  // Refs capture whatever is in the DOM at submit time —
  // whether the user typed it or Touch ID / a password manager filled it.
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const emailVal = emailRef.current?.value.trim() ?? ''
    const passwordVal = passwordRef.current?.value ?? ''

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
        // Full page reload — bypasses Next.js Router Cache entirely.
        // The browser GETs '/' with the fresh session cookie, the server
        // returns the Dashboard RSC payload, done.
        window.location.href = '/'
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
    <div className="glass-panel p-8 w-full space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Welcome back</h2>
        <p className="text-sm text-white/40 mt-0.5">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} autoComplete="on" className="space-y-4">
        <div>
          <label
            htmlFor="landing-email"
            className="block text-sm font-medium text-white/70 mb-1.5"
          >
            Email
          </label>
          <input
            ref={emailRef}
            id="landing-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            defaultValue=""
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 bg-white/[0.07] border border-white/15 rounded-lg text-white placeholder-white/25 text-sm focus:outline-none focus:border-crystal-500 focus:ring-1 focus:ring-crystal-500 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="landing-password"
            className="block text-sm font-medium text-white/70 mb-1.5"
          >
            Password
          </label>
          <input
            ref={passwordRef}
            id="landing-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            defaultValue=""
            placeholder="••••••••"
            className="w-full px-3 py-2.5 bg-white/[0.07] border border-white/15 rounded-lg text-white placeholder-white/25 text-sm focus:outline-none focus:border-crystal-500 focus:ring-1 focus:ring-crystal-500 transition-colors"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex justify-end -mt-1">
          <Link
            href="/auth/reset-request"
            className="text-xs text-white/35 hover:text-crystal-400 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-crystal-600 hover:bg-crystal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-crystal-500 focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center gap-2 mt-1"
        >
          {isLoading ? (
            'Signing in…'
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-sm text-center text-white/35 pt-4 border-t border-white/10">
        No account yet?{' '}
        <Link
          href="/auth/signup"
          className="text-crystal-400 hover:text-crystal-300 font-medium transition-colors"
        >
          Create one free →
        </Link>
      </p>
    </div>
  )
}
