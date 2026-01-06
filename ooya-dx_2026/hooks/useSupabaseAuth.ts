// @ts-nocheck
// TODO: Neon移行後に有効化
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // モック認証状態をlocalStorageから復元する関数
  const restoreMockAuth = () => {
    try {
      // まずlocalStorageから確認（ログイン状態を保持）
      const savedUser = localStorage.getItem('mock_user')
      const savedSession = localStorage.getItem('mock_session')
      
      if (savedUser && savedSession) {
        const mockUser = JSON.parse(savedUser) as User
        const mockSession = JSON.parse(savedSession) as Session
        setUser(mockUser)
        setSession(mockSession)
        console.log('モック認証状態を復元しました（永続保存）:', mockUser.email)
        return true
      }
      
      // 次にsessionStorageから確認（一時的な認証）
      const sessionUser = sessionStorage.getItem('mock_user')
      const sessionSession = sessionStorage.getItem('mock_session')
      
      if (sessionUser && sessionSession) {
        const mockUser = JSON.parse(sessionUser) as User
        const mockSession = JSON.parse(sessionSession) as Session
        setUser(mockUser)
        setSession(mockSession)
        console.log('モック認証状態を復元しました（一時保存）:', mockUser.email)
        return true
      }
    } catch (error) {
      console.error('モック認証状態の復元に失敗:', error)
      localStorage.removeItem('mock_user')
      localStorage.removeItem('mock_session')
      sessionStorage.removeItem('mock_user')
      sessionStorage.removeItem('mock_session')
    }
    return false
  }

  // モック認証状態をlocalStorageに保存する関数
  const saveMockAuth = (user: User, session: Session) => {
    try {
      localStorage.setItem('mock_user', JSON.stringify(user))
      localStorage.setItem('mock_session', JSON.stringify(session))
      console.log('モック認証状態を保存しました:', user.email)
    } catch (error) {
      console.error('モック認証状態の保存に失敗:', error)
    }
  }

  // モック認証状態をクリアする関数
  const clearMockAuth = () => {
    try {
      localStorage.removeItem('mock_user')
      localStorage.removeItem('mock_session')
      sessionStorage.removeItem('mock_user')
      sessionStorage.removeItem('mock_session')
      console.log('モック認証状態をクリアしました')
    } catch (error) {
      console.error('モック認証状態のクリアに失敗:', error)
    }
  }

  useEffect(() => {
    // Check if Supabase is configured
    if (!import.meta.env.VITE_SUPABASE_URL) {
      console.log('Supabase not configured, using mock auth')
      // モック認証状態を復元
      const restored = restoreMockAuth()
      if (!restored) {
        console.log('復元可能なモック認証状態がありません')
      }
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(() => {
      console.log('Supabase error, using mock auth')
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
    if (!import.meta.env.VITE_SUPABASE_URL) {
      // Mock sign up
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
      
      // モック認証状態を永続化
      saveMockAuth(mockUser, mockSession)
      
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
    if (!import.meta.env.VITE_SUPABASE_URL) {
      // Mock sign in - accept demo credentials or any email/password
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
        
        // rememberMeがtrueの場合のみモック認証状態を永続化
        if (rememberMe) {
          saveMockAuth(mockUser, mockSession)
          console.log('モックサインイン成功（認証状態を保存）:', email)
        } else {
          // セッションストレージに一時的に保存（ブラウザを閉じると削除される）
          sessionStorage.setItem('mock_user', JSON.stringify(mockUser))
          sessionStorage.setItem('mock_session', JSON.stringify(mockSession))
          console.log('モックサインイン成功（一時的な認証）:', email)
        }
        
        return { data: { user: mockUser, session: mockSession }, error: null }
      } else {
        return { data: null, error: new Error('無効なメールアドレスまたはパスワードです') }
      }
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