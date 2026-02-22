import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'

export function MidCTASection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden border border-crystal-500/20 bg-gradient-to-br from-crystal-600/10 via-crystal-500/5 to-transparent p-10 md:p-14 text-center shadow-2xl shadow-crystal-500/10">
          {/* Decorative glow */}
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-crystal-500/10 blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-crystal-600/20 border border-crystal-500/20 text-crystal-300 text-xs font-semibold mb-6">
              <Zap className="w-3 h-3" aria-hidden="true" />
              No credit card required
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to invoice smarter?
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              Create your first AI-generated invoice in under 60 seconds. Free forever, no forms required.
            </p>

            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-crystal-600 text-white font-semibold text-sm hover:bg-crystal-500 shadow-lg shadow-crystal-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-crystal-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Try AI invoicing free
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>

            <p className="mt-4 text-xs text-white/25">
              3 invoices free · No credit card · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
