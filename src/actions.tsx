"use server"

import { db } from '@/db';
import { Invoices } from './db/schema';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function createAction(formData: FormData) {
  const { userId } = await auth();
  
  const valueString = formData.get("value") as string;
  const parsedValue = parseFloat(valueString);
  const value = Math.floor(parsedValue * 100);
  
  const description = formData.get("description") as string;
  
  if (!userId) {
    return;
  }
  
  if (isNaN(value)) {
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