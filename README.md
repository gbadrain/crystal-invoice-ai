# Crystal Invoice AI

**[crystalinvoiceai.com](https://crystalinvoiceai.com)** — Live in production

> ### Say the job. Crystal does the rest.
> **Speak into the mic → AI builds the invoice → professional PDF → emailed to your client.**
> Free to start. No forms. No fuss.

| | |
|---|---|
| 🎙️ **Voice or text** | Describe your job out loud or type it in plain English |
| 🤖 **AI-generated** | Line items, rates, tax, client details — extracted instantly |
| 📄 **Professional PDF** | Clean, A4-formatted — consistent across every device |
| 📧 **Send to client** | One button emails the invoice with PDF attached |
| ✅ **Free to start** | 3 invoices free — upgrade to Pro for unlimited |

---

> **Coming Soon — Industry-Specific Invoice Templates**
> Pre-built for the way each trade actually works:
> Dentist · Handyman · Restaurant · Online Business · Personal Trainer · Cleaner · Consultant · Builder · Photographer

---

## The Problem This Solves

Most invoice tools are built for accountants. They demand you know line items, tax codes, and formatting conventions before you've even started. For a freelancer who just finished a job, the invoicing step feels like a second job.

The common pattern:
1. Open a template
2. Manually fill in client details
3. Manually key in every line item
4. Calculate tax and discount by hand
5. Export a PDF
6. Email it separately

Crystal Invoice AI collapses this into **one step**: describe your work in plain English, and the application handles everything else.

---

## What Crystal Invoice AI Is

Crystal Invoice AI is a full-stack SaaS platform built for service-based freelancers — cleaners, contractors, consultants, designers, tradespeople — who need to invoice clients fast without wrestling with software.

It is **not** an accounting suite. It does not manage payroll, chart of accounts, or tax filing. It does one thing exceptionally well: **turn a natural language job description into a professional, deliverable invoice**.

---

## How It Was Designed

### Phase 1 — Defining the Core Loop

The entire product was designed around one user action:

> *"I fixed two boilers at £200 each for James at 14 Clover Lane. Add 20% VAT."*

That sentence contains a complete invoice. The question was: can the application extract all of it reliably? The answer, using a large language model as a structured extraction engine, is yes.

The design decision was to make the AI the **entry point**, not a helper buried in settings. The first thing a user sees when creating an invoice is a plain-text box and a microphone button — not a form.

### Phase 2 — Choosing the Architecture

Three architectural constraints shaped the system:

1. **Data must be owned by the user.** All invoices live in a user-specific PostgreSQL database with session-authenticated access. There is no shared data pool.

2. **PDF generation must be pixel-perfect.** Browser-based PDF libraries produce inconsistent output across fonts and layouts. The decision was to use Puppeteer (headless Chromium) running inside a dedicated Express server — the same rendering engine as Chrome's print dialog.

3. **The AI layer must be stateless and independently scalable.** The Anthropic API call and the Puppeteer process are computationally different from the CRUD operations. Running them on a separate Express service (deployed to Railway) keeps the Next.js frontend lean and separates concerns cleanly.

**Result**: Two backends working in concert.
- **Next.js (Vercel)** — authentication, invoice CRUD, billing, and routing
- **Express (Railway)** — AI generation and PDF rendering

### Phase 3 — Building the Form Experience

The invoice form was designed so that AI-generated content **pre-fills every field** but the user can override anything. The form is not locked after AI generation — it is simply a starting point. Every field is editable. Line items can be added, removed, or repriced. Tax and discount rates are adjustable sliders.

The AI output is never trusted blindly. A dedicated parser (`src/utils/ai-parser.ts`) validates every field the model returns: dates are enforced as ISO format, rates are clamped between 0–100%, totals are recalculated independently, and line item IDs are regenerated client-side. The AI provides intent; the application provides correctness.

### Phase 4 — Closing the Loop (PDF + Email)

An invoice that cannot be delivered is incomplete. Two delivery mechanisms were built:

- **PDF Download** — Puppeteer renders the invoice as an A4 PDF. The binary is held in memory for five minutes with a one-time token, then purged automatically. The user gets a native browser download, not a web preview.
- **Send to Client** — A single button emails the client a fully styled HTML invoice via Resend, with the PDF attached as a binary file. If the invoice is in draft status, it is automatically promoted to `pending` after sending.

### Phase 5 — Lifecycle and Trash

Invoices have a full lifecycle: `draft → pending → paid / overdue`. Deletion is non-destructive — invoices move to a trash state and can be restored individually or in bulk. Permanent deletion requires explicit confirmation. The original status is preserved so a restored invoice returns exactly where it was.

### Phase 6 — Subscription Billing

A complete Stripe integration handles the full subscription lifecycle without any manual intervention:

- **Upgrade** — User clicks "Upgrade to Pro" → hosted Stripe Checkout → payment captured → webhook fires → account upgraded instantly
- **Auto-billing** — Stripe charges the card automatically every month. On failure, Stripe retries automatically over several days
- **Cancel** — In-app "Cancel Plan" button opens a confirmation dialog. Cancellation is scheduled for end of billing period — the user keeps Pro access until then. An amber banner shows the exact cancellation date with a "Keep Pro" reactivate option
- **Downgrade** — When the billing period ends, Stripe fires `customer.subscription.deleted` → webhook sets `isPro = false` → account downgrades automatically. Zero manual steps required

---

## Technical Architecture

| Layer | Technology | Deployment |
|---|---|---|
| Frontend + CRUD API | Next.js 14 (TypeScript) | Vercel |
| PDF + AI API | Express 4 (Node.js) | Railway |
| Database | PostgreSQL + Prisma 7 | Neon (managed Postgres) |
| Authentication | NextAuth v4 (JWT) | — |
| Payments | Stripe (subscriptions) | — |
| Email | Resend | — |
| AI Model | Anthropic Claude Haiku | — |
| Styling | Tailwind CSS | — |

**Key architectural decisions:**
- Prisma 7 uses the `PrismaPg` adapter pattern (no URL in schema file, connection pooling via `pg.Pool`)
- All code lives in `src/` — the path alias `@/*` maps to `src/*`
- NextAuth uses JWT strategy — no database session table needed
- PDF files are stored in Node.js memory with token-based one-time retrieval (no S3 dependency)
- AI output is constrained via assistant prefill (`{`) to force valid JSON from Claude Haiku
- Stripe webhook handles all subscription state transitions — no polling, no cron jobs

---

## Key Features

### AI Invoice Generation
Describe a job in plain text and the AI extracts client name, email, address, line items, rates, quantities, tax, and discounts. The form pre-fills instantly — every field is editable before saving.

### Voice Input
Speak your invoice description hands-free. A mic button sits directly inside the input field. When active, it pulses red and displays a live "Listening… speak now" indicator. Tap again to stop and generate. No extra app, no third-party transcription service — powered entirely by the browser's Web Speech API.

### Professional PDF Export
Every invoice renders as a clean, A4-formatted PDF — consistent fonts, spacing, and layout on every device and browser. No browser print dialog quirks.

### Send to Client
One button emails the client a fully formatted HTML invoice with the PDF attached. The client receives a styled email and a downloadable PDF in a single delivery. Status is automatically updated from draft to pending after sending.

### Password Reset & Account Security
Full self-service password reset via email token — no admin intervention required. Users who forget their password receive a time-limited reset link. Authenticated users can change their password at any time from the Settings page.

### Payment Tracking
Invoices move through a clear status lifecycle. The dashboard surfaces outstanding totals, overdue invoices, and revenue collected at a glance.

### Trash and Restore
Soft deletion with full restore capability. Nothing is permanently deleted unless explicitly confirmed.

### Company Logo
Upload a PNG, JPG, or SVG (up to 500 KB). The logo is stored as a base64 data URL in PostgreSQL and automatically embedded in every PDF and every email sent to clients. Changing the logo on an invoice updates both outputs immediately — no cache delay.

### Auto Overdue Detection
Every time the invoice list loads, pending invoices whose due date has passed are automatically promoted to `overdue`. No cron job required — the status is always accurate at list-read time.

### Stripe Subscription Billing
Live Stripe integration handles the complete subscription lifecycle:

| | Free | Pro ($9/month) |
|---|---|---|
| Invoices | 3 | Unlimited |
| AI generation | ✅ | ✅ |
| PDF export | ✅ | ✅ |
| Send to client | ✅ | ✅ |
| Priority support | — | ✅ |

- Stripe charges the card automatically each month — no action required from the user or owner
- Stripe takes 2.9% + $0.30 per transaction; the remainder is paid out to the owner's bank account on a rolling basis
- Card failures are retried automatically by Stripe before escalating
- Cancellation is scheduled for end of billing period — users never lose access mid-cycle
- The owner receives $8.44 net per active subscriber per month

### In-App Subscription Management
Pro subscribers manage their plan entirely within the app — no need to email support:
- **Manage Subscription** — opens Stripe's hosted portal for card updates, payment history, and invoice downloads
- **Cancel Plan** — confirmation dialog with exact end date; cancellation is never immediate
- **Keep Pro** — one-click reactivation if the user changes their mind before the period ends
- **Scheduled cancellation banner** — amber warning showing the exact date access ends, with a reactivate button inline

### Freemium Model
Free users get three invoices. Pro users get unlimited invoices and full feature access. The upgrade path is inline — no separate checkout page required.

---

## What Makes This Different

Most invoice generators are **form-first**. They expect you to fill in boxes. Crystal Invoice AI is **language-first**. It expects you to talk about your work the way you naturally would.

This is a meaningful distinction for the niche it targets.

**A cleaning company owner does not think in line items.** They think: "I did three houses for Sarah this week at £80 each." Translating that mental model into a structured form is friction. Crystal Invoice AI removes that friction entirely.

**A plumber finishing a job on-site** does not want to open a laptop, log into a portal, and navigate a form. They want to type one sentence into their phone and hit send. The mobile-responsive interface, voice input, and one-tap email delivery are designed for exactly this workflow.

**The output is indistinguishable from software costing 10× more.** The PDF is clean, professional, and branded. The email is styled. The status tracking is thorough. There is no visible compromise that signals "this was built fast."

---

## The Niche

Crystal Invoice AI is explicitly not for:
- Accountants managing multiple clients' books
- Businesses with complex inventory or payroll
- Companies needing double-entry bookkeeping or audit trails

It is explicitly for:
- **Freelancers** who invoice irregularly and need speed over structure
- **Sole traders and micro-businesses** in service industries (cleaning, trades, consulting, creative work)
- **People who hate invoicing** and have been using Word documents or spreadsheets until now

The market this serves is large, underserved by existing tools, and highly price-sensitive. A $9/month Pro plan is the right price point. A zero-config free tier with a meaningful limit is the right acquisition strategy.

---

## Challenges Encountered

### Prisma 7 — Breaking Changes
Prisma 7 removed the `url` field from the `datasource` block in `schema.prisma`. The connection string must now be provided via a separate `prisma.config.ts` file and the `PrismaPg` adapter. This was a non-obvious breaking change that required a complete rearchitecture of the database connection layer before a single query could run.

### Next.js 14 Router Cache — Silent Stale State
After sign-in, calling `router.push('/')` on the landing page appeared to do nothing — the user remained on the unauthenticated view. The root cause: Next.js 14 serves a cached RSC (React Server Component) payload for same-URL navigations, completely bypassing the server. The fix was to use `window.location.href = '/'` — a full HTTP request — which forces the server to re-evaluate the session and render the authenticated dashboard.

### Browser Autofill and SSR Hydration
Password manager autofill was being wiped on the landing page sign-in form. The cause: React hydration touches input DOM nodes and clears values that autofill has already injected. The fix was to extract the sign-in card into its own component and load it with `next/dynamic({ ssr: false })` — making it entirely client-rendered, bypassing hydration interference.

### Puppeteer in a Containerised Environment
Puppeteer requires a full Chrome installation. In Docker on Railway's Node.js 22 slim image, several native dependencies (`libasound2`, `libgbm1`, `libxss1`) are absent by default. Each missing dependency is a silent launch failure — Puppeteer attempts to launch Chrome, fails, and returns a generic error. The Dockerfile was built incrementally to identify and install each required system package.

### AI Output Reliability
Claude Haiku is fast and cost-effective but its JSON output is not perfectly consistent across all inputs. The assistant prefill technique (beginning the model's response with `{`) dramatically increased reliability. Even so, a dedicated validation and sanitisation layer was necessary to handle edge cases — malformed dates, rates outside valid ranges, missing fields, and hallucinated values.

### CORS Across Two Origins
The Express backend (Railway) needs to accept requests from the Next.js frontend (Vercel). With production deployments using dynamic Vercel preview URLs, a static CORS allowlist was insufficient. The solution was to explicitly whitelist the production Vercel origin via the `NEXT_PUBLIC_APP_URL` environment variable and allow all origins in development.

### Logo in Email — Gmail CID Limitation
The initial implementation used CID inline attachments to embed the company logo in invoice emails. Gmail ignores CID attachments entirely and renders them as file attachments instead. The fix was to serve the logo via a public (no-auth) HTTPS endpoint (`/api/public/logo/[id]`) and reference it as a standard `<img src="">` in the HTML — a URL every email client can load. A versioned query parameter (`?v=<updatedAt timestamp>`) busts Gmail's aggressive image proxy cache whenever the logo changes.

### Stripe Keys — Trailing Newline Corruption
When adding Stripe API keys to Vercel via the CLI, using `echo "value" | vercel env add` appends a trailing newline to the value. Stripe's SDK treats this as a malformed key and retries the connection multiple times before failing with a cryptic connection error. The fix is to pipe with `printf '%s' 'value' | vercel env add` — which writes the value with no trailing newline.

### Stripe Test→Live Mode Migration
Customer IDs created in Stripe's test mode (`cus_...`) are siloed — they do not exist in live mode. When the application was switched from test keys to live keys, the database still held test-mode customer IDs. Any API call using those IDs against the live Stripe endpoint returns "No such customer" with no clear indication of why. The fix was to identify the stale IDs via a direct database query, clear `stripeCustomerId` and `stripeSubscriptionId` from the affected user records, and allow the checkout flow to create fresh live-mode customer IDs on the next real payment.

### Prisma Migration Recorded but Column Not Created
A `prisma migrate dev` run created the migration file and recorded it in `_prisma_migrations`, but the actual `ALTER TABLE` never executed against the production database — the `logo` column was missing from the live table. Root cause: `prisma migrate deploy` uses a PostgreSQL advisory lock (`pg_advisory_lock`) which times out on Neon's serverless connection pooler (error P1002). The fix was to bypass the migration runner entirely and execute the `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS logo TEXT` statement directly via `node-pg` against the non-pooled `DATABASE_URL_NEON_DIRECT` connection string.

---

## Getting Started (Local Development)

**Prerequisites**: Node.js >=20.19.0, PostgreSQL running locally

```bash
git clone https://github.com/your-username/crystal-invoice-ai.git
cd crystal-invoice-ai
npm install
cp .env.example .env   # fill in your keys
npx prisma db push     # create tables
npm run dev:all        # Next.js :3000 + Express :3001
```

All required environment variables are documented in `.env.example` with setup instructions for each service (Anthropic, Stripe, Resend). Stripe and Resend are optional for local development — the app degrades gracefully without them.

---

## Deployment

The application is deployed as two independent services:

- **Vercel**: The Next.js frontend, API routes, and database access
- **Railway**: The Express server handling PDF generation and AI calls

Local development runs both concurrently:
```bash
npm run dev:all
```

Required environment variables are documented in `.env.example`. The application gracefully degrades when optional services (Stripe, Resend) are not configured — features are hidden or disabled rather than throwing errors.

---

## Status

All core features are implemented, tested, and live in production at [crystalinvoiceai.com](https://crystalinvoiceai.com):

- User registration and authentication
- Password reset (email token) and change-password (settings)
- Full invoice CRUD with soft delete and restore
- AI generation via Claude Haiku
- Voice input via Web Speech API
- PDF generation via Puppeteer (Railway)
- Email delivery via Resend (verified custom domain) — HTML invoice + PDF attachment
- Company logo — uploaded once, persisted to DB, embedded in PDF and email
- Auto overdue detection — pending invoices past due date auto-promote to `overdue` on list load
- Stripe subscription billing — **live payments active** ($9/month, auto-debit monthly)
- In-app subscription management — Cancel Plan (with confirmation), Keep Pro reactivate, scheduled-cancellation banner with exact end date
- Stripe Customer Portal — card updates, invoice history, and cancellation via hosted Stripe UI
- Billing success/cancellation banners on return from Stripe
- Freemium enforcement — free tier capped at 3 invoices; Pro users are unlimited
- Dashboard with status overview and live trash badge

---

## Owner Operations Guide

This section covers the day-to-day tasks an owner needs to manage the live application — no engineering background required.

---

### Viewing Registered Users

All user accounts are stored in the PostgreSQL database on Neon, regardless of whether they have paid.

**Option 1 — Neon Console (easiest)**
1. Go to [console.neon.tech](https://console.neon.tech)
2. Open your project → **Tables** → select the `users` table
3. All accounts are listed with email, name, plan status, and signup date

**Option 2 — SQL Query**
In the Neon console, open the **SQL Editor** and run:
```sql
SELECT email, name, "isPro", "createdAt"
FROM users
ORDER BY "createdAt" DESC;
```

This shows every account — free and Pro — sorted by most recently signed up.

> **Important:** Stripe only shows customers who have made a payment. The Neon database is the source of truth for all registered accounts.

---

### Viewing Payments and Subscriptions (Stripe)

> Always make sure you are in **Live mode** before checking real payments. The toggle is in the top-left of the Stripe dashboard.

**To check Live mode:** Log in to [dashboard.stripe.com](https://dashboard.stripe.com). In the top-left, the mode label should read **Live** (not Test). Click it to toggle if needed.

| What you want to see | Where to go in Stripe |
|---|---|
| All payments and charges | **Payments → All transactions** |
| Active subscriber list | **Billing → Subscriptions** |
| A specific customer | **Customers** → search by email |
| Refunds issued | **Payments → All transactions** → filter by Refunded |
| Payouts to your bank | **Balance → Payouts** |
| Your monthly revenue | **Home** → Revenue overview |

---

### Issuing a Refund

1. Go to **Payments → All transactions** (Live mode)
2. Click the payment you want to refund
3. Click **Refund payment** in the top-right
4. Choose full or partial refund → confirm

Refunds typically appear on the customer's card within **5–10 business days**.

---

### Subscription Lifecycle (How It Works)

When a customer upgrades to Pro:
1. They click "Upgrade to Pro" in the app → redirected to Stripe Checkout
2. They enter their card → payment captured ($9)
3. Stripe fires a webhook → app automatically sets their account to Pro
4. Stripe auto-charges their card every month — no manual action needed

When a customer cancels:
1. They click "Cancel Plan" in the app → confirm in the dialog
2. Their cancellation is **scheduled for end of the billing period** — they keep Pro access until then
3. When the period ends, Stripe fires a webhook → app automatically downgrades the account
4. The customer can reactivate any time before the period ends

> **Note:** Cancellation is never immediate. Customers always retain access for the full month they paid for. This is enforced at the Stripe level — not just in the UI.

---

### Revenue Breakdown

- **Gross per subscriber:** $9.00 / month
- **Stripe fees:** 2.9% + $0.30 = ~$0.56 per transaction
- **Net per subscriber:** ~$8.44 / month
- Stripe pays out to your linked bank account on a rolling schedule (typically 2-day rolling payouts once enabled)

---

### Dashboards to Bookmark

| Dashboard | URL | What it shows |
|---|---|---|
| Your live site | [crystalinvoiceai.com](https://crystalinvoiceai.com) | The app your customers use |
| Stripe Live | [dashboard.stripe.com](https://dashboard.stripe.com) | Payments, subscribers, payouts |
| Neon (database) | [console.neon.tech](https://console.neon.tech) | All users, invoices, raw data |
| Vercel (frontend) | [vercel.com/dashboard](https://vercel.com/dashboard) | Deployment logs, error monitoring |
| Railway (Express) | [railway.app/dashboard](https://railway.app/dashboard) | PDF/AI server health and logs |

---

## Future Improvements

The current build covers the full core loop — from plain English to delivered invoice. The roadmap below reflects where the product goes next.

### Mobile App
The most requested natural extension. A native iOS and Android app (React Native / Expo) would put voice-to-invoice directly in a tradesperson's pocket — on-site, between jobs, with no laptop required. A **Progressive Web App (PWA)** is a viable near-term step: installable from the browser, offline-capable, with the same voice input already in place.

### AI & Intelligence Upgrades
- **Client memory** — the AI learns past rates, job descriptions, and recurring clients from invoice history. "Invoice John for the usual" becomes a complete invoice.
- **Multi-language generation** — describe a job in any language; the invoice outputs in the client's locale and currency format.
- **Smarter model toggle** — Claude Opus for complex multi-service invoices requiring deeper inference.
- **Auto-categorisation** — line items tagged by type (labour, materials, travel) for cleaner reporting.

### Client & Business Management
- **Client address book** — save and reuse client profiles across invoices; no retyping the same name and address.
- **Multi-business profiles** — one account, multiple trading names or entities, each with its own logo and bank details.
- **Recurring invoices** — schedule auto-generation weekly, monthly, or on a custom cadence.
- **Quote → Invoice conversion** — send a quote or estimate first; convert to a live invoice on client approval.

### Payments & Collections
- **Stripe Payment Links in email** — clients click "Pay Now" directly inside the invoice email and settle the balance online, no bank transfer required.
- **Partial payment recording** — track deposits and staged payments against a single invoice.
- **Automated overdue reminders** — email reminders sent at configurable intervals (3 days, 7 days, 14 days overdue).
- **Payment receipt generation** — auto-issue a receipt PDF when an invoice is marked paid.

### Integrations & Export
- **Accounting software** — QuickBooks, Xero, and FreeAgent export for users who need invoices to feed into their books.
- **Automation** — Zapier and Make.com webhook triggers (invoice created, paid, overdue) for no-code workflow builders.
- **Bulk export** — CSV and Excel for users who want their invoice data outside the app.
- **Public API** — authenticated REST endpoints for power users building custom integrations.

### Analytics & Reporting
- **Revenue dashboard** — monthly and quarterly charts; income at a glance.
- **Client profitability** — total billed vs average days-to-pay per client; identify who pays fast and who doesn't.
- **Tax summary report** — annual income and tax totals in a format ready for self-assessment filing.

### Infrastructure
- **S3 / Cloudflare R2 PDF storage** — replace the current in-memory token store with persistent object storage; enables shareable invoice links and longer download windows.
- **Audit log** — full change history per invoice (who changed what, when) for dispute resolution.
- **Multi-currency** — display, invoice, and track revenue in any currency with live exchange rates.

---

## Built With

- [Next.js](https://nextjs.org) — React framework
- [Prisma](https://prisma.io) — Database ORM
- [PostgreSQL](https://postgresql.org) — Relational database
- [NextAuth.js](https://next-auth.js.org) — Authentication
- [Anthropic Claude](https://anthropic.com) — AI invoice generation
- [Puppeteer](https://pptr.dev) — PDF rendering
- [Resend](https://resend.com) — Transactional email
- [Stripe](https://stripe.com) — Subscription billing
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [Vercel](https://vercel.com) + [Railway](https://railway.app) — Deployment

---

## License

MIT — Copyright © 2026 Gurpreet Singh Badrain. See [LICENSE](LICENSE) for details.
