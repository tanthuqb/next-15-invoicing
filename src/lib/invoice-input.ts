// Validation for the "create invoice" form. Pure (no server/DB imports) so it
// can be unit tested and shared by the server action.

export const NAME_MAX_LENGTH = 100;
// RFC 5321 caps a forward-path at 254 characters.
export const EMAIL_MAX_LENGTH = 254;

// Deliberately simple: one "@", no whitespace, and a dotted domain with no
// empty labels. Stricter than the browser's type="email" check, which accepts
// e.g. "someone@localhost".
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export type InvoiceField = "name" | "email" | "value" | "description";

export type InvoiceInput = {
  name: string;
  email: string;
  /** Amount in cents. */
  value: number;
  description: string;
};

export type InvoiceValidationResult =
  | { ok: true; data: InvoiceInput }
  | { ok: false; errors: Partial<Record<InvoiceField, string>> };

function field(formData: FormData, key: InvoiceField): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export function validateInvoiceInput(formData: FormData): InvoiceValidationResult {
  const errors: Partial<Record<InvoiceField, string>> = {};

  const name = field(formData, "name");
  if (!name) errors.name = "Billing name is required.";
  else if (name.length > NAME_MAX_LENGTH) errors.name = `Billing name must be at most ${NAME_MAX_LENGTH} characters.`;

  const email = field(formData, "email");
  if (!email) errors.email = "Billing email is required.";
  else if (email.length > EMAIL_MAX_LENGTH) errors.email = `Billing email must be at most ${EMAIL_MAX_LENGTH} characters.`;
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid billing email address.";

  // Math.round, not Math.floor: binary floating point makes e.g. 19.99 * 100
  // evaluate to 1998.9999..., which floor would truncate to 1998 cents.
  const value = Math.round(parseFloat(field(formData, "value")) * 100);
  if (!Number.isFinite(value) || value < 0) errors.value = "Enter a valid amount (0 or more).";

  const description = field(formData, "description");
  if (!description) errors.description = "Description is required.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { name, email, value, description } };
}

/** Billing name/email are null on invoices created before they were stored. */
export function displayOrDash(value: string | null | undefined): string {
  return value && value.trim() ? value : "—";
}
