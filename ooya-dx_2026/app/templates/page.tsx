import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Download, FileSpreadsheet, User, Table, FileText } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { SimulatorCTA } from '@/components/tools/SimulatorCTA'
import { CompanyProfileCompact } from '@/components/tools/CompanyProfileCompact'

const BASE_URL = 'https://ooya.tech';
const PAGE_TITLE = '無料テンプレート一覧｜賃貸経営に役立つExcel・スプレッドシート';
const PAGE_DESCRIPTION = '賃貸経営・不動産投資に役立つ無料テンプレートを配布しています。レントロール、プロフィールシート、収支管理表など、すぐに使えるExcel・Googleスプレッドシートをダウンロードできます。';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${BASE_URL}/templates`,
    siteName: '大家DX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
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
      name: '大家DX',
      item: BASE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: '無料テンプレート',
      item: `${BASE_URL}/templates`,
    },
  ],
};

// テンプレート一覧
const templates = [
  {
    title: 'レントロール（賃料明細表）',
    description: '銀行融資・売却査定に必須の賃料明細表。3種類のフォーマットを無料配布しています。',
    href: '/media/base/rent-roll-template',
    icon: Table,
    tags: ['融資', '売却', 'Excel'],
  },
  {
    title: 'プロフィールシート',
    description: '金融機関や不動産会社への自己紹介資料。信頼感を高める投資家プロフィールを作成できます。',
    href: '/media/base/profile-sheet-template',
    icon: User,
    tags: ['融資', '営業'],
  },
  {
    title: 'エクセルテンプレート集',
    description: '収支管理、物件比較、家賃管理など、目的別に使えるエクセルテンプレートをまとめて紹介。',
    href: '/media/base/excel-template',
    icon: FileSpreadsheet,
    tags: ['収支管理', 'Excel'],
  },
  {
    title: 'スプレッドシート活用術',
    description: 'Googleスプレッドシートで賃貸経営を効率化。クラウド管理のメリットと無料テンプレートを紹介。',
    href: '/media/base/spreadsheet',
    icon: FileText,
    tags: ['Google', 'クラウド'],
  },
];

export default function TemplatesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="min-h-screen bg-white flex flex-col">
        <LandingHeader />

        {/* ヘッダー固定時のスペーサー */}
        <div className="h-[72px] sm:h-[88px]"></div>

        <main className="flex-1 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* パンくずリスト */}
            <nav className="flex items-center text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-primary-600">
                ホーム
              </Link>
              <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
              <span className="text-gray-900">無料テンプレート</span>
            </nav>

            {/* ヘッダー */}
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Download className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                無料テンプレート
              </h1>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                賃貸経営・不動産投資に役立つテンプレートを無料で配布しています。
                <br className="hidden sm:block" />
                Excel・Googleスプレッドシート対応。すぐにダウンロードして使えます。
              </p>
            </div>

            {/* テンプレート一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {templates.map((template) => {
                const IconComponent = template.icon;
                return (
                  <Link
                    key={template.href}
                    href={template.href}
                    className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-green-300 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                        <IconComponent className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-2">
                          {template.title}
                        </h2>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {template.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* 補足説明 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-12">
              <h2 className="text-lg font-bold text-gray-900 mb-4">テンプレートの使い方</h2>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>各テンプレートの記事ページへアクセスし、Googleスプレッドシートのリンクを開きます</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>「ファイル」→「コピーを作成」で自分のGoogleドライブに保存できます</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Excelで使いたい場合は「ファイル」→「ダウンロード」→「Microsoft Excel」を選択</span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="mt-16">
              <SimulatorCTA />
            </div>

            {/* 運営会社・運営者プロフィール */}
            <div className="mt-12">
              <CompanyProfileCompact />
            </div>
          </div>
        </main>

        <LandingFooter />
      </div>
    </>
  )
}
