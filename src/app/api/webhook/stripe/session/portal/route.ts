import { stripe } from "@/lib/stripe";

import { NextResponse , NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  let session_id: string;

  const contentType = req.headers.get("content-type") || "";
  
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await req.formData();
    session_id = formData.get("session_id") as string;
  } else {
    const body = await req.json();
    session_id = body.session_id;
  }

  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

  const returnUrl = req.headers.get("origin") || "http://localhost:3000";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: checkoutSession.customer as string,
    return_url: returnUrl,
  });

  return NextResponse.redirect(portalSession.url, { status: 303 });
}