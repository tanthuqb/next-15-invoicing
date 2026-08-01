// Seeds real subscription products into Stripe (test mode) and the Supabase products table.
// Idempotent: reuses Stripe prices by lookup_key and updates existing DB rows by stripePriceId.
// Usage: npm run seed

import Stripe from "stripe";
import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

const PLANS = [
  {
    name: "Starter Plan",
    description:
      "For freelancers and individuals. Up to 25 invoices per month, one user, and standard email support.",
    amountCents: 900,
    lookupKey: "starter_plan",
  },
  {
    name: "Pro Plan",
    description:
      "For small teams and growing businesses. Unlimited invoices, up to 5 team members, payment links, and priority support.",
    amountCents: 2900,
    lookupKey: "pro_plan",
  },
  {
    name: "Enterprise",
    description:
      "For large organizations. Unlimited invoices and team members, custom integrations, a dedicated account manager, and SLA-backed support.",
    amountCents: 9900,
    lookupKey: "enterprise_plan",
  },
];

function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.endsWith("...")) {
    console.error(`Missing or placeholder env var: ${name} (check .env.local)`);
    process.exit(1);
  }
  return value;
}

async function resolveClerkUserId() {
  if (process.env.SEED_USER_ID) return process.env.SEED_USER_ID;
  const clerkKey = requireEnv("CLERK_SECRET_KEY");
  const res = await fetch("https://api.clerk.com/v1/users?limit=1&order_by=-created_at", {
    headers: { Authorization: `Bearer ${clerkKey}` },
  });
  if (!res.ok) {
    console.error(`Clerk API error ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  const users = await res.json();
  if (!users.length) {
    console.error("No Clerk users found. Sign up once in the app, or set SEED_USER_ID.");
    process.exit(1);
  }
  const user = users[0];
  const email = user.email_addresses?.[0]?.email_address ?? "unknown";
  console.log(`Seeding products for Clerk user ${user.id} (${email})`);
  return user.id;
}

const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"));
const pool = new pg.Pool({ connectionString: requireEnv("DATABASE_URL") });

const userId = await resolveClerkUserId();

for (const plan of PLANS) {
  const existing = await stripe.prices.list({ lookup_keys: [plan.lookupKey] });
  let price;
  if (existing.data.length > 0) {
    price = existing.data[0];
    console.log(`Stripe: reusing price ${price.id} for lookup_key "${plan.lookupKey}"`);
  } else {
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
    });
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.amountCents,
      currency: "usd",
      recurring: { interval: "month" },
      lookup_key: plan.lookupKey,
      transfer_lookup_key: true,
    });
    console.log(`Stripe: created ${plan.name} (${product.id}, ${price.id})`);
  }

  const productId = typeof price.product === "string" ? price.product : price.product.id;
  const updated = await pool.query(
    `UPDATE products SET name = $1, description = $2, price = $3, "stripeProductId" = $4, "userId" = $5
     WHERE "stripePriceId" = $6`,
    [plan.name, plan.description, plan.amountCents, productId, userId, price.id]
  );
  if (updated.rowCount === 0) {
    await pool.query(
      `INSERT INTO products (name, description, price, "stripeProductId", "stripePriceId", "userId")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [plan.name, plan.description, plan.amountCents, productId, price.id, userId]
    );
    console.log(`DB: inserted ${plan.name} ($${(plan.amountCents / 100).toFixed(2)}/mo)`);
  } else {
    console.log(`DB: updated ${plan.name} ($${(plan.amountCents / 100).toFixed(2)}/mo)`);
  }
}

const { rows } = await pool.query(
  'SELECT id, name, price, "stripePriceId" FROM products ORDER BY price'
);
console.table(rows);
await pool.end();
console.log("Seed complete.");
