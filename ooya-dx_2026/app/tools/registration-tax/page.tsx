import type { Metadata } from 'next'
import { RegistrationTaxCalculator } from './RegistrationTaxCalculator'
import { getGlossaryTermsByTool } from '@/lib/glossary'

export const metadata: Metadata = {
  title: '不動産の登録免許税 計算シミュレーション｜軽減税率対応',
  description:
    '不動産購入時の登録免許税を無料で計算。土地・建物の移転登記、新築の保存登記、抵当権設定登記に対応。軽減税率（長期優良住宅・低炭素住宅）も自動判定します。',
  keywords: [
    '登録免許税',
    '登録免許税 計算',
    '登録免許税 シミュレーション',
    '登録免許税 軽減',
    '不動産 登記 費用',
    '所有権移転登記 費用',
    '抵当権設定 費用',
    '新築 登記費用',
    '中古住宅 登記費用',
  ],
  openGraph: {
    title: '不動産の登録免許税 計算シミュレーション｜軽減税率対応',
    description:
      '不動産購入時の登録免許税を無料で計算。土地・建物の移転登記、新築の保存登記、抵当権設定登記に対応。',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://ooya.tech/tools/registration-tax',
  },
  twitter: {
    card: 'summary_large_image',
    title: '不動産の登録免許税 計算シミュレーション｜軽減税率対応',
    description:
      '不動産購入時の登録免許税を無料で計算。軽減税率も自動判定。',
  },
  alternates: {
    canonical: 'https://ooya.tech/tools/registration-tax',
  },
}

// 構造化データ
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '登録免許税シミュレーター',
  description:
    '不動産購入時の登録免許税を計算するシミュレーター。土地・建物の移転登記、保存登記、抵当権設定に対応。軽減税率も自動判定。',
  url: 'https://ooya.tech/tools/registration-tax',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
  },
  creator: {
    '@type': 'Organization',
    name: '大家DX',
    url: 'https://ooya.tech',
  },
}

// パンくずリスト構造化データ
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'ホーム',
      item: 'https://ooya.tech',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: '不動産・賃貸経営計算ツール',
      item: 'https://ooya.tech/tools',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: '登録免許税シミュレーター',
      item: 'https://ooya.tech/tools/registration-tax',
    },
  ],
}

export default function RegistrationTaxPage() {
  const relatedGlossary = getGlossaryTermsByTool('/tools/registration-tax')
    .map(term => ({ slug: term.slug, title: term.title }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <RegistrationTaxCalculator relatedGlossary={relatedGlossary} />
    </>
  )
}
