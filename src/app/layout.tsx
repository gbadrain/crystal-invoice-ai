import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Crystal Invoice AI',
  description: 'AI-powered invoice generator',
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
        {children}
      </body>
    </html>
  )
}
