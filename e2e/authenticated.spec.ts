import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";
import Stripe from "stripe";

import { hasE2ECredentials, MISSING_CREDENTIALS_MESSAGE } from "./helpers";

// Runs with the signed-in storage state saved by global.setup.ts.
test.skip(!hasE2ECredentials, MISSING_CREDENTIALS_MESSAGE);

test.beforeEach(async ({ page }) => {
  await setupClerkTestingToken({ page });
});

const STRIPE_CHECKOUT_URL = /^https:\/\/checkout\.stripe\.com\//;

test("dashboard lists invoices and links to the main flows", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Invoices" })).toBeVisible();
  await expect(page.getByText("A list of your recent invoices.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Create Invoice" })).toHaveAttribute("href", "/invoices/new");
  await expect(page.getByRole("link", { name: "Products" })).toHaveAttribute("href", "/dashboard/products");
  await expect(page.getByRole("link", { name: "Checkout" })).toHaveAttribute("href", "/checkout");
});

test("create invoice stores the exact amount and shows it on the dashboard", async ({ page }) => {
  const description = `E2E invoice ${Date.now()}`;

  await page.goto("/invoices/new");
  await expect(page.getByRole("heading", { name: "Create Invoice" })).toBeVisible();
  await page.getByLabel("Billing Name").fill("E2E Customer");
  await page.getByLabel("Billing Email").fill("e2e+clerk_test@example.com");
  // 19.99 * 100 is 1998.999... in floating point; must be stored as 1999 cents.
  await page.getByLabel("Value").fill("19.99");
  await page.getByLabel("Description").fill(description);
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL(/\/invoices\/\d+$/);
  const invoiceId = page.url().split("/").pop()!;
  await expect(page.getByRole("heading", { name: new RegExp(`Invoice ${invoiceId}`) })).toBeVisible();
  await expect(page.getByText("$19.99")).toBeVisible();
  await expect(page.getByText(description)).toBeVisible();
  await expect(page.getByText("open", { exact: true })).toBeVisible();

  await page.goto("/dashboard");
  await expect(page.locator(`a[href="/invoices/${invoiceId}"]`).first()).toBeVisible();
});

test("unknown or malformed invoice ids render 404", async ({ page }) => {
  for (const id of ["not-a-number", "999999999"]) {
    const res = await page.goto(`/invoices/${id}`);
    expect(res?.status()).toBe(404);
  }
});

test.describe("products", () => {
  const productName = `E2E Product ${Date.now()}`;

  test.afterAll(async () => {
    // Archive the test-mode Stripe product this suite created.
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key?.startsWith("sk_test_")) return;
    const stripe = new Stripe(key);
    // products.search is eventually consistent, so scan the newest products.
    const recent = await stripe.products.list({ limit: 25 });
    for (const product of recent.data.filter((p) => p.name === productName)) {
      await stripe.products.update(product.id, { active: false });
    }
  });

  test("products page renders", async ({ page }) => {
    await page.goto("/dashboard/products");
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
    await expect(page.getByText("Manage and sell your products via Stripe.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Product" })).toBeVisible();
  });

  test("create a product without a description syncs it to Stripe", async ({ page }) => {
    await page.goto("/dashboard/products");
    await page.getByRole("button", { name: "Create Product" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Create New Product" })).toBeVisible();
    await dialog.getByLabel("Name").fill(productName);
    // Description intentionally left blank (Stripe rejects empty strings).
    await dialog.getByLabel("Price (USD)").fill("12.34");
    await dialog.getByRole("button", { name: "Save Product" }).click();

    // The form reloads the page on success.
    const row = page.getByRole("row").filter({ hasText: productName });
    await expect(row).toBeVisible();
    await expect(row).toContainText("$12.34");
    await expect(row.getByRole("link", { name: "View on Stripe" })).toHaveAttribute(
      "href",
      /^https:\/\/dashboard\.stripe\.com\/products\/prod_/
    );
  });

  test("Buy redirects to Stripe Checkout", async ({ page }) => {
    await page.goto("/dashboard/products");
    const row = page.getByRole("row").filter({ hasText: productName });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "Buy" }).click();
    await page.waitForURL(STRIPE_CHECKOUT_URL, { timeout: 60_000 });
  });
});

test.describe("subscription checkout", () => {
  test("checkout page lists the three plans", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Choose Your Plan" })).toBeVisible();
    for (const plan of ["Subscribe to Starter", "Subscribe to Pro", "Subscribe to Enterprise"]) {
      await expect(page.getByRole("button", { name: plan })).toBeVisible();
    }
  });

  test("subscribing redirects to Stripe Checkout", async ({ page }) => {
    await page.goto("/checkout");
    await page.getByRole("button", { name: "Subscribe to Starter" }).click();
    await page.waitForURL(STRIPE_CHECKOUT_URL, { timeout: 60_000 });
  });

  test("canceled checkout shows the cancel message", async ({ page }) => {
    await page.goto("/checkout?canceled=true");
    await expect(page.getByText(/Order canceled/)).toBeVisible();
  });
});
