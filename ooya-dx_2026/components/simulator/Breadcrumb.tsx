'use client';

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface BreadcrumbItem {
  name: string;
  path: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Auto-generate breadcrumbs if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const path = pathname || '';
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'マイページ', path: '/dashboard' }
    ];

    if (path.includes('/simulator')) {
      breadcrumbs.push({ name: '賃貸経営シミュレーター', path: '/tools/simulator', current: true });
    // } else if (path.includes('/transaction-search')) {
    //   breadcrumbs.push({ name: 'AI取引事例検索', path: '/transaction-search', current: true });
    // } else if (path.includes('/market-analysis')) {
    //   breadcrumbs.push({ name: 'AI市場分析', path: '/market-analysis', current: true });
    // } else if (path.includes('/land-prices')) {
    //   breadcrumbs.push({ name: '公示地価検索', path: '/land-prices', current: true });
    } else if (path.includes('/guide')) {
      breadcrumbs.push({ name: 'ユーザーガイド', path: '/guide', current: true });
    } else if (path.includes('/company/faq')) {
      breadcrumbs.push({ name: 'FAQ', path: '/company/faq', current: true });
    } else if (path.includes('/company/pricing')) {
      breadcrumbs.push({ name: '有料プラン', path: '/company/pricing', current: true });
    } else if (path.includes('/property-detail')) {
      breadcrumbs.push({ name: '物件詳細', path: path, current: true });
    } else if (path === '/dashboard') {
      breadcrumbs[0].current = true;
    }

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  // Don't show breadcrumbs on the homepage unless explicitly provided
  if (!items && pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className="flex mb-4 print:hidden" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 text-sm">
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
            {index === 0 && (
              <Home className="h-4 w-4 text-gray-400 mr-1" />
            )}
            {item.current ? (
              <span className="font-medium text-gray-900">{item.name}</span>
            ) : (
              <button
                onClick={() => router.push(item.path)}
                className="text-gray-500 hover:text-gray-700 transition-colors touch-manipulation"
              >
                {item.name}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;