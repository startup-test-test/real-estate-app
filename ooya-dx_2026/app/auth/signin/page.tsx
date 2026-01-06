'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/client'

export default function SignInPage() {
  const auth = useAuth()
  const user = auth.user
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 既にログイン済みの場合はレンダー外で遷移
  useEffect(() => {
    if (user) router.replace('/dashboard')
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await auth.signIn({ email, password })
      if (result.ok) {
        router.push('/dashboard')
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
    <main className="min-h-screen flex items-start justify-center pt-24 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-sm">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl px-5 py-4">
          <div className="text-center mb-4">
            <h1 className="text-lg font-medium text-slate-800">
              ログイン
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-600 mb-1.5">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50"
                placeholder="email@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-medium text-slate-600">
                  パスワード
                </label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  パスワードを忘れた？
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50"
                placeholder="パスワード"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
                {error}
                {error.includes('登録されていません') && (
                  <div className="mt-1.5">
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
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-400">または</span>
              </div>
            </div>

            <button
              onClick={handleOAuthSignIn}
              disabled={isLoading}
              className="w-full mt-3 py-2.5 px-4 border border-slate-200 rounded-lg bg-white/70 text-slate-700 text-sm font-medium hover:bg-white hover:border-slate-300 disabled:opacity-50 transition-all duration-200 shadow-sm"
            >
              Googleでログイン
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-slate-500">
            アカウントをお持ちでない方は{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              新規登録
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
