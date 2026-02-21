import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Crystal Invoice AI',
  description: 'AI-powered invoice generator',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gradient-to-br from-slate-950 via-slate-900 to-crystal-950 text-white min-h-screen antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
