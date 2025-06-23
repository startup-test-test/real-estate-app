import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if Supabase is configured
    if (!import.meta.env.VITE_SUPABASE_URL) {
      console.log('Supabase not configured, using mock auth')
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
        user_metadata: { full_name: fullName }
      } as User
      setUser(mockUser)
      setSession({ user: mockUser } as Session)
      return { data: { user: mockUser }, error: null }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
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
        setUser(mockUser)
        setSession({ user: mockUser } as Session)
        return { data: { user: mockUser }, error: null }
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