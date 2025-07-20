import { describe, it, expect } from 'vitest'
import {
  validateEnvVariables,
  validateSupabaseEnv,
  maskEnvValue,
  EnvValidationError
} from '../envValidator'

describe('envValidator', () => {
  describe('validateEnvVariables', () => {
    it('必須の環境変数が存在する場合は検証に成功する', () => {
      const variables = [
        { name: 'TEST_VAR', value: 'test-value', required: true }
      ]
      
      const result = validateEnvVariables(variables)
      expect(result).toEqual({ TEST_VAR: 'test-value' })
    })

    it('必須の環境変数が存在しない場合はエラーをスローする', () => {
      const variables = [
        { name: 'MISSING_VAR', value: undefined, required: true }
      ]
      
      expect(() => validateEnvVariables(variables)).toThrow(EnvValidationError)
      expect(() => validateEnvVariables(variables)).toThrow('Missing required environment variable: MISSING_VAR')
    })

    it('空文字列の環境変数はエラーをスローする', () => {
      const variables = [
        { name: 'EMPTY_VAR', value: '   ', required: true }
      ]
      
      expect(() => validateEnvVariables(variables)).toThrow('Environment variable EMPTY_VAR is empty')
    })

    it('パターンに一致しない値はエラーをスローする', () => {
      const variables = [
        { 
          name: 'PATTERN_VAR', 
          value: 'invalid-format', 
          required: true,
          pattern: /^\d+$/
        }
      ]
      
      expect(() => validateEnvVariables(variables)).toThrow('Environment variable PATTERN_VAR has invalid format')
    })

    it('カスタムバリデーターで検証失敗時はエラーをスローする', () => {
      const variables = [
        { 
          name: 'CUSTOM_VAR', 
          value: 'invalid', 
          required: true,
          validator: (value: string) => value === 'valid'
        }
      ]
      
      expect(() => validateEnvVariables(variables)).toThrow('Environment variable CUSTOM_VAR is invalid')
    })

    it('複数のエラーがある場合は全てのエラーメッセージを含む', () => {
      const variables = [
        { name: 'MISSING1', value: undefined, required: true },
        { name: 'MISSING2', value: undefined, required: true }
      ]
      
      expect(() => validateEnvVariables(variables)).toThrow(/MISSING1.*\n.*MISSING2/)
    })

    it('オプションの環境変数が存在しない場合はエラーをスローしない', () => {
      const variables = [
        { name: 'OPTIONAL_VAR', value: undefined, required: false }
      ]
      
      const result = validateEnvVariables(variables)
      expect(result).toEqual({})
    })
  })

  describe('validateSupabaseEnv', () => {
    it('現在の環境変数が有効であることを確認する', () => {
      // 実際の環境変数を使用してテスト
      // CI環境やローカル環境では実際のSupabase環境変数が設定されているはず
      const result = validateSupabaseEnv()
      expect(result).toHaveProperty('supabaseUrl')
      expect(result).toHaveProperty('supabaseAnonKey')
      expect(result.supabaseUrl).toMatch(/^https?:\/\//)
      expect(result.supabaseAnonKey).toBeTruthy()
    })

    it('URLバリデーションが正しく動作する', () => {
      const variables = [
        {
          name: 'TEST_URL',
          value: 'not-a-url',
          required: true,
          validator: (value: string) => {
            try {
              new URL(value)
              return true
            } catch {
              return false
            }
          }
        }
      ]
      
      expect(() => validateEnvVariables(variables)).toThrow('Environment variable TEST_URL is invalid')
    })

    it('JWTパターンのバリデーションが正しく動作する', () => {
      const variables = [
        {
          name: 'TEST_JWT',
          value: 'not-a-jwt',
          required: true,
          pattern: /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
        }
      ]
      
      expect(() => validateEnvVariables(variables)).toThrow('Environment variable TEST_JWT has invalid format')
    })
  })

  describe('maskEnvValue', () => {
    it('環境変数の値をマスク表示する', () => {
      expect(maskEnvValue('secret-key-123456', 4)).toBe('secr*********3456')
      expect(maskEnvValue('short', 4)).toBe('*****')
      expect(maskEnvValue('1234567890', 3)).toBe('123****890')
    })

    it('空文字列をマスクする', () => {
      expect(maskEnvValue('', 4)).toBe('')
    })

    it('短い文字列を全てマスクする', () => {
      expect(maskEnvValue('abc', 2)).toBe('***')
    })
  })

  describe('エラーハンドリング', () => {
    it('EnvValidationErrorが正しくスローされる', () => {
      const error = new EnvValidationError('Test error')
      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('EnvValidationError')
      expect(error.message).toBe('Test error')
    })

    it('複数のエラーメッセージが改行で結合される', () => {
      const variables = [
        { name: 'VAR1', value: '', required: true },
        { name: 'VAR2', value: 'invalid', required: true, pattern: /^\d+$/ },
        { name: 'VAR3', value: undefined, required: true }
      ]
      
      try {
        validateEnvVariables(variables)
        expect.fail('Should throw error')
      } catch (error) {
        expect(error).toBeInstanceOf(EnvValidationError)
        const message = (error as Error).message
        expect(message).toContain('Missing required environment variable: VAR1')
        expect(message).toContain('VAR2 has invalid format')
        expect(message).toContain('Missing required environment variable: VAR3')
      }
    })
  })
})