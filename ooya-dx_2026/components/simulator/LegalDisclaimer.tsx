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
          ※ 本サービスは不動産賃貸経営の参考目的のシミュレーションツールです。
          提供する情報・分析結果は参考情報であり、将来の経営や成果事業の成功を保証するものではありません。
          実際の経営判断・投資判断は、宅地建物取引士・税理士等の専門家にご相談の上、必ずご自身の責任において行ってください。
          当社は金融商品取引業および宅地建物取引業の登録を受けておらず、特定の金融商品を推奨するものではなく、取引代理・媒介・仲介は行っておりません。
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
            本サービスは不動産賃貸経営の参考目的のシミュレーションツールです。
            提供する情報・分析結果は参考情報であり、将来の経営や成果事業の成功を保証するものではありません。
            実際の経営判断・投資判断は、宅地建物取引士・税理士等の専門家にご相談の上、必ずご自身の責任において行ってください。
            当社は金融商品取引業および宅地建物取引業の登録を受けておらず、特定の金融商品を推奨するものではなく、取引代理・媒介・仲介は行っておりません。
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalDisclaimer;