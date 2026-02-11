import { articleAuthorRef, articlePublisherRef } from '@/lib/eeat'

const BASE_URL = 'https://ooya.tech'

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
}

/**
 * WebPage構造化データ（JSON-LD）
 * 非ツールページ用。公開日・更新日をGoogleに伝える。
 */
export function WebPageJsonLd({ name, description, path, datePublished, dateModified }: WebPageJsonLdProps) {
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
