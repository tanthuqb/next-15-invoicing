import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client for Server Components / Server Actions / Route Handlers.
// Injects the Clerk session token so RLS policies can read auth.jwt()->>'sub'.
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
    }
  );
}
