'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Is my data safe?',
    a: 'Yes. All invoices are stored in a private PostgreSQL database tied to your account. No other user can access your data. Passwords are hashed with bcrypt and never stored in plain text. All connections use HTTPS/TLS.',
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
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-crystal-400 mb-3">
            FAQ
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Questions? We have answers.
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-white/[0.03] transition-colors duration-200"
                >
                  <span className="text-sm font-semibold text-white/90">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-white/40 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-6 pb-5 text-sm text-white/55 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
