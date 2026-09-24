import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { expect, test as setup } from "@playwright/test";

import {
  AUTH_FILE,
  E2E_PASSWORD,
  E2E_USERNAME,
  hasE2ECredentials,
  MISSING_CREDENTIALS_MESSAGE,
  writeEmptyStorageState,
} from "./helpers";

// Setup must run serially (see Clerk's Playwright guide).
setup.describe.configure({ mode: "serial" });

setup("configure Clerk testing token", async () => {
  // Reads NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY (it loads
  // .env.local itself) and exposes CLERK_FAPI + CLERK_TESTING_TOKEN to tests.
  await clerkSetup();
});

setup("sign in test user and save auth state", async ({ page }) => {
  // Always leave a valid storage file behind so the authenticated project can
  // start and report its own skips.
  writeEmptyStorageState(AUTH_FILE);
  setup.skip(!hasE2ECredentials, MISSING_CREDENTIALS_MESSAGE);

  // clerk.signIn needs a page that loads Clerk and is not protected.
  await page.goto("/");
  await clerk.loaded({ page });
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      identifier: E2E_USERNAME!,
      password: E2E_PASSWORD!,
    },
  });

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Invoices" })).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});
