"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { Products } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function createProductAction(prevState: any, formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;

    if (!name || !priceStr) {
      throw new Error("Missing required fields");
    }

    // Convert dollars to cents for Stripe
    const priceInCents = Math.round(parseFloat(priceStr) * 100);

    // 1. Create Product in Stripe
    const stripeProduct = await stripe.products.create({
      name,
      description,
      metadata: {
        userId, // Optionally attach the user ID
      },
    });

    // 2. Create Price in Stripe for this Product
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: priceInCents,
      currency: "usd",
    });

    // 3. Save to our Database
    await db.insert(Products).values({
      name,
      description,
      price: priceInCents,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
      userId,
    });

    return { success: true, message: "Product created successfully in DB and Stripe!" };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { success: false, error: error.message };
  }
}
