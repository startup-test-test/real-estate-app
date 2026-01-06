import { Suspense } from 'react';
import LandingPageClient from './LandingPageClient';

export const metadata = {
  title: '大家DX - 不動産投資シミュレーション',
  description: 'AI搭載の包括的不動産投資プラットフォーム。収益シミュレーション、市場分析、投資判断をサポートします。',
};

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">読み込み中...</div>}>
      <LandingPageClient />
    </Suspense>
  );
}
