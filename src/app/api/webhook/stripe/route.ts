import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  // Stripe signs the raw body, so it must be read as text (not parsed JSON).
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid payload";
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;

    if (!userId) {
      return new NextResponse("User ID not found in metadata", { status: 400 });
    }

    const stripeCustomerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id;

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        plan: "pro",
        stripeCustomerId,
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}
