'use client'

import { FileText, Mic, Sparkles, Download, Mail } from 'lucide-react'
import { MotionDiv } from '@/components/MotionDiv'

const steps = [
  {
    icon: Mic,
    title: '1. Describe the Job',
    description: 'Simply type or speak what you did. Crystal Invoice AI understands natural language to capture all job details.',
  },
  {
    icon: Sparkles,
    title: '2. AI Generates Invoice',
    description: 'Our AI instantly extracts client info, line items, quantities, rates, and taxes to pre-fill your invoice.',
  },
  {
    icon: FileText,
    title: '3. Deliver Instantly',
    description: 'Review, then download a pixel-perfect PDF or email it directly to your client with a single click.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4" id="how-it-works">
      <div className="max-w-6xl mx-auto text-center">
        <MotionDiv y={20} opacity={0}>
          <p className="text-xs font-semibold uppercase tracking-widest text-crystal-400 mb-3">
            Workflow
          </p>
        </MotionDiv>
        <MotionDiv y={20} opacity={0} delay={0.1}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Invoice in 3 simple steps
          </h2>
        </MotionDiv>
        <MotionDiv y={20} opacity={0} delay={0.2}>
          <p className="text-white/50 text-lg mb-14 max-w-xl mx-auto">
            Crystal Invoice AI streamlines your billing process, so you can focus on what you do best.
          </p>
        </MotionDiv>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <MotionDiv key={index} y={20} opacity={0} delay={index * 0.2 + 0.3}>
              <div className="glass-panel p-8 rounded-2xl border border-white/[0.08] flex flex-col items-center text-center h-full">
                <div className="w-14 h-14 rounded-full bg-crystal-600/20 border border-crystal-500/20 flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-crystal-300" />
                </div>
                <h3 className="font-semibold text-white text-xl mb-3">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  )
}
