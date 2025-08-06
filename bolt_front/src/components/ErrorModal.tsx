import React from 'react';
import { AlertCircle, X, HelpCircle, RefreshCw } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorCode?: string;
  message: string;
  solution?: string;
  details?: string[];
  onRetry?: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  errorCode,
  message,
  solution,
  details,
  onRetry
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="bg-red-50 border-b border-red-200 p-4 rounded-t-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">
                  エラーが発生しました
                </h3>
                {errorCode && (
                  <p className="text-sm text-red-700 mt-1">
                    エラーコード: {errorCode}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 本文 */}
        <div className="p-6">
          {/* エラーメッセージ */}
          <div className="mb-4">
            <p className="text-gray-800">{message}</p>
          </div>

          {/* 詳細情報 */}
          {details && details.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">詳細:</h4>
              <ul className="list-disc list-inside space-y-1">
                {details.map((detail, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 対処法 */}
          {solution && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <HelpCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    対処法
                  </h4>
                  <p className="text-sm text-blue-800">{solution}</p>
                </div>
              </div>
            </div>
          )}

          {/* サポート情報 */}
          {errorCode && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
              <p>
                このエラーが解決しない場合は、エラーコード「{errorCode}」を
                サポートまでお知らせください。
              </p>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              再試行
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 
                     transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;