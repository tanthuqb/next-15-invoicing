"use client";

import { useActionState, useEffect } from "react";
import { createProductAction } from "@/app/actions/product.action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/ui/submitbutton";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CreateProductForm() {
  const [state, formAction] = useActionState(createProductAction, null);

  useEffect(() => {
    if (state?.success) {
      // Reload so the server-rendered products table picks up the new row
      // (this also closes the dialog).
      window.location.reload();
    }
  }, [state]);

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create New Product</DialogTitle>
        <DialogDescription>
          Add a new product. This will automatically sync to Stripe.
        </DialogDescription>
      </DialogHeader>
      <form action={formAction} className="space-y-4 pt-4">
        {state && !state.success && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs">
            {state.error}
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Expert Consultation" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Short description..." />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input id="price" name="price" type="number" step="0.01" placeholder="49.99" required />
        </div>
        <SubmitButton className="w-full mt-4">Save Product</SubmitButton>
      </form>
    </DialogContent>
  );
}
