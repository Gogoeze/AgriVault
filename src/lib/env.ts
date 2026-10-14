/**
 * Validated client environment.
 *
 * Only VITE_* variables reach the browser bundle. Anything secret — the
 * service-role key, the Resend API key — belongs to Supabase Edge Functions
 * and must never appear here.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    )
  }
  return value
}

export const env = {
  supabaseUrl: required("VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL),
  supabasePublishableKey: required(
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  ),
  appUrl: import.meta.env.VITE_APP_URL ?? window.location.origin,
  isProduction: import.meta.env.PROD,
} as const
