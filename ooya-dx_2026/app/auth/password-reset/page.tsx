"use client"

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function SupabasePasswordResetPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  function getClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) return null
    return createBrowserClient(url, anon)
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const client = getClient()
      if (!client) return
      const { data } = await client.auth.getSession()
      if (!mounted) return
      setSessionReady(Boolean(data.session))
    })()
    return () => { mounted = false }
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください')
      return
    }
    if (password !== confirm) {
      setError('確認用パスワードが一致しません')
      return
    }
    setIsLoading(true)
    try {
      const client = getClient()
      if (!client) throw new Error('SUPABASE_NOT_CONFIGURED')
      const { error } = await client.auth.updateUser({ password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (e: any) {
      setError(e?.message || 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-start justify-center pt-24 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-sm">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl px-5 py-4">
          <div className="text-center mb-4">
            <h1 className="text-lg font-medium text-slate-800">パスワードをリセット</h1>
          </div>

          {!sessionReady && !success && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 mb-3">
              リセットリンクからアクセスしてください。リンクの有効期限が切れている可能性があります。
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-sm text-slate-700 mb-4">パスワードを更新しました。</p>
              <Link href="/dashboard" className="px-3 py-2 rounded bg-blue-600 text-white text-sm inline-block">ダッシュボードへ</Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">新しいパスワード</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                  placeholder="8文字以上"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">新しいパスワード（確認）</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                  placeholder="もう一度入力"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">{error}</div>
              )}

              <button
                type="submit"
                disabled={isLoading || !sessionReady}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '更新中...' : 'パスワードを更新'}
              </button>

              <div className="mt-2 text-center">
                <Link href="/auth/signin" className="text-xs text-blue-600 hover:text-blue-700">← ログイン画面に戻る</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
