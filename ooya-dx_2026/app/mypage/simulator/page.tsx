import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import { getServerUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

// 動的インポートでバンドルを分割（初回読み込み高速化）
const SimulatorClient = dynamicImport(() => import('./SimulatorClient'), {
  loading: () => <SimulatorSkeleton />,
  ssr: false, // クライアントサイドのみでレンダリング
});

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

export default async function SimulatorPage() {
  // 1. ユーザー認証確認
  const user = await getServerUser();
  if (!user) {
    redirect('/auth/signin');
  }

  // 2. サブスクリプション確認
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
  });

  // 3. active または trialing でなければ課金ページへリダイレクト
  const hasAccess =
    subscription?.status === 'active' ||
    subscription?.status === 'trialing';

  if (!hasAccess) {
    redirect('/mypage/billing');
  }

  // 4. アクセス許可 → シミュレーター表示
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">読み込み中...</div>}>
      <SimulatorClient />
    </Suspense>
  );
}
