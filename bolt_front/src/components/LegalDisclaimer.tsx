import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LegalDisclaimerProps {
  variant?: 'full' | 'compact';
}

export const LegalDisclaimer: React.FC<LegalDisclaimerProps> = ({ variant = 'full' }) => {
  if (variant === 'compact') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-700">
            本ツールは教育・参考目的のシミュレーションです。実際の投資判断は専門家にご相談ください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-yellow-800 mb-2">重要な注意事項</h4>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>本ツールは教育・参考目的のシミュレーションです</li>
            <li>算出結果は参考値であり、実際の市場価格や投資成果を保証するものではありません</li>
            <li>投資の推奨・勧誘を行うものではありません</li>
            <li>実際の投資判断は、宅地建物取引士・ファイナンシャルプランナー等の専門家にご相談ください</li>
            <li>不動産投資にはリスクが伴います。投資は自己責任でお願いします</li>
          </ul>
        </div>
      </div>
    </div>
  );
};