import React from 'react';
import { CommentCard } from './CommentCard';
import { ShareComment } from '../../types';

interface CommentListProps {
  comments: ShareComment[];
  currentUser: any;
  onReaction: (commentId: string, reactionType: string) => void;
  onReply: (commentId: string) => void;
  onEdit: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  emptyMessage?: string;
  showOnlyComments?: boolean;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  currentUser,
  onReaction,
  onReply,
  onEdit,
  onDelete,
  emptyMessage = "まだコメントがありません。最初のコメントを投稿してみましょう！",
  showOnlyComments = false
}) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-5.041-1.759L3 21l2.758-5.041A8.013 8.013 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
            />
          </svg>
          <p className="text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          currentUser={currentUser}
          onReaction={onReaction}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};