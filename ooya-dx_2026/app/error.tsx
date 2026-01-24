'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

// エラー通知を送信
async function reportError(error: Error & { digest?: string }) {
  try {
    await fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (e) {
    // 通知失敗は無視（ユーザー体験に影響させない）
    console.error('[Error Report] Failed to send:', e);
  }
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをコンソールに出力
    console.error('[Error Boundary]', error);
    // エラー通知を送信
    reportError(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center">
          {/* ロゴ */}
          <div className="flex justify-center mb-6">
            <img
              src="/img/logo_250709_2.png"
              alt="大家DX ロゴ"
              className="h-12 w-auto"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>

          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            エラーが発生しました
          </h1>
          <p className="text-gray-600 mb-2">
            申し訳ございません。予期しないエラーが発生しました。
          </p>
          <p className="text-sm text-gray-500 mb-8">
            問題が解決しない場合は、しばらく時間をおいて再度お試しください。
          </p>

          {/* エラー詳細（開発時のみ表示推奨） */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm font-medium text-red-800 mb-1">エラー詳細:</p>
              <p className="text-sm text-red-700 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-gray-200">
          <div className="space-y-3">
            <button
              onClick={() => reset()}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              もう一度試す
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              トップページへ戻る
            </button>

            <button
              onClick={() => window.history.back()}
              className="w-full flex justify-center items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              前のページに戻る
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          お問い合わせ: <a href="/contact" className="text-blue-600 hover:underline">お問い合わせフォーム</a>
        </p>
      </div>
    </div>
  );
}
