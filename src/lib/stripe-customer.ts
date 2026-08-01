import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";

import { stripe } from "@/lib/stripe";

/**
 * Resolves the Stripe Customer for a Clerk user, creating one on first use.
 *
 * The id is cached on the Clerk user's publicMetadata (the same field the
 * checkout.session.completed webhook writes), so a user keeps a single Stripe
 * Customer across purchases instead of getting a new one per checkout.
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const cachedId = user.publicMetadata?.stripeCustomerId as string | undefined;

  if (cachedId) {
    try {
      const existing = await stripe.customers.retrieve(cachedId);
      if (!("deleted" in existing && existing.deleted)) {
        return existing.id;
      }
    } catch (err) {
      // A missing/invalid id just means we need a fresh customer. Anything
      // else (auth, network, rate limit) is a real failure worth surfacing.
      if (!(err instanceof Stripe.errors.StripeInvalidRequestError)) {
        throw err;
      }
    }
  }

  const customer = await stripe.customers.create({
    email: user.primaryEmailAddress?.emailAddress,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined,
    metadata: { userId },
  });

  await client.users.updateUserMetadata(userId, {
    publicMetadata: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
