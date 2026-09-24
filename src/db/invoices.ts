import { and, eq } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { db } from "@/db";
import { Invoices, statusEnum } from "@/db/schema";
import { isMissingColumnError } from "@/lib/db-errors";
import type { InvoiceInput } from "@/lib/invoice-input";

// Migration 0004 adds invoices.name / invoices.email. Until it has been applied
// to a database, queries that reference those columns fail with Postgres
// 42703 (undefined_column). These helpers fall back to the legacy column set
// so the app keeps working (billing details show as "—") if the code is
// deployed before the migration.

// The invoices table as it was before migration 0004. Deliberately NOT in
// schema.ts, so drizzle-kit never sees it. A separate table object is needed
// because Drizzle's insert lists every column of the table it is given
// (emitting `default` for omitted ones), so inserting through `Invoices`
// would still reference "name"/"email".
const LegacyInvoices = pgTable("invoices", {
  id: serial("id").primaryKey().notNull(),
  createTs: timestamp("createTs").notNull().defaultNow(),
  value: integer("value").notNull(),
  description: text("description").notNull(),
  userId: text("userId").notNull(),
  status: statusEnum("status").notNull(),
});

export type Invoice = typeof Invoices.$inferSelect;

function warnMigrationPending() {
  console.warn(
    "[invoices] Columns invoices.name/email are missing: apply migration " +
      "src/db/migrations/0004_invoice_billing_details.sql. Falling back to legacy columns."
  );
}

async function withLegacyFallback<T>(query: () => Promise<T>, legacy: () => Promise<T>): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    warnMigrationPending();
    return legacy();
  }
}

const withoutBilling = <R extends object>(rows: R[]) =>
  rows.map((row) => ({ ...row, name: null, email: null }));

export function listInvoices(userId: string): Promise<Invoice[]> {
  return withLegacyFallback(
    () => db.select().from(Invoices).where(eq(Invoices.userId, userId)),
    async () =>
      withoutBilling(await db.select().from(LegacyInvoices).where(eq(LegacyInvoices.userId, userId)))
  );
}

export async function getInvoice(userId: string, invoiceId: number): Promise<Invoice | undefined> {
  const rows = await withLegacyFallback(
    () =>
      db.select().from(Invoices)
        .where(and(eq(Invoices.id, invoiceId), eq(Invoices.userId, userId)))
        .limit(1),
    async () =>
      withoutBilling(
        await db.select().from(LegacyInvoices)
          .where(and(eq(LegacyInvoices.id, invoiceId), eq(LegacyInvoices.userId, userId)))
          .limit(1)
      )
  );
  return rows[0];
}

/**
 * Inserts an open invoice and returns its id. Before migration 0004 is applied
 * the billing name/email cannot be stored; the invoice is still created (the
 * app's previous behaviour) and a warning is logged.
 */
export async function createInvoice(userId: string, input: InvoiceInput): Promise<number> {
  const { name, email, value, description } = input;
  const base = { value, description, userId, status: "open" as const };
  const [row] = await withLegacyFallback(
    () => db.insert(Invoices).values({ ...base, name, email }).returning({ id: Invoices.id }),
    () => db.insert(LegacyInvoices).values(base).returning({ id: LegacyInvoices.id })
  );
  return row.id;
}
