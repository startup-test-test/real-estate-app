'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/client'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function SignInPage() {
  const auth = useAuth()
  const user = auth.user
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) router.replace('/mypage')
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await auth.signIn({ email, password })
      if (result.ok) {
        router.push('/mypage')
      } else {
        setIsLoading(false)
        if (result.error === 'EMAIL_PASSWORD_MISMATCH') {
          setError('メールアドレスまたはパスワードが正しくありません')
        } else if (result.error === 'USER_NOT_FOUND') {
          setError('このメールアドレスは登録されていません')
        } else {
          setError('ログインに失敗しました')
        }
      }
    } catch (err: any) {
      setIsLoading(false)
      setError('エラーが発生しました')
    }
  }

  const handleOAuthSignIn = async () => {
    setError('')
    setIsLoading(true)

    try {
      await auth.signInWithGoogle()
    } catch (err: any) {
      setIsLoading(false)
      setError('Googleログインに失敗しました')
    }
  }

  if (user) {
    return null
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 pt-[90px] bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl px-8 py-10">
          {/* ロゴ */}
          <div className="text-center mb-2">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <img
                src="/img/logo_250709_2.png"
                alt="大家DX"
                style={{
                  height: '2.5rem',
                  width: 'auto',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            </Link>
            <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
              AIが導く、あなたの賃貸経営の未来。
            </p>
          </div>

          {/* タイトル */}
          <h2 className="text-xl font-bold text-center text-gray-800 mt-6 mb-6">
            ログイン
          </h2>

          {/* Googleボタン */}
          <button
            onClick={handleOAuthSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <span>Googleアカウントでログインする</span>
          </button>

          {/* セパレーター */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">または</span>
            </div>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                メールアドレス
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                  placeholder="your-email@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                  placeholder="パスワードを入力"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* ログイン状態を保持 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-600">
                ログイン状態を保持する
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
                {error}
                {error.includes('登録されていません') && (
                  <div className="mt-2">
                    <Link href="/auth/signup" className="underline font-medium">
                      新規登録ページへ
                    </Link>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="h-5 w-5" />
              <span>{isLoading ? 'ログイン中...' : 'メールでログインする'}</span>
            </button>
          </form>

          {/* リンク */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでない方は{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                新規登録
              </Link>
            </p>
            <p>
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                パスワードを忘れた方・変更したい方
              </Link>
            </p>
          </div>
        </div>

        {/* セキュリティ表示 */}
        <p className="text-center text-xs text-gray-500 mt-6">
          SSL暗号化通信により、お客様の情報を安全に保護しています
        </p>
      </div>
    </main>
  )
}
