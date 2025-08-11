import React from 'react';
import { Info } from 'lucide-react';

interface LegalDisclaimerProps {
  variant?: 'subtle' | 'info';
  className?: string;
}

const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({ 
  variant = 'subtle',
  className = '' 
}) => {
  if (variant === 'subtle') {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        <p>
          ※ 本サービスは教育・参考目的のシミュレーションツールです。
          実際の投資に関しては、専門家にご相談の上、お客様ご自身の責任で行ってください。
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
      <div className="flex items-start">
        <Info className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <div className="ml-2">
          <p className="text-xs text-gray-600">
            本サービスは教育・参考目的のシミュレーションツールです。
            実際の投資に関しては、専門家にご相談の上、お客様ご自身の責任で行ってください。
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalDisclaimer;