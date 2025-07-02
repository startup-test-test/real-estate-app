import React, { useState } from 'react';
import { MessageCircle, Send, Trash2, AlertCircle, Database } from 'lucide-react';
import { useTestComments } from '../hooks/useTestComments';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface TestCommentSectionProps {
  title?: string;
}

const TestCommentSection: React.FC<TestCommentSectionProps> = ({ 
  title = 'テストコメント' 
}) => {
  const { user } = useSupabaseAuth();
  const { comments, loading, error, postComment, deleteComment } = useTestComments();
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setPosting(true);
    const result = await postComment(newComment);
    
    if (result) {
      setNewComment('');
    }
    setPosting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('このコメントを削除しますか？')) {
      await deleteComment(commentId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center mb-4">
        <Database className="h-5 w-5 mr-2 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
          LocalStorage
        </span>
        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {comments.length}件
        </span>
      </div>

      {/* 説明 */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 text-sm">
          🧪 この機能はローカルストレージを使用してコメントを保存します。
          Supabaseの接続問題を回避したテスト用機能です。
        </p>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* コメント投稿フォーム */}
      {user ? (
        <form onSubmit={handlePostComment} className="mb-6">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="テストコメントを入力してください..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={3}
                disabled={posting}
              />
            </div>
            <button
              type="submit"
              disabled={!newComment.trim() || posting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {posting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">コメントを投稿するには<a href="/login" className="text-green-600 hover:underline">ログイン</a>してください</p>
        </div>
      )}

      {/* ローディング表示 */}
      {loading && comments.length === 0 && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto" />
          <p className="text-gray-500 mt-2">コメントを読み込み中...</p>
        </div>
      )}

      {/* コメント一覧 */}
      <div className="space-y-4">
        {comments.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>まだコメントがありません</p>
            <p className="text-sm">最初のコメントを投稿してみましょう</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border border-gray-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">
                      {comment.user_email}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                </div>
                
                {/* 削除ボタン（自分のコメントのみ） */}
                {user && user.email === comment.user_email && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* デバッグ情報（開発環境のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600">
          <p><strong>Debug Info:</strong></p>
          <p>Storage: LocalStorage</p>
          <p>User: {user?.email || 'Not logged in'}</p>
          <p>Comments: {comments.length}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default TestCommentSection;