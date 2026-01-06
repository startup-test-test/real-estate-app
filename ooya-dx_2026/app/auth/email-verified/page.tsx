'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/client'

export default function EmailVerifiedPage() {
  const auth = useAuth()
  const user = auth.user
  const router = useRouter()
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')

  // ログイン済みならダッシュボードへ
  useEffect(() => {
    if (user) {
      router.replace('/dashboard')
    }
  }, [user, router])

  const handleResend = async () => {
    if (!auth.resendEmailVerification) return
    try {
      setResending(true)
      const res = await auth.resendEmailVerification()
      if (res && res.ok) {
        setMessage('認証メールを再送信しました。受信トレイをご確認ください。')
      } else {
        setMessage('再送信に失敗しました。時間をおいて再度お試しください。')
      }
    } catch {
      setMessage('再送信に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setResending(false)
    }
  }

  // resendEmailVerificationがあるか（Supabaseの場合）
  const hasResend = !!auth.resendEmailVerification

  return (
    <main className="min-h-screen flex items-start justify-center pt-24 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl px-5 py-4 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h1 className="text-lg font-medium text-slate-800 mb-3">メール認証</h1>
        <p className="text-xs text-slate-600 mb-4">
          メールの認証リンクからアクセスしてください。<br />
          届いていない場合は迷惑メールをご確認ください。
        </p>
        {hasResend && (
          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={resending}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {resending ? '送信中…' : '認証メールを再送信'}
            </button>
            {message && <p className="text-xs text-slate-500">{message}</p>}
          </div>
        )}
        <div className="mt-4">
          <Link 
            href="/auth/signin" 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ログインへ
          </Link>
        </div>
      </div>
    </main>
  )
}
