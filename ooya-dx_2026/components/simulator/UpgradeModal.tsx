/**
 * アップグレードモーダルコンポーネント
 * 完全無料プラン移行により、新規有料プラン募集停止中のため非表示
 */

import React from 'react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 完全無料プラン移行により、アップグレードモーダルは表示しない
 */
export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  // 新規有料プラン募集停止中のため、常にnullを返す
  return null;
};

export default UpgradeModal;
