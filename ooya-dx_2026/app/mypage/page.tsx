import { Suspense } from 'react';
import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'マイページ | 大家DX',
  description: '不動産投資シミュレーションツールのダッシュボード',
};

export default function MypagePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">読み込み中...</div>}>
      <DashboardClient />
    </Suspense>
  );
}
