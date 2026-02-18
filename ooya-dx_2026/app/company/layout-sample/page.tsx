import { CompanyNav } from '@/components/company-nav';
import { Breadcrumb } from '@/components/Breadcrumb';
import Link from 'next/link';

export const metadata = {
  title: 'layout.tsxサンプル｜大家DX',
  robots: { index: false, follow: false },
};

export default function LayoutSamplePage() {
  return (
    <article className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-12">
      {/* パンくず */}
      <Breadcrumb items={[
        { label: '賃貸経営ツール 大家DX', href: '/' },
        { label: 'CompanyPageLayoutサンプル' },
      ]} />

      {/* 日付 */}
      <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
        <span>公開日：2026年2月17日</span>
        <span>更新日：2026年2月18日</span>
      </div>

      {/* H1タイトル */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
        CompanyPageLayout サンプルページ
      </h1>

      {/* ページナビゲーション */}
      <CompanyNav />

      {/* コンテンツ */}
      <div className="text-base text-gray-700 leading-relaxed space-y-6">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">このページの構造</h2>
          <p>このページは <code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-blue-700">app/company/layout.tsx</code> が提供する <code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-blue-700">CompanyPageLayout</code> で表示しています。company配下の全ページ（18ページ）が同じレイアウトを共有しています。</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">CompanyPageLayout が提供するもの</h2>
          <p className="mb-3"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-blue-700">components/CompanyPageLayout.tsx</code> が以下をラップ：</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>LandingHeader（上部ヘッダー・固定）</li>
            <li>HeaderSpacer（固定ヘッダー下の余白）</li>
            <li>main（flex-1 overflow-x-hidden）← この中に children が入る</li>
            <li>LandingFooter（下部フッター）</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ページ側（page.tsx）が書いているもの</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>パンくず（nav）</li>
            <li>日付表示（getCompanyPageInfo）</li>
            <li>H1タイトル</li>
            <li>CompanyNav（11ページのみ・H1直後に配置）</li>
            <li>コンテンツ本文（この部分）</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">※ CompanyNav は <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">components/company-nav.tsx</code> の1ファイルで管理。メニュー変更は1箇所で全ページに反映。</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">レイアウト管理ファイル</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-blue-700">app/company/layout.tsx</code> — CompanyPageLayout をimport（18ページ分）</li>
            <li><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-blue-700">app/profile/layout.tsx</code> — CompanyPageLayout をimport（1ページ分）</li>
            <li><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-blue-700">components/CompanyPageLayout.tsx</code> — レイアウト本体（ここを変更すると全20ページに反映）</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">比較ページ</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><Link href="/company" className="text-blue-600 hover:underline">/company</Link> — CompanyPageLayout + CompanyNav</li>
            <li><Link href="/company/disclaimer" className="text-blue-600 hover:underline">/company/disclaimer</Link> — CompanyPageLayout（CompanyNavなし）</li>
            <li><Link href="/profile" className="text-blue-600 hover:underline">/profile</Link> — CompanyPageLayout（ルート直下・E-E-A-T）</li>
            <li><Link href="/tools/cf" className="text-blue-600 hover:underline">/tools/cf</Link> — ContentPageLayout（2カラム）</li>
            <li><Link href="/tools" className="text-blue-600 hover:underline">/tools</Link> — CompanyPageLayout（ツール一覧）</li>
          </ul>
        </section>
      </div>
    </article>
  );
}
