import { expect, test } from "@playwright/test";

import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  displayOrDash,
  validateInvoiceInput,
} from "../src/lib/invoice-input";
import { isMissingColumnError } from "../src/lib/db-errors";

// Pure unit tests (no browser, no server, no DB). They run in the "unit"
// Playwright project so they work without Clerk credentials.

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const valid = {
  name: "  Ada Lovelace  ",
  email: "  ada@example.com ",
  value: "19.99",
  description: " Consulting ",
};

test.describe("validateInvoiceInput", () => {
  test("accepts valid input, trims strings and converts value to cents", () => {
    const result = validateInvoiceInput(form(valid));
    expect(result).toEqual({
      ok: true,
      data: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        value: 1999,
        description: "Consulting",
      },
    });
  });

  test("requires a name (whitespace only is empty)", () => {
    const result = validateInvoiceInput(form({ ...valid, name: "   " }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.name).toBe("Billing name is required.");
  });

  test("rejects a name longer than the max length", () => {
    const result = validateInvoiceInput(form({ ...valid, name: "a".repeat(NAME_MAX_LENGTH + 1) }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.name).toBe(`Billing name must be at most ${NAME_MAX_LENGTH} characters.`);
  });

  test("requires an email", () => {
    const result = validateInvoiceInput(form({ ...valid, email: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBe("Billing email is required.");
  });

  for (const email of ["not-an-email", "someone@localhost", "a b@example.com", "a@@example.com", "a@example..com", "@example.com"]) {
    test(`rejects invalid email ${JSON.stringify(email)}`, () => {
      const result = validateInvoiceInput(form({ ...valid, email }));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.email).toBe("Enter a valid billing email address.");
    });
  }

  test("rejects an email longer than the max length", () => {
    const email = `${"a".repeat(EMAIL_MAX_LENGTH)}@example.com`;
    const result = validateInvoiceInput(form({ ...valid, email }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBe(`Billing email must be at most ${EMAIL_MAX_LENGTH} characters.`);
  });

  for (const value of ["", "abc", "-1", "Infinity"]) {
    test(`rejects invalid value ${JSON.stringify(value)}`, () => {
      const result = validateInvoiceInput(form({ ...valid, value }));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.value).toBe("Enter a valid amount (0 or more).");
    });
  }

  test("requires a description", () => {
    const result = validateInvoiceInput(form({ ...valid, description: "  " }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.description).toBe("Description is required.");
  });

  test("reports every invalid field at once and handles missing fields", () => {
    const result = validateInvoiceInput(new FormData());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(["description", "email", "name", "value"]);
    }
  });
});

test.describe("displayOrDash", () => {
  test("shows the value, or an em dash for legacy null/blank values", () => {
    expect(displayOrDash("Ada")).toBe("Ada");
    expect(displayOrDash(null)).toBe("—");
    expect(displayOrDash(undefined)).toBe("—");
    expect(displayOrDash("  ")).toBe("—");
  });
});

test.describe("isMissingColumnError", () => {
  test("detects Postgres undefined_column (42703) directly or wrapped by Drizzle", () => {
    const pgError = Object.assign(new Error('column "name" does not exist'), { code: "42703" });
    expect(isMissingColumnError(pgError)).toBe(true);
    expect(isMissingColumnError(new Error("Failed query", { cause: pgError }))).toBe(true);
  });

  test("ignores other errors", () => {
    expect(isMissingColumnError(Object.assign(new Error("dup"), { code: "23505" }))).toBe(false);
    expect(isMissingColumnError(new Error("boom"))).toBe(false);
    expect(isMissingColumnError(null)).toBe(false);
    expect(isMissingColumnError("42703")).toBe(false);
  });
});
