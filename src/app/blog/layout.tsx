import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s — Crystal Invoice AI Blog',
    default: 'Blog — Crystal Invoice AI',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${cormorant.variable} ${dmSans.variable} font-dm-sans`}>
      {children}
    </div>
  )
}
