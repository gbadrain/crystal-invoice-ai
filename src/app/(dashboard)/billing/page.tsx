import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'
import { BillingClient } from './BillingClient'
import { BillingSkeleton } from './BillingSkeleton'

export const metadata = { title: 'Billing — Crystal Invoice' }

async function BillingPageContent() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/auth/signin')

  const user = await prisma.user.findUnique({
    where: { email: session.user!.email! },
    select: { isPro: true, stripeCustomerId: true, stripeSubscriptionId: true },
  })

  let cancelAtPeriodEnd = false
  let currentPeriodEnd: string | null = null

  if (user?.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
      cancelAtPeriodEnd = sub.cancel_at_period_end
      currentPeriodEnd = sub.cancel_at
        ? new Date(sub.cancel_at * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : null
    } catch {
      // Ignore Stripe errors
    }
  }

  return (
    <BillingClient
      isPro={user?.isPro ?? false}
      hasStripeCustomer={!!user?.stripeCustomerId}
      cancelAtPeriodEnd={cancelAtPeriodEnd}
      currentPeriodEnd={currentPeriodEnd}
    />
  )
}

export default function BillingPage() {
  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Billing
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage your plan and subscription details.
          </p>
        </div>
      </div>
      <Suspense fallback={<BillingSkeleton />}>
        <BillingPageContent />
      </Suspense>
    </div>
  )
}
