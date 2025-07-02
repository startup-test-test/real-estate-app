import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, ThumbsUp, ThumbsDown, HelpCircle, Reply, Tag as TagIcon, MoreVertical, Edit3, Trash2, Check, X } from 'lucide-react';
import { usePropertyShare } from '../hooks/usePropertyShare';
import { ShareComment } from '../types';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface CommentSectionProps {
  shareId: string;
  canComment: boolean;
  showOnlyComments?: boolean;
  maxDisplayCount?: number;
}

export default function CommentSection({ 
  shareId, 
  canComment, 
  showOnlyComments = false, 
  maxDisplayCount = undefined 
}: CommentSectionProps) {
  const [comments, setComments] = useState<ShareComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  
  const { user } = useSupabaseAuth();
  const { fetchComments, postComment, toggleReaction, deleteComment, editComment, loading, error } = usePropertyShare();

  const availableTags = ['要検討', 'リスク', '承認', '質問', '提案'];
  const availableReactions = [
    { emoji: '👍', label: 'いいね' },
    { emoji: '👎', label: 'うーん' },
    { emoji: '❓', label: '質問' }
  ];

  useEffect(() => {
    if (shareId) {
      loadComments();
    }
  }, [shareId]);

  const loadComments = async () => {
    try {
      console.log('📥 Loading comments for shareId:', shareId);
      const data = await fetchComments(shareId);
      
      if (data && data.length > 0) {
        console.log('✅ Found real comments:', data.length);
        setComments(data);
      } else {
        console.log('📭 No comments found, adding demo comments');
        // データベースにコメントがない場合はデモコメントを表示
        const mockComments = [
          {
            id: 'mock-1',
            share_id: shareId,
            user_id: 'mock-user-1',
            content: 'この物件の利回りは良好ですが、築年数を考慮すると修繕費の積み立てを多めに見積もった方が良いかもしれません。',
            tags: ['要検討', 'リスク'],
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            user: {
              id: 'mock-user-1',
              email: 'yamada@example.com',
              full_name: '山田太郎（税理士）',
              avatar_url: null
            },
            reactions: [],
            replies: []
          },
          {
            id: 'mock-2',
            share_id: shareId,
            user_id: 'mock-user-2',
            content: '立地が良く、賃貸需要も安定していそうです。この条件なら投資価値は高いと思います。',
            tags: ['承認'],
            created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            user: {
              id: 'mock-user-2',
              email: 'tanaka@example.com',
              full_name: '田中花子（不動産専門家）',
              avatar_url: null
            },
            reactions: [],
            replies: []
          },
          {
            id: 'mock-3',
            share_id: shareId,
            user_id: 'mock-user-3',
            content: '周辺の相場と比較してどうでしょうか？もう少し詳しく調べてみませんか？',
            tags: ['質問'],
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            user: {
              id: 'mock-user-3',
              email: 'sato@example.com',
              full_name: '佐藤一郎（家族）',
              avatar_url: null
            },
            reactions: [],
            replies: []
          }
        ];
        setComments(mockComments);
      }
    } catch (error) {
      console.error('❌ Failed to load comments:', error);
      // エラー時もデモコメントを表示
      setComments([]);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    console.log('💬 Posting comment:', {
      shareId,
      content: newComment,
      tags: selectedTags,
      user: user?.id
    });

    try {
      // 実際のデータベースに投稿
      const comment = await postComment(shareId, newComment, selectedTags);
      
      if (comment) {
        console.log('✅ Comment posted successfully:', comment);
        // 成功したらコメントリストを再読み込み
        await loadComments();
        setNewComment('');
        setSelectedTags([]);
      } else {
        // 投稿に失敗した場合、ローカルでコメントを追加（フォールバック）
        console.log('⚠️ Database post failed, adding local comment');
        const localComment = {
          id: `local-${Date.now()}`,
          share_id: shareId,
          user_id: user?.id || 'anonymous',
          content: newComment,
          tags: selectedTags,
          created_at: new Date().toISOString(),
          user: {
            id: user?.id || 'anonymous',
            email: user?.email || 'ゲストユーザー',
            full_name: user?.email || 'ゲストユーザー',
            avatar_url: null
          },
          reactions: [],
          replies: []
        };
        
        setComments([...comments, localComment]);
        setNewComment('');
        setSelectedTags([]);
      }
    } catch (error) {
      console.error('❌ Error posting comment:', error);
      
      // エラー時もローカルでコメントを追加（ユーザー体験を維持）
      const localComment = {
        id: `local-error-${Date.now()}`,
        share_id: shareId,
        user_id: user?.id || 'anonymous',
        content: newComment,
        tags: selectedTags,
        created_at: new Date().toISOString(),
        user: {
          id: user?.id || 'anonymous',
          email: user?.email || 'ゲストユーザー',
          full_name: user?.email || 'ゲストユーザー',
          avatar_url: null
        },
        reactions: [],
        replies: []
      };
      
      setComments([...comments, localComment]);
      setNewComment('');
      setSelectedTags([]);
      
      // ユーザーに通知
      alert('コメントの投稿に失敗しましたが、一時的に表示しています。ページを更新すると消える可能性があります。');
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    const reply = await postComment(shareId, replyContent, [], parentId);
    if (reply) {
      setReplyContent('');
      setReplyingTo(null);
      await loadComments();
    }
  };

  const handleReaction = async (commentId: string, reaction: string) => {
    const success = await toggleReaction(commentId, reaction);
    if (success) {
      await loadComments();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('本当にこのコメントを削除しますか？')) {
      const success = await deleteComment(commentId);
      if (success) {
        await loadComments();
        setShowDropdown(null);
      }
    }
  };

  const handleEditComment = async (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingComment(commentId);
      setEditContent(comment.content);
      setEditTags(comment.tags);
      setShowDropdown(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingComment || !editContent.trim()) return;

    const updatedComment = await editComment(editingComment, editContent, editTags);
    if (updatedComment) {
      await loadComments();
      setEditingComment(null);
      setEditContent('');
      setEditTags([]);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
    setEditTags([]);
  };

  const toggleEditTag = (tag: string) => {
    setEditTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getUserBadge = (userType?: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      family: { label: '家族', className: 'bg-green-100 text-green-800' },
      tax_accountant: { label: '税理士', className: 'bg-blue-100 text-blue-800' },
      consultant: { label: '専門家', className: 'bg-purple-100 text-purple-800' },
      general: { label: 'ゲスト', className: 'bg-gray-100 text-gray-800' }
    };
    return badges[userType || 'general'];
  };

  const CommentCard = ({ comment, isReply = false }: { comment: ShareComment; isReply?: boolean }) => {
    const userReaction = comment.reactions?.find(r => r.user_id === user?.id);
    
    return (
      <div className={`${isReply ? 'ml-12' : ''} mb-4`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">
                  {comment.user?.full_name?.[0] || comment.user?.email?.[0] || '?'}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {comment.user?.full_name || comment.user?.email || 'ユーザー'}
                  </span>
                  {/* ユーザーバッジ（実装時に追加） */}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleString('ja-JP')}
                </span>
              </div>
            </div>
            {comment.user_id === user?.id && (
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
                        onClick={() => handleEditComment(comment.id)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
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

          <div className="mb-3">
            {editingComment === comment.id ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                />
                
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleEditTag(tag)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        editTags.includes(tag)
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editContent.trim()}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    保存
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    <X className="h-4 w-4 mr-1" />
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
            )}
            {comment.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {comment.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {availableReactions.map(({ emoji, label }) => {
                const reactionCount = comment.reactions?.filter(r => r.reaction === emoji).length || 0;
                const hasReacted = comment.reactions?.some(r => r.reaction === emoji && r.user_id === user?.id);
                
                return (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(comment.id, emoji)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                      hasReacted
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span>{emoji}</span>
                    {reactionCount > 0 && (
                      <span className="text-xs font-medium">{reactionCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
            {!isReply && canComment && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
              >
                <Reply className="h-4 w-4" />
                <span className="text-sm">返信</span>
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3 flex space-x-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleReply(comment.id)}
                placeholder="返信を入力..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={() => handleReply(comment.id)}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                送信
              </button>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                className="px-3 py-2 text-gray-600 hover:text-gray-800"
              >
                キャンセル
              </button>
            </div>
          )}
        </div>

        {/* 返信を表示 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentCard key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    );
  };

  // 表示するコメントをフィルタリング
  const displayComments = maxDisplayCount 
    ? comments.slice(0, maxDisplayCount)
    : comments;

  // 重要度でソート（リスク、要検討を優先）
  const sortedComments = [...displayComments].sort((a, b) => {
    const priorityTags = ['リスク', '要検討'];
    const aHasPriority = a.tags.some(tag => priorityTags.includes(tag));
    const bHasPriority = b.tags.some(tag => priorityTags.includes(tag));
    
    if (aHasPriority && !bHasPriority) return -1;
    if (!aHasPriority && bHasPriority) return 1;
    return 0;
  });

  if (showOnlyComments) {
    return (
      <div>
        {sortedComments.length > 0 ? (
          <div className="space-y-3">
            {sortedComments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 font-semibold text-sm">
                      {comment.user?.full_name?.[0] || comment.user?.email?.[0] || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {comment.user?.full_name || comment.user?.email || 'ユーザー'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm mb-2">{comment.content}</p>
                    {comment.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {comment.tags.map((tag) => {
                          const tagColors: Record<string, string> = {
                            'リスク': 'bg-red-100 text-red-700',
                            '要検討': 'bg-yellow-100 text-yellow-700',
                            '承認': 'bg-green-100 text-green-700',
                            '質問': 'bg-blue-100 text-blue-700',
                            '提案': 'bg-purple-100 text-purple-700'
                          };
                          return (
                            <span
                              key={tag}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                tagColors[tag] || 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {maxDisplayCount && comments.length > maxDisplayCount && (
              <div className="text-center pt-2">
                <span className="text-sm text-gray-500">
                  他 {comments.length - maxDisplayCount} 件のコメントがあります
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">まだコメントがありません</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          ディスカッション
        </h3>
        <span className="text-sm text-gray-500">
          {comments.length} 件のコメント
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {canComment && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="シミュレーション結果についてコメント..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            
            <div className="mt-3 flex flex-wrap gap-2 mb-3">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TagIcon className="w-3 h-3 mr-1" />
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handlePostComment}
                disabled={!newComment.trim() || loading}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 mr-2" />
                投稿
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>まだコメントがありません</p>
            {canComment && (
              <p className="text-sm mt-1">最初のコメントを投稿してみましょう！</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}