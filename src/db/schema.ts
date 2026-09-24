import { integer, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum('status',['open','paid','void','uncollectinle'])

export const Invoices = pgTable('invoices', {
  id: serial('id').primaryKey().notNull(),
  createTs: timestamp('createTs').notNull().defaultNow(),
  value: integer('value').notNull(),
  description: text('description').notNull(),
  userId: text('userId').notNull(),
  status: statusEnum('status').notNull(),
  // Billing details. Nullable on purpose: invoices created before these
  // columns existed have no real name/email, and inventing a placeholder
  // would be fake data. New invoices always set both (validated in
  // createAction / src/lib/invoice-input.ts).
  name: text('name'),
  email: text('email'),
})

export const Products = pgTable('products', {
  id: serial('id').primaryKey().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // price in cents
  stripeProductId: text('stripeProductId').notNull(),
  stripePriceId: text('stripePriceId').notNull(),
  userId: text('userId').notNull(),
  createTs: timestamp('createTs').notNull().defaultNow(),
})