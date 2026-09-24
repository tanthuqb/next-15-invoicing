import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";

test.describe("public pages", () => {
  test.beforeEach(async ({ page }) => {
    // Lets Clerk's Frontend API requests through bot protection.
    await setupClerkTestingToken({ page });
  });

  test("home page renders", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Invoicipedia");
    await expect(page.getByRole("heading", { level: 1, name: "Invoicipedia" })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("sign-in page renders the Clerk sign-in form", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator(".cl-signIn-root")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeVisible();
  });

  test("sign-up page renders the Clerk sign-up form", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.locator(".cl-signUp-root")).toBeVisible();
  });
});

test.describe("protected routes redirect unauthenticated users to sign-in", () => {
  for (const path of [
    "/dashboard",
    "/dashboard/products",
    "/invoices/new",
    "/invoices/1",
    "/checkout",
  ]) {
    test(`${path} -> /sign-in`, async ({ page }) => {
      await setupClerkTestingToken({ page });
      await page.goto(path);
      await expect(page).toHaveURL(/\/sign-in(\?|\/|$)/);
      const url = new URL(page.url());
      expect(url.searchParams.get("redirect_url") ?? "").toContain(path);
      await expect(page.locator(".cl-signIn-root")).toBeVisible();
    });
  }
});

test.describe("API routes", () => {
  test("Stripe webhook is public and rejects requests without a signature (400)", async ({
    request,
  }) => {
    const res = await request.post("/api/webhook/stripe", {
      data: JSON.stringify({ type: "checkout.session.completed" }),
      headers: { "content-type": "application/json" },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(400);
    expect(await res.text()).toContain("No stripe-signature header value was provided.");
  });

  test("Stripe webhook rejects an invalid signature (400)", async ({ request }) => {
    const res = await request.post("/api/webhook/stripe", {
      data: "{}",
      headers: {
        "content-type": "application/json",
        "stripe-signature": "t=1,v1=deadbeef",
      },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(400);
    expect(await res.text()).toContain("Webhook Error");
  });

  for (const path of [
    "/api/webhook/stripe/session/checkout",
    "/api/webhook/stripe/session/portal",
  ]) {
    test(`${path} returns 401 without a Clerk session`, async ({ request }) => {
      const res = await request.post(path, {
        form: { lookup_key: "starter_plan" },
        maxRedirects: 0,
      });
      expect(res.status()).toBe(401);
    });
  }
});
