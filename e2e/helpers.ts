import fs from "node:fs";

// Signed-in browser state written by global.setup.ts and reused by the
// authenticated project (git-ignored).
export const AUTH_FILE = "playwright/.clerk/user.json";

export const E2E_USERNAME = process.env.E2E_CLERK_USER_USERNAME;
export const E2E_PASSWORD = process.env.E2E_CLERK_USER_PASSWORD;

export const hasE2ECredentials = Boolean(E2E_USERNAME && E2E_PASSWORD);

export const MISSING_CREDENTIALS_MESSAGE =
  "Skipping authenticated E2E tests: set E2E_CLERK_USER_USERNAME and " +
  "E2E_CLERK_USER_PASSWORD to a Clerk (development instance) user that signs in " +
  "with username/email + password.";

const EMPTY_STATE = JSON.stringify({ cookies: [], origins: [] });

/** Ensures a storage-state file exists so projects that reference it can start. */
export function writeEmptyStorageState(file: string) {
  fs.mkdirSync(file.substring(0, file.lastIndexOf("/")), { recursive: true });
  fs.writeFileSync(file, EMPTY_STATE);
}
