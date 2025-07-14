import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import { usePropertyShare } from '../hooks/usePropertyShare';
import { PropertyShare } from '../types';

interface InviteModalProps {
  propertyId: string;
  propertyName: string;
  share?: PropertyShare;
  onClose: () => void;
  onShareCreated?: (share: PropertyShare) => void;
}

export default function InviteModal({ 
  propertyId, 
  propertyName, 
  share,
  onClose,
  onShareCreated 
}: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [shareTitle, setShareTitle] = useState(`${propertyName}のシミュレーション結果`);
  const [shareDescription, setShareDescription] = useState('');
  const { createShare, sendInvitation, loading, error } = usePropertyShare();

  const handleCreateShare = async () => {
    if (!share) {
      const newShare = await createShare(propertyId, shareTitle, shareDescription);
      if (newShare) {
        onShareCreated?.(newShare);
        return newShare;
      }
    }
    return share;
  };

  const handleSendInvitation = async () => {
    if (!email) {
      alert('メールアドレスを入力してください');
      return;
    }

    let currentShare;
    try {
      // 1. 共有を作成または取得
      currentShare = await handleCreateShare();
      if (!currentShare) {
        alert(`共有の作成に失敗しました。データベース設定を確認してください。`);
        return;
      }

      console.log('🚀 送信する招待情報:', {
        shareId: currentShare.id,
        email,
        propertyName,
        shareToken: currentShare.share_token
      });

      // 2. 招待を作成してメール送信
      console.log('📧 sendInvitation関数を呼び出し中...');
      const invitation = await sendInvitation(
        currentShare.id,
        email,
        'commenter', // 全員コメント可能に固定
        'general',   // ユーザータイプは汎用に固定
        message
      );

      console.log('📊 sendInvitation結果:', invitation);

      if (invitation) {
        // 成功時の処理 - 招待リンクをクリップボードにコピー
        const invitationUrl = `${window.location.origin}/collaboration/${invitation.invitation_token}`;
        
        try {
          await navigator.clipboard.writeText(invitationUrl);
          alert(`🎉 招待リンクをクリップボードにコピーしました！\n\n${email} に以下をお送りください：\n\n「不動産投資シミュレーションの検討にご招待します。\nこちらのリンクからご確認ください：\n${invitationUrl}\n\n※リンクの有効期限は7日間です。」`);
        } catch (err) {
          alert(`🎉 招待リンクを生成しました！\n\n以下のリンクを ${email} にお送りください：\n\n${invitationUrl}\n\n※リンクの有効期限は7日間です。`);
        }
        
        setEmail('');
        setMessage('');
        
        // 共有情報を親コンポーネントに渡す
        if (!share) {
          onShareCreated?.(currentShare);
        }
      } else {
        // メール送信失敗時のフォールバック
        const invitationUrl = `${window.location.origin}/simple-collaboration/${currentShare.share_token}`;
        alert(`⚠️ 招待処理でエラーが発生しました。\n\n代替として招待リンクを生成しました：\n${invitationUrl}\n\nこのリンクを ${email} に手動で送信してください。`);
        setEmail('');
        setMessage('');
      }

    } catch (err) {
      console.error('Invitation error:', err);
      
      // エラー時のフォールバック処理
      if (currentShare) {
        const invitationUrl = `${window.location.origin}/simple-collaboration/${currentShare.share_token}`;
        alert(`❌ 招待処理でエラーが発生しました。\n\n代替手段として招待リンクを生成しました:\n${invitationUrl}\n\nこのリンクを ${email} に手動で送信してください。`);
        setEmail('');
        setMessage('');
      } else {
        alert(`❌ 招待処理でエラーが発生しました。しばらく時間をおいて再度お試しください。`);
      }
    }
  };




  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            メールで招待
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {!share && (
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  共有タイトル
                </label>
                <input
                  type="text"
                  value={shareTitle}
                  onChange={(e) => setShareTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明（任意）
                </label>
                <textarea
                  value={shareDescription}
                  onChange={(e) => setShareDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="共有する際の説明やメモを入力..."
                />
              </div>
            </div>
          )}


          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="example@email.com"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メッセージ（任意）
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="招待メッセージを入力..."
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">招待機能について</p>
                    <p>招待された方はシミュレーション結果を閲覧し、コメントやアドバイスを投稿できます。</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSendInvitation}
                disabled={!email || loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '送信中...' : '招待を送信'}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}