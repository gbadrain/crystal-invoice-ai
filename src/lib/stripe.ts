import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[Stripe] STRIPE_SECRET_KEY is required in production.')
  }
  console.warn('[Stripe] STRIPE_SECRET_KEY is not set — Stripe features will be unavailable.')
}

if (!process.env.STRIPE_PRO_PRICE_ID) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[Stripe] STRIPE_PRO_PRICE_ID is required in production.')
  }
  console.warn('[Stripe] STRIPE_PRO_PRICE_ID is not set — Pro upgrade will be unavailable.')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-01-28.clover',
})

export const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID as string
