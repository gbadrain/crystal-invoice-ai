import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { BillingClient } from './BillingClient'

export const metadata = { title: 'Billing — Crystal Invoice' }

export default async function BillingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/auth/signin')

  const user = await prisma.user.findUnique({
    where: { email: session.user!.email! },
    select: { isPro: true, stripeCustomerId: true, stripeSubscriptionId: true },
  })

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-white mb-2">Billing</h1>
      <p className="text-white/40 text-sm mb-8">Manage your plan and subscription.</p>
      <BillingClient
        isPro={user?.isPro ?? false}
        hasStripeCustomer={!!user?.stripeCustomerId}
      />
    </div>
  )
}
