"use server";

import { stripe } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function buyProductAction(formData: FormData) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const priceId = formData.get("priceId") as string;
  
  if (!priceId) {
    throw new Error("Missing price ID");
  }
  
  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";

  // Payment-mode sessions default to customer_creation: 'if_required', which
  // leaves session.customer null and breaks the billing portal. Attach the
  // user's customer up front so it is always populated.
  const customer = await getOrCreateStripeCustomer(userId);

  const session = await stripe.checkout.sessions.create({
    customer,
    billing_address_collection: 'auto',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'payment', // use payment for one-time product, subscription for recurring
    success_url: `${origin}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      userId,
    },
  });

  if (session.url) {
    redirect(session.url);
  } else {
    throw new Error("Failed to create checkout session");
  }
}
