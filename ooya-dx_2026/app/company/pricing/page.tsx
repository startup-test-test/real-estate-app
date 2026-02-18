'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import Link from 'next/link';
import { getPageInfo, formatToolDate } from '@/lib/navigation';

/**
 * 有料プラン募集停止のお知らせページ
 * 現在は完全無料プランのみ提供中
 */
const PremiumPlan: React.FC = () => {
  return (
    <article className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
      {/* パンくず */}
      <Breadcrumb items={[
        { label: '賃貸経営ツール 大家DX', href: '/' },
        { label: '有料プランについて' },
      ]} />

      {/* 日付 */}
      {(() => {
        const pageInfo = getPageInfo('/company/pricing');
        return pageInfo ? (
          <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
            {pageInfo.publishDate && <span>公開日：{formatToolDate(pageInfo.publishDate)}</span>}
            {pageInfo.lastUpdated && <span>更新日：{formatToolDate(pageInfo.lastUpdated)}</span>}
          </div>
        ) : null;
      })()}

      {/* ページタイトル */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">有料プランについて</h1>
      <p className="text-gray-600 mb-8">
        大家DXの有料プランに関するお知らせ
      </p>

          {/* メインお知らせカード */}
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-3 flex-1">
                  <h2 className="text-lg font-semibold text-blue-800 mb-2">
                    【重要なお知らせ】有料プラン（ベーシックプラン）の新規募集停止について
                  </h2>
                  <div className="text-blue-700 space-y-3">
                    <p>
                      2025年10月27日をもちまして、有料プラン（ベーシックプラン）の新規募集を停止いたしました。
                    </p>
                    <p>
                      現在、すべての機能を<strong className="text-blue-900">完全無料・無制限</strong>でご提供しております。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 現在のサービス内容 */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">現在のサービス内容</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">賃貸経営シミュレーター機能</h4>
                      <p className="text-gray-600 text-sm">
                        回数制限なく、無制限でご利用いただけます。IRR・DSCR・LTV・NOI等の主要指標と35年キャッシュフローを一括計算できます。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">PDFレポート出力</h4>
                      <p className="text-gray-600 text-sm">
                        シミュレーション結果をPDF形式で出力できます。無制限にご利用可能です。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">すべて完全無料</h4>
                      <p className="text-gray-600 text-sm">
                        月額料金は一切かかりません。登録するだけで、すべての機能をご利用いただけます。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 停止した機能 */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">サービス提供を停止した機能</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>AI市場分析機能（一時メンテナンス中）</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>公示地価検索機能（一時メンテナンス中）</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>有料プラン（ベーシックプラン）の新規募集</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-600 mt-4">
                  ※ 既にご契約中のお客様は引き続きベーシックプランをご利用いただけます。
                </p>
              </div>
            </div>

            {/* 今後の予定 */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">今後の予定</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  サービス改善後、有料プランの提供再開を予定しております。
                  再開時期については、サイト上でお知らせいたします。
                </p>
              </div>
            </div>
          </div>

          {/* CTAボタン */}
          <div className="text-center">
            <Link
              href="/tools/simulator"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              賃貸経営シミュレーターを使う
            </Link>
            <p className="text-sm text-gray-600 mt-4">
              完全無料・無制限でご利用いただけます
            </p>
      </div>
    </article>
  );
};

export default PremiumPlan;
