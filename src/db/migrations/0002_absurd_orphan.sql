CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"stripeProductId" text NOT NULL,
	"stripePriceId" text NOT NULL,
	"userId" text NOT NULL,
	"createTs" timestamp DEFAULT now() NOT NULL
);
