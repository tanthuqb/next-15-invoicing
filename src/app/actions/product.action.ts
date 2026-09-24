"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { Products } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

export type CreateProductState =
  | { success: true; message: string }
  | { success: false; error: string }
  | null;

export async function createProductAction(
  _prevState: CreateProductState,
  formData: FormData
): Promise<CreateProductState> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const name = ((formData.get("name") as string | null) ?? "").trim();
    const description = ((formData.get("description") as string | null) ?? "").trim();
    const priceStr = (formData.get("price") as string | null) ?? "";

    if (!name || !priceStr) {
      throw new Error("Missing required fields");
    }

    // Convert dollars to cents for Stripe
    const priceInCents = Math.round(parseFloat(priceStr) * 100);

    if (!Number.isFinite(priceInCents) || priceInCents <= 0) {
      throw new Error("Price must be a positive number");
    }

    // 1. Create Product in Stripe
    const stripeProduct = await stripe.products.create({
      name,
      // Stripe rejects an empty-string description, so omit it when blank.
      description: description || undefined,
      metadata: {
        userId,
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
      description: description || null,
      price: priceInCents,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
      userId,
    });

    return { success: true, message: "Product created successfully in DB and Stripe!" };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }
}
