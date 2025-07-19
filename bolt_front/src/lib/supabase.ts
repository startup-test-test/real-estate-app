import { createClient } from '@supabase/supabase-js'
import { getSupabaseCSRFConfig } from '../utils/csrf'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// SEC-004: CSRF対策を適用したSupabaseクライアント
export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey,
  getSupabaseCSRFConfig()
)