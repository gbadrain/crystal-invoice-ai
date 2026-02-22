import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Crystal Invoice AI',
  description: 'Privacy policy for Crystal Invoice AI.',
}

export default function PrivacyPage() {
  const updated = 'February 2026'

  return (
    <div className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      {/* Back link */}
      <Link href="/" className="text-sm text-crystal-400 hover:text-crystal-300 transition-colors mb-10 inline-block">
        ← Back to Crystal Invoice AI
      </Link>

      <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-white/40 text-sm mb-10">Last updated: {updated}</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <Section title="1. Overview">
          Crystal Invoice AI (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This Policy explains what data we collect, why we collect it, and how it is used when you use our Service at crystalinvoiceai.com.
        </Section>

        <Section title="2. Data We Collect">
          <ul className="list-disc list-inside mt-3 space-y-2 text-white/50">
            <li><strong className="text-white/70">Account data:</strong> Email address and hashed password when you register</li>
            <li><strong className="text-white/70">Invoice data:</strong> Client names, addresses, emails, line items, amounts you create within the app</li>
            <li><strong className="text-white/70">Profile data:</strong> Optional profile avatar you upload</li>
            <li><strong className="text-white/70">Billing data:</strong> Stripe customer and subscription IDs (we never store card numbers)</li>
            <li><strong className="text-white/70">Usage data:</strong> Invoice counts for plan enforcement</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Data">
          <ul className="list-disc list-inside mt-3 space-y-2 text-white/50">
            <li>To provide, maintain, and improve the Service</li>
            <li>To authenticate your account and protect it from unauthorised access</li>
            <li>To process subscription payments via Stripe</li>
            <li>To deliver invoice emails to your clients via Resend</li>
            <li>To enforce plan limits (free vs Pro)</li>
          </ul>
        </Section>

        <Section title="4. Third-Party Services">
          We share data with the following trusted third parties solely to operate the Service:
          <ul className="list-disc list-inside mt-3 space-y-2 text-white/50">
            <li><strong className="text-white/70">Stripe</strong> — payment processing (PCI-compliant; we never see card details)</li>
            <li><strong className="text-white/70">Resend</strong> — transactional email delivery</li>
            <li><strong className="text-white/70">Anthropic</strong> — AI invoice generation (your description is sent to Claude; no data is stored by Anthropic for training without consent)</li>
            <li><strong className="text-white/70">Neon / PostgreSQL</strong> — database hosting</li>
            <li><strong className="text-white/70">Vercel / Railway</strong> — application hosting</li>
          </ul>
          We do not sell, rent, or trade your personal data with any third party for marketing purposes.
        </Section>

        <Section title="5. Data Retention">
          We retain your account data and invoice data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, subject to any legal obligations to retain records.
        </Section>

        <Section title="6. Security">
          All data is transmitted over HTTPS. Passwords are hashed using bcrypt and never stored in plain text. Access to your invoice data is session-authenticated — no other user can access your data.
        </Section>

        <Section title="7. Cookies">
          We use a minimal session cookie (set by NextAuth) to keep you signed in. We do not use tracking, advertising, or analytics cookies.
        </Section>

        <Section title="8. Your Rights">
          Depending on your location, you may have rights to access, correct, or delete your personal data. To exercise any of these rights, contact us at{' '}
          <a href="mailto:support@crystalinvoiceai.com" className="text-crystal-400 hover:underline">
            support@crystalinvoiceai.com
          </a>.
        </Section>

        <Section title="9. Children">
          The Service is not directed at children under 16. We do not knowingly collect personal data from children.
        </Section>

        <Section title="10. Changes to this Policy">
          We may update this Privacy Policy periodically. We will notify you of material changes via email or an in-app notice. Continued use of the Service after changes are posted constitutes acceptance.
        </Section>

        <Section title="11. Contact">
          For privacy-related questions or requests, contact:{' '}
          <a href="mailto:support@crystalinvoiceai.com" className="text-crystal-400 hover:underline">
            support@crystalinvoiceai.com
          </a>
          <br />
          <br />
          You can also review our{' '}
          <Link href="/terms" className="text-crystal-400 hover:underline">
            Terms of Service
          </Link>.
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
