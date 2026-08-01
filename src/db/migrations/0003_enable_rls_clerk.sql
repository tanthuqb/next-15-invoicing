-- Enable Row Level Security for Data API access with Clerk third-party auth.
-- Clerk user id is carried in the JWT `sub` claim: auth.jwt()->>'sub'.
-- Direct Postgres connections (drizzle) run as the table owner and are unaffected.

ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE POLICY "Users can view their own invoices"
ON "public"."invoices" FOR SELECT TO authenticated
USING ((SELECT auth.jwt()->>'sub') = "userId");--> statement-breakpoint

CREATE POLICY "Users can create their own invoices"
ON "public"."invoices" FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.jwt()->>'sub') = "userId");--> statement-breakpoint

CREATE POLICY "Users can update their own invoices"
ON "public"."invoices" FOR UPDATE TO authenticated
USING ((SELECT auth.jwt()->>'sub') = "userId")
WITH CHECK ((SELECT auth.jwt()->>'sub') = "userId");--> statement-breakpoint

CREATE POLICY "Users can delete their own invoices"
ON "public"."invoices" FOR DELETE TO authenticated
USING ((SELECT auth.jwt()->>'sub') = "userId");--> statement-breakpoint

CREATE POLICY "Users can view their own products"
ON "public"."products" FOR SELECT TO authenticated
USING ((SELECT auth.jwt()->>'sub') = "userId");--> statement-breakpoint

CREATE POLICY "Users can create their own products"
ON "public"."products" FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.jwt()->>'sub') = "userId");--> statement-breakpoint

CREATE POLICY "Users can update their own products"
ON "public"."products" FOR UPDATE TO authenticated
USING ((SELECT auth.jwt()->>'sub') = "userId")
WITH CHECK ((SELECT auth.jwt()->>'sub') = "userId");--> statement-breakpoint

CREATE POLICY "Users can delete their own products"
ON "public"."products" FOR DELETE TO authenticated
USING ((SELECT auth.jwt()->>'sub') = "userId");
