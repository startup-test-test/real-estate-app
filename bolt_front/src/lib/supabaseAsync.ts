/**
 * SEC-065: 環境変数の直接露出対策
 * 非同期でSupabaseクライアントを初期化
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseCSRFConfig } from '../utils/csrf';
import { configProxy } from '../utils/configProxy';
import { logger } from '../utils/logger';

let supabaseInstance: SupabaseClient | null = null;
let initializationPromise: Promise<SupabaseClient> | null = null;

/**
 * Supabaseクライアントを非同期で初期化
 */
export async function initializeSupabase(): Promise<SupabaseClient> {
  // 既に初期化済みの場合はそれを返す
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // 初期化中の場合は同じPromiseを返す
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      // 設定を取得
      const publicConfig = await configProxy.getPublicConfig();
      const supabaseUrl = publicConfig.supabase.url;
      
      // Anon Keyを取得（認証状態に応じて適切な方法で取得）
      const supabaseAnonKey = await configProxy.getSupabaseAnonKey();
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }

      // Supabaseクライアントを作成
      supabaseInstance = createClient(
        supabaseUrl,
        supabaseAnonKey,
        getSupabaseCSRFConfig()
      );

      logger.log('Supabase client initialized successfully');
      return supabaseInstance;
    } catch (error) {
      logger.error('Failed to initialize Supabase client:', error);
      // エラー時は従来の方法にフォールバック
      return createFallbackClient();
    }
  })();

  return initializationPromise;
}

/**
 * フォールバック用のクライアントを作成
 */
function createFallbackClient(): SupabaseClient {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not set');
  }

  supabaseInstance = createClient(
    supabaseUrl,
    supabaseAnonKey,
    getSupabaseCSRFConfig()
  );

  return supabaseInstance;
}

/**
 * 初期化済みのSupabaseクライアントを取得
 * 注意: この関数を使用する前に必ずinitializeSupabase()を呼び出すこと
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    // 開発環境では警告を出す
    if (import.meta.env.DEV) {
      console.warn('Supabase client is not initialized. Call initializeSupabase() first.');
    }
    // 緊急時のフォールバック
    return createFallbackClient();
  }
  return supabaseInstance;
}

/**
 * Supabaseクライアントが初期化済みかチェック
 */
export function isSupabaseInitialized(): boolean {
  return supabaseInstance !== null;
}

/**
 * Supabaseクライアントをリセット（テスト用）
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null;
  initializationPromise = null;
  configProxy.clearCache();
}