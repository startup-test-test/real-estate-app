import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import { useCommentTags } from '../../hooks/useCommentTags';

interface CommentFormProps {
  onSubmit: (content: string, tags: string[]) => Promise<void>;
  onCancel?: () => void;
  initialContent?: string;
  initialTags?: string[];
  placeholder?: string;
  submitLabel?: string;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  initialContent = '',
  initialTags = [],
  placeholder = "アドバイスやコメントを入力...",
  submitLabel = "投稿",
  isLoading = false,
  isEdit = false
}) => {
  const [content, setContent] = useState(initialContent);
  
  const {
    selectedTags,
    availableTags,
    toggleSelectedTag,
    clearSelectedTags,
    isTagSelected,
    getTagStyle
  } = useCommentTags();

  // 編集モードの場合は初期タグを設定
  React.useEffect(() => {
    if (isEdit && initialTags.length > 0) {
      // 編集モードでは直接selectedTagsを初期化
      initialTags.forEach(tag => {
        if (!isTagSelected(tag)) {
          toggleSelectedTag(tag);
        }
      });
    }
  }, [isEdit, initialTags]);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await onSubmit(content.trim(), selectedTags);
      
      // 成功後のクリーンアップ（編集モードでない場合のみ）
      if (!isEdit) {
        setContent('');
        clearSelectedTags();
      }
    } catch (error) {
      console.error('Comment submission failed:', error);
    }
  };

  const handleCancel = () => {
    if (!isEdit) {
      setContent('');
      clearSelectedTags();
    }
    onCancel?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isSubmitDisabled = !content.trim() || isLoading;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Content Input */}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          disabled={isLoading}
        />
      </div>

      {/* Tags Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          タグ（複数選択可）
        </label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleSelectedTag(tag)}
              disabled={isLoading}
              className={`
                px-3 py-1 rounded-full text-sm border transition-colors
                ${isTagSelected(tag)
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <span key={tag} className={getTagStyle(tag)}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Ctrl+Enter で投稿
        </div>
        <div className="flex space-x-2">
          {(isEdit || onCancel) && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4 mr-1 inline" />
              キャンセル
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="h-4 w-4 mr-1" />
            {isLoading ? '送信中...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};