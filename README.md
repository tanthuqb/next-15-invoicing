# 🚀 Next.js Invoicing Application

A professional, full-stack invoicing application built with **Next.js 16** and **React 19**. This project features a dashboard, invoice management, product catalog, secure authentication, and seamless Stripe payment integration.

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

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Components:** [Shadcn/UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/)
- **Authentication:** [Clerk](https://clerk.com/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/), with Clerk third-party auth + RLS)
- **Payments:** [Stripe](https://stripe.com/)
- **Hosting:** [Vercel](https://vercel.com/)

---

## 🚦 Getting Started

### Prerequisites

- [Node.js 22+](https://nodejs.org/)
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
   ```

4. **Initialize the Database:**

   ```bash
   npm run generate
   npm run migrate
   ```

### 🚀 Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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
- `npm run seed` — seed demo products
- `scripts/upload-env-to-vercel.ps1` — upload `.env.local` to Vercel Production and redeploy (run manually)

---

## 🧪 Testing Payments

Use Stripe test cards on Checkout, e.g. `4242 4242 4242 4242` with any future expiry and any CVC. After paying, confirm the webhook delivery shows **200** in Stripe Dashboard → Webhooks.

---

## 📄 License

This project is licensed under the MIT License.
