/**
 * SEC-044: 環境変数チェッカーのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkEnvironmentVariables, performStartupEnvCheck, isEnvironmentHealthy } from '../envChecker';

describe('envChecker', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    // 環境変数をモック
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzI2NTQ2NCwiZXhwIjoxOTM4ODQxNDY0fQ.test');
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('DEV', true);
    vi.stubEnv('PROD', false);
  });

  afterEach(() => {
    // 環境変数を復元
    vi.unstubAllEnvs();
  });

  describe('checkEnvironmentVariables', () => {
    it('必須環境変数が設定されている場合は有効', () => {
      const result = checkEnvironmentVariables();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('必須環境変数が欠けている場合はエラー', () => {
      vi.stubEnv('VITE_SUPABASE_URL', '');
      
      const result = checkEnvironmentVariables();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Environment variable VITE_SUPABASE_URL is empty');
    });

    it('Supabase URLが無効な場合はエラー', () => {
      vi.stubEnv('VITE_SUPABASE_URL', 'not-a-valid-url');
      
      const result = checkEnvironmentVariables();
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid configuration') || e.includes('invalid'))).toBe(true);
    });

    it('本番環境でlocalhostのSupabase URLはエラー', () => {
      vi.stubEnv('PROD', true);
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
      
      const result = checkEnvironmentVariables();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Production environment cannot use localhost Supabase URL');
    });

    it('本番環境でモックモードが有効な場合はエラー', () => {
      vi.stubEnv('PROD', true);
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_ENABLE_MOCK_MODE', 'true');
      
      const result = checkEnvironmentVariables();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mock mode must be disabled in production (VITE_ENABLE_MOCK_MODE)');
    });

    it('開発環境でオプション環境変数が未設定の場合は警告', () => {
      const result = checkEnvironmentVariables();
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Optional environment variable not set: VITE_ENABLE_MOCK_MODE');
    });
  });

  describe('performStartupEnvCheck', () => {
    it('開発環境では環境変数エラーでも例外をスローしない', () => {
      vi.stubEnv('VITE_SUPABASE_URL', '');
      
      expect(() => performStartupEnvCheck()).not.toThrow();
    });

    it('本番環境では環境変数エラーで例外をスロー', () => {
      vi.stubEnv('PROD', true);
      vi.stubEnv('DEV', false);
      vi.stubEnv('VITE_SUPABASE_URL', '');
      
      // DOM要素をモック
      document.body.innerHTML = '<div id="root"></div>';
      
      expect(() => performStartupEnvCheck()).toThrow('Invalid environment configuration');
    });
  });

  describe('isEnvironmentHealthy', () => {
    it('環境変数が正しく設定されている場合はtrue', () => {
      expect(isEnvironmentHealthy()).toBe(true);
    });

    it('環境変数にエラーがある場合はfalse', () => {
      vi.stubEnv('VITE_SUPABASE_URL', '');
      
      expect(isEnvironmentHealthy()).toBe(false);
    });

    it('例外が発生した場合はfalse', () => {
      // validateSupabaseEnvをモックして例外をスロー
      vi.mock('../envValidator', () => ({
        validateSupabaseEnv: () => {
          throw new Error('Test error');
        }
      }));
      
      expect(isEnvironmentHealthy()).toBe(false);
    });
  });
});