import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

import { stripe } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";

import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let session_id: string | undefined;

  const contentType = req.headers.get("content-type") || "";

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await req.formData();
    session_id = (formData.get("session_id") as string | null) ?? undefined;
  } else {
    const body = await req.json().catch(() => ({}));
    session_id = body?.session_id;
  }

  let customer: string | undefined;

  if (session_id) {
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    // The session id travels through the browser, so confirm it belongs to the
    // signed-in user before opening a billing portal against its customer.
    if (checkoutSession.metadata?.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    customer =
      typeof checkoutSession.customer === "string"
        ? checkoutSession.customer
        : checkoutSession.customer?.id;
  }

  // Sessions created before customers were attached (payment mode defaults to
  // customer_creation: 'if_required') have no customer, so fall back to the
  // user's own Stripe Customer.
  if (!customer) {
    customer = await getOrCreateStripeCustomer(userId);
  }

  const returnUrl = `${req.headers.get("origin") || req.nextUrl.origin}/dashboard`;

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer,
      return_url: returnUrl,
      locale: 'en',
    });

    return NextResponse.redirect(portalSession.url, { status: 303 });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeInvalidRequestError) {
      return new NextResponse(`Stripe error: ${err.message}`, { status: 400 });
    }
    throw err;
  }
}
