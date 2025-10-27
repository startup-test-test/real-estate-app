import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface MaintenanceNoticeProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

const MaintenanceNotice: React.FC<MaintenanceNoticeProps> = ({
  onClose,
  showCloseButton = false
}) => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold text-blue-800 mb-1">
            【重要なお知らせ】機能の一時メンテナンスについて
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              サービス品質向上のため、以下の機能を一時的にメンテナンス中とさせていただいております。
            </p>
            <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
              <li>AI市場分析</li>
              <li>公示地価検索</li>
              <li>有料プラン（ベーシックプラン）- 現在無料プランのみ提供しております</li>
            </ul>
            <p className="mt-2 text-xs text-blue-600">
              ※ 収益シミュレーターは通常通りご利用いただけます
            </p>
          </div>
        </div>
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 text-blue-500 hover:text-blue-700 transition-colors"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MaintenanceNotice;
