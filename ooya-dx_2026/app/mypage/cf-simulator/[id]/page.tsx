import { Suspense } from 'react';
import CFSimulatorDetailClient from './CFSimulatorDetailClient';

// ローディングスケルトン
function CFSimulatorDetailSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen animate-pulse">
      <div className="max-w-6xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'CFシミュレーション結果 | 大家DX',
  description: '保存したCFシミュレーションの結果を確認・編集できます。',
};

export default async function CFSimulatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<CFSimulatorDetailSkeleton />}>
      <CFSimulatorDetailClient id={id} />
    </Suspense>
  );
}
