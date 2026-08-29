import { createClient, SupabaseClient } from "@supabase/supabase-js";

let serverAdminClient: SupabaseClient | null = null;

/**
 * Server-only Supabase client with service role authorization.
 * CRITICAL SECURITY: This module must NEVER be imported in client-side code.
 * It is only utilized inside server functions (createServerFn / Nitro handlers).
 */
export function getServerSupabaseAdmin(): SupabaseClient {
  if (serverAdminClient) return serverAdminClient;

  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://emlhfbbkwdpmdodjruje.supabase.co";

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "[Supabase Server Admin] Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Server-side mutations cannot proceed.",
    );
  }

  serverAdminClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverAdminClient;
}
