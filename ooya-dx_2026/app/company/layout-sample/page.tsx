import { Breadcrumb } from '@/components/Breadcrumb';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CompanyPageLayout サンプル | 大家DX',
  description: 'CompanyPageLayout（1カラム）のレイアウトサンプルページです。',
  robots: { index: false, follow: false },
};

export default function LayoutSamplePage() {
  return (
    <article className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: '大家DX', href: '/' },
          { label: '会社概要', href: '/company' },
          { label: 'レイアウトサンプル' },
        ]}
      />

      {/* 日付 */}
      <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
        <span>公開日：2026年1月15日</span>
        <span>更新日：2026年2月18日</span>
      </div>

      {/* H1タイトル */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
        CompanyPageLayout サンプル
      </h1>

      <div className="prose prose-gray max-w-none">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-blue-900 mt-0">レイアウト情報</h2>
          <ul className="text-blue-800">
            <li><strong>テンプレート名:</strong> CompanyPageLayout</li>
            <li><strong>構成:</strong> 1カラム（ヘッダー + メイン + フッター）</li>
            <li><strong>用途:</strong> company系ページ、profile等</li>
            <li><strong>対象ページ数:</strong> 約20ページ</li>
          </ul>
        </div>

        <h2>特徴</h2>
        <ul>
          <li>共通ヘッダー（SharedHeader）を使用</li>
          <li>固定ヘッダー対応のスペーサー（HeaderSpacer）</li>
          <li>共通フッター（LandingFooter）を使用</li>
          <li>1カラムのシンプルなレイアウト</li>
          <li>レスポンシブ対応のパディング</li>
          <li>パンくずリスト（Breadcrumb）</li>
          <li>公開日・更新日の表示</li>
        </ul>

        <h2>使用しているページ例</h2>
        <ul>
          <li><a href="/company">/company</a> - 会社概要</li>
          <li><a href="/company/legal/terms">/company/legal/terms</a> - 利用規約</li>
          <li><a href="/company/disclaimer">/company/disclaimer</a> - 免責事項</li>
          <li><a href="/company/contact">/company/contact</a> - お問い合わせ</li>
          <li><a href="/profile">/profile</a> - 自己紹介</li>
        </ul>

        <h2>サンプルコンテンツ</h2>
        <p>
          以下はレイアウトの表示確認用のダミーテキストです。
          このページは CompanyPageLayout の1カラムレイアウトで表示されています。
        </p>
        <p>
          ヘッダーとフッターが共通コンポーネントとして表示され、
          メインコンテンツエリアは max-w-7xl で中央寄せされています。
        </p>
      </div>
    </article>
  );
}
