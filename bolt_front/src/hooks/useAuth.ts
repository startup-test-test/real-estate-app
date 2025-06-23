import { useState, useEffect } from 'react'
import { mockAuth } from '../lib/mockAuth'

// モック用の型定義
interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface Session {
  access_token: string;
  user?: User;
}

// mockAuthをauthとして使用
const auth = mockAuth;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初期認証状態の取得
    const getInitialSession = async () => {
      try {
        const { user, error } = await auth.getCurrentUser()
        if (error) {
          console.error('認証状態の取得エラー:', error)
        }
        setUser(user)
      } catch (error) {
        console.error('認証状態の取得中にエラーが発生しました:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        console.log('認証状態が変更されました:', event, session)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, _fullName?: string) => {
    setLoading(true)
    try {
      const { data, error } = await auth.signUp(email, password)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    console.log('useAuth: サインイン開始', { email })
    try {
      const { data, error } = await auth.signIn(email, password)
      console.log('useAuth: サインイン結果', { data, error })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('useAuth: サインインエラー', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  }
}