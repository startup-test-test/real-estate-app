/**
 * コメント機能共通ユーティリティ
 */

// 日付フォーマット（重複コードを統合）
export const formatCommentDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'たった今';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分前`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}時間前`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    if (days < 7) {
      return `${days}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};

// コメント数の表示フォーマット
export const formatCommentCount = (count: number): string => {
  if (count === 0) return 'コメントなし';
  if (count === 1) return '1件';
  return `${count}件`;
};

// ユーザー表示名の取得
export const getUserDisplayName = (user?: { email: string; full_name?: string }): string => {
  if (!user) return '匿名ユーザー';
  return user.full_name || user.email.split('@')[0] || 'ユーザー';
};

// エラーメッセージの標準化
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return '予期しないエラーが発生しました';
};

// コメント投稿の入力検証
export const validateCommentContent = (content: string): { isValid: boolean; error?: string } => {
  const trimmed = content.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'コメントを入力してください' };
  }
  
  if (trimmed.length > 1000) {
    return { isValid: false, error: 'コメントは1000文字以内で入力してください' };
  }
  
  return { isValid: true };
};

// タグの色分け
export const getTagColor = (tag: string): string => {
  const tagColors: Record<string, string> = {
    '質問': 'bg-blue-100 text-blue-800',
    '提案': 'bg-green-100 text-green-800',
    '懸念': 'bg-yellow-100 text-yellow-800',
    '確認': 'bg-purple-100 text-purple-800',
    '重要': 'bg-red-100 text-red-800'
  };
  
  return tagColors[tag] || 'bg-gray-100 text-gray-800';
};

// リアクション絵文字
export const reactionEmojis = ['👍', '❤️', '😊', '🤔', '💡', '⚠️'];

// コメントのソート
export const sortComments = (
  comments: any[], 
  sortBy: 'newest' | 'oldest' | 'priority' = 'newest'
): any[] => {
  return [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'priority':
        // タグに基づく優先度ソート
        const getPriority = (comment: any) => {
          if (comment.tags?.includes('重要')) return 3;
          if (comment.tags?.includes('懸念')) return 2;
          if (comment.tags?.includes('質問')) return 1;
          return 0;
        };
        return getPriority(b) - getPriority(a);
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
};