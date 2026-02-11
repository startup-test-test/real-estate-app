import type { Metadata } from 'next'

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: '法人のお問合せ・受託開発・取材など ｜株式会社StartupMarketing',
  description: 'お仕事のご相談やご依頼、弊社サービスに関するお問い合わせはこちらから。2〜3営業日以内にご返信いたします。',
  alternates: {
    canonical: '/company/contact',
  },
  openGraph: {
    title: '法人のお問合せ・受託開発・取材など ｜株式会社StartupMarketing',
    description: 'お仕事のご相談やご依頼、弊社サービスに関するお問い合わせはこちらから。2〜3営業日以内にご返信いたします。',
    url: `${BASE_URL}/company/contact`,
    siteName: '大家DX',
    type: 'website',
    images: [{ url: `${BASE_URL}/img/kakushin_img01.png`, width: 998, height: 674, alt: '大家DX' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '法人のお問合せ・受託開発・取材など ｜株式会社StartupMarketing',
    description: 'お仕事のご相談やご依頼、弊社サービスに関するお問い合わせはこちらから。2〜3営業日以内にご返信いたします。',
    images: [`${BASE_URL}/img/kakushin_img01.png`],
  },
}

export default function CorporateContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
