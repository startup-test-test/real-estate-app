'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/client'

export default function ForgotPasswordPage() {
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await auth.sendPasswordReset?.(email)
      if (res && !res.ok) throw new Error(res.error || 'RESET_FAILED')
      setSuccess(true)
    } catch (err: any) {
      setError('メールの送信に失敗しました。もう一度お試しください')
      console.error('Forgot password error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-start justify-center pt-24 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="w-full max-w-sm">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl px-5 py-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-lg font-medium text-slate-800 mb-3">
                メールを送信しました
              </h1>
              <p className="text-xs text-slate-600 mb-4">
                パスワードリセット用のリンクを<br />
                <span className="font-medium">{email}</span><br />
                に送信しました
              </p>
              <p className="text-xs text-slate-500 mb-4">
                メールが届かない場合は迷惑メールフォルダをご確認ください
              </p>
              <Link 
                href="/auth/signin"
                className="w-full py-2.5 px-4 border border-slate-200 rounded-lg bg-white/70 text-slate-700 text-sm font-medium hover:bg-white hover:border-slate-300 transition-all duration-200 shadow-sm inline-block"
              >
                ログイン画面に戻る
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-start justify-center pt-24 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-sm">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl px-5 py-4">
          <div className="text-center mb-4">
            <h1 className="text-lg font-medium text-slate-800 mb-2">
              パスワードをリセット
            </h1>
            <p className="text-xs text-slate-600">
              登録したメールアドレスを入力してください
            </p>
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

            {error && (
              <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {isLoading ? '送信中...' : 'リセットリンクを送信'}
            </button>
          </form>

          {/* ログイン画面へのリンクは不要のため削除 */}
        </div>
      </div>
    </main>
  )
}
