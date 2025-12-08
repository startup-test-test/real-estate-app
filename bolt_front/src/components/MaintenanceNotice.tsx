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
    <div className="bg-red-50 border-4 border-red-500 p-6 sm:p-8 mb-6 rounded-lg shadow-lg">
      <div className="flex flex-col items-center text-center">
        <div className="flex-shrink-0 mb-4">
          <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-bold text-red-800 mb-2">
            【重要なお知らせ】サービス提供内容の変更について
          </h3>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-800 mb-4">
            サービス終了のお知らせ
          </p>
          <div className="text-lg sm:text-xl lg:text-2xl text-red-700 space-y-2">
            <p className="font-semibold">
              2025年12月8日をもちまして、本サービスは終了いたしました。
            </p>
            <p className="mt-4 text-base sm:text-lg text-red-600">
              長らくのご愛顧、誠にありがとうございました。
            </p>
          </div>
        </div>
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 mt-4 text-red-500 hover:text-red-700 transition-colors"
            aria-label="閉じる"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MaintenanceNotice;
