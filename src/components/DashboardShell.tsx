import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

/**
 * Shared layout wrapper used in two places:
 *   1. src/app/page.tsx          — authenticated branch of the smart root
 *   2. src/app/(dashboard)/layout.tsx — all sub-routes (/invoices, /trash, …)
 *
 * Keeping it here means the Sidebar + Header markup is defined exactly once.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8 pt-24">{children}</main>
      </div>
    </div>
  )
}
