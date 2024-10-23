import { integer, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
export const statusEnum = pgEnum('status',['open','paid','void','uncollectinle'])
export const Invoices = pgTable('invoices', {
  id: serial('id').primaryKey().notNull(),
  createTs: timestamp('createTs').notNull().defaultNow(),
  value: integer('value').notNull(),
  description: text('description').notNull(),
  status: statusEnum('status').notNull()
})