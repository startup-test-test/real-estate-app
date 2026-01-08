'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { BarChart3, Calculator, TrendingUp, FileText, Shield, Clock, Loader } from 'lucide-react'

interface Subscription {
  id: string
  status: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  currentPeriodEnd: string | null
  cancelAt: string | null
  cancelAtPeriodEnd: boolean
}

export default function BillingPage() {
  const auth = useAuth()
  const user = auth.user
  const router = useRouter()
  const searchParams = useSearchParams()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')
  const sessionIdFromUrl = searchParams.get('session_id')

  useEffect(() => {
    try {
      if (localStorage.getItem('signing_out') === '1') {
        setIsSigningOut(true)
        localStorage.removeItem('signing_out')
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!user && !auth.isLoading) {
      router.replace('/')
    }
  }, [user, auth.isLoading, router])

  useEffect(() => {
    if (user) {
      fetchSubscription()
    }
  }, [user])

  useEffect(() => {
    const trySync = async () => {
      if (!success || !sessionIdFromUrl || !user) return
      if (subscription?.status) return
      try {
        const res = await fetch('/api/stripe/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionIdFromUrl }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.subscription) setSubscription(data.subscription)
        }
      } catch {}
    }
    trySync()
  }, [success, sessionIdFromUrl, user])

  const fetchSubscription = async () => {
    try {
      try { if (localStorage.getItem('signing_out') === '1') return } catch {}
      const response = await fetch('/api/stripe/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
        if (data.subscription && !data.subscription.currentPeriodEnd) {
          try {
            const res = await fetch('/api/stripe/refresh', { method: 'POST' })
            if (res.ok) {
              const refreshed = await res.json()
              if (refreshed.subscription) setSubscription(refreshed.subscription)
            }
          } catch {}
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth/signup')
      return
    }
    setIsProcessing(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setErrorMessage(data?.error || 'チェックアウトの開始に失敗しました')
        return
      }
      const { url } = await response.json()
      if (!url) {
        setErrorMessage('チェックアウトURLの取得に失敗しました')
        return
      }
      window.location.href = url
    } catch (error) {
      console.error('Checkout error:', error)
      setErrorMessage('ネットワークまたはサーバーエラーが発生しました')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManageSubscription = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (!response.ok) {
        setErrorMessage(data.error || 'エラーが発生しました')
        return
      }
      if (data.url) {
        window.location.href = data.url
      } else {
        setErrorMessage('ポータルURLが取得できませんでした')
      }
    } catch (error) {
      console.error('Portal error:', error)
      setErrorMessage('ネットワークエラーが発生しました')
    } finally {
      setIsProcessing(false)
    }
  }

  // ローディング状態（マイページと同じ構造）
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto pt-5 lg:pt-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto pt-5 lg:pt-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">リダイレクト中...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const isCancelScheduled = !!subscription && subscription.status !== 'canceled' && (subscription.cancelAtPeriodEnd || !!subscription.cancelAt)
  const endForCompare = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null
  const nowForCompare = new Date()
  const isPastEnd = !!(endForCompare && nowForCompare.getTime() >= endForCompare.getTime())
  const isCanceledDisplay = (subscription?.status === 'canceled') || (isCancelScheduled && isPastEnd)
  const showValueProposition = !subscription || isCanceledDisplay

  // メインコンテンツ（マイページと同じ構造）
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto pt-1 md:pt-0">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">プラン</h1>
                <p className="text-gray-600 mt-1">サブスクリプションの管理</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Success/Cancel messages */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-medium">サブスクリプションの登録が完了しました</p>
                <p className="text-green-700 text-xs mt-1">ご登録ありがとうございます。すべての機能をご利用いただけます。</p>
              </div>
            )}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-red-800 text-sm font-medium">エラーが発生しました</p>
                  <p className="text-red-700 text-xs mt-1">{errorMessage}</p>
                </div>
                <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            {canceled && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-slate-800 text-sm font-medium">お支払いがキャンセルされました</p>
                <p className="text-slate-700 text-xs mt-1">いつでも再度お申し込みいただけます。</p>
              </div>
            )}

            {/* 価値訴求セクション */}
            {showValueProposition && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    不動産投資シミュレーターを使ってみませんか？
                  </h2>
                  <p className="text-gray-600 text-sm">
                    物件の収益性を35年間のキャッシュフローで可視化。投資判断に必要な指標を自動計算します。
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">35年キャッシュフロー</p>
                      <p className="text-xs text-gray-600">長期収支を可視化</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Calculator className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">IRR・CCR・DSCR</p>
                      <p className="text-xs text-gray-600">投資指標を自動計算</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">PDF出力</p>
                      <p className="text-xs text-gray-600">レポートをダウンロード</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-bold">1ヶ月間無料でお試しいただけます</span>
                  </div>
                  <p className="text-blue-100 text-sm mb-4">
                    月額980円（税込）・無料期間中に解約すれば料金は発生しません
                  </p>
                  <Button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 text-base"
                    size="lg"
                  >
                    {isProcessing ? '処理中...' : '無料トライアルを開始する'}
                  </Button>
                  <div className="flex items-center justify-center gap-2 mt-4 text-blue-200 text-xs">
                    <Shield className="w-4 h-4" />
                    <span>いつでもキャンセル可能・自動更新の解除も簡単</span>
                  </div>
                </div>
              </div>
            )}

            {/* プランカード */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Subscription Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">現在のプラン</h2>
                </div>
                {subscription && !isCanceledDisplay ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">プレミアムプラン</h3>
                        <p className="text-gray-600 text-sm">月額 980円（税込）</p>
                      </div>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        (isCancelScheduled && !isPastEnd)
                          ? 'bg-gray-100 text-gray-800'
                          : isActive
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(isCancelScheduled && !isPastEnd)
                          ? 'キャンセル予定'
                          : (
                            <>
                              {subscription.status === 'active' && '有効'}
                              {subscription.status === 'trialing' && 'トライアル中'}
                              {subscription.status === 'past_due' && '支払い遅延'}
                              {subscription.status === 'incomplete' && '未完了'}
                              {subscription.status === 'unpaid' && '未払い'}
                            </>
                          )}
                      </span>
                    </div>
                    {(() => {
                      const tz: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Tokyo' }
                      const end = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null
                      const canceledScheduled = subscription.cancelAtPeriodEnd && !isCanceledDisplay
                      if (canceledScheduled && end) {
                        return (
                          <p className="text-xs text-gray-500">
                            解約予定日: {end.toLocaleDateString('ja-JP', tz)}
                          </p>
                        )
                      }
                      if (end) {
                        return (
                          <p className="text-xs text-gray-500">
                            {subscription.status === 'trialing' ? 'トライアル終了日' : '契約更新日'}: {end.toLocaleDateString('ja-JP', tz)}
                          </p>
                        )
                      }
                      return null
                    })()}
                    <div className="pt-4">
                      <Button
                        onClick={handleManageSubscription}
                        variant="outline"
                        disabled={isProcessing}
                        className="w-full border-gray-200 hover:bg-gray-50"
                        size="sm"
                      >
                        {isProcessing ? '処理中...' : 'サブスクリプションを管理'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm">現在、有効なプランはありません</p>
                    <p className="text-gray-500 text-xs mt-1">上のボタンから無料トライアルを開始できます</p>
                  </div>
                )}
              </div>

              {/* Premium Plan Card */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg p-6 shadow-sm text-white">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">プレミアムプラン</h2>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold">¥980</span>
                    <span className="text-white/80 text-sm">/ 月</span>
                  </div>
                  <p className="text-white/80 text-xs">税込価格・1ヶ月無料トライアル付き</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white/90 text-sm">35年間キャッシュフロー分析</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white/90 text-sm">IRR・CCR・DSCR自動計算</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white/90 text-sm">シミュレーション無制限保存</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white/90 text-sm">PDFレポート出力</span>
                  </li>
                </ul>
                {showValueProposition && (
                  <Button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-white text-blue-600 hover:bg-white/90 font-medium py-4 text-base"
                    size="lg"
                  >
                    {isProcessing ? '処理中...' : '無料で試してみる'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
