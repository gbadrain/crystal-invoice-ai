'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FilePlus, FileText, Trash, Settings } from 'lucide-react'
import { cn } from '@/utils/cn'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'New Invoice', href: '/invoices/new', icon: FilePlus },
  { label: 'Trash', href: '/trash', icon: Trash },
  { label: 'Settings', href: '/settings/password', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [trashCount, setTrashCount] = useState(0)

  const fetchTrashCount = useCallback(async () => {
    try {
      const res = await fetch(`/api/invoices?status=trashed`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setTrashCount(data.total ?? 0)
      }
    } catch {
      // Silently fail — badge just won't show
    }
  }, [])

  useEffect(() => {
    fetchTrashCount()
    // Poll every 5 seconds to keep badge fresh
    const interval = setInterval(fetchTrashCount, 5000)
    return () => clearInterval(interval)
  }, [fetchTrashCount])

  // Listen for custom event so pages can trigger instant refresh
  useEffect(() => {
    const handler = () => fetchTrashCount()
    window.addEventListener('trash-updated', handler)
    return () => window.removeEventListener('trash-updated', handler)
  }, [fetchTrashCount])

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 glass-panel-solid border-r border-white/10 flex flex-col">
      {/* Branding */}
      <div className="px-6 py-6 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-crystal-400">Crystal</span>{' '}
          <span className="text-white/80">Invoice</span>
        </h1>
        <p className="text-xs text-white/40 mt-1">AI-Powered Invoicing</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/settings/password'
            ? (pathname ?? '').startsWith('/settings')
            : pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-crystal-600/20 text-crystal-300 border border-crystal-500/20'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.href === '/trash' && trashCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {trashCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
