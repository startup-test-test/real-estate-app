import { createClient } from '@supabase/supabase-js'
import { getSupabaseCSRFConfig } from '../utils/csrf'
import { validateSupabaseEnv, maskEnvValue, isDevelopment } from '../utils/envValidator'
import { logger } from '../utils/logger'

// SEC-065: 環境変数の直接露出対策
// 注意: このファイルは後方互換性のために残されています。
// 新しいコードではsupabaseAsync.tsを使用してください。

// SEC-007: 環境変数の厳密な検証
let supabaseUrl: string
let supabaseAnonKey: string

try {
  const validated = validateSupabaseEnv()
  supabaseUrl = validated.supabaseUrl
  supabaseAnonKey = validated.supabaseAnonKey
  
  // 開発環境でのみデバッグ情報を表示
  if (isDevelopment()) {
    logger.log('Supabase URL:', maskEnvValue(supabaseUrl, 8))
    logger.log('Supabase Anon Key:', maskEnvValue(supabaseAnonKey, 8))
  }
} catch (error) {
  // 本番環境では詳細なエラー情報を隠蔽
  const message = isDevelopment() && error instanceof Error 
    ? error.message 
    : 'Failed to initialize Supabase client'
  
  logger.error(message)
  
  // 開発環境では例外をスロー、本番環境では空の値を設定
  if (isDevelopment()) {
    throw new Error(message)
  } else {
    // 本番環境では後でsupabaseAsync経由で初期化される
    supabaseUrl = ''
    supabaseAnonKey = ''
  }
}

// SEC-004: CSRF対策を適用したSupabaseクライアント
// 警告: このクライアントは環境変数を直接使用しています
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, getSupabaseCSRFConfig())
  : null as any // 本番環境では後で初期化される

// 非推奨の警告を表示
if (isDevelopment()) {
  console.warn(
    'Direct import of supabase client is deprecated. ' +
    'Use initializeSupabase() from lib/supabaseAsync.ts instead.'
  )
}