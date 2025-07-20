/**
 * SEC-007: 環境変数管理の改善
 * 環境変数の厳密な検証と安全な管理
 */

interface EnvVariable {
  name: string
  value: string | undefined
  required: boolean
  pattern?: RegExp
  validator?: (value: string) => boolean
}

interface ValidatedEnv {
  [key: string]: string
}

/**
 * 環境変数の検証エラー
 */
export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvValidationError'
  }
}

/**
 * URLの妥当性を検証
 */
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    // HTTPSのみ許可（開発環境ではHTTPも許可）
    const allowedProtocols = import.meta.env.DEV 
      ? ['http:', 'https:'] 
      : ['https:']
    
    if (!allowedProtocols.includes(parsed.protocol)) {
      return false
    }
    
    // 有効なホスト名かチェック
    if (!parsed.hostname || parsed.hostname === 'localhost' && import.meta.env.PROD) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

/**
 * Supabase Anon Keyの形式を検証
 */
const isValidSupabaseAnonKey = (key: string): boolean => {
  // Supabase Anon Keyは通常、JWTトークンの形式
  // 基本的な形式チェックのみ実施
  const jwtPattern = /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
  return jwtPattern.test(key)
}

/**
 * 環境変数を検証
 */
export const validateEnvVariables = (variables: EnvVariable[]): ValidatedEnv => {
  const validated: ValidatedEnv = {}
  const errors: string[] = []

  for (const variable of variables) {
    const { name, value, required, pattern, validator } = variable

    // 必須チェック
    if (required && !value) {
      errors.push(`Missing required environment variable: ${name}`)
      continue
    }

    // 値が存在する場合の検証
    if (value) {
      // 空文字列チェック
      if (value.trim() === '') {
        errors.push(`Environment variable ${name} is empty`)
        continue
      }

      // パターンマッチング
      if (pattern && !pattern.test(value)) {
        errors.push(`Environment variable ${name} has invalid format`)
        continue
      }

      // カスタムバリデーター
      if (validator && !validator(value)) {
        errors.push(`Environment variable ${name} is invalid`)
        continue
      }

      validated[name] = value
    }
  }

  if (errors.length > 0) {
    throw new EnvValidationError(errors.join('\n'))
  }

  return validated
}

/**
 * Supabase用の環境変数を検証
 */
export const validateSupabaseEnv = () => {
  const envVars: EnvVariable[] = [
    {
      name: 'VITE_SUPABASE_URL',
      value: import.meta.env.VITE_SUPABASE_URL,
      required: true,
      validator: isValidUrl
    },
    {
      name: 'VITE_SUPABASE_ANON_KEY',
      value: import.meta.env.VITE_SUPABASE_ANON_KEY,
      required: true,
      validator: isValidSupabaseAnonKey
    }
  ]

  try {
    const validated = validateEnvVariables(envVars)
    return {
      supabaseUrl: validated.VITE_SUPABASE_URL,
      supabaseAnonKey: validated.VITE_SUPABASE_ANON_KEY
    }
  } catch (error) {
    // 本番環境では詳細なエラーメッセージを出さない
    if (import.meta.env.PROD) {
      throw new Error('Invalid configuration')
    }
    throw error
  }
}

/**
 * 環境変数の値をマスク表示（デバッグ用）
 */
export const maskEnvValue = (value: string, showChars: number = 4): string => {
  if (value.length <= showChars * 2) {
    return '*'.repeat(value.length)
  }
  
  const start = value.substring(0, showChars)
  const end = value.substring(value.length - showChars)
  const maskedLength = Math.max(value.length - showChars * 2, 3)
  
  return `${start}${'*'.repeat(maskedLength)}${end}`
}

/**
 * 環境変数の安全な取得
 */
export const getEnvVariable = (name: string, defaultValue?: string): string => {
  // @ts-ignore - import.meta.env の動的アクセスを許可
  const value = import.meta.env[name]
  
  if (!value && !defaultValue) {
    throw new EnvValidationError(`Environment variable ${name} is not defined`)
  }
  
  return value || defaultValue || ''
}

/**
 * 環境変数の型安全な取得
 */
export const getTypedEnvVariable = <T extends string | number | boolean>(
  name: string,
  type: 'string' | 'number' | 'boolean',
  defaultValue?: T
): T => {
  const value = getEnvVariable(name, defaultValue?.toString())
  
  switch (type) {
    case 'number':
      const num = Number(value)
      if (isNaN(num)) {
        throw new EnvValidationError(`Environment variable ${name} must be a number`)
      }
      return num as T
    
    case 'boolean':
      if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
        throw new EnvValidationError(`Environment variable ${name} must be a boolean`)
      }
      return (value.toLowerCase() === 'true' || value === '1') as T
    
    default:
      return value as T
  }
}

/**
 * 開発環境かどうかのチェック
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV === true
}

/**
 * 本番環境かどうかのチェック
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD === true
}

/**
 * モック環境かどうかのチェック（SEC-002対応）
 */
export const isMockEnabled = (): boolean => {
  // 本番環境では必ずfalse
  if (isProduction()) {
    return false
  }
  
  // 開発環境では環境変数で制御
  return getTypedEnvVariable('VITE_ENABLE_MOCK_AUTH', 'boolean', false)
}