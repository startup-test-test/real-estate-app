'use client';

import React from 'react';
import { SharedHeader } from '@/components/shared-header';
import { LandingFooter } from '@/components/landing-footer';
import PurchaseOfferGenerator from '@/components/tools/PurchaseOfferGenerator';

export default function PurchaseOfferPage() {
  return (
    <div className="min-h-screen bg-gray-50 print:min-h-0 print:bg-white">
      <div className="print:hidden">
        <SharedHeader />
      </div>
      <div className="h-[52px] sm:h-[72px] md:h-[88px] print:hidden" />

      <main className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-8 md:py-12">
        <PurchaseOfferGenerator
          showHeader={true}
          showDisclaimer={true}
          compact={false}
        />
      </main>

      <div className="print:hidden">
        <LandingFooter />
      </div>
    </div>
  );
}
