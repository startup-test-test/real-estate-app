import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  name: string;
  path: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-generate breadcrumbs if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'マイページ', path: '/' }
    ];

    if (path.includes('/simulator')) {
      breadcrumbs.push({ name: 'AI物件シミュレーター', path: '/simulator', current: true });
    } else if (path.includes('/transaction-search')) {
      breadcrumbs.push({ name: 'AI取引事例検索', path: '/transaction-search', current: true });
    } else if (path.includes('/market-analysis')) {
      breadcrumbs.push({ name: 'AI市場分析', path: '/market-analysis', current: true });
    } else if (path.includes('/user-guide')) {
      breadcrumbs.push({ name: 'ユーザーガイド', path: '/user-guide', current: true });
    } else if (path.includes('/faq')) {
      breadcrumbs.push({ name: 'FAQ', path: '/faq', current: true });
    } else if (path.includes('/premium-plan')) {
      breadcrumbs.push({ name: '有料プラン', path: '/premium-plan', current: true });
    } else if (path.includes('/property-detail')) {
      breadcrumbs.push({ name: '物件詳細', path: path, current: true });
    } else if (path.includes('/simulation-result')) {
      breadcrumbs.push({ name: 'シミュレーション結果', path: path, current: true });
    } else if (path === '/') {
      breadcrumbs[0].current = true;
    }

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  // Don't show breadcrumbs on the homepage unless explicitly provided
  if (!items && location.pathname === '/') {
    return null;
  }

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
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
                onClick={() => navigate(item.path)}
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