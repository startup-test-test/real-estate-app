import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BackButtonProps {
  defaultPath?: string;
  label?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  defaultPath = '/mypage', 
  label,
  className = "flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation"
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Try to go back in history first, fallback to defaultPath
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate(defaultPath);
    }
  };

  // Smart label based on current location
  const getBackLabel = () => {
    if (label) return label;
    
    if (location.pathname.includes('/property-detail')) return 'マイページへ戻る';
    if (location.pathname.includes('/simulator')) return 'マイページへ戻る';
    if (location.pathname.includes('/transaction-search')) return 'マイページへ戻る';
    if (location.pathname.includes('/market-analysis')) return 'マイページへ戻る';
    if (location.pathname.includes('/user-guide')) return 'マイページへ戻る';
    if (location.pathname.includes('/faq')) return 'マイページへ戻る';
    if (location.pathname.includes('/premium-plan')) return 'マイページへ戻る';
    
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