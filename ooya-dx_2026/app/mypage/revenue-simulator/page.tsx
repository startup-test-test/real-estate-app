import { Suspense } from 'react';
import RevenueSimulatorListClient from './RevenueSimulatorListClient';
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
  title: '収益シミュレーション | 大家DX',
  description: '賃貸物件の収益性をシミュレーション。IRR、CCR、DSCRなどの指標を計算します。',
};

export default async function RevenueSimulatorPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; edit?: string }>;
}) {
  const params = await searchParams;
  const hasViewOrEdit = params.view || params.edit;

  // view または edit パラメータがある場合はシミュレーター詳細を表示
  if (hasViewOrEdit) {
    return (
      <Suspense fallback={<SimulatorSkeleton />}>
        <SimulatorClient />
      </Suspense>
    );
  }

  // パラメータがない場合は一覧を表示
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">読み込み中...</div>}>
      <RevenueSimulatorListClient />
    </Suspense>
  );
}
