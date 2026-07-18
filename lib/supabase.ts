import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase is OPTIONAL until credentials are added. When the env vars below are
 * absent, the app runs on the local fallback store (dev) and the hardcoded
 * defaults, so the site is never blank and edit-saving degrades gracefully.
 *
 * Only the SERVICE ROLE key is used, and only ever on the server (route handlers
 * + server components). It is never imported into a client component.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const IMAGE_BUCKET = "site-images";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
}

let cached: SupabaseClient | null = null;

/** Server-only admin client (service role). Returns null if not configured. */
export function getAdminClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
