'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
        type: 'global',
      }),
    });
  } catch (e) {
    // 通知失敗は無視
    console.error('[Error Report] Failed to send:', e);
  }
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをコンソールに出力
    console.error('[Global Error]', error);
    // エラー通知を送信
    reportError(error);
  }, [error]);

  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-lg">
            <div className="text-center">
              {/* シンプルなテキストロゴ（画像が読み込めない可能性があるため） */}
              <h2 className="text-2xl font-bold text-blue-600 mb-6">大家DX</h2>

              <div
                className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: '#FEE2E2' }}
              >
                <AlertTriangle className="h-8 w-8" style={{ color: '#DC2626' }} />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                システムエラーが発生しました
              </h1>
              <p className="text-gray-600 mb-2">
                申し訳ございません。システムに問題が発生しました。
              </p>
              <p className="text-sm text-gray-500 mb-8">
                しばらく時間をおいて再度アクセスしてください。
              </p>

              {/* エラー詳細（開発時） */}
              {process.env.NODE_ENV === 'development' && (
                <div
                  className="mb-6 p-4 rounded-lg text-left"
                  style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
                >
                  <p className="text-sm font-medium mb-1" style={{ color: '#991B1B' }}>
                    エラー詳細:
                  </p>
                  <p className="text-sm font-mono break-all" style={{ color: '#B91C1C' }}>
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs mt-2" style={{ color: '#EF4444' }}>
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div
              className="py-8 px-6 rounded-xl"
              style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB' }}
            >
              <div className="space-y-3">
                <button
                  onClick={() => reset()}
                  className="w-full flex justify-center items-center px-4 py-3 text-sm font-medium rounded-lg text-white transition-colors"
                  style={{ backgroundColor: '#2563EB' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  もう一度試す
                </button>

                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full flex justify-center items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                  style={{ backgroundColor: 'white', border: '1px solid #D1D5DB', color: '#374151' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <Home className="h-4 w-4 mr-2" />
                  トップページへ戻る
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              問題が続く場合は、ブラウザのキャッシュをクリアしてお試しください。
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
