import { Suspense } from 'react';
import { Metadata } from 'next';
import SimulatorLPClient from './SimulatorLPClient';
import { getAllArticles } from '@/lib/mdx';

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: '賃貸経営シミュレーター | 大家DX',
  description: '賃貸経営の収益性をシミュレーション。IRR、CCR、DSCR、35年キャッシュフローを一括計算。完全無料で利用可能。',
  openGraph: {
    title: '賃貸経営シミュレーター | 大家DX',
    description: '賃貸経営の収益性をシミュレーション。IRR、CCR、DSCR、35年キャッシュフローを一括計算。完全無料で利用可能。',
    url: `${BASE_URL}/simulator`,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/img/kakushin_img01.png`,
        width: 1200,
        height: 630,
        alt: '賃貸経営シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '賃貸経営シミュレーター | 大家DX',
    description: '賃貸経営の収益性をシミュレーション。IRR、CCR、DSCR、35年キャッシュフローを一括計算。完全無料で利用可能。',
    images: [`${BASE_URL}/img/kakushin_img01.png`],
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
      name: '賃貸経営シミュレーター',
      item: `${BASE_URL}/simulator`,
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
