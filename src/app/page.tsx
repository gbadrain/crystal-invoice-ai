import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { LandingPage } from '@/components/LandingPage'
import { DashboardShell } from '@/components/DashboardShell'
import { DashboardPage } from '@/components/DashboardPage'

/**
 * Smart root route.
 *
 * Unauthenticated → public landing page with embedded sign-in card.
 * Authenticated   → full dashboard (same layout as /invoices, /trash, etc.)
 *
 * We call getServerSession() directly here so Next.js can render the correct
 * branch on the server without an extra client round-trip.
 */
export default async function RootPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return <LandingPage />
  }

  return (
    <DashboardShell>
      <DashboardPage />
    </DashboardShell>
  )
}
