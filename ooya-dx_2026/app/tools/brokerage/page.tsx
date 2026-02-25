import { Metadata } from 'next'
import { ToolStructuredData } from '@/components/tools/ToolStructuredData'
import { BrokerageCalculator } from './BrokerageCalculator'

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: '仲介手数料を自動計算【2026最新】不動産・800万円以下特例対応',
  description:
    '不動産売買の仲介手数料を無料でシミュレーション。売買価格を入力するだけで消費税込みの金額を自動計算。2024年法改正の800万円以下特例に対応した2026年最新版。速算式・早見表付き。',
  openGraph: {
    title: '仲介手数料を自動計算【2026最新】不動産・800万円以下特例対応',
    description: '不動産売買の仲介手数料を無料でシミュレーション。売買価格を入力するだけで消費税込みの金額を自動計算。2024年法改正の800万円以下特例に対応した2026年最新版。速算式・早見表付き。',
    url: 'https://ooya.tech/tools/brokerage',
    siteName: '大家DX',
    type: 'website',
    images: [
      {
        url: 'https://ooya.tech/images/media/hero-media.jpeg',
        width: 1200,
        height: 630,
        alt: '仲介手数料シミュレーター',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '仲介手数料を自動計算【2026最新】不動産・800万円以下特例対応',
    description: '不動産売買の仲介手数料を無料でシミュレーション。売買価格を入力するだけで消費税込みの金額を自動計算。2024年法改正の800万円以下特例に対応した2026年最新版。速算式・早見表付き。',
    images: ['https://ooya.tech/images/media/hero-media.jpeg'],
  },
  alternates: {
    canonical: '/tools/brokerage',
  },
}

export default function BrokeragePage() {
  return (
    <>
      <ToolStructuredData
        name="仲介手数料計算シミュレーター"
        description="不動産売買の仲介手数料を瞬時に計算するツール。売買価格を入力するだけで税込金額がわかります。"
        toolPath="/tools/brokerage"
        datePublished="2026-01-15"
        dateModified="2026-02-25"
        featureList={[
          '2024年法改正（800万円特例）対応',
          '消費税自動計算',
          '速算式・早見表付き',
          '売主・買主別の手数料上限表示',
        ]}
        faqItems={[
          {
            question: '「3%+6万円」の計算式とは？',
            answer: '売買価格が400万円を超える場合、仲介手数料の上限は「売買価格×3%+6万円（税抜）」で計算できます。これは宅地建物取引業法で定められた上限額を、一つの式で簡単に求められるようにした計算式です。正式には価格帯ごとに5%・4%・3%の料率が適用されますが、この式を使えば同じ結果が得られます。なぜ6万円を足すのか？それは200万円までの2%分（4万円）と、400万円までの1%分（2万円）の差額を調整するためです。',
          },
          {
            question: '2024年法改正（800万円特例）とは？',
            answer: '2024年7月の宅建業法改正により、売買価格800万円以下の物件については、売主・買主それぞれから最大33万円（税込）を仲介手数料の上限として受け取れるようになりました。低額物件の流通促進を目的とした特例で、適用には媒介契約時の合意が必要です。',
          },
          {
            question: '仲介手数料に消費税はかかりますか？',
            answer: 'はい、仲介手数料には消費税（10%）がかかります。「3%+6万円」などの計算式で求めた金額は税抜価格のため、実際に支払う金額は消費税を加算した税込価格となります。また、売買価格に建物の消費税が含まれている場合は、消費税を差し引いた本体価格で仲介手数料を計算します。',
          },
        ]}
      />
      <BrokerageCalculator />
    </>
  )
}
