"use client";

import { useActionState, useEffect, useState } from "react";
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
  const [state, formAction] = useActionState(createProductAction as any, null as any);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (state?.success) {
      // We could close the dialog here if we had a way to control it from here
      // For now, just show success in the UI or redirect
      window.location.reload(); // Refresh to show new product
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
            {state.error || "An error occurred."}
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
