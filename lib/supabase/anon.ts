import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-free anonymous client for rendering published sites.
 *
 * Deliberately not session-aware: published-site reads are wrapped in
 * `unstable_cache` (see lib/tenant.ts), and reading cookies inside a cached
 * scope is both forbidden and would leak per-user data into a shared cache.
 * RLS is the gatekeeper — only published content is visible to anon.
 */
export function createAnonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
