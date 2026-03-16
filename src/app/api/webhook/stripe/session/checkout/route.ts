import { stripe } from "@/lib/stripe";

import { NextResponse , NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  let lookup_key: string;

  const contentType = req.headers.get("content-type") || "";
  
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await req.formData();
    lookup_key = formData.get("lookup_key") as string;
  } else {
    const body = await req.json();
    lookup_key = body.lookup_key;
  }

  const prices = await stripe.prices.list({
    lookup_keys: [lookup_key],
    expand: ['data.product'],
  });

  if (!prices.data || prices.data.length === 0) {
    return new NextResponse(`Error: No price found for lookup key "${lookup_key}". Please ensure you have created this lookup key in your Stripe dashboard.`, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    billing_address_collection: 'auto',
    line_items: [
      {
        price: prices.data[0].id,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${req.headers.get("origin") || "http://localhost:3000"}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}