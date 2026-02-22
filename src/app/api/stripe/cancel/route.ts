import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

// POST /api/stripe/cancel
// Toggle cancel_at_period_end on the active subscription.
// body: { reactivate: true } → un-cancel (keep Pro)
// body: {} or omitted     → schedule cancellation at period end
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user!.email! },
      select: { stripeSubscriptionId: true },
    })

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found.' }, { status: 404 })
    }

    const body = await req.json().catch(() => ({}))
    const reactivate = body?.reactivate === true

    const updated = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: !reactivate,
    })

    return NextResponse.json({
      cancelAtPeriodEnd: updated.cancel_at_period_end,
      cancelAt: updated.cancel_at ? new Date(updated.cancel_at * 1000).toISOString() : null,
      currentPeriodEnd: updated.cancel_at ? new Date(updated.cancel_at * 1000).toISOString() : null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Stripe cancel] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
