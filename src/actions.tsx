"use server"

import { db } from '@/db';
import { Invoices } from './db/schema';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function createAction(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    return;
  }

  const valueString = formData.get("value") as string;
  // Math.round, not Math.floor: binary floating point makes e.g. 19.99 * 100
  // evaluate to 1998.9999..., which floor would truncate to 1998 cents.
  const value = Math.round(parseFloat(valueString) * 100);

  const description = formData.get("description") as string;

  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Invalid value");
  }

  const results = await db.insert(Invoices)
    .values({
      value,
      description,
      userId,
      status: "open",
    })
    .returning({
      id: Invoices.id
    })
  redirect(`/invoices/${results[0].id}`)
}
