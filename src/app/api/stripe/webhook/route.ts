import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

// Must disable body parsing — Stripe needs the raw body to verify signature
export const config = { api: { bodyParser: false } }

async function setUserPro(customerId: string, isPro: boolean, subscriptionId?: string) {
  await prisma.user.update({
    where: { stripeCustomerId: customerId },
    data: {
      isPro,
      stripeSubscriptionId: subscriptionId ?? null,
    },
  })
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 })
  }

  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[Stripe webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.customer) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          await setUserPro(session.customer as string, true, sub.id)
          console.log('[Stripe] User upgraded to Pro:', session.customer)
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const isActive = sub.status === 'active' || sub.status === 'trialing'
        await setUserPro(sub.customer as string, isActive, sub.id)
        console.log(`[Stripe] Subscription updated (${sub.status}):`, sub.customer)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await setUserPro(sub.customer as string, false)
        console.log('[Stripe] Subscription cancelled — user downgraded:', sub.customer)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.warn('[Stripe] Payment failed for customer:', invoice.customer)
        // Optionally email the user — for now just log
        break
      }

      default:
        // Unhandled event type — ignore
        break
    }
  } catch (err) {
    console.error('[Stripe webhook] Handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
