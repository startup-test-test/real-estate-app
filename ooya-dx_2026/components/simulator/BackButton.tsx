'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface BackButtonProps {
  defaultPath?: string;
  label?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  defaultPath = '/dashboard',
  label,
  className = "flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation"
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    // Try to go back in history first, fallback to defaultPath
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.push(defaultPath);
    }
  };

  // Smart label based on current location
  const getBackLabel = () => {
    if (label) return label;

    const path = pathname || '';
    if (path.includes('/property-detail')) return 'マイページへ戻る';
    if (path.includes('/simulator')) return 'マイページへ戻る';
    if (path.includes('/transaction-search')) return 'マイページへ戻る';
    if (path.includes('/market-analysis')) return 'マイページへ戻る';
    if (path.includes('/guide')) return 'マイページへ戻る';
    if (path.includes('/faq')) return 'マイページへ戻る';
    if (path.includes('/pricing')) return 'マイページへ戻る';

    return '戻る';
  };

  return (
    <button onClick={handleBack} className={className}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      {getBackLabel()}
    </button>
  );
};

export default BackButton;