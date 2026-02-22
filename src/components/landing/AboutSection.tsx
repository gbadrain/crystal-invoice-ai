import Image from 'next/image'
import { MotionDiv } from '@/components/MotionDiv'
import { motion } from 'framer-motion'

export function AboutSection() {
  return (
    <section className="py-20 px-4" id="about">
      <div className="max-w-4xl mx-auto">
        <MotionDiv y={20} opacity={0}>
          <div className="glass-panel rounded-3xl border border-white/[0.08] p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center">
            {/* Avatar / logo */}
            <motion.div
              className="shrink-0 flex flex-col items-center gap-3"
              whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <Image
                  src="/icon.png"
                  alt="Crystal Invoice AI"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-white/30 text-center">
                Gurpreet Singh Badrain<br />
                <span className="text-crystal-400/70">Founder</span>
              </p>
            </motion.div>

            {/* Story */}
            <div>
              <MotionDiv y={20} opacity={0} delay={0.1}>
                <p className="text-xs font-semibold uppercase tracking-widest text-crystal-400 mb-3">
                  Our Story
                </p>
              </MotionDiv>
              <MotionDiv y={20} opacity={0} delay={0.2}>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-5">
                  Built for the people who actually do the work.
                </h2>
              </MotionDiv>
              <div className="space-y-4 text-white/55 text-sm leading-relaxed">
                <MotionDiv y={20} opacity={0} delay={0.3}>
                  <p>
                    Crystal Invoice AI was born from a simple frustration: every invoice tool I tried
                    was designed for accountants, not for the freelancer who just finished a job and
                    wants to get paid fast.
                  </p>
                </MotionDiv>
                <MotionDiv y={20} opacity={0} delay={0.4}>
                  <p>
                    The idea was straightforward — what if you could just <em>describe</em> what you
                    did, and the software figured out the rest? Line items, tax, client details,
                    due dates. All of it, instantly, from plain English.
                  </p>
                </MotionDiv>
                <MotionDiv y={20} opacity={0} delay={0.5}>
                  <p>
                    That is exactly what Crystal Invoice AI does. It is built for cleaners, plumbers,
                    consultants, photographers, and anyone else who earns a living by doing great work
                    — not by wrestling with software.
                  </p>
                </MotionDiv>
                <MotionDiv y={20} opacity={0} delay={0.6}>
                  <p className="text-white/70 font-medium">
                    Professional invoices should take seconds, not minutes. That is the mission.
                  </p>
                </MotionDiv>
              </div>
            </div>
          </div>
        </MotionDiv>
      </div>
    </section>
  )
}
