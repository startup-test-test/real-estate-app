'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Clock, Home } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-slate-800 to-slate-900 text-white mt-auto lg:hidden print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          {/* 左側：ロゴとサービス情報 */}
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
            {/* ロゴ */}
            <div className="flex items-center">
              <Home className="h-5 w-5 mr-2" />
              <span className="text-lg font-bold" style={{ fontFamily: 'serif' }}>大家DX</span>
            </div>

            {/* サービスリンク（2列） */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <Link href="/tools/simulator" className="text-sm text-white/70 hover:text-white transition-colors">
                賃貸経営シミュレーター
              </Link>
              <Link href="/guide" className="text-sm text-white/70 hover:text-white transition-colors">
                ご利用ガイド
              </Link>
              <Link href="/company/faq" className="text-sm text-white/70 hover:text-white transition-colors">
                よくある質問
              </Link>
            </div>
          </div>

          {/* 右側：法的文書リンクとコピーライト */}
          <div className="text-xs space-y-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/company/legal/terms" className="text-white/70 hover:text-white transition-colors">
                利用規約
              </Link>
              <Link href="/company/legal/privacy" className="text-white/70 hover:text-white transition-colors">
                プライバシーポリシー
              </Link>
              <Link href="/company/disclaimer" className="text-white/70 hover:text-white transition-colors">
                免責事項
              </Link>
            </div>
            <p className="text-white/50">© {currentYear} 大家DX. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
