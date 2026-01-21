import { Suspense } from 'react';
import { Metadata } from 'next';
import LandingPageClient from './LandingPageClient';
import { getAllArticles } from '@/lib/mdx';
import { getAllGlossaryTerms } from '@/lib/glossary';

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: '大家DX - 賃貸経営シミュレーション',
  description: 'AI搭載の包括的賃貸経営プラットフォーム。収益シミュレーション、市場分析、経営判断をサポートします。',
  openGraph: {
    title: '大家DX - 賃貸経営シミュレーション',
    description: 'AI搭載の包括的賃貸経営プラットフォーム。収益シミュレーション、市場分析、経営判断をサポートします。',
    url: BASE_URL,
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/media/hero-media.jpeg`,
        width: 1200,
        height: 630,
        alt: '大家DX - 賃貸経営シミュレーション',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '大家DX - 賃貸経営シミュレーション',
    description: 'AI搭載の包括的賃貸経営プラットフォーム。収益シミュレーション、市場分析、経営判断をサポートします。',
    images: [`${BASE_URL}/images/media/hero-media.jpeg`],
  },
};

// WebSite構造化データ
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '大家DX',
  url: BASE_URL,
  description: 'AI搭載の包括的賃貸経営プラットフォーム。収益シミュレーション、市場分析、経営判断をサポートします。',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}/media?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

// Organization構造化データ
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '大家DX',
  url: BASE_URL,
  logo: `${BASE_URL}/img/logo_250709_2.png`,
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'ooya.tech2025@gmail.com',
    contactType: 'customer service',
    availableLanguage: 'Japanese',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: '桜木町2丁目3番地 大宮マルイ7階',
    addressLocality: 'さいたま市大宮区',
    addressRegion: '埼玉県',
    postalCode: '330-9501',
    addressCountry: 'JP',
  },
};

export default function HomePage() {
  const articles = getAllArticles().slice(0, 6); // 最新6件
  const glossaryTerms = getAllGlossaryTerms().slice(0, 6); // 最新6件

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Suspense fallback={<div className="flex justify-center items-center min-h-screen">読み込み中...</div>}>
        <LandingPageClient articles={articles} glossaryTerms={glossaryTerms} />
      </Suspense>
    </>
  );
}
