/**
 * Plan limits — single source of truth.
 * When Stripe is added, paid users will bypass these.
 */
export const FREE_INVOICE_LIMIT = 3

export const PLANS = {
  free: {
    name: 'Free',
    invoiceLimit: FREE_INVOICE_LIMIT,
    price: 0,
  },
  pro: {
    name: 'Pro',
    invoiceLimit: Infinity,
    price: 9, // USD/month — placeholder until Stripe is set up
  },
} as const
