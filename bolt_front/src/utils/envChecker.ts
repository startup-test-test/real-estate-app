/**
 * SEC-044: 環境変数の設定チェック強化
 * 本番環境での起動時検証とエラーハンドリング
 */

import { validateSupabaseEnv, EnvValidationError, isDevelopment, isProduction } from './envValidator';
import { logger } from './logger';

interface EnvCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 必須環境変数のリスト
 */
const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
] as const;

/**
 * オプション環境変数のリスト
 */
const OPTIONAL_ENV_VARS = [
  'VITE_ENABLE_MOCK_MODE',
  'VITE_ENABLE_MOCK_AUTH'
] as const;

/**
 * 環境変数の包括的なチェック
 */
export const checkEnvironmentVariables = (): EnvCheckResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 必須環境変数のチェック
  for (const varName of REQUIRED_ENV_VARS) {
    const value = import.meta.env[varName];
    
    if (!value) {
      errors.push(`Missing required environment variable: ${varName}`);
    } else if (value.trim() === '') {
      errors.push(`Environment variable ${varName} is empty`);
    }
  }

  // Supabase環境変数の詳細検証
  try {
    validateSupabaseEnv();
  } catch (error) {
    if (error instanceof EnvValidationError) {
      errors.push(error.message);
    } else {
      errors.push('Failed to validate Supabase environment variables');
    }
  }

  // 本番環境での追加チェック
  if (isProduction()) {
    // モックモードが無効になっているか確認
    const mockMode = import.meta.env.VITE_ENABLE_MOCK_MODE;
    if (mockMode === 'true' || mockMode === true) {
      errors.push('Mock mode must be disabled in production (VITE_ENABLE_MOCK_MODE)');
    }

    const mockAuth = import.meta.env.VITE_ENABLE_MOCK_AUTH;
    if (mockAuth === 'true' || mockAuth === true) {
      errors.push('Mock auth must be disabled in production (VITE_ENABLE_MOCK_AUTH)');
    }

    // Supabase URLがlocalhostでないことを確認
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl && (supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1'))) {
      errors.push('Production environment cannot use localhost Supabase URL');
    }
  }

  // 開発環境での警告
  if (isDevelopment()) {
    // オプション環境変数の警告
    for (const varName of OPTIONAL_ENV_VARS) {
      const value = import.meta.env[varName];
      if (!value) {
        warnings.push(`Optional environment variable not set: ${varName}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * 環境変数チェックの結果を表示
 */
export const displayEnvCheckResult = (result: EnvCheckResult): void => {
  if (!result.isValid) {
    logger.error('Environment variable validation failed:');
    result.errors.forEach(error => logger.error(`  - ${error}`));
  }

  if (result.warnings.length > 0 && isDevelopment()) {
    logger.warn('Environment variable warnings:');
    result.warnings.forEach(warning => logger.warn(`  - ${warning}`));
  }

  if (result.isValid && result.warnings.length === 0) {
    logger.log('✅ All environment variables are properly configured');
  }
};

/**
 * アプリケーション起動時の環境変数チェック
 */
export const performStartupEnvCheck = (): void => {
  const result = checkEnvironmentVariables();
  
  // 開発環境では詳細を表示
  if (isDevelopment()) {
    displayEnvCheckResult(result);
  }

  // 本番環境でエラーがある場合は起動を停止
  if (isProduction() && !result.isValid) {
    // セキュリティのため、本番環境では詳細なエラーメッセージを表示しない
    console.error('Application startup failed: Invalid configuration');
    
    // エラー画面を表示（実装に応じて調整）
    const errorContainer = document.getElementById('root');
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui;">
          <div style="text-align: center;">
            <h1 style="color: #ef4444;">設定エラー</h1>
            <p style="color: #6b7280;">アプリケーションの起動に失敗しました。</p>
            <p style="color: #6b7280;">システム管理者にお問い合わせください。</p>
          </div>
        </div>
      `;
    }
    
    // これ以上の処理を停止
    throw new Error('Invalid environment configuration');
  }
};

/**
 * 環境変数の健全性チェック（ランタイム用）
 */
export const isEnvironmentHealthy = (): boolean => {
  try {
    const result = checkEnvironmentVariables();
    return result.isValid;
  } catch {
    return false;
  }
};