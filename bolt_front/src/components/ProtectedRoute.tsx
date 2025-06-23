import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from './AuthProvider'
import { Loader } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuthContext()

  // デバッグ用ログ
  console.log('ProtectedRoute - loading:', loading, 'user:', user)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('ユーザーが認証されていません。ログインページにリダイレクトします。')
    return <Navigate to="/login" replace />
  }

  console.log('ユーザーが認証されています。保護されたコンテンツを表示します。')
  return <>{children}</>
}