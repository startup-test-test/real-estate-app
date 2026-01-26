'use client';

import React from 'react';
import PurchaseOfferGenerator from '@/components/tools/PurchaseOfferGenerator';

export default function MypagePurchaseOfferPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto pt-1 md:pt-0">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">買付申込書ジェネレーター</h1>
            <p className="text-gray-600 mt-1">
              フォームに入力するだけで、A4サイズの買付申込書PDFを作成
            </p>
          </div>

          {/* Purchase Offer Generator Component */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
            <PurchaseOfferGenerator
              showHeader={false}
              showDisclaimer={true}
              compact={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
