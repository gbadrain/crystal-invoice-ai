'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { MotionDiv } from '@/components/MotionDiv'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  {
    q: 'Is my data safe?',
    a: 'Yes. All invoices are stored in a private PostgreSQL database tied to your account. No other user can access your data. Passwords are hashed with bcrypt and never stored in plain text. All connections use HTTPS/TLS.',
  },
  {
    q: 'Which currencies are supported?',
    a: 'Crystal Invoice AI supports 10 currencies: USD ($), EUR (€), GBP (£), INR (₹), JPY (¥), CAD (CA$), AUD (A$), AED, SGD (S$), and CHF (Fr). Set your default once in Settings → Invoice Defaults and it updates instantly everywhere — invoice list, PDF downloads, client emails, dashboard stats, and the trash page. No manual editing needed.',
  },
  {
    q: 'How does AI generate invoices?',
    a: 'You describe your job in plain English — or speak it aloud using the microphone. Crystal Invoice AI sends that description to an Anthropic Claude model, which extracts the client details, line items, quantities, rates, tax, and discounts. The result pre-fills every field in the invoice form instantly. You can edit anything before saving.',
  },
  {
    q: 'Can I customise invoices?',
    a: 'Absolutely. Every field is editable after AI generation. You can upload your company logo, adjust line items, change tax and discount rates, set due dates, and add custom notes. Your logo is stored once and automatically appears on every PDF and email you send.',
  },
  {
    q: 'Do you support taxes and discounts?',
    a: 'Yes. You can set a tax rate (e.g. 20% VAT) and a discount rate on every invoice. Totals are recalculated automatically. The AI will also pick up tax instructions from your description — just say "add 20% VAT" and it applies it.',
  },
  {
    q: 'Can I cancel my Pro subscription anytime?',
    a: 'Yes — cancel any time from the Billing page inside the app. Your Pro access continues until the end of the current billing period. You will never be charged after cancellation. If you change your mind, you can reactivate before the period ends with one click.',
  },
  {
    q: 'Do you store my financial data?',
    a: 'Crystal Invoice AI stores only the invoice data you create — client names, amounts, line items. It does not store bank account details, card numbers, or tax records. Payment processing is handled entirely by Stripe, which is PCI-compliant. We never see your card details.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20 px-4" id="faq">
      <div className="max-w-3xl mx-auto">
        <MotionDiv y={20} opacity={0}>
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-crystal-400 mb-3">
              FAQ
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Questions? We have answers.
            </h2>
          </div>
        </MotionDiv>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <MotionDiv key={i} y={20} opacity={0} delay={i * 0.1}>
                <motion.div
                  className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden"
                  whileHover={{ scale: 1.02, y: -4, boxShadow: '0 0 35px rgba(99,102,241,0.45), 0 0 70px rgba(99,102,241,0.18), 0 28px 55px rgba(0,0,0,0.55)' }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-white/[0.03] transition-colors duration-200"
                  >
                    <span className="text-sm font-semibold text-white/90">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown
                        className="w-4 h-4 text-white/40 shrink-0"
                        aria-hidden="true"
                      />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm text-white/55 leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </MotionDiv>
            )
          })}
        </div>
      </div>
    </section>
  )
}
