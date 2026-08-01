"use client";

import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { useMemo } from "react";

// Supabase client for Client Components.
// Injects the Clerk session token so RLS policies can read auth.jwt()->>'sub'.
export function useClerkSupabaseClient() {
  const { session } = useSession();

  return useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          async accessToken() {
            return session?.getToken() ?? null;
          },
        }
      ),
    [session]
  );
}
