import { Suspense } from 'react';
import MyPageClient from './MyPageClient';

export const metadata = {
  title: '収益シミュレーション | 大家DX',
  description: '保存したシミュレーションの管理を行えます。',
};

export default function MypagePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">読み込み中...</div>}>
      <MyPageClient />
    </Suspense>
  );
}
