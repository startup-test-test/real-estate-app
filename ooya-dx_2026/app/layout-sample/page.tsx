import Link from 'next/link';

export const metadata = {
  title: 'layout.tsxサンプル｜大家DX',
  robots: { index: false, follow: false },
};

export default function LayoutSamplePage() {
  return (
    <article className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-12">
      {/* パンくず */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600">
          ホーム
        </Link>
        <span className="mx-2">&gt;</span>
        <span>layout.tsxサンプル</span>
      </nav>

      {/* 日付 */}
      <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
        <span>公開日：2026年2月17日</span>
      </div>

      {/* H1タイトル */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        layout.tsx だけのサンプルページ
      </h1>

      {/* コンテンツ */}
      <div className="text-base text-gray-700 leading-relaxed space-y-6">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">このページの構造</h2>
          <p>このページは <code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-blue-700">layout.tsx</code> だけで表示しています。ToolPageLayout は使っていません。</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">layout.tsx が提供するもの</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>LandingHeader（上部ヘッダー）</li>
            <li>HeaderSpacer（固定ヘッダー下の余白）</li>
            <li>main（flex-1 overflow-x-hidden）</li>
            <li>LandingFooter（下部フッター）</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ページ側が書いているもの</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>パンくず（nav）</li>
            <li>日付表示</li>
            <li>H1タイトル</li>
            <li>コンテンツ本文（この部分）</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">比較ページ</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><Link href="/company" className="text-blue-600 hover:underline">/company</Link> — layout.tsx（同じ構造）</li>
            <li><Link href="/tools/cf" className="text-blue-600 hover:underline">/tools/cf</Link> — ToolPageLayout（2カラム）</li>
            <li><Link href="/tools" className="text-blue-600 hover:underline">/tools</Link> — 個別配置（コピペ）</li>
          </ul>
        </section>
      </div>
    </article>
  );
}
