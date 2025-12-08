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
    <div className="bg-red-50 border-2 border-red-500 p-4 mb-6 rounded-lg shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-1">
            【重要なお知らせ】サービス提供内容の変更について
          </h3>
          <p className="text-lg sm:text-xl font-bold text-red-800 mb-2">
            サービス終了のお知らせ
          </p>
          <div className="text-sm text-red-700 space-y-1">
            <p className="font-semibold">
              2025年12月8日をもちまして、本サービスは終了いたしました。
            </p>
            <p className="mt-2 text-red-600">
              長らくのご愛顧、誠にありがとうございました。
            </p>
          </div>
        </div>
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 text-red-500 hover:text-red-700 transition-colors"
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
