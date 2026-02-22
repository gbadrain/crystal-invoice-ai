import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Crystal Invoice AI',
  description: 'Terms of service for Crystal Invoice AI.',
}

export default function TermsPage() {
  const updated = 'February 2026'

  return (
    <div className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      {/* Back link */}
      <Link href="/" className="text-sm text-crystal-400 hover:text-crystal-300 transition-colors mb-10 inline-block">
        ← Back to Crystal Invoice AI
      </Link>

      <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
      <p className="text-white/40 text-sm mb-10">Last updated: {updated}</p>

      <div className="space-y-8 text-white/60 text-sm leading-relaxed">
        <Section title="1. Acceptance of Terms">
          By accessing or using Crystal Invoice AI (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
        </Section>

        <Section title="2. Description of Service">
          Crystal Invoice AI is a web-based application that allows users to generate, manage, and send invoices using AI-assisted tools. The Service includes AI-generated invoice creation, PDF export, email delivery, and subscription billing.
        </Section>

        <Section title="3. Account Registration">
          You must register an account to use the Service. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You agree to provide accurate, current, and complete information during registration.
        </Section>

        <Section title="4. Acceptable Use">
          You agree not to use the Service to:
          <ul className="list-disc list-inside mt-3 space-y-1 text-white/50">
            <li>Violate any applicable law or regulation</li>
            <li>Transmit fraudulent, misleading, or deceptive invoices</li>
            <li>Attempt to gain unauthorised access to other accounts or systems</li>
            <li>Interfere with or disrupt the integrity or performance of the Service</li>
          </ul>
        </Section>

        <Section title="5. Subscription and Payments">
          The Service offers a free tier and a paid Pro subscription ($9/month). Payments are processed by Stripe. You authorise us to charge your payment method on a recurring monthly basis. You may cancel at any time; cancellation takes effect at the end of the current billing period and no refunds are issued for partial months.
        </Section>

        <Section title="6. Data and Privacy">
          Your invoice data is stored securely in a private database associated with your account. We do not sell, rent, or share your personal data with third parties except as necessary to provide the Service (e.g., Stripe for payments, Resend for email delivery). Please review our <Link href="/privacy" className="text-crystal-400 hover:underline">Privacy Policy</Link> for full details.
        </Section>

        <Section title="7. Intellectual Property">
          The Service, including its design, code, and content, is owned by Crystal Invoice AI and protected by applicable intellectual property laws. You retain ownership of the invoice content you create. You grant us a limited licence to store and process that content solely to provide the Service.
        </Section>

        <Section title="8. Disclaimer of Warranties">
          The Service is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, or suitable for any particular purpose.
        </Section>

        <Section title="9. Limitation of Liability">
          To the maximum extent permitted by law, Crystal Invoice AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service.
        </Section>

        <Section title="10. Changes to Terms">
          We may update these Terms at any time. Continued use of the Service after changes are posted constitutes acceptance of the revised Terms. We will notify users of material changes via email or an in-app notice.
        </Section>

        <Section title="11. Governing Law">
          These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
        </Section>

        <Section title="12. Contact">
          For questions about these Terms, contact us at{' '}
          <a href="mailto:support@crystalinvoiceai.com" className="text-crystal-400 hover:underline">
            support@crystalinvoiceai.com
          </a>.
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-white/80 mb-2">{title}</h2>
      <div className="text-white/55">{children}</div>
    </div>
  )
}
