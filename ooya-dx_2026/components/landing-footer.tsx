import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="bg-gray-100 text-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start">
          <div className="mb-4 md:mb-0">
            <img src="/img/logo_250709_2.png" alt="大家DX ロゴ" className="h-8 w-auto mb-2" style={{ mixBlendMode: 'multiply' }} />
            <div className="text-xs text-gray-600">
              <a href="https://startup-marketing.co.jp/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 block">
                株式会社StartupMarketing
              </a>
              <span className="text-gray-500">〒330-9501 埼玉県さいたま市大宮区桜木町2丁目3番地 大宮マルイ7階</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            {/* PC版ナビゲーション */}
            <nav className="hidden md:flex items-center space-x-6 mb-2">
              <Link href="/simulator" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                シミュレーター
              </Link>
              <Link href="/tools" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                計算ツール
              </Link>
              <Link href="/media" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                メディア
              </Link>
              <a href="mailto:ooya.tech2025@gmail.com" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                お問合せ
              </a>
            </nav>

            {/* SP版ナビゲーション */}
            <nav className="md:hidden w-full mb-2">
              <div className="flex justify-start space-x-3">
                <Link href="/simulator" className="text-gray-600 hover:text-gray-900 transition-colors text-xs whitespace-nowrap">
                  シミュレーター
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/tools" className="text-gray-600 hover:text-gray-900 transition-colors text-xs whitespace-nowrap">
                  計算ツール
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/media" className="text-gray-600 hover:text-gray-900 transition-colors text-xs whitespace-nowrap">
                  メディア
                </Link>
                <span className="text-gray-300">|</span>
                <a href="mailto:ooya.tech2025@gmail.com" className="text-gray-600 hover:text-gray-900 transition-colors text-xs whitespace-nowrap">
                  お問合せ
                </a>
              </div>
            </nav>

            {/* PC版: 右寄せ */}
            <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center space-x-4 text-xs mb-1">
                <a href="https://startup-marketing.co.jp/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                  運営会社
                </a>
                <Link href="/legal/terms" className="text-gray-500 hover:text-gray-700">
                  利用規約
                </Link>
                <Link href="/legal/privacy" className="text-gray-500 hover:text-gray-700">
                  個人情報保護方針
                </Link>
                <Link href="/legal/tokushoho" className="text-gray-500 hover:text-gray-700">
                  特定商取引法
                </Link>
                <Link href="/disclaimer" className="text-gray-500 hover:text-gray-700">
                  免責事項
                </Link>
              </div>
              <div className="text-xs text-gray-500">
                © 2026 大家DX. All rights reserved.
              </div>
            </div>

            {/* SP版: 左寄せ */}
            <div className="md:hidden flex flex-col items-start w-full">
              <div className="overflow-x-auto w-full mb-1">
                <div className="flex items-center space-x-4 text-xs whitespace-nowrap pb-1">
                  <a href="https://startup-marketing.co.jp/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                    運営会社
                  </a>
                  <Link href="/legal/terms" className="text-gray-500 hover:text-gray-700">
                    利用規約
                  </Link>
                  <Link href="/legal/privacy" className="text-gray-500 hover:text-gray-700">
                    個人情報保護方針
                  </Link>
                  <Link href="/legal/tokushoho" className="text-gray-500 hover:text-gray-700">
                    特定商取引法
                  </Link>
                  <Link href="/disclaimer" className="text-gray-500 hover:text-gray-700">
                    免責事項
                  </Link>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                © 2026 大家DX. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
