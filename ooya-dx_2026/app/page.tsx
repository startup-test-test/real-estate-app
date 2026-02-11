import { Suspense } from 'react';
import { Metadata } from 'next';
import LandingPageClient from './LandingPageClient';
import { getAllArticles } from '@/lib/mdx';

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: '不動産投資クラウドソフトなら「大家DX」｜現役大家が開発',
  description: '【完全無料】現役大家が開発した不動産投資クラウドツール。収支・利回り・税金など27種類の計算ソフトを全て無料で提供。実務に基づいた精度の高いシミュレーションで、購入判断から出口戦略までをトータルにサポートする大家のためのプラットフォームです。',
  openGraph: {
    title: '不動産投資クラウドソフトなら「大家DX」｜現役大家が開発',
    description: '【完全無料】現役大家が開発した不動産投資クラウドツール。収支・利回り・税金など27種類の計算ソフトを全て無料で提供。実務に基づいた精度の高いシミュレーションで、購入判断から出口戦略までをトータルにサポートする大家のためのプラットフォームです。',
    url: BASE_URL,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '不動産投資クラウドソフト「大家DX」',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産投資クラウドソフトなら「大家DX」｜現役大家が開発',
    description: '【完全無料】現役大家が開発した不動産投資クラウドツール。収支・利回り・税金など27種類の計算ソフトを全て無料で提供。実務に基づいた精度の高いシミュレーションで、購入判断から出口戦略までをトータルにサポートする大家のためのプラットフォームです。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  const articles = getAllArticles().slice(0, 6); // 最新6件

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">読み込み中...</div>}>
      <LandingPageClient articles={articles} />
    </Suspense>
  );
}
