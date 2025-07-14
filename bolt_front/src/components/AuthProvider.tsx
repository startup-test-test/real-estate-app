import React, { createContext, useContext } from 'react'
import { useSupabaseAuth } from '../hooks/useSupabaseAuth'

interface AuthContextType {
  user: any
  session: any
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<any>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<any>
  signOut: () => Promise<any>
  resetPassword: (email: string) => Promise<any>
  updatePassword: (password: string) => Promise<any>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user, session, loading, signIn, signUp, signOut, resetPassword, updatePassword } = useSupabaseAuth()

  // 認証状態の変更をログに記録
  React.useEffect(() => {
    console.log('AuthProvider状態変更:', {
      user: user ? { id: user.id, email: user.email } : null,
      session: session ? 'あり' : 'なし',
      loading,
      isAuthenticated: !!user
    })
  }, [user, session, loading])

  const authValue = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}