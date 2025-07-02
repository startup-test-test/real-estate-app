import { useState, useEffect } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';

interface TestComment {
  id: string;
  user_email: string;
  content: string;
  created_at: string;
}

export function useTestComments() {
  const { user } = useSupabaseAuth();
  const [comments, setComments] = useState<TestComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ローカルストレージからコメントを取得
  const loadComments = () => {
    try {
      const stored = localStorage.getItem('test-comments');
      if (stored) {
        const parsedComments = JSON.parse(stored);
        setComments(parsedComments);
        console.log('✅ Loaded comments from localStorage:', parsedComments.length);
      }
    } catch (err) {
      console.error('❌ Error loading comments:', err);
    }
  };

  // ローカルストレージにコメントを保存
  const saveComments = (newComments: TestComment[]) => {
    try {
      localStorage.setItem('test-comments', JSON.stringify(newComments));
      console.log('✅ Saved comments to localStorage:', newComments.length);
    } catch (err) {
      console.error('❌ Error saving comments:', err);
    }
  };

  // コメントを投稿
  const postComment = async (content: string): Promise<TestComment | null> => {
    if (!user) {
      setError('ログインが必要です');
      return null;
    }

    if (!content.trim()) {
      setError('コメント内容を入力してください');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const newComment: TestComment = {
        id: crypto.randomUUID(),
        user_email: user.email || 'unknown@example.com',
        content: content.trim(),
        created_at: new Date().toISOString()
      };

      console.log('📝 Posting test comment:', newComment);

      const updatedComments = [...comments, newComment];
      setComments(updatedComments);
      saveComments(updatedComments);

      console.log('✅ Test comment posted successfully');
      return newComment;
    } catch (err: any) {
      console.error('❌ Error posting test comment:', err);
      setError(err.message || 'コメントの投稿に失敗しました');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // コメントを削除
  const deleteComment = async (commentId: string): Promise<boolean> => {
    if (!user) {
      setError('ログインが必要です');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const updatedComments = comments.filter(comment => 
        comment.id !== commentId || comment.user_email === user.email
      );
      
      setComments(updatedComments);
      saveComments(updatedComments);

      console.log('✅ Test comment deleted successfully');
      return true;
    } catch (err: any) {
      console.error('❌ Error deleting test comment:', err);
      setError(err.message || 'コメントの削除に失敗しました');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 初回ロード
  useEffect(() => {
    loadComments();
  }, []);

  return {
    comments,
    loading,
    error,
    postComment,
    deleteComment,
    refetch: loadComments
  };
}