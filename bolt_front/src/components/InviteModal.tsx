import React, { useState, useEffect } from 'react';
import { X, Mail, Link, QrCode, Users, Info } from 'lucide-react';
import { usePropertyShare } from '../hooks/usePropertyShare';
import { PropertyShare } from '../types';
import { supabase } from '../lib/supabase';

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
  const [activeTab, setActiveTab] = useState<'email' | 'link' | 'members'>('email');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'commenter' | 'editor'>('commenter');
  const [userType, setUserType] = useState<'family' | 'tax_accountant' | 'consultant' | 'general'>('general');
  const [message, setMessage] = useState('');
  const [shareTitle, setShareTitle] = useState(`${propertyName}のシミュレーション結果`);
  const [shareDescription, setShareDescription] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);

  const { createShare, sendInvitation, fetchShare, loading, error } = usePropertyShare();

  // 招待リストを取得する関数
  const loadInvitations = async (shareId: string) => {
    try {
      const { data, error } = await supabase
        .from('share_invitations')
        .select('*')
        .eq('share_id', shareId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('招待リスト取得エラー:', error);
        return;
      }

      console.log('取得した招待リスト:', data);
      setInvitations(data || []);
    } catch (err) {
      console.error('招待リスト読み込みエラー:', err);
    }
  };

  // shareが設定されたら招待リストを読み込む
  useEffect(() => {
    if (share) {
      loadInvitations(share.id);
    }
  }, [share]);

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
    // 簡易テスト用: データベース接続前でもUIテストが可能
    if (!email) {
      alert('メールアドレスを入力してください');
      return;
    }

    try {
      const currentShare = await handleCreateShare();
      if (!currentShare) {
        // データベース未設定の場合のフォールバック
        alert(`招待テスト:\n${userTypeLabels[userType]}として${email}に招待を送信しました！\n権限: ${roleLabels[role]}\n\n※実際の送信にはデータベース設定が必要です`);
        setEmail('');
        setMessage('');
        return;
      }

      const invitation = await sendInvitation(
        currentShare.id,
        email,
        role,
        userType,
        message
      );

      if (invitation) {
        setEmail('');
        setMessage('');
        alert('招待を送信しました！');
        
        // 共有リンク用にもshareを設定
        if (currentShare && !share) {
          onShareCreated?.(currentShare);
        }
        
        // 招待リストを再読み込み
        if (currentShare) {
          await loadInvitations(currentShare.id);
        }
      }
    } catch (err) {
      console.error('Invitation error:', err);
      alert(`招待テスト:\n${userTypeLabels[userType]}として${email}に招待を送信しました！\n権限: ${roleLabels[role]}\n\n※実際の送信にはデータベース設定が必要です`);
      setEmail('');
      setMessage('');
    }
  };

  const shareUrl = share 
    ? `${window.location.origin}/collaboration/${share.share_token}`
    : '';

  const handleCopyLink = () => {
    console.log('Generated share URL:', shareUrl);
    console.log('Share object:', share);
    navigator.clipboard.writeText(shareUrl);
    alert('リンクをコピーしました！');
  };

  const roleLabels = {
    viewer: '閲覧のみ',
    commenter: 'コメント可能',
    editor: '編集可能'
  };

  const userTypeLabels = {
    family: '家族',
    tax_accountant: '税理士',
    consultant: '不動産専門家',
    general: 'その他'
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            シミュレーション結果を共有
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

          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('email')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'email'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Mail className="inline h-4 w-4 mr-2" />
                メールで招待
              </button>
              <button
                onClick={() => setActiveTab('link')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'link'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Link className="inline h-4 w-4 mr-2" />
                リンク共有
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'members'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="inline h-4 w-4 mr-2" />
                メンバー管理
              </button>
            </nav>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {activeTab === 'email' && (
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    役割
                  </label>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.entries(userTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    権限
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
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
                    <p className="font-medium mb-1">権限について</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>閲覧のみ</strong>: シミュレーション結果の閲覧</li>
                      <li><strong>コメント可能</strong>: 閲覧 + コメント投稿</li>
                      <li><strong>編集可能</strong>: 閲覧 + コメント + 値の編集</li>
                    </ul>
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
          )}

          {activeTab === 'link' && (
            <div className="space-y-4">
              {share ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      共有リンク
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        コピー
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowQR(!showQR)}
                      className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
                    >
                      <QrCode className="h-5 w-5" />
                      <span>QRコードを{showQR ? '非表示' : '表示'}</span>
                    </button>
                  </div>

                  {showQR && (
                    <div className="flex justify-center p-4 bg-gray-50 rounded-md">
                      <div className="bg-white p-4 rounded-md shadow">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`}
                          alt="共有QRコード"
                          className="w-48 h-48"
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    共有リンクを生成するには、まず共有設定を保存してください。
                  </p>
                  <button
                    onClick={handleCreateShare}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? '作成中...' : '共有リンクを生成'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              {invitations.length > 0 ? (
                <div className="space-y-2">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">{inv.email}</p>
                        <p className="text-sm text-gray-500">
                          {userTypeLabels[inv.user_type as keyof typeof userTypeLabels]} • 
                          {roleLabels[inv.role as keyof typeof roleLabels]} • 
                          {inv.status === 'pending' ? '招待中' : '承認済み'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  まだメンバーを招待していません
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}