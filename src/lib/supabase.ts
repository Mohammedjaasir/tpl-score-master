import { createClient } from "@supabase/supabase-js";

// Read environment variables (supports Vite, Next, and process conventions)
const rawUrl =
  (typeof process !== "undefined" && (process.env?.VITE_SUPABASE_URL || process.env?.NEXT_PUBLIC_SUPABASE_URL)) ||
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  "";

const rawKey =
  (typeof process !== "undefined" &&
    (process.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env?.VITE_SUPABASE_ANON_KEY ||
      process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY)) ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// Diagnostic flags (DO NOT log keys)
console.log("[Supabase Config] SUPABASE_URL_PRESENT =", Boolean(rawUrl));
console.log("[Supabase Config] SUPABASE_PUBLIC_KEY_PRESENT =", Boolean(rawKey));

// Safe URL & Key fallback to avoid fatal module-level exceptions if env is missing
const validUrl =
  rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))
    ? rawUrl
    : "https://placeholder.supabase.co";

const validKey = rawKey || "placeholder-anon-key";

if (!rawUrl || !rawKey) {
  console.warn(
    "[Supabase Config] Missing production environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Queries will fail gracefully.",
  );
}

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
