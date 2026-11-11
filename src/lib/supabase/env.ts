// The publishable key is safe in the browser: row-level security decides what
// it can read. The secret (service role) key must never get a NEXT_PUBLIC_ name.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabaseConfigured = supabaseUrl !== "" && supabasePublishableKey !== "";

export function requireSupabaseEnv() {
  if (!supabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and fill in the project URL and publishable key.",
    );
  }
  return { url: supabaseUrl, key: supabasePublishableKey };
}
