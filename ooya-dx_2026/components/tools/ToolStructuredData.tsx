const BASE_URL = 'https://ooya.tech'

interface FaqItem {
  question: string
  answer: string
}

interface ToolStructuredDataProps {
  /** ツール名（例: '仲介手数料計算シミュレーター'） */
  name: string
  /** ツールの説明文 */
  description: string
  /** ツールのパス（例: '/tools/brokerage'） */
  toolPath: string
  /** 公開日（例: '2026-01-15'） */
  datePublished?: string
  /** 更新日（例: '2026-02-05'） */
  dateModified?: string
  /** FAQリスト（あれば FAQPage 構造化データを自動生成） */
  faqItems?: FaqItem[]
  /** ツールの主要機能リスト（例: ['2024年法改正対応', '消費税自動計算']） */
  featureList?: string[]
  /** ツールのスクリーンショット画像パス（例: '/images/tools/brokerage.png'） */
  image?: string
}

/**
 * ツールページ共通の構造化データ（JSON-LD）
 *
 * 以下を自動生成:
 * - SoftwareApplication（Googleに「計算ツール」と認識させる）
 * - BreadcrumbList（パンくずリスト）
 * - WebPage（公開日・更新日がある場合）
 * - FAQPage（faqItemsがある場合）
 *
 * 一箇所変更すれば全ツールページに反映されます。
 */
export function ToolStructuredData({
  name,
  description,
  toolPath,
  datePublished,
  dateModified,
  faqItems,
  featureList,
  image,
}: ToolStructuredDataProps) {
  // SoftwareApplication: Googleに「これは計算ツールである」と伝える
  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY',
    },
    provider: {
      '@type': 'Organization',
      name: '大家DX',
      url: BASE_URL,
      logo: `${BASE_URL}/img/logo_250709_2.png`,
    },
    ...(featureList && featureList.length > 0 && { featureList: featureList.join(', ') }),
    ...(image && { image: `${BASE_URL}${image}` }),
  }

  // BreadcrumbList: パンくずリスト
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'ホーム',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '不動産・賃貸経営計算ツール',
        item: `${BASE_URL}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name,
        item: `${BASE_URL}${toolPath}`,
      },
    ],
  }

  // WebPage: 公開日・更新日がある場合のみ生成
  const webPageSchema = datePublished
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name,
        description,
        url: `${BASE_URL}${toolPath}`,
        datePublished,
        ...(dateModified && { dateModified }),
        publisher: {
          '@type': 'Organization',
          name: '大家DX',
          url: BASE_URL,
        },
      }
    : null

  // FAQPage: faqItemsがある場合のみ生成
  const faqSchema =
    faqItems && faqItems.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }
      : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {webPageSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  )
}
