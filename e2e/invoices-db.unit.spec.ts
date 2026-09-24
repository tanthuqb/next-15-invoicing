import { expect, test } from "@playwright/test";
import { Pool } from "pg";

// Exercises src/db/invoices.ts against a stubbed `pg` driver (no network) to
// check the behaviour while migration 0004 has not been applied yet, i.e. when
// any query that mentions invoices.name / invoices.email fails with 42703.

type Call = { text: string; values: unknown[] };

let calls: Call[] = [];
let migrated = false;

// Array-mode rows (Drizzle selects with rowMode: "array", columns in order).
const legacyRow = [7, "2026-09-25 10:00:00", 1999, "Consulting", "user_1", "open"];
const migratedRow = [...legacyRow, "Ada Lovelace", "ada@example.com"];

const realQuery = Pool.prototype.query;

async function stubQuery(config: { text: string } | string, values: unknown[] = []) {
  const text = typeof config === "string" ? config : config.text;
  calls.push({ text, values });
  if (!migrated && /"(name|email)"/.test(text)) {
    throw Object.assign(new Error('column "name" does not exist'), { code: "42703" });
  }
  if (text.startsWith("insert")) return { rows: [[42]] };
  return { rows: [migrated ? migratedRow : legacyRow] };
}

test.beforeAll(() => {
  // Belt and braces: if the stub were bypassed, nothing could reach a real DB.
  process.env.DATABASE_URL = "postgresql://stub:stub@127.0.0.1:1/stub";
});

test.beforeEach(() => {
  // @ts-expect-error -- test stub replaces the overloaded pg signature
  Pool.prototype.query = stubQuery;
  calls = [];
  migrated = false;
});

test.afterAll(() => {
  Pool.prototype.query = realQuery;
});

const input = { name: "Ada Lovelace", email: "ada@example.com", value: 1999, description: "Consulting" };

test.describe("before migration 0004", () => {
  test("listInvoices falls back to legacy columns with null billing details", async () => {
    const { listInvoices } = await import("../src/db/invoices");
    const rows = await listInvoices("user_1");
    expect(rows).toEqual([
      expect.objectContaining({ id: 7, value: 1999, status: "open", name: null, email: null }),
    ]);
    expect(calls).toHaveLength(2);
    expect(calls[1].text).not.toMatch(/"(name|email)"/);
  });

  test("getInvoice falls back to legacy columns", async () => {
    const { getInvoice } = await import("../src/db/invoices");
    const row = await getInvoice("user_1", 7);
    expect(row).toEqual(expect.objectContaining({ id: 7, name: null, email: null }));
  });

  test("createInvoice still creates the invoice without billing details", async () => {
    const { createInvoice } = await import("../src/db/invoices");
    await expect(createInvoice("user_1", input)).resolves.toBe(42);
    expect(calls).toHaveLength(2);
    expect(calls[1].text).toMatch(/^insert into "invoices"/);
    expect(calls[1].text).not.toMatch(/"(name|email)"/);
  });
});

test.describe("after migration 0004", () => {
  test.beforeEach(() => {
    migrated = true;
  });

  test("createInvoice stores name and email in one query", async () => {
    const { createInvoice } = await import("../src/db/invoices");
    await expect(createInvoice("user_1", input)).resolves.toBe(42);
    expect(calls).toHaveLength(1);
    expect(calls[0].text).toMatch(/"name", "email"/);
    expect(calls[0].values).toEqual(expect.arrayContaining(["Ada Lovelace", "ada@example.com"]));
  });

  test("listInvoices returns the stored billing details", async () => {
    const { listInvoices } = await import("../src/db/invoices");
    const rows = await listInvoices("user_1");
    expect(rows).toEqual([expect.objectContaining({ name: "Ada Lovelace", email: "ada@example.com" })]);
    expect(calls).toHaveLength(1);
  });

  test("other database errors are not swallowed", async () => {
    const { listInvoices } = await import("../src/db/invoices");
    Pool.prototype.query = async () => {
      throw Object.assign(new Error("permission denied"), { code: "42501" });
    };
    await expect(listInvoices("user_1")).rejects.toThrow();
  });
});
