import { Suspense } from 'react';
import MyPageClient from './MyPageClient';

export const metadata = {
  title: 'マイページ | 大家DX',
  description: 'シミュレーション結果の管理、アカウント設定を行えます。',
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">読み込み中...</div>}>
      <MyPageClient />
    </Suspense>
  );
}
