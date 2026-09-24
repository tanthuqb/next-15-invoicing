# 🚀 Next.js Invoicing Application

A professional, full-stack invoicing application built with **Next.js 16.3** and **React 19.3**. This project features a dashboard, invoice management, product catalog, secure authentication, and seamless Stripe payment integration.

**Live demo:** [https://next-15-invoicing.vercel.app](https://next-15-invoicing.vercel.app)

---

## ✨ Features

- **📊 Dashboard:** Overview of your invoices and recent activity.
- **📄 Invoice Management:** Create and manage invoices with ease.
- **🛍️ Products:** Create products synced to Stripe (Product + Price objects).
- **💳 Stripe Payments:** Secure payment processing with Stripe Checkout, plus the customer Billing Portal.
- **🔔 Stripe Webhooks:** Signature-verified webhook handling for `checkout.session.completed`.
- **🔐 Authentication:** User authentication and management powered by [Clerk](https://clerk.com/).
- **🗄️ Database:** Type-safe database interactions with [Drizzle ORM](https://orm.drizzle.team/) and PostgreSQL.
- **🎨 Modern UI:** A responsive interface built with [Tailwind CSS 4](https://tailwindcss.com/) and [Radix UI](https://www.radix-ui.com/).
- **🧪 End-to-end tests:** [Playwright](https://playwright.dev/) suite using Clerk's official testing helpers.

---

## 🛠️ Tech Stack

| Area | Package | Version |
| --- | --- | --- |
| Framework | [Next.js](https://nextjs.org/) (App Router, Turbopack, `src/proxy.ts`) | 16.3.6 |
| UI runtime | React / React DOM | 19.3.0 |
| Language | [TypeScript](https://www.typescriptlang.org/) | 6.0.3 |
| Styling | [Tailwind CSS](https://tailwindcss.com/) (`@tailwindcss/postcss`) | 4.3.3 |
| Components | [shadcn/ui](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/), lucide-react | 1.48.0 (lucide) |
| Authentication | [Clerk](https://clerk.com/) `@clerk/nextjs` (Core 3) | 7.9.5 |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) / drizzle-kit | 0.45.3 / 0.31.11 |
| Database | [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/) (`pg`, Clerk third-party auth + RLS) | pg 8.23.0 |
| Payments | [Stripe](https://stripe.com/) `stripe` / `@stripe/stripe-js` | 22.6.2 / 9.17.0 |
| Linting | ESLint / `eslint-config-next` | 9.39.5 / 16.3.6 |
| E2E testing | `@playwright/test` / `@clerk/testing` | 1.63.0 / 2.2.37 |
| Hosting | [Vercel](https://vercel.com/) | — |

> **Held back on purpose:** TypeScript 7 (the native compiler) and ESLint 10 are released, but `typescript-eslint` (used by `eslint-config-next`) only supports TypeScript `<6.1`, and `eslint-plugin-react`, `eslint-plugin-import` and `eslint-plugin-jsx-a11y` do not yet declare ESLint 10 support. Upgrade them once `eslint-config-next` does.

---

## 🚦 Getting Started

### Prerequisites

- [Node.js 22+](https://nodejs.org/) (24 LTS recommended)
- [Stripe CLI](https://docs.stripe.com/stripe-cli) (for local webhook testing)
- Accounts: [Clerk](https://clerk.com/), [Supabase](https://supabase.com/), [Stripe](https://stripe.com/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/tanthuqb/next-15-invoicing.git
   cd next-15-invoicing
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Copy [.env.example](.env.example) to `.env.local` and fill in your credentials:

   ```env
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
   NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   DATABASE_URL=postgresql://...

   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...   # see "Stripe Webhooks" below

   # Playwright E2E (optional; authenticated tests are skipped without them)
   E2E_CLERK_USER_USERNAME=e2e+clerk_test@example.com
   E2E_CLERK_USER_PASSWORD=...
   ```

4. **Initialize the Database:**

   ```bash
   npm run generate   # only needed after editing src/db/schema.ts
   npm run migrate    # applies src/db/migrations to DATABASE_URL
   ```

   > **Upgrading an existing database:** migration `0004_invoice_billing_details` adds the nullable `name` and `email` columns to `invoices`:
   >
   > ```sql
   > ALTER TABLE "invoices" ADD COLUMN "name" text;
   > ALTER TABLE "invoices" ADD COLUMN "email" text;
   > ```
   >
   > Apply it with `npm run migrate` (recommended: it also records the migration in drizzle's journal table), **or** paste the two statements above into the Supabase SQL editor — but then `npm run migrate` will try to add the columns again later and fail, so prefer one method consistently. Existing rows keep `NULL` (shown as "—"). The app tolerates the columns being absent (it logs a warning and falls back to the old columns), so deploying the code before the migration does not break the dashboard, but billing details are not saved until it is applied.

5. **(Optional) Seed the subscription plans:**

   ```bash
   npm run seed
   ```

   Creates (or reuses) the `starter_plan`, `pro_plan` and `enterprise_plan` monthly Prices in Stripe **test mode** and upserts matching rows in the `products` table for the newest Clerk user (or `SEED_USER_ID`). The `/checkout` page looks these Prices up by `lookup_key`, so run it once per Stripe account.

### 🚀 Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🗺️ Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | public | Landing page |
| `/sign-in`, `/sign-up` | public | Clerk sign-in / sign-up |
| `/dashboard` | signed in | Your invoices |
| `/invoices/new`, `/invoices/[invoiceId]` | signed in | Create / view an invoice (404 for unknown ids or other users' invoices) |
| `/dashboard/products` | signed in | Create products (synced to a Stripe Product + Price) and buy them via Checkout |
| `/checkout` | signed in | Subscription plans -> Stripe Checkout; the success view opens the Billing Portal |
| `POST /api/webhook/stripe` | public, Stripe-signed | Stripe webhook |
| `POST /api/webhook/stripe/session/checkout` | signed in (401 otherwise) | Creates a subscription Checkout Session from a `lookup_key` |
| `POST /api/webhook/stripe/session/portal` | signed in (401 otherwise) | Opens the Stripe Billing Portal |

Authentication is enforced by `clerkMiddleware` in `src/proxy.ts` (Next.js 16 renamed `middleware.ts` to `proxy.ts`). Everything except `/`, `/sign-in`, `/sign-up` and `/api/webhook/*` requires a session; the `/api/webhook/stripe/session/*` handlers check the Clerk session themselves.

Invoices store the billing **name** and **email** entered on `/invoices/new` (validated server-side: trimmed, required, name ≤ 100 chars, email ≤ 254 chars and a valid address; errors are shown next to the field). The dashboard and invoice page show them; invoices created before these columns existed show "—".

---

## 🔔 Stripe Webhooks

The webhook handler lives at `/api/webhook/stripe`. It is publicly reachable (excluded from Clerk auth in `src/proxy.ts`) and protects itself by verifying the Stripe signature with `STRIPE_WEBHOOK_SECRET`.

The local and production secrets are **different** — never mix them up:

### Local development

Stripe cannot reach `localhost`, so forward events with the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

The CLI prints a `whsec_...` secret — put it in `STRIPE_WEBHOOK_SECRET` in `.env.local`, then test with:

```bash
stripe trigger checkout.session.completed
```

> The CLI's test fixture has no `metadata.userId`, so this specific event returns 400 by design. Real checkouts initiated by the app always attach it.

### Production

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://next-15-invoicing.vercel.app/api/webhook/stripe`
   — use the **stable production domain**, never a hashed deployment URL (those are blocked by Vercel Deployment Protection and change on every deploy)
3. Select the `checkout.session.completed` event
4. Copy the endpoint's **Signing secret** into the `STRIPE_WEBHOOK_SECRET` environment variable on Vercel

To verify the endpoint is reachable:

```bash
curl -X POST https://next-15-invoicing.vercel.app/api/webhook/stripe
# expect: 400 "Webhook Error: No stripe-signature header value was provided."
```

---

## 🌐 Deployment (Vercel)

The app deploys to Vercel. Environment variables must exist in the **Production** environment before the build (all `NEXT_PUBLIC_*` values are inlined at build time).

To upload all env vars from `.env.local` and redeploy in one step, run **from your own terminal**:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\upload-env-to-vercel.ps1
```

> ⚠️ This script must be run by a human. The Vercel CLI detects AI coding agents and deliberately replaces secret values with `[SENSITIVE]`, which breaks the deployment.

Manual alternative: Vercel Dashboard → Project → **Settings → Environment Variables**, then redeploy.

Recommended project settings: **Node.js 24** (Node 20 builds are rejected by Vercel starting 2026-10-01).

---

## 📜 Scripts

- `npm run dev` — start the development server
- `npm run build` — build for production
- `npm run start` — start the production server
- `npm run lint` — run ESLint
- `npm run generate` — generate Drizzle migrations
- `npm run migrate` — apply Drizzle migrations
- `npm run seed` — seed the three subscription plans into Stripe (test mode) and the `products` table
- `npm run test:e2e` — run the Playwright end-to-end suite (starts `next dev` on port 3101)
- `npm run test:e2e:ui` — the same suite in Playwright UI mode
- `scripts/upload-env-to-vercel.ps1` — upload `.env.local` to Vercel Production and redeploy (run manually)

---

## 🧪 End-to-End Tests (Playwright)

One-time setup:

```bash
npx playwright install chromium
```

Run:

```bash
npm run test:e2e          # headless; list output + HTML report in playwright-report/
npm run test:e2e:ui       # interactive UI mode
npx playwright show-report
```

`playwright.config.ts` starts the app with `next dev -p 3101` (base URL `http://localhost:3101`; override the port with `E2E_PORT`) and reuses a server that is already listening on that port. It loads `.env.local`, so the app's Clerk, Stripe and Supabase keys are used. **Only run it with Clerk development (`pk_test_` / `sk_test_`) and Stripe test-mode keys.**

Projects:

- **setup** (`e2e/global.setup.ts`): `clerkSetup()` from `@clerk/testing/playwright` fetches a Testing Token (bypasses Clerk bot protection), then signs the E2E user in with `clerk.signIn({ page, signInParams: { strategy: "password", identifier, password } })` and saves the session to `playwright/.clerk/user.json` (git-ignored).
- **public** (`e2e/public.spec.ts`): the landing, sign-in and sign-up pages render; `/dashboard`, `/dashboard/products`, `/invoices/new`, `/invoices/1` and `/checkout` redirect to `/sign-in`; the webhook returns 400 without a signature and with an invalid one; the checkout and portal session routes return 401 without a session.
- **unit** (`e2e/*.unit.spec.ts`): no browser, auth or database — invoice form validation, and the invoice data layer against a stubbed `pg` driver (including the fallback used before migration 0004 is applied).
- **authenticated** (`e2e/authenticated.spec.ts`): dashboard, creating an invoice (amount stored to the cent; billing name/email shown on the invoice page and dashboard), server-side rejection of an invalid billing email, 404 for unknown invoices, the products page, creating a product (synced to Stripe), **Buy** and **Subscribe** redirecting to `checkout.stripe.com`, and the canceled-checkout message.

Authenticated tests need a password user in your Clerk **development** instance:

| Variable | Description |
| --- | --- |
| `E2E_CLERK_USER_USERNAME` | Email address or username of the test user (a `+clerk_test` email such as `e2e+clerk_test@example.com` suppresses Clerk emails) |
| `E2E_CLERK_USER_PASSWORD` | That user's password |

Set them in your shell or in `.env.local`. If either is missing, the authenticated tests are **skipped** with an explanatory message and the public tests still run.

> The authenticated tests write real data: each run inserts one invoice and one product row into the database, creates a Stripe **test-mode** Product/Price (archived again after the run) and, on first run, a test-mode Customer for the E2E user.

---

## 🧪 Testing Payments

Use Stripe test cards on Checkout, e.g. `4242 4242 4242 4242` with any future expiry and any CVC. After paying, confirm the webhook delivery shows **200** in Stripe Dashboard → Webhooks.

---

## 📄 License

This project is licensed under the MIT License.
