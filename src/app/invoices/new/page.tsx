"use client"
import createAction, { type CreateInvoiceState } from "@/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/ui/submitbutton"
import { Textarea } from "@/components/ui/textarea"
import { EMAIL_MAX_LENGTH, NAME_MAX_LENGTH, type InvoiceField } from "@/lib/invoice-input"
import { useActionState } from "react"

import Container from "@/components/container"

const initialState: CreateInvoiceState = {};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return <p id={id} className="mt-1 text-sm text-red-600">{message}</p>;
}

export default function Page() {
  const [state, formAction] = useActionState(createAction, initialState);

  // React resets the form after the action settles; defaultValue restores what
  // the user typed so a validation error does not wipe the other fields.
  const fieldProps = (field: InvoiceField) => ({
    id: field,
    name: field,
    defaultValue: state.values?.[field],
    "aria-invalid": state.errors?.[field] ? true : undefined,
    "aria-describedby": state.errors?.[field] ? `${field}-error` : undefined,
  });

  return <main className="h-full ">
    <Container>
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Create Invoice</h1>
      </div>
      <form action={formAction} className="grid gap-4 max-w-sm">
        {state.message && <p role="alert" className="text-sm text-red-600">{state.message}</p>}
        <div>
          <Label htmlFor="name" className="block font-semibold mb-2 text-sm">Billing Name</Label>
          <Input {...fieldProps("name")} type="text" maxLength={NAME_MAX_LENGTH} required></Input>
          <FieldError id="name-error" message={state.errors?.name} />
        </div>
        <div>
          <Label htmlFor="email" className="block font-semibold mb-2 text-sm">Billing Email</Label>
          <Input {...fieldProps("email")} type="email" maxLength={EMAIL_MAX_LENGTH} required></Input>
          <FieldError id="email-error" message={state.errors?.email} />
        </div>
        <div>
          <Label htmlFor="value" className="block font-semibold mb-2 text-sm">Value</Label>
          <Input {...fieldProps("value")} type="number" step="0.01" min="0" required></Input>
          <FieldError id="value-error" message={state.errors?.value} />
        </div>
        <div>
          <Label htmlFor="description" className="block font-semibold mb-2 text-sm">Description</Label>
          <Textarea {...fieldProps("description")} required></Textarea>
          <FieldError id="description-error" message={state.errors?.description} />
        </div>
        <div>
          {/* useFormStatus inside SubmitButton disables it while pending, which
              also prevents double submission. */}
          <SubmitButton />
        </div>
      </form>
    </Container>
  </main>
}
