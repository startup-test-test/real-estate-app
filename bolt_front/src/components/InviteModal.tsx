import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import { useInvitationSender } from '../hooks/useInvitationSender';
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
  const [shareTitle, setShareTitle] = useState(`${propertyName}のシミュレーション結果`);
  const [shareDescription, setShareDescription] = useState('');
  
  const { 
    sendInvitationEmail, 
    isLoading, 
    error,
    clearError 
  } = useInvitationSender({ onShareCreated });


  const handleSendInvitation = async () => {
    clearError();
    
    const result = await sendInvitationEmail(
      propertyId,
      email,
      propertyName,
      shareTitle,
      shareDescription,
      share
    );
    
    if (result.errorMessage) {
      alert(result.errorMessage);
    }
    
    if (result.success || result.invitationUrl) {
      setEmail('');
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
                disabled={!email || isLoading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '送信中...' : '招待を送信'}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}