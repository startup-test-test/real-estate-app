'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/client'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function SignUpPage() {
  const auth = useAuth()
  const user = auth.user
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) router.replace('/mypage')
  }, [user, router])

  if (user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!agreeTerms) {
      setError('利用規約およびプライバシーポリシーに同意してください')
      return
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で設定してください')
      return
    }

    setIsLoading(true)

    try {
      const result = await auth.signUp({ email, password })

      if (result.ok) {
        if (result.info === 'verification_sent') {
          setInfo('確認メールを送信しました。メール内のリンクをクリックして認証を完了してください。')
        } else {
          router.replace('/mypage')
        }
      } else {
        // エラーメッセージをチェック
        const errorMsg = result.error || ''
        if (errorMsg.includes('already exists') || errorMsg.includes('USER_ALREADY_EXISTS')) {
          setError('このメールアドレスは既に登録されています。ログインページからお試しください。')
        } else if (errorMsg.includes('INVALID_EMAIL') || errorMsg.includes('invalid email')) {
          setError('有効なメールアドレスを入力してください')
        } else {
          setError('登録に失敗しました')
        }
      }
    } catch (err: any) {
      const errorMsg = err?.message || ''
      if (errorMsg.includes('already exists') || errorMsg.includes('USER_ALREADY_EXISTS')) {
        setError('このメールアドレスは既に登録されています。ログインページからお試しください。')
      } else {
        setError('エラーが発生しました')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignUp = async () => {
    setError('')
    setIsLoading(true)

    try {
      await auth.signInWithGoogle()
    } catch (err: any) {
      setIsLoading(false)
      setError('Googleログインに失敗しました')
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
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
            新規会員登録
          </h2>

          {/* Googleボタン */}
          <button
            onClick={handleOAuthSignUp}
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
            <span>Googleアカウントで新規登録する</span>
          </button>

          {/* Google同意文言 */}
          <p className="text-xs text-gray-500 text-center mt-3">
            Googleアカウントで新規登録することで<br />
            <Link href="/legal/terms" className="text-blue-600 hover:underline">利用規約</Link>
            と
            <Link href="/legal/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</Link>
            に同意したものとみなされます
          </p>

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
                  placeholder="6文字以上のパスワード"
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

            {/* 同意チェックボックス */}
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setAgreeTerms(!agreeTerms)}
                style={{
                  width: '20px',
                  height: '20px',
                  minWidth: '20px',
                  minHeight: '20px',
                  border: '2px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: agreeTerms ? '#2563eb' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  marginTop: '2px',
                  flexShrink: 0,
                }}
              >
                {agreeTerms && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <span
                className="text-sm cursor-pointer"
                style={{ color: '#4b5563' }}
                onClick={() => setAgreeTerms(!agreeTerms)}
              >
                <Link href="/legal/terms" className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>利用規約</Link>
                および
                <Link href="/legal/privacy" className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>プライバシーポリシー</Link>
                に同意する
              </span>
            </div>

            {(error || info) && (
              <div className={`p-3 rounded-xl text-sm ${info ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {error || info}
                {error && error.includes('既に登録されています') && (
                  <div className="mt-2">
                    <Link href="/auth/signin" className="underline font-medium">
                      ログインページへ
                    </Link>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !agreeTerms}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="h-5 w-5" />
              <span>{isLoading ? '登録中...' : 'メールでアカウント作成する'}</span>
            </button>
          </form>

          {/* リンク */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              すでにアカウントをお持ちの方は{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                ログイン
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
