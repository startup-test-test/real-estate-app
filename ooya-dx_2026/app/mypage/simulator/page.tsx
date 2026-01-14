import { Suspense } from 'react';
import SimulatorClient from './SimulatorClient';

// ローディングスケルトン
function SimulatorSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen animate-pulse">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダースケルトン */}
        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>

        {/* フォームスケルトン */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* セクションタイトル */}
          <div className="h-6 bg-gray-200 rounded w-48"></div>

          {/* 入力フィールド群 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>

          {/* ボタンスケルトン */}
          <div className="flex justify-center pt-4">
            <div className="h-14 bg-blue-200 rounded-lg w-64"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Next.js Route Segment Config
export const dynamic = 'force-dynamic';

export const metadata = {
  title: '不動産賃貸経営シミュレーション | 大家DX',
  description: '投資物件の収益性をシミュレーション。IRR、CCR、DSCRなどの指標を計算します。',
};

export default function SimulatorPage() {
  // 無料化対応: 認証・課金チェックを削除
  // 保存時のみ認証が必要（SimulatorClient側で制御）
  return (
    <Suspense fallback={<SimulatorSkeleton />}>
      <SimulatorClient />
    </Suspense>
  );
}
