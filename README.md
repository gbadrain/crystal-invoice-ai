# Crystal Invoice AI

> **AI-powered invoicing for freelancers and small businesses — from plain English to professional PDF in seconds.**

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
- **Send to Client** — A single button emails the client a fully styled HTML invoice via Resend. If the invoice is in draft status, it is automatically promoted to `pending` after sending.

### Phase 5 — Lifecycle and Trash

Invoices have a full lifecycle: `draft → pending → paid / overdue`. Deletion is non-destructive — invoices move to a trash state and can be restored individually or in bulk. Permanent deletion requires explicit confirmation. The original status is preserved so a restored invoice returns exactly where it was.

---

## Technical Architecture (Summary)

| Layer | Technology | Deployment |
|---|---|---|
| Frontend + CRUD API | Next.js 14 (TypeScript) | Vercel |
| PDF + AI API | Express 4 (Node.js) | Railway |
| Database | PostgreSQL + Prisma 7 | Managed Postgres |
| Authentication | NextAuth v4 (JWT) | — |
| Payments | Stripe (subscription) | — |
| Email | Resend | — |
| AI Model | Anthropic Claude Haiku | — |
| Styling | Tailwind CSS | — |

**Key architectural decisions:**
- Prisma 7 uses the `PrismaPg` adapter pattern (no URL in schema file, connection pooling via `pg.Pool`)
- All code lives in `src/` — the path alias `@/*` maps to `src/*`
- NextAuth uses JWT strategy — no database session table
- PDF files are stored in Node.js memory with token-based one-time retrieval (no S3 dependency)
- AI output is constrained via assistant prefill (`{`) to force valid JSON from Claude Haiku

---

## Key Features

### AI Invoice Generation
Describe a job in plain text and the AI extracts client name, email, address, line items, rates, quantities, tax, and discounts. The form pre-fills instantly — every field is editable before saving.

### Voice Input
Speak your invoice description hands-free. A mic button sits directly inside the input field. When active, it pulses red and displays a live "Listening… speak now" indicator. Tap again to stop and generate. No extra app, no third-party transcription service — powered entirely by the browser's Web Speech API.

### Professional PDF Export
Every invoice renders as a clean, A4-formatted PDF — consistent fonts, spacing, and layout on every device and browser. No browser print dialog quirks.

### Send to Client
One button emails the client a fully formatted invoice. Status is automatically updated from draft to pending.

### Password Reset & Account Security
Full self-service password reset via email token — no admin intervention required. Users who forget their password receive a time-limited reset link. Authenticated users can change their password at any time from the Settings page.

### Payment Tracking
Invoices move through a clear status lifecycle. The dashboard surfaces outstanding totals, overdue invoices, and revenue collected at a glance.

### Trash and Restore
Soft deletion with full restore capability. Nothing is permanently deleted unless explicitly confirmed.

### Freemium Model
Free users get three invoices. Pro users ($9/month via Stripe) get unlimited invoices and full feature access. The upgrade path is inline — no separate checkout page is required.

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

All core features are implemented and tested in production:

- User registration and authentication
- Password reset (email token) and change-password (settings)
- Full invoice CRUD with soft delete and restore
- AI generation via Claude Haiku
- Voice input via Web Speech API
- PDF generation via Puppeteer
- Email delivery via Resend
- Stripe subscription billing
- Freemium enforcement with usage tracking
- Dashboard with status overview

**Pending**: Stripe production keys (billing UI is live, upgrade flow activates on key addition).

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

MIT — see [LICENSE](LICENSE)
