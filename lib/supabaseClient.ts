import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * Server-side Supabase client. Every DB call in this app runs on the server
 * (server components + route handlers), so the browser never touches Supabase
 * directly.
 *
 * Prefers SUPABASE_SERVICE_ROLE_KEY (server-only env, never NEXT_PUBLIC) which
 * bypasses RLS. Falls back to the public anon key so the app keeps working
 * before the service key is added. Once RLS is enabled (migration 0002), only
 * the service-role path can read/write - the public anon key is locked out.
 *
 * Returns null until env vars are set, so the app runs on mock data locally
 * without a live project.
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
