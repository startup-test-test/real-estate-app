/**
 * アップグレードモーダルコンポーネント
 * 有料プラン募集停止中の案内を表示
 */

import React from 'react';
import { X, AlertCircle, Clock } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 有料プラン募集停止中の案内モーダル
 */
export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              有料プランについて
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="p-6">
          {/* お知らせアイコン */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* メッセージ */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              有料プランの新規募集を停止しております
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              現在、サービス品質向上のため、有料プラン（ベーシックプラン）の新規募集を一時的に停止しております。
            </p>
          </div>

          {/* 詳細情報 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">現在のサービス状況</p>
                <ul className="space-y-1.5">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>収益シミュレーター機能は引き続き無料でご利用いただけます</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>AI市場分析・公示地価検索は一時メンテナンス中です</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>既にご契約中のお客様は引き続きご利用いただけます</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 今後の予定 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">今後の予定：</span><br />
              サービス改善後、有料プランの提供再開を予定しております。再開時期については、サイト上でお知らせいたします。
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            了解しました
          </button>

          <p className="text-center text-xs text-gray-500 mt-3">
            ご不明な点がございましたら、お問い合わせください
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
