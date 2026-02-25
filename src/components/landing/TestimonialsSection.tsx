import { MotionDiv } from '@/components/MotionDiv'
import { FloatingAvatar } from '@/components/FloatingAvatar'
import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Freelance Photographer',
    avatar: 'SM',
    quote:
      'I used to spend 20 minutes writing invoices in Word. Now I describe the shoot, hit generate, and email the PDF — all in under a minute. Absolute game changer.',
  },
  {
    name: 'James T.',
    role: 'Independent Plumber',
    avatar: 'JT',
    quote:
      'I can do it from my van on my phone. Client gets a professional PDF in their inbox before I even drive off. My clients actually comment on how polished it looks.',
  },
  {
    name: 'Priya K.',
    role: 'Consultant & Coach',
    avatar: 'PK',
    quote:
      'The AI picks up tax rates, discounts, everything. I just say what I did and it fills in the rest. I have no idea how I managed invoicing before this.',
  },
  {
    name: 'Daniel R.',
    role: 'Cleaning Business Owner',
    avatar: 'DR',
    quote:
      'I run a small team and we invoice 30+ clients a week. Crystal Invoice AI cut our admin time in half. The logo on every PDF makes us look like a proper company.',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <MotionDiv y={20} opacity={0}>
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-crystal-400 mb-3">
              Loved By Freelancers
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Real people. Real results.
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              From tradespeople to consultants — Crystal Invoice AI fits the way you actually work.
            </p>
          </div>
        </MotionDiv>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, index) => (
            <MotionDiv key={t.name} y={20} opacity={0} delay={index * 0.1}>
              <motion.div
                className="glass-panel p-6 rounded-2xl border border-white/[0.08] flex flex-col gap-4"
                whileHover={{ y: -7, scale: 1.02, boxShadow: '0 0 35px rgba(99,102,241,0.45), 0 0 70px rgba(99,102,241,0.18), 0 28px 55px rgba(0,0,0,0.55)' }}
                transition={{ duration: 0.3 }}
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm" aria-hidden="true">★</span>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-white/70 text-sm leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                  <FloatingAvatar>
                    <div
                      className="w-9 h-9 rounded-full bg-crystal-600/30 border border-crystal-500/20 flex items-center justify-center text-xs font-bold text-crystal-300 shrink-0"
                      aria-hidden="true"
                    >
                      {t.avatar}
                    </div>
                  </FloatingAvatar>
                  <div>
                    <p className="text-sm font-semibold text-white/90">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  )
}
