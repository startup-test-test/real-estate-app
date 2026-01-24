'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/company', label: '会社概要' },
  { href: '/company/portfolio', label: '実績・得意領域' },
  { href: '/company/service', label: 'メニュー・料金' },
  { href: '/media/profile', label: 'プロフィール' },
  { href: '/media', label: 'ブログ' },
  { href: '/company/contact', label: 'お問合わせ' },
];

export function CompanyNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 bg-gray-50 rounded-xl p-4">
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              {isActive ? (
                <span className="text-gray-900 font-medium">
                  &gt; {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  &gt; {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
