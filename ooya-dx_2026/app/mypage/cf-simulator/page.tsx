import { Suspense } from 'react';
import CFSimulatorListClient from './CFSimulatorListClient';

// ローディングスケルトン
function CFSimulatorListSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダースケルトン */}
        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>

        {/* ボタンスケルトン */}
        <div className="flex justify-center mb-6">
          <div className="h-14 bg-blue-200 rounded-lg w-72"></div>
        </div>

        {/* テーブルスケルトン */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Next.js Route Segment Config
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'CFシミュレーション | 大家DX',
  description: '賃貸物件のキャッシュフローを簡単にシミュレーション。保存した結果を一覧で管理できます。',
};

export default function CFSimulatorListPage() {
  return (
    <Suspense fallback={<CFSimulatorListSkeleton />}>
      <CFSimulatorListClient />
    </Suspense>
  );
}
