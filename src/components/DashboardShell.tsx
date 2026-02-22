'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { cn } from '@/utils/cn'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          'lg:ml-64'
        )}
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8 pt-20 sm:pt-24">{children}</main>
      </div>
    </div>
  )
}
