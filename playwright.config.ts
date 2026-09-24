import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

import { AUTH_FILE } from "./e2e/helpers";

// Same env file the app uses; E2E_CLERK_USER_* may live here or in the shell.
dotenv.config({ path: [".env.local", ".env"], quiet: true });

const PORT = Number(process.env.E2E_PORT ?? 3101);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Tests share one dev server and one Clerk test user, so keep them serial:
  // Next.js dev compiles routes on demand and parallel first hits are slow.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    navigationTimeout: 60_000,
  },
  projects: [
    {
      // Pure logic tests: no browser, no auth, no database.
      name: "unit",
      testMatch: /\.unit\.spec\.ts$/,
    },
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "public",
      testMatch: /public\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
    {
      name: "authenticated",
      testMatch: /authenticated\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: AUTH_FILE },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
