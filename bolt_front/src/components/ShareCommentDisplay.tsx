import React, { useState, useEffect } from 'react';
import { MessageCircle, AlertCircle, RefreshCw, Users } from 'lucide-react';
import { useShareComments } from '../hooks/useShareComments';
import { ShareComment } from '../types';

interface ShareCommentDisplayProps {
  shareToken: string;
  title?: string;
  showInviteButton?: boolean;
  onInviteClick?: () => void;
}

const ShareCommentDisplay: React.FC<ShareCommentDisplayProps> = ({ 
  shareToken, 
  title = '招待者からのコメント',
  showInviteButton = false,
  onInviteClick
}) => {
  const { fetchComments, loading, error } = useShareComments();
  const [comments, setComments] = useState<ShareComment[]>([]);
  
  const loadComments = async () => {
    try {
      const data = await fetchComments(shareToken);
      setComments(data || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
      setComments([]);
    }
  };
  
  useEffect(() => {
    if (shareToken) {
      loadComments();
    }
  }, [shareToken]);
  
  const refetch = () => {
    loadComments();
  };
  
  // デバッグ用
  console.log('🔍 ShareCommentDisplay rendering with:', {
    shareToken,
    commentsCount: comments?.length || 0,
    loading,
    error
  });

  // 30秒ごとに自動更新
  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing comments...');
      refetch();
    }, 30000); // 30秒

    return () => clearInterval(interval);
  }, [refetch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {comments?.length || 0}件
          </span>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          title="コメントを更新"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          更新
        </button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* ローディング表示 */}
      {loading && (!comments || comments.length === 0) && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto" />
          <p className="text-gray-500 mt-2">コメントを読み込み中...</p>
        </div>
      )}

      {/* コメント一覧 */}
      <div className="space-y-4">
        {(!comments || comments.length === 0) && !loading ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>招待者からのコメントはまだありません</p>
            {showInviteButton && onInviteClick && (
              <button
                onClick={onInviteClick}
                className="mt-4 flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 mx-auto shadow-md"
              >
                <Users size={20} />
                <span>メールで招待・共有</span>
              </button>
            )}
          </div>
        ) : (
          comments?.map((comment) => (
            <div key={comment.id} className="border border-gray-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">
                      {comment.user?.email || comment.user?.full_name || 'ユーザー'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                      招待者
                    </span>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* デバッグ情報（開発環境のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600">
          <p><strong>Debug Info:</strong></p>
          <p>Share Token: {shareToken}</p>
          <p>Comments: {comments.length}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Error: {error || 'None'}</p>
        </div>
      )}
    </div>
  );
};

export default ShareCommentDisplay;