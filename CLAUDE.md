# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs both Next.js :3000 and Express :3001)
npm run dev:all

# Individual services
npm run dev        # Next.js only
npm run server     # Express only (tsx server/index.ts)

# Build & lint
npm run build      # Runs: prisma generate && next build
npm run lint       # next lint

# Database
npm run prisma:generate   # Regenerate Prisma client
npm run prisma:push       # Push schema changes (dev only)
npm run prisma:studio     # Open Prisma Studio GUI
```

There is no test suite.

## Architecture: Two-Service Backend

The app runs as **two separate services**:

1. **Next.js (Vercel)** — App Router, API routes, auth, database, Stripe
2. **Express (Railway)** — Puppeteer PDF generation + Claude AI calls

The split exists because Puppeteer and Claude API calls exceed Vercel's 10s timeout and memory limits. The Express server URL is set via `NEXT_PUBLIC_EXPRESS_URL`.

Frontend hooks bridge the two:
- `src/ai/useInvoiceAI.ts` → calls Express `POST /api/ai/generate`
- `src/ai/usePDF.ts` → calls Express `POST /api/pdf/generate`

## Key Architectural Decisions

**Prisma 7 with PrismaPg adapter** — The `schema.prisma` has no `url` field; the connection string is configured in `prisma.config.ts` using a `pg.Pool`. Use `DATABASE_URL` for pooled connections (Neon) and `DATABASE_URL_NEON_DIRECT` for migrations.

**AI output validation** — The AI response is never blindly trusted. `src/utils/ai-parser.ts` validates every field, clamps rates to 0–100%, enforces ISO date format, and recalculates totals. Claude is prompted with a prefill (`{`) to force valid JSON output.

**Soft deletes** — Invoices are never hard-deleted on the primary delete action. Status becomes `trashed`, original status is saved in `originalStatus`, and `deletedAt` is set. The trash page uses `?status=trashed`. Permanent deletion is a separate explicit action.

**Stripe webhooks own all state** — Subscription status (isPro, stripeSubscriptionId, stripeCustomerId) is only written by the webhook handler at `src/app/api/stripe/webhook/route.ts`. Never update these fields from other routes.

**PDF token flow** — Express generates a PDF in memory, stores it with a one-time token (5-min TTL), and returns the token. The frontend then fetches `GET /api/pdf/download/:token`.

**Email logo delivery** — Logos are served via `GET /api/public/logo/[id]` (no auth) with a `?v=<updatedAt>` cache-buster to defeat Gmail's aggressive image caching. Never use CID inline attachments.

**Currency** — Stored on both `User.invoiceCurrency` (default) and `Invoice.currency`. Changing the default in settings uses an atomic transaction to update both. Format with `Intl.NumberFormat`.

**Free tier enforcement** — Max 3 invoices for free users. Checked server-side in `GET /api/invoices/usage`. The `UsageBanner` component displays remaining quota.

## File Layout

```
src/app/           Next.js App Router pages + API routes
src/components/    React components (invoice/, landing/ subdirs)
src/ai/            Custom hooks for AI and PDF Express calls
src/lib/           Singleton clients: prisma, stripe, resend, auth, plans
src/utils/         Shared pure utilities: ai-parser, invoice-calculations,
                   invoice-types, pdf-template, email-template
server/            Express backend (AI + PDF only)
prisma/            Schema + migrations
```

## Environment Variables

Required for full functionality:

```bash
DATABASE_URL                        # Neon pooled URL
DATABASE_URL_NEON_DIRECT            # Neon direct URL (for migrations)
NEXTAUTH_SECRET                     # JWT signing key
NEXTAUTH_URL                        # e.g. https://crystalinvoiceai.com
ANTHROPIC_API_KEY                   # Claude Haiku
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_ID
RESEND_API_KEY
RESEND_FROM                         # e.g. Crystal Invoice AI <noreply@domain.com>
EXPRESS_PORT                        # default 3001
NEXT_PUBLIC_EXPRESS_URL             # Express server base URL
NEXT_PUBLIC_APP_URL                 # App base URL
```

## Deployment

- **Vercel** — `vercel.json` sets `buildCommand: "npx prisma generate && next build"`
- **Railway** — `railway.toml` starts with `npx tsx server/index.ts`, health check at `/health`
- **Docker** — `Dockerfile` installs Chromium dependencies for Puppeteer, runs Express server
