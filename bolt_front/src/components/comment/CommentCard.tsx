import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  MoreVertical,
  Edit3,
  Trash2,
  Reply
} from 'lucide-react';
import { ShareComment } from '../../types';

interface CommentCardProps {
  comment: ShareComment;
  currentUser: any;
  isReply?: boolean;
  onReaction: (commentId: string, reactionType: string) => void;
  onReply: (commentId: string) => void;
  onEdit: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  currentUser,
  isReply = false,
  onReaction,
  onReply,
  onEdit,
  onDelete
}) => {
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  
  const userReaction = comment.reactions?.find(r => r.user_id === currentUser?.id);
  const isLiked = userReaction?.reaction_type === 'like';
  const likeCount = comment.reactions?.filter(r => r.reaction_type === 'like').length || 0;

  const handleReactionClick = (reactionType: string) => {
    onReaction(comment.id, reactionType);
  };

  const handleReplyClick = () => {
    onReply(comment.id);
    setShowDropdown(null);
  };

  const handleEditClick = () => {
    onEdit(comment.id);
    setShowDropdown(null);
  };

  const handleDeleteClick = () => {
    onDelete(comment.id);
    setShowDropdown(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const getUserInitial = (user: any) => {
    return user?.full_name?.[0] || user?.email?.[0] || '?';
  };

  const getUserDisplayName = (user: any) => {
    return user?.full_name || user?.email || 'ユーザー';
  };

  const isOwner = comment.user_id === currentUser?.id;

  return (
    <div className={`${isReply ? 'ml-12' : ''} mb-4`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-semibold">
                {getUserInitial(comment.user)}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {getUserDisplayName(comment.user)}
                </span>
                {/* ユーザーバッジ（実装時に追加） */}
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(comment.created_at)}
              </span>
            </div>
          </div>
          
          {/* Options Menu */}
          {isOwner && (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(showDropdown === comment.id ? null : comment.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {showDropdown === comment.id && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={handleEditClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      編集
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      削除
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        {/* Tags */}
        {comment.tags && comment.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {comment.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleReactionClick('like')}
              className={`flex items-center space-x-1 text-sm ${
                isLiked 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount > 0 ? likeCount : ''}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={handleReplyClick}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-indigo-600"
              >
                <Reply className="h-4 w-4" />
                <span>返信</span>
              </button>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                currentUser={currentUser}
                isReply={true}
                onReaction={onReaction}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};