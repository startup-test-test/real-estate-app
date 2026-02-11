import { articleAuthorRef, articlePublisherRef } from '@/lib/eeat'

const BASE_URL = 'https://ooya.tech'

interface BreadcrumbItem {
  name: string
  href: string
}

interface WebPageJsonLdProps {
  /** ページ名 */
  name: string
  /** ページの説明 */
  description: string
  /** ページのパス（例: '/company/csr'） */
  path: string
  /** 公開日（YYYY-MM-DD形式） */
  datePublished: string
  /** 更新日（YYYY-MM-DD形式） */
  dateModified?: string
  /** パンくずリスト（ホームは自動追加、中間階層＋現在ページを指定） */
  breadcrumbs?: BreadcrumbItem[]
}

/**
 * WebPage構造化データ（JSON-LD）
 * 非ツールページ用。公開日・更新日・パンくずリストをGoogleに伝える。
 */
export function WebPageJsonLd({ name, description, path, datePublished, dateModified, breadcrumbs }: WebPageJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: `${BASE_URL}${path}`,
    datePublished,
    ...(dateModified && { dateModified }),
    author: articleAuthorRef,
    publisher: articlePublisherRef,
  }

  // パンくずリスト: ホーム + 指定された階層
  const breadcrumbSchema = breadcrumbs
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'ホーム', item: BASE_URL },
          ...breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 2,
            name: item.name,
            item: `${BASE_URL}${item.href}`,
          })),
        ],
      }
    : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  )
}
