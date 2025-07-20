import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { SessionManager } from '../utils/sessionManager'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // SEC-005: セキュアなセッション管理
  const sessionManager = SessionManager.getInstance()

  // モック認証状態をセキュアに復元する関数
  const restoreMockAuth = () => {
    const { user: restoredUser, session: restoredSession } = sessionManager.restoreSession()
    
    if (restoredUser && restoredSession) {
      setUser(restoredUser)
      setSession(restoredSession)
      console.log('セキュアなセッション復元成功:', restoredUser.email)
      return true
    }
    
    return false
  }

  // SEC-005: セキュアなセッション保存
  const saveMockAuth = (user: User, session: Session, rememberMe: boolean = false) => {
    sessionManager.saveSession(user, session, rememberMe)
    console.log('セキュアなセッション保存完了:', user.email)
  }

  // SEC-005: セキュアなセッションクリア
  const clearMockAuth = () => {
    sessionManager.clearSession()
    console.log('セキュアなセッションクリア完了')
  }

  useEffect(() => {
    const isProduction = import.meta.env.PROD || import.meta.env.VITE_ENV === 'production'
    
    // Check if Supabase is configured
    if (!import.meta.env.VITE_SUPABASE_URL) {
      if (isProduction) {
        // SEC-038: 本番環境では必ずSupabaseが設定されている必要がある
        console.error('Critical error: Supabase is not configured in production environment')
        setLoading(false)
        return
      } else {
        console.log('Supabase not configured, using mock auth in development')
        // 開発環境でのみモック認証状態を復元
        const restored = restoreMockAuth()
        if (!restored) {
          console.log('復元可能なモック認証状態がありません')
        }
        setLoading(false)
        return
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((error) => {
      const isProduction = import.meta.env.PROD || import.meta.env.VITE_ENV === 'production'
      if (isProduction) {
        console.error('Supabase authentication error:', error)
        // 本番環境では認証エラーをそのまま扱う
      } else {
        console.log('Supabase error in development environment')
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName?: string) => {
    const isProduction = import.meta.env.PROD || import.meta.env.VITE_ENV === 'production'
    
    if (!import.meta.env.VITE_SUPABASE_URL) {
      if (isProduction) {
        // SEC-038: 本番環境では必ずSupabaseが必要
        return { 
          data: null, 
          error: new Error('Authentication service is not configured. Please contact support.') 
        }
      }
      // Mock sign up (開発環境のみ)
      const mockUser = {
        id: 'mock-user-id',
        email,
        user_metadata: { full_name: fullName || 'ユーザー' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as User
      const mockSession = { 
        user: mockUser,
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer'
      } as Session
      
      setUser(mockUser)
      setSession(mockSession)
      
      // SEC-005: セキュアなセッション保存（永続化）
      saveMockAuth(mockUser, mockSession, true)
      
      console.log('モックサインアップ成功:', email)
      return { data: { user: mockUser, session: mockSession }, error: null }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    // 本番環境でモック認証を無効化
    const isProduction = import.meta.env.PROD || import.meta.env.VITE_ENV === 'production'
    const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL
    
    if (!isSupabaseConfigured) {
      if (isProduction) {
        // SEC-038: 本番環境では必ずSupabaseが必要
        return { 
          data: null, 
          error: new Error('Authentication service is not configured. Please contact support.') 
        }
      }
      // 開発環境でのみモック認証を許可
      if ((email === 'demo@ooya-dx.com' && password === 'demo123') || email.includes('@')) {
        const mockUser = {
          id: 'mock-user-id',
          email,
          user_metadata: { full_name: 'デモユーザー' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as User
        const mockSession = { 
          user: mockUser,
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer'
        } as Session
        
        setUser(mockUser)
        setSession(mockSession)
        
        // SEC-005: rememberMeに基づくセキュアなセッション保存
        saveMockAuth(mockUser, mockSession, rememberMe)
        if (!isProduction) {
          console.log(`セキュアサインイン成功（${rememberMe ? '永続' : '一時'}）:`, email)
        }
        
        return { data: { user: mockUser, session: mockSession }, error: null }
      } else {
        return { data: null, error: new Error('無効なメールアドレスまたはパスワードです') }
      }
    }
    
    // 本番環境でSupabaseが設定されていない場合はエラー
    if (!isSupabaseConfigured && isProduction) {
      console.error('本番環境でSupabaseが設定されていません')
      return { data: null, error: new Error('認証サービスが利用できません。システム管理者にお問い合わせください。') }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { data, error }
  }

  // Sign out
  const signOut = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      // Mock sign out
      setUser(null)
      setSession(null)
      clearMockAuth()
      console.log('モックサインアウト成功')
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { data, error }
  }

  // Update password
  const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    })
    return { data, error }
  }

  // Update profile
  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    if (!user) return { error: new Error('No user logged in') }

    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    })

    if (!error) {
      // Also update the users table
      const { error: dbError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
      
      if (dbError) {
        return { error: dbError }
      }
    }

    return { data, error }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  }
}