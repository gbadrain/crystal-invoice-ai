import { requireUser } from '@/lib/requireUser'
import { DashboardShell } from '@/components/DashboardShell'

/**
 * Auth gate for all /invoices, /trash, etc. sub-routes.
 * requireUser() redirects to /auth/signin?callbackUrl=<current-path>
 * if no session is present, so no page inside (dashboard)/ can be
 * accessed without authentication.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUser()
  return <DashboardShell>{children}</DashboardShell>
}
