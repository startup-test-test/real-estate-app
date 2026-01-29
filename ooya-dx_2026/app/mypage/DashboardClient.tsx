'use client';

import React from 'react';
import Link from 'next/link';
import { Calculator, BarChart3, ArrowRight } from 'lucide-react';

const DashboardClient: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto pt-1 md:pt-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            マイページ
          </h1>
          <p className="text-gray-600">
            不動産投資の収益性を分析するためのツールです。目的に合わせてお選びください。
          </p>
        </div>

        {/* Simulator Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* CF Simulation Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 ml-4">
                CFシミュレーション
              </h2>
            </div>

            <p className="text-gray-600 mb-4 min-h-[60px]">
              4項目の入力だけで、35年間のキャッシュフローを簡単にシミュレーション。物件のスクリーニングに最適です。
            </p>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">入力項目:</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>・物件価格</li>
                <li>・月額賃料</li>
                <li>・自己資金</li>
                <li>・借入金利</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700">
                諸費用7%、管理費5%、空室率5%、固定資産税1%で自動計算
              </p>
            </div>

            <Link
              href="/mypage/cf-simulator"
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              CFシミュレーションを使う
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>

          {/* Revenue Simulation Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calculator className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 ml-4">
                収益シミュレーション
              </h2>
            </div>

            <p className="text-gray-600 mb-4 min-h-[60px]">
              詳細な条件を設定して、より精密な収益分析が可能。本格的な投資判断にご活用ください。
            </p>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">主な機能:</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>・物件URLから自動情報取得</li>
                <li>・詳細な経費設定</li>
                <li>・税金シミュレーション</li>
                <li>・複数シナリオの比較</li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-purple-700">
                CFシミュレーションで絞り込んだ物件の詳細分析に
              </p>
            </div>

            <Link
              href="/mypage/revenue-simulator"
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              収益シミュレーションを使う
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
