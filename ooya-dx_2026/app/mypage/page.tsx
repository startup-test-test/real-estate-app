import { Suspense } from 'react';
import MyPageClient from './MyPageClient';

export const metadata = {
  title: 'マイページ | 大家DX',
  description: 'サービスの管理、シミュレーション結果の確認、アカウント設定を行えます。',
};

export default function MypagePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">読み込み中...</div>}>
      <MyPageClient />
    </Suspense>
  );
}
