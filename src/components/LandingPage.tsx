'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Zap, CheckCircle, ArrowRight, FileText, Sparkles, Shield } from 'lucide-react'

// ssr: false → SignInCard never appears in the server-rendered HTML payload.
// It renders fresh on the client after hydration, avoiding any hydration
// mismatch that could reset autofilled input values before the user submits.
// This mirrors exactly how /auth/signin's SignInForm is client-only via Suspense.
const SignInCard = dynamic(
  () => import('@/components/SignInCard').then((m) => m.SignInCard),
  {
    ssr: false,
    // Placeholder that preserves card dimensions while JS loads
    loading: () => (
      <div className="glass-panel p-8 w-full space-y-6">
        <div className="space-y-1">
          <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-10 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-10 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-10 bg-crystal-600/40 rounded-lg animate-pulse" />
        </div>
      </div>
    ),
  }
)

/* ─────────────────────────────────────────────
   Feature pills shown in the hero section
───────────────────────────────────────────── */
const FEATURES = [
  { icon: Sparkles, label: 'AI-generated invoices' },
  { icon: FileText,  label: 'PDF export' },
  { icon: Shield,    label: 'Secure & private' },
  { icon: CheckCircle, label: 'Multi-status workflow' },
]

/* ─────────────────────────────────────────────
   Main export
───────────────────────────────────────────── */
export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Decorative background orbs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-56 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-crystal-600/[0.08] rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-64 w-[700px] h-[700px] bg-crystal-400/[0.05] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-0 w-[500px] h-[500px] bg-crystal-800/10 rounded-full blur-3xl" />
      </div>

      {/* ── Top navigation ── */}
      <nav className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-5 border-b border-white/[0.06]">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-crystal-600 flex items-center justify-center shadow-lg shadow-crystal-600/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-crystal-400">Crystal</span>
            <span className="text-white/80"> Invoice</span>
          </span>
        </div>

        {/* Nav actions */}
        <Link
          href="/auth/signup"
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
        >
          Create account
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </nav>

      {/* ── Hero + auth card ── */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24 px-8 lg:px-16 py-16 max-w-7xl mx-auto w-full">

        {/* Left: hero copy */}
        <div className="flex-1 space-y-8 text-center lg:text-left max-w-xl">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-crystal-600/15 border border-crystal-500/25 text-crystal-400 text-xs font-medium tracking-wide">
            <Sparkles className="w-3 h-3" />
            AI-powered invoicing
          </span>

          {/* Headline */}
          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight">
            Invoicing that{' '}
            <span className="text-crystal-400">works</span>
            <br />
            as fast as you do.
          </h1>

          {/* Sub-copy */}
          <p className="text-lg text-white/50 leading-relaxed max-w-md mx-auto lg:mx-0">
            Create professional invoices in seconds with AI, export to PDF,
            and track every payment — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2.5">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-white/40">
                <Icon className="w-4 h-4 text-crystal-500 shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Right: sign-in card (client-only via dynamic import) */}
        <div className="w-full max-w-sm shrink-0">
          <SignInCard />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.06] py-5 px-8 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/20">
        <span>© {new Date().getFullYear()} Crystal Invoice. All rights reserved.</span>
        <div className="flex items-center gap-5">
          <Link href="/auth/signin" className="hover:text-white/50 transition-colors">
            Sign in
          </Link>
          <Link href="/auth/signup" className="hover:text-white/50 transition-colors">
            Sign up
          </Link>
        </div>
      </footer>
    </div>
  )
}
