/**
 * 統合コメントセクション（全機能統合版）
 */
import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, AlertCircle, RefreshCw } from 'lucide-react';
import CommentItem, { CommentData } from './CommentItem';
import CommentForm from './CommentForm';
import { formatCommentCount, getErrorMessage, sortComments } from './CommentUtils';

export type CommentSectionMode = 'full' | 'simple' | 'readonly' | 'test';
export type StorageType = 'supabase' | 'localStorage';
export type SortType = 'newest' | 'oldest' | 'priority';

interface CommentSectionConfig {
  mode: CommentSectionMode;
  storage: StorageType;
  features: {
    tags?: boolean;
    reactions?: boolean;
    replies?: boolean;
    edit?: boolean;
    delete?: boolean;
    realtime?: boolean;
  };
  display: {
    maxCount?: number;
    autoRefresh?: number; // seconds
    showHeader?: boolean;
    showStats?: boolean;
  };
}

interface UnifiedCommentSectionProps {
  config: CommentSectionConfig;
  // データソース識別
  shareId?: string;
  pageId?: string;
  shareToken?: string;
  // カスタムフック
  useCommentsHook: () => {
    comments: CommentData[];
    loading: boolean;
    error: string | null;
    postComment: (content: string, tags?: string[]) => Promise<void>;
    editComment?: (id: string, content: string) => Promise<void>;
    deleteComment?: (id: string) => Promise<void>;
    addReaction?: (commentId: string, reaction: string) => Promise<void>;
    refreshComments?: () => Promise<void>;
  };
  // UI制御
  currentUserId?: string;
  title?: string;
  className?: string;
  onCommentCountChange?: (count: number) => void;
}

const UnifiedCommentSection: React.FC<UnifiedCommentSectionProps> = ({
  config,
  useCommentsHook,
  currentUserId,
  title = 'コメント',
  className = '',
  onCommentCountChange
}) => {
  const {
    comments,
    loading,
    error,
    postComment,
    editComment,
    deleteComment,
    addReaction,
    refreshComments
  } = useCommentsHook();

  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [showForm, setShowForm] = useState(config.mode !== 'readonly');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(config.display.maxCount || 10);

  // 自動更新
  useEffect(() => {
    if (config.features.realtime && config.display.autoRefresh && refreshComments) {
      const interval = setInterval(refreshComments, config.display.autoRefresh * 1000);
      return () => clearInterval(interval);
    }
  }, [config.features.realtime, config.display.autoRefresh, refreshComments]);

  // コメント数変更通知
  useEffect(() => {
    onCommentCountChange?.(comments.length);
  }, [comments.length, onCommentCountChange]);

  const sortedComments = sortComments(comments, sortBy);
  const displayedComments = sortedComments.slice(0, displayCount);
  const hasMoreComments = sortedComments.length > displayCount;

  const handlePostComment = async (content: string, tags?: string[]) => {
    await postComment(content, tags);
    setReplyingTo(null);
  };

  const handleEditComment = async (commentId: string, content: string) => {
    if (editComment) {
      await editComment(commentId, content);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (deleteComment) {
      await deleteComment(commentId);
    }
  };

  const handleReaction = async (commentId: string, reaction: string) => {
    if (addReaction) {
      await addReaction(commentId, reaction);
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setShowForm(true);
  };

  const getHeaderIcon = () => {
    switch (config.mode) {
      case 'readonly':
        return <Users className="h-5 w-5 text-blue-600" />;
      case 'test':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <MessageCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getModeLabel = () => {
    switch (config.mode) {
      case 'readonly':
        return '（閲覧のみ）';
      case 'test':
        return '（テストモード）';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4" />
            <p className="text-gray-600">コメントを読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* ヘッダー */}
      {config.display.showHeader && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {getHeaderIcon()}
            <h3 className="text-lg font-semibold text-gray-800">
              {title} {getModeLabel()}
            </h3>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
              {formatCommentCount(comments.length)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* ソート選択 */}
            {comments.length > 1 && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="newest">新しい順</option>
                <option value="oldest">古い順</option>
                {config.features.tags && <option value="priority">重要度順</option>}
              </select>
            )}

            {/* 手動更新ボタン */}
            {refreshComments && (
              <button
                onClick={refreshComments}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="更新"
              >
                <RefreshCw size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-800">{getErrorMessage(error)}</span>
          </div>
        </div>
      )}

      {/* コメント投稿フォーム */}
      {showForm && config.mode !== 'readonly' && (
        <div className="p-4 border-b border-gray-200">
          <CommentForm
            onSubmit={handlePostComment}
            onCancel={replyingTo ? () => setReplyingTo(null) : undefined}
            enableTags={config.features.tags}
            placeholder={replyingTo ? `返信を入力...` : `${title}を入力...`}
            replyToUser={replyingTo ? 
              comments.find(c => c.id === replyingTo)?.user?.email?.split('@')[0] : 
              undefined
            }
          />
        </div>
      )}

      {/* コメントリスト */}
      <div className="p-4 space-y-4">
        {displayedComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {config.mode === 'readonly' ? 'まだコメントがありません' : '最初のコメントを投稿しましょう'}
            </p>
          </div>
        ) : (
          <>
            {displayedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                canEdit={config.features.edit}
                canDelete={config.features.delete}
                canReply={config.features.replies}
                canReact={config.features.reactions}
                showActions={config.mode !== 'readonly'}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onReply={handleReply}
                onReact={handleReaction}
              />
            ))}

            {/* もっと見るボタン */}
            {hasMoreComments && (
              <div className="text-center">
                <button
                  onClick={() => setDisplayCount(prev => prev + 10)}
                  className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  さらに{Math.min(10, sortedComments.length - displayCount)}件表示
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 統計情報 */}
      {config.display.showStats && comments.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span>総コメント数: {comments.length}件</span>
            {config.features.realtime && (
              <span>自動更新: {config.display.autoRefresh}秒間隔</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedCommentSection;