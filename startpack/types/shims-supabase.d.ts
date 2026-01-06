// Optional Supabase shims to allow building without installing supabase packages
// These are used when the Supabase provider is not selected.

declare module '@supabase/supabase-js' {
  export type SupabaseClient = any
  export function createClient(...args: any[]): any
}

declare module '@supabase/ssr' {
  export function createBrowserClient(...args: any[]): any
  export function createServerClient(...args: any[]): any
}

