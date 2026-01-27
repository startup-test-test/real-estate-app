import { Metadata } from 'next';

const BASE_URL = 'https://ooya.tech';

export const metadata: Metadata = {
  title: '買付申込書ジェネレーター｜無料で作成・PDF出力',
  description:
    '不動産の買付申込書（購入申込書）を無料で作成。フォームに入力するだけでA4サイズのPDFを出力できます。物件情報・購入条件・支払方法を入力して簡単作成。',
  keywords: [
    '買付申込書',
    '買付申込書 テンプレート',
    '買付申込書 書き方',
    '購入申込書 不動産',
    '買付証明書',
    '不動産 買付',
    '買付申込書 無料',
    '買付申込書 PDF',
  ],
  openGraph: {
    title: '買付申込書ジェネレーター｜無料で作成・PDF出力',
    description:
      '不動産の買付申込書を無料で作成。フォームに入力するだけでA4サイズのPDFを出力できます。',
    url: `${BASE_URL}/tools/purchase-offer`,
    siteName: '大家DX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '買付申込書ジェネレーター｜無料で作成・PDF出力',
    description:
      '不動産の買付申込書を無料で作成。フォームに入力するだけでA4サイズのPDFを出力できます。',
  },
  alternates: {
    canonical: `${BASE_URL}/tools/purchase-offer`,
  },
};

export default function PurchaseOfferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
