'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/cn'

const TABS = [
  { label: 'Profile', href: '/settings/profile' },
  { label: 'Password', href: '/settings/password' },
  { label: 'Invoice Defaults', href: '/settings/invoice-defaults' },
  { label: 'Danger Zone', href: '/settings/danger-zone' },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="max-w-3xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-2 text-sm text-slate-400">Manage your account, preferences, and defaults.</p>
      </div>

      {/* Tab nav */}
      <nav className="flex gap-1 mb-8 p-1 rounded-xl bg-slate-900/70 ring-1 ring-slate-800 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-crystal-600/20 text-white ring-1 ring-crystal-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {children}
    </div>
  )
}
