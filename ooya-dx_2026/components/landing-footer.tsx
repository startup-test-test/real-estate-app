import Link from 'next/link';
import { footerNavigation, legalLinks } from '@/lib/navigation';

export function LandingFooter() {
  return (
    <footer className="bg-gray-100 text-gray-800 print:hidden">
      {/* メインフッターエリア */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 会社情報セクション */}
          <div className="lg:col-span-1">
            <img
              src="/img/logo_250709_2.png"
              alt="大家DX ロゴ"
              className="h-8 w-auto mb-4"
              style={{ mixBlendMode: 'multiply' }}
            />
            <div className="text-sm text-gray-600 space-y-1">
              <a
                href="https://startup-marketing.co.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 block font-medium"
              >
                株式会社StartupMarketing
              </a>
              <p className="text-gray-500 text-xs">
                〒330-9501 埼玉県さいたま市大宮区桜木町2丁目3番地 大宮マルイ7階
              </p>
            </div>
          </div>

          {/* ナビゲーションセクション */}
          {footerNavigation.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-bold text-gray-900 mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 下部フッターエリア */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            {/* 法的リンク */}
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-xs">
              {legalLinks.map((link) => (
                link.href.startsWith('http') ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>

            {/* コピーライト */}
            <div className="text-xs text-gray-500">
              © 2026 大家DX. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
