import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import SimulatorClient from './SimulatorClient';

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
