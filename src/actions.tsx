"use server"

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

import { createInvoice } from '@/db/invoices';
import { validateInvoiceInput, type InvoiceField } from '@/lib/invoice-input';

export type CreateInvoiceState = {
  errors?: Partial<Record<InvoiceField, string>>;
  /** Form-level error (not tied to one field). */
  message?: string;
  /** Submitted values, echoed back so the form keeps them after an error. */
  values?: Partial<Record<InvoiceField, string>>;
};

function submittedValues(formData: FormData): CreateInvoiceState["values"] {
  const values: Partial<Record<InvoiceField, string>> = {};
  for (const key of ["name", "email", "value", "description"] as const) {
    const raw = formData.get(key);
    if (typeof raw === "string") values[key] = raw;
  }
  return values;
}

export default async function createAction(
  _prevState: CreateInvoiceState,
  formData: FormData
): Promise<CreateInvoiceState> {
  const { userId } = await auth();

  if (!userId) {
    return { message: "You must be signed in to create an invoice.", values: submittedValues(formData) };
  }

  const result = validateInvoiceInput(formData);
  if (!result.ok) {
    return { errors: result.errors, values: submittedValues(formData) };
  }

  const invoiceId = await createInvoice(userId, result.data);
  redirect(`/invoices/${invoiceId}`);
}
