import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '法人のお問合せ・受託開発・取材など | 株式会社StartupMarketing',
  description: 'お仕事のご相談やご依頼、弊社サービスに関するお問い合わせはこちらから。2〜3営業日以内にご返信いたします。',
  alternates: {
    canonical: '/company/contact',
  },
}

export default function CorporateContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
