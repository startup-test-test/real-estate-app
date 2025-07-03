/**
 * コメント投稿フォーム（共通化）
 */
import React, { useState } from 'react';
import { Send, X, Tag } from 'lucide-react';
import { validateCommentContent, getTagColor } from './CommentUtils';

interface CommentFormProps {
  onSubmit: (content: string, tags?: string[]) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  enableTags?: boolean;
  maxLength?: number;
  submitButtonText?: string;
  isSubmitting?: boolean;
  replyToUser?: string;
  className?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  placeholder = 'コメントを入力してください...',
  enableTags = false,
  maxLength = 1000,
  submitButtonText = '投稿',
  isSubmitting = false,
  replyToUser,
  className = ''
}) => {
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableTags = ['質問', '提案', '懸念', '確認', '重要'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateCommentContent(content);
    if (!validation.isValid) {
      setError(validation.error || 'エラーが発生しました');
      return;
    }

    try {
      await onSubmit(content.trim(), enableTags ? selectedTags : undefined);
      setContent('');
      setSelectedTags([]);
      setError(null);
      setShowTagSelector(false);
    } catch (err: any) {
      setError(err.message || 'コメントの投稿に失敗しました');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    if (error) setError(null);
  };

  const isSubmitDisabled = !content.trim() || isSubmitting || content.length > maxLength;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {replyToUser && (
        <div className="mb-3 text-sm text-gray-600">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {replyToUser} への返信
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* テキストエリア */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            rows={3}
            maxLength={maxLength}
            disabled={isSubmitting}
          />
          
          {/* 文字数カウント */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {content.length}/{maxLength}
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        {/* タグ選択 */}
        {enableTags && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowTagSelector(!showTagSelector)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
              >
                <Tag size={14} />
                <span>タグを追加</span>
              </button>
              
              {selectedTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTags([])}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  クリア
                </button>
              )}
            </div>

            {/* 選択されたタグ表示 */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs px-2 py-1 rounded-full ${getTagColor(tag)} flex items-center space-x-1`}
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* タグセレクター */}
            {showTagSelector && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        selectedTags.includes(tag)
                          ? getTagColor(tag)
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {enableTags && '💡 タグを使って投稿を分類できます'}
          </div>
          
          <div className="flex space-x-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-lg transition-all ${
                isSubmitDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>投稿中...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>{submitButtonText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;