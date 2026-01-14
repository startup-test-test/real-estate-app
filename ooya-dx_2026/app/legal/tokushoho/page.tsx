import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 - Sample',
  description: 'Sampleサービスの特定商取引法に基づく表記'
}

export default function TokushohoPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <h1 className="text-3xl font-semibold">特定商取引法に基づく表記</h1>
      
      <section>
        <h2 className="text-xl font-medium">販売事業者</h2>
        <ul className="mt-2 space-y-1 text-sm">
          <li>販売業者: 株式会社サンプル</li>
          <li>運営責任者: 代表取締役 山田太郎</li>
          <li>所在地: 〒100-0001 東京都千代田区千代田1-1-1</li>
          <li>連絡先: support@example.com</li>
        </ul>
      </section>
      
      <section>
        <h2 className="text-xl font-medium">販売価格</h2>
        <p className="text-sm">無料（すべての機能を無料でご利用いただけます）</p>
      </section>

      <section>
        <h2 className="text-xl font-medium">サービス利用開始時期</h2>
        <p className="text-sm">会員登録完了後、即時にサービス利用可能</p>
      </section>
      
      <section>
        <h2 className="text-xl font-medium">返品・キャンセル</h2>
        <p className="text-sm">デジタルサービスの性質上、原則として返品・返金はお受けしておりません。</p>
      </section>
    </main>
  )
}
