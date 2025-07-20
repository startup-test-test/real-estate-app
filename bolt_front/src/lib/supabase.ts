import { createClient } from '@supabase/supabase-js'
import { getSupabaseCSRFConfig } from '../utils/csrf'
import { validateSupabaseEnv, maskEnvValue, isDevelopment } from '../utils/envValidator'

// SEC-007: 環境変数の厳密な検証
let supabaseUrl: string
let supabaseAnonKey: string

try {
  const validated = validateSupabaseEnv()
  supabaseUrl = validated.supabaseUrl
  supabaseAnonKey = validated.supabaseAnonKey
  
  // 開発環境でのみデバッグ情報を表示
  if (isDevelopment()) {
    console.log('Supabase URL:', maskEnvValue(supabaseUrl, 8))
    console.log('Supabase Anon Key:', maskEnvValue(supabaseAnonKey, 8))
  }
} catch (error) {
  // 本番環境では詳細なエラー情報を隠蔽
  const message = isDevelopment() && error instanceof Error 
    ? error.message 
    : 'Failed to initialize Supabase client'
  
  console.error(message)
  throw new Error(message)
}

// SEC-004: CSRF対策を適用したSupabaseクライアント
export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey,
  getSupabaseCSRFConfig()
)