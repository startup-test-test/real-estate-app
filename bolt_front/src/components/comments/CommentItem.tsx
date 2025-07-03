/**
 * 個別コメント表示コンポーネント（共通化）
 */
import React, { useState } from 'react';
import { Trash2, Edit, Reply, MoreHorizontal } from 'lucide-react';
import { formatCommentDate, getUserDisplayName, getTagColor, reactionEmojis } from './CommentUtils';

export interface CommentData {
  id: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  tags?: string[];
  reactions?: { reaction: string; count: number; users: string[] }[];
  replies?: CommentData[];
  is_edited?: boolean;
  edited_at?: string;
}

interface CommentItemProps {
  comment: CommentData;
  currentUserId?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canReply?: boolean;
  canReact?: boolean;
  showActions?: boolean;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
  onReact?: (commentId: string, reaction: string) => void;
  className?: string;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  canEdit = false,
  canDelete = false,
  canReply = false,
  canReact = false,
  showActions = true,
  onEdit,
  onDelete,
  onReply,
  onReact,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReactions, setShowReactions] = useState(false);

  const isOwner = currentUserId === comment.user?.id;
  const userDisplayName = getUserDisplayName(comment.user);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('このコメントを削除しますか？')) {
      onDelete?.(comment.id);
    }
  };

  const handleReaction = (reaction: string) => {
    onReact?.(comment.id, reaction);
    setShowReactions(false);
  };

  return (
    <div className={`border border-gray-200 rounded-lg p-4 bg-white ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {/* アバター */}
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {userDisplayName.charAt(0).toUpperCase()}
          </div>
          
          {/* ユーザー情報 */}
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{userDisplayName}</span>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>{formatCommentDate(comment.created_at)}</span>
              {comment.is_edited && (
                <span className="text-gray-400">• 編集済み</span>
              )}
            </div>
          </div>
        </div>

        {/* アクションメニュー */}
        {showActions && (isOwner || canDelete) && (
          <div className="flex items-center space-x-1">
            {isOwner && canEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="編集"
              >
                <Edit size={16} />
              </button>
            )}
            {(isOwner || canDelete) && (
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                title="削除"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* タグ */}
      {comment.tags && comment.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {comment.tags.map((tag, index) => (
            <span
              key={index}
              className={`text-xs px-2 py-1 rounded-full ${getTagColor(tag)}`}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* コンテンツ */}
      <div className="mb-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="コメントを編集..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                キャンセル
              </button>
              <button
                onClick={handleEdit}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </p>
        )}
      </div>

      {/* リアクション表示 */}
      {comment.reactions && comment.reactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {comment.reactions.map((reaction, index) => (
            <button
              key={index}
              onClick={() => canReact && handleReaction(reaction.reaction)}
              className="flex items-center space-x-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition-colors"
              disabled={!canReact}
            >
              <span>{reaction.reaction}</span>
              <span className="text-gray-600">{reaction.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* アクションボタン */}
      {showActions && !isEditing && (
        <div className="flex items-center space-x-4 text-sm">
          {canReply && (
            <button
              onClick={() => onReply?.(comment.id)}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Reply size={14} />
              <span>返信</span>
            </button>
          )}
          
          {canReact && (
            <div className="relative">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="flex items-center space-x-1 text-gray-500 hover:text-yellow-600 transition-colors"
              >
                <span>😊</span>
                <span>リアクション</span>
              </button>
              
              {showReactions && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="flex space-x-1">
                    {reactionEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="p-1 hover:bg-gray-100 rounded text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 返信（ネストしたコメント） */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 ml-4 border-l-2 border-gray-200 pl-4 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              canEdit={canEdit}
              canDelete={canDelete}
              canReply={false} // 返信の返信は無効化
              canReact={canReact}
              showActions={showActions}
              onEdit={onEdit}
              onDelete={onDelete}
              onReact={onReact}
              className="bg-gray-50"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;