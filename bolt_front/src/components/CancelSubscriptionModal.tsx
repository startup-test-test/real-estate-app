import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cancelDate: string;
  remainingDays: number;
  isLoading: boolean;
}

const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cancelDate,
  remainingDays,
  isLoading
}) => {
  // ESCキーで閉じる
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  // モーダルの背景クリックで閉じる
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto animate-fadeIn">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            プランを解約しますか？
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 警告メッセージ */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-2">解約にあたってのご注意</p>
              <ul className="space-y-1">
                <li className="flex items-start">
                  <span className="mr-1">•</span>
                  <span>{cancelDate}まで全機能をご利用いただけます</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-1">•</span>
                  <span>残り{remainingDays}日間は無制限で利用可能です</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-1">•</span>
                  <span>解約後は月5回の利用制限に戻ります</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-1">•</span>
                  <span>作成済みのデータは引き続き閲覧できます</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-1">•</span>
                  <span className="font-semibold">日割り返金はございません</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 追加情報 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-800">
            💡 ヒント：解約後も再度ベーシックプランに加入することができます。
            解約を取り消したい場合は、サポート（ooya.tech2025@gmail.com）までご連絡ください。
          </p>
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                処理中...
              </span>
            ) : (
              '解約する'
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CancelSubscriptionModal;