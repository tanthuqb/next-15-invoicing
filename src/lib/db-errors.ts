// Postgres SQLSTATE 42703 = undefined_column. Drizzle wraps driver errors in
// DrizzleQueryError and keeps the original pg error on `cause`.
const UNDEFINED_COLUMN = "42703";

export function isMissingColumnError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current instanceof Error; depth++) {
    if ((current as Error & { code?: unknown }).code === UNDEFINED_COLUMN) return true;
    current = current.cause;
  }
  return false;
}
