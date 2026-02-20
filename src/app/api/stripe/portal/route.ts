import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

// POST /api/stripe/portal — open Stripe Customer Portal (manage/cancel subscription)
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user!.email! } })
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account found.' }, { status: 404 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/billing`,
  })

  return NextResponse.json({ url: portalSession.url })
}
