import { renderHook, act } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { useSupabaseAuth } from '../useSupabaseAuth'

// Supabaseのモック
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    }
  }))
}))

// AuthProviderのモック実装
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

describe('useSupabaseAuth - SEC-002 モック認証の本番無効化テスト', () => {
  beforeEach(() => {
    // 環境変数のリセット
    vi.resetModules()
    vi.clearAllMocks()
    // localStorage/sessionStorageのクリア
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('開発環境でのモック認証', () => {
    beforeEach(() => {
      // 開発環境の設定
      vi.stubEnv('PROD', false)
      vi.stubEnv('VITE_ENV', 'development')
      vi.stubEnv('VITE_SUPABASE_URL', '')
    })

    test('demo@ooya-dx.com と demo123 でログインできる', async () => {
      const { result } = renderHook(() => useSupabaseAuth(), {
        wrapper: AuthProvider
      })

      await act(async () => {
        const response = await result.current.signIn('demo@ooya-dx.com', 'demo123', false)
        expect(response.data).toBeTruthy()
        expect(response.data?.user?.email).toBe('demo@ooya-dx.com')
        expect(response.error).toBeNull()
      })

      expect(result.current.user?.email).toBe('demo@ooya-dx.com')
    })

    test('任意のメールアドレス（@を含む）でログインできる', async () => {
      const { result } = renderHook(() => useSupabaseAuth(), {
        wrapper: AuthProvider
      })

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'anypassword', false)
        expect(response.data).toBeTruthy()
        expect(response.data?.user?.email).toBe('test@example.com')
        expect(response.error).toBeNull()
      })

      expect(result.current.user?.email).toBe('test@example.com')
    })

    test('メールアドレスに@が含まれない場合はログインできない', async () => {
      const { result } = renderHook(() => useSupabaseAuth(), {
        wrapper: AuthProvider
      })

      await act(async () => {
        const response = await result.current.signIn('invalid-email', 'password', false)
        expect(response.data).toBeNull()
        expect(response.error).toBeTruthy()
        expect(response.error?.message).toBe('無効なメールアドレスまたはパスワードです')
      })

      expect(result.current.user).toBeNull()
    })
  })

  describe('本番環境でのモック認証無効化', () => {
    test('本番環境（PROD=true）ではモック認証が無効', async () => {
      // 本番環境の設定
      vi.stubEnv('PROD', true)
      vi.stubEnv('VITE_SUPABASE_URL', '')

      const { result } = renderHook(() => useSupabaseAuth(), {
        wrapper: AuthProvider
      })

      await act(async () => {
        const response = await result.current.signIn('demo@ooya-dx.com', 'demo123', false)
        expect(response.data).toBeNull()
        expect(response.error).toBeTruthy()
        expect(response.error?.message).toBe('認証サービスが利用できません。システム管理者にお問い合わせください。')
      })

      expect(result.current.user).toBeNull()
    })

    test('本番環境（VITE_ENV=production）ではモック認証が無効', async () => {
      // 本番環境の設定
      vi.stubEnv('PROD', false)
      vi.stubEnv('VITE_ENV', 'production')
      vi.stubEnv('VITE_SUPABASE_URL', '')

      const { result } = renderHook(() => useSupabaseAuth(), {
        wrapper: AuthProvider
      })

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'anypassword', false)
        expect(response.data).toBeNull()
        expect(response.error).toBeTruthy()
        expect(response.error?.message).toBe('認証サービスが利用できません。システム管理者にお問い合わせください。')
      })

      expect(result.current.user).toBeNull()
    })
  })

  describe('Supabase設定時の動作', () => {
    test('Supabaseが設定されている場合は環境に関わらずSupabaseを使用', async () => {
      // Supabaseが設定されている
      vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'dummy-anon-key')

      const mockSignIn = vi.fn().mockResolvedValue({
        data: {
          user: { id: 'supabase-user', email: 'user@example.com' },
          session: { access_token: 'supabase-token' }
        },
        error: null
      })

      // Supabaseクライアントモックを最初から設定
      const mockSupabaseClient = {
        auth: {
          signInWithPassword: mockSignIn,
          signOut: vi.fn(),
          getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
          onAuthStateChange: vi.fn(() => ({
            data: { subscription: { unsubscribe: vi.fn() } }
          }))
        }
      }

      // createClientモックを再定義
      vi.doMock('@supabase/supabase-js', () => ({
        createClient: vi.fn(() => mockSupabaseClient)
      }))

      const { result } = renderHook(() => useSupabaseAuth(), {
        wrapper: AuthProvider
      })

      await act(async () => {
        await result.current.signIn('user@example.com', 'password', false)
      })

      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password'
      })
    })
  })

  describe('ログ出力の制御', () => {
    test('開発環境ではconsole.logが出力される', async () => {
      vi.stubEnv('PROD', false)
      vi.stubEnv('VITE_ENV', 'development')
      vi.stubEnv('VITE_SUPABASE_URL', '')

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { result } = renderHook(() => useSupabaseAuth(), {
        wrapper: AuthProvider
      })

      await act(async () => {
        await result.current.signIn('demo@ooya-dx.com', 'demo123', false)
      })

      expect(consoleSpy).toHaveBeenCalledWith('モックサインイン成功（一時的な認証）:', 'demo@ooya-dx.com')

      consoleSpy.mockRestore()
    })

    test('本番環境ではconsole.logが出力されない', async () => {
      vi.stubEnv('PROD', true)
      vi.stubEnv('VITE_ENV', 'production')
      vi.stubEnv('VITE_SUPABASE_URL', '')

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useSupabaseAuth(), {
        wrapper: AuthProvider
      })

      await act(async () => {
        await result.current.signIn('demo@ooya-dx.com', 'demo123', false)
      })

      // モック認証のログは出力されない
      expect(consoleSpy).not.toHaveBeenCalledWith('モックサインイン成功（一時的な認証）:', 'demo@ooya-dx.com')
      
      // エラーログは出力される（設定エラー）
      expect(consoleErrorSpy).toHaveBeenCalledWith('本番環境でSupabaseが設定されていません')

      consoleSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('認証状態の永続化', () => {
    test('rememberMe=trueの場合はlocalStorageに保存', async () => {
      vi.stubEnv('PROD', false)
      vi.stubEnv('VITE_ENV', 'development')
      vi.stubEnv('VITE_SUPABASE_URL', '')

      const { result } = renderHook(() => useSupabaseAuth(), {
        wrapper: AuthProvider
      })

      await act(async () => {
        await result.current.signIn('demo@ooya-dx.com', 'demo123', true)
      })

      expect(localStorage.getItem('mock_user')).toBeTruthy()
      expect(localStorage.getItem('mock_session')).toBeTruthy()
      expect(sessionStorage.getItem('mock_user')).toBeNull()
      expect(sessionStorage.getItem('mock_session')).toBeNull()
    })

    test('rememberMe=falseの場合はsessionStorageに保存', async () => {
      vi.stubEnv('PROD', false)
      vi.stubEnv('VITE_ENV', 'development') 
      vi.stubEnv('VITE_SUPABASE_URL', '')

      const { result } = renderHook(() => useSupabaseAuth(), {
        wrapper: AuthProvider
      })

      await act(async () => {
        await result.current.signIn('demo@ooya-dx.com', 'demo123', false)
      })

      expect(localStorage.getItem('mock_user')).toBeNull()
      expect(localStorage.getItem('mock_session')).toBeNull()
      expect(sessionStorage.getItem('mock_user')).toBeTruthy()
      expect(sessionStorage.getItem('mock_session')).toBeTruthy()
    })
  })
})