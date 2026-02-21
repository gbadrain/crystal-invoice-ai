'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { Zap, CheckCircle, ArrowRight, FileText, Sparkles, Shield, Send, Clock, Star } from 'lucide-react'
import { FREE_INVOICE_LIMIT } from '@/lib/plans'

// ssr: false → avoids hydration-wipe of autofill values
const SignInCard = dynamic(
  () => import('@/components/SignInCard').then((m) => m.SignInCard),
  {
    ssr: false,
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

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Invoice Generation',
    desc: 'Describe the job in plain English — Crystal fills in client, line items, tax, and totals instantly.',
  },
  {
    icon: FileText,
    title: 'Professional PDF Export',
    desc: 'One click to download a pixel-perfect PDF you can send to any client, anywhere.',
  },
  {
    icon: Send,
    title: 'Send to Client by Email',
    desc: 'Email invoices directly from Crystal — no copy-paste, no attachments, no hassle.',
  },
  {
    icon: Clock,
    title: 'Payment Status Tracking',
    desc: 'Mark invoices as draft, pending, paid, or overdue. See everything in one dashboard.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'Your data lives in your own database. Password-hashed, session-protected, HTTPS everywhere.',
  },
  {
    icon: CheckCircle,
    title: 'Trash & Restore',
    desc: "Soft-delete invoices you don't need — restore them any time with one click.",
  },
]

const PLAN_FREE = [
  `Up to ${FREE_INVOICE_LIMIT} invoices`,
  'PDF export',
  'AI generation (preview)',
  'Email sending',
  'Status tracking',
]

const PLAN_PRO = [
  'Unlimited invoices',
  'PDF export',
  'Full AI generation',
  'Email sending',
  'Status tracking',
  'Priority support',
]

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Decorative orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-56 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-crystal-600/[0.08] rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-64 w-[700px] h-[700px] bg-crystal-400/[0.05] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-0 w-[500px] h-[500px] bg-crystal-800/10 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 lg:px-16 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <Image
            src="/icon.png"
            alt="Crystal Invoice AI"
            width={48}
            height={48}
            className="rounded-xl shrink-0"
            priority
          />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-crystal-400">Crystal</span>
            <span className="text-white/80"> Invoice</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm text-white/40 hover:text-white transition-colors hidden md:block">Features</a>
          <a href="#pricing" className="text-sm text-white/40 hover:text-white transition-colors hidden md:block">Pricing</a>
          <Link
            href="/auth/signup"
            className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            Create account
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero + Sign-in */}
      <section className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24 px-8 lg:px-16 py-20 max-w-7xl mx-auto w-full">
        <div className="flex-1 space-y-8 text-center lg:text-left max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-crystal-600/15 border border-crystal-500/25 text-crystal-400 text-xs font-medium tracking-wide">
            <Sparkles className="w-3 h-3" />
            AI-powered invoicing
          </span>

          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight">
            Invoicing that{' '}
            <span className="text-crystal-400">works</span>
            <br />
            as fast as you do.
          </h1>

          <p className="text-lg text-white/50 leading-relaxed max-w-md mx-auto lg:mx-0">
            Describe a job in plain English, get a professional invoice in seconds.
            PDF export, email sending, payment tracking — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-crystal-600 text-white font-semibold text-sm hover:bg-crystal-700 transition-colors shadow-lg shadow-crystal-600/25"
            >
              <Zap className="w-4 h-4" />
              Start for free
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/60 font-medium text-sm hover:bg-white/5 transition-colors"
            >
              See how it works
            </a>
          </div>

          <div className="flex items-center gap-1 justify-center lg:justify-start">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
            <span className="text-sm text-white/30 ml-2">Loved by freelancers &amp; small businesses</span>
          </div>
        </div>

        <div className="w-full max-w-sm shrink-0 transition-all duration-300 hover:-translate-y-2 hover:drop-shadow-[0_24px_48px_rgba(99,102,241,0.2)]">
          <SignInCard />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-8 lg:px-16 py-20 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Everything you need to get paid</h2>
          <p className="text-white/40 max-w-lg mx-auto">No bloat, no learning curve — just the tools that matter for independent professionals.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-panel p-6 border border-white/[0.06] hover:border-crystal-500/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-crystal-600/15 border border-crystal-500/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-crystal-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 px-8 lg:px-16 py-20 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Simple, honest pricing</h2>
          <p className="text-white/40">Start free. Upgrade when you need unlimited.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="glass-panel p-8 border border-white/[0.06] flex flex-col transition-all duration-300 hover:-translate-y-2 hover:border-white/20 hover:shadow-2xl hover:shadow-white/5 cursor-pointer">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Free</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-white/30">/forever</span>
            </div>
            <ul className="space-y-2.5 flex-1 mb-8">
              {PLAN_FREE.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle className="w-4 h-4 text-crystal-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup"
              className="block text-center py-2.5 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="glass-panel p-8 border border-crystal-500/30 flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-crystal-400/60 hover:shadow-2xl hover:shadow-crystal-500/25 cursor-pointer">
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-crystal-600/20 border border-crystal-500/30 text-crystal-300 text-xs font-semibold">
              Most Popular
            </div>
            <p className="text-xs text-crystal-400 uppercase tracking-wider mb-1">Pro</p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">$9</span>
              <span className="text-white/30">/month</span>
            </div>
            <ul className="space-y-2.5 flex-1 mb-8">
              {PLAN_PRO.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle className="w-4 h-4 text-crystal-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup"
              className="block text-center py-2.5 rounded-xl bg-crystal-600 text-white text-sm font-semibold hover:bg-crystal-700 transition-colors shadow-lg shadow-crystal-600/20"
            >
              Start Pro — $9/mo
            </Link>
            <p className="text-xs text-white/20 text-center mt-3">Cancel anytime · Secure via Stripe</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-6 px-8 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/20">
        <span>© {new Date().getFullYear()} Crystal Invoice. All rights reserved.</span>
        <div className="flex items-center gap-5">
          <Link href="/auth/signin" className="hover:text-white/50 transition-colors">Sign in</Link>
          <Link href="/auth/signup" className="hover:text-white/50 transition-colors">Sign up</Link>
          <a href="#pricing" className="hover:text-white/50 transition-colors">Pricing</a>
        </div>
      </footer>
    </div>
  )
}
