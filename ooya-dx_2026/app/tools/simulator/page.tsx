import { Suspense } from 'react';
import { Metadata } from 'next';
import SimulatorLPClient from './SimulatorLPClient';
import { getAllArticles } from '@/lib/mdx';

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: '不動産投資シミュレーション【無料】収支・利回り・IRR一括計算｜大家DX',
  description: '不動産投資の収支を無料で詳細シミュレーション。IRR・CCR・DSCR・35年キャッシュフローを一括算出。現役大家が実際に銀行提出に使用しているプロ仕様の計算ロジック。結果の保存・比較機能も搭載し、あなたの投資判断を強力に支援します。',
  openGraph: {
    title: '不動産投資シミュレーション【無料】収支・利回り・IRR一括計算｜大家DX',
    description: '不動産投資の収支を無料で詳細シミュレーション。IRR・CCR・DSCR・35年キャッシュフローを一括算出。現役大家が実際に銀行提出に使用しているプロ仕様の計算ロジック。結果の保存・比較機能も搭載し、あなたの投資判断を強力に支援します。',
    url: `${BASE_URL}/tools/simulator`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/img/kakushin_img01.png`,
        width: 1200,
        height: 630,
        alt: '不動産投資シミュレーション',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産投資シミュレーション【無料】収支・利回り・IRR一括計算｜大家DX',
    description: '不動産投資の収支を無料で詳細シミュレーション。IRR・CCR・DSCR・35年キャッシュフローを一括算出。現役大家が実際に銀行提出に使用しているプロ仕様の計算ロジック。結果の保存・比較機能も搭載し、あなたの投資判断を強力に支援します。',
    images: [`${BASE_URL}/img/kakushin_img01.png`],
  },
  alternates: {
    canonical: '/tools/simulator',
  },
};

// パンくずリスト構造化データ
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: '大家DX',
      item: BASE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: '計算ツール一覧',
      item: `${BASE_URL}/tools`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: '賃貸経営シミュレーター',
      item: `${BASE_URL}/tools/simulator`,
    },
  ],
};

export default function SimulatorLPPage() {
  const articles = getAllArticles().slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense fallback={<div className="flex justify-center items-center min-h-screen">読み込み中...</div>}>
        <SimulatorLPClient articles={articles} />
      </Suspense>
    </>
  );
}
