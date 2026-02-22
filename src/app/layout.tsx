import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

const APP_URL = 'https://crystalinvoiceai.com'
const TITLE = 'Crystal Invoice AI — Smart, Fast, Beautiful Invoicing'
const DESCRIPTION =
  'Generate invoices instantly with AI. Export PDFs, send emails, track payment status, and manage clients effortlessly. Free to start.'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['AI invoicing', 'invoice generator', 'freelance invoice', 'small business invoice', 'payment tracking', 'professional invoice', 'AI-powered invoicing', 'invoice app', 'billing software'],
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: APP_URL,
    siteName: 'Crystal Invoice AI',
    // TODO: Replace with a real OG image (1200×630px) at /public/og-image.png
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Crystal Invoice AI' }],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    // TODO: Replace with real Twitter OG image at /public/og-image.png
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: APP_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Crystal Invoice AI',
    operatingSystem: 'WEB',
    applicationCategory: 'BusinessApplication',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '150',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: DESCRIPTION,
    softwareHelp: {
      '@type': 'CreativeWork',
      url: `${APP_URL}/faq`,
    },
    url: APP_URL,
    image: `${APP_URL}/og-image.png`,
    publisher: {
      '@type': 'Organization',
      name: 'Crystal Invoice AI',
      url: APP_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${APP_URL}/icon.png`,
        width: '60',
        height: '60',
      },
    },
  }

  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gradient-to-br from-slate-950 via-slate-900 to-crystal-950 text-white min-h-screen antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
