import React, { useState } from 'react';
import { Share2, Check, Copy, X } from 'lucide-react';
import { copyToClipboard } from '../utils/shareUtils';
import { usePropertyShare } from '../hooks/usePropertyShare';

interface ShareButtonProps {
  propertyId: string;
  simulationData: any;
  propertyData: any;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  onShareCreated?: (share: any) => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  propertyId,
  simulationData,
  propertyData,
  className = '',
  size = 'medium',
  onShareCreated
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { fetchOrCreateShareByPropertyId } = usePropertyShare();

  const handleShare = async () => {
    setIsSharing(true);
    setError(null);

    try {
      // 新しいproperty_sharesシステムを使用
      const propertyName = propertyData?.propertyName || simulationData?.propertyName || '物件シミュレーション';
      const share = await fetchOrCreateShareByPropertyId(propertyId, propertyName);
      
      if (share) {
        const baseUrl = window.location.origin;
        const shareUrl = `${baseUrl}/simple-collaboration/${share.share_token}`;
        setShareUrl(shareUrl);
        setShowModal(true);
        
        // 共有作成を親コンポーネントに通知
        if (onShareCreated) {
          onShareCreated(share);
        }
      } else {
        throw new Error('共有の作成に失敗しました');
      }
    } catch (err) {
      console.error('Share creation error:', err);
      setError(err instanceof Error ? err.message : '共有の作成に失敗しました');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setShareUrl(null);
    setCopied(false);
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  };

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${sizeClasses[size]} ${className}`}
      >
        <Share2 className={size === 'small' ? 'h-4 w-4' : 'h-5 w-5'} />
        {isSharing ? '共有中...' : '共有'}
      </button>

      {/* エラー表示 */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* 共有モーダル */}
      {showModal && shareUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">共有リンクが作成されました</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  このリンクは7日間有効です。URLを知っている人なら誰でも閲覧できます。
                </p>
                
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">コピー済み</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>コピー</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">共有方法：</p>
                <div className="space-y-2">
                  <a
                    href={`https://line.me/R/msg/text/?${encodeURIComponent('不動産投資シミュレーション結果を共有します：\n' + shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    LINEで送る
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent('不動産投資シミュレーション結果')}&body=${encodeURIComponent('シミュレーション結果を共有します：\n\n' + shareUrl)}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    メールで送る
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};