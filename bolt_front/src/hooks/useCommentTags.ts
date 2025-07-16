import { useState, useCallback } from 'react';

const AVAILABLE_TAGS = ['要検討', 'リスク', '承認', '質問', '提案'];
const PRIORITY_TAGS = ['リスク', '要検討'];

export const useCommentTags = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editTags, setEditTags] = useState<string[]>([]);

  const toggleSelectedTag = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const toggleEditTag = useCallback((tag: string) => {
    setEditTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const clearSelectedTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  const clearEditTags = useCallback(() => {
    setEditTags([]);
  }, []);

  const setEditTagsFromComment = useCallback((tags: string[]) => {
    setEditTags(tags || []);
  }, []);

  const getTagStyle = useCallback((tag: string): string => {
    const baseStyle = "inline-block px-2 py-1 rounded-full text-xs ";
    
    switch (tag) {
      case 'リスク':
        return baseStyle + "bg-red-100 text-red-800";
      case '要検討':
        return baseStyle + "bg-yellow-100 text-yellow-800";
      case '承認':
        return baseStyle + "bg-green-100 text-green-800";
      case '質問':
        return baseStyle + "bg-blue-100 text-blue-800";
      case '提案':
        return baseStyle + "bg-purple-100 text-purple-800";
      default:
        return baseStyle + "bg-gray-100 text-gray-800";
    }
  }, []);

  const hasPriorityTag = useCallback((tags: string[]): boolean => {
    return tags.some(tag => PRIORITY_TAGS.includes(tag));
  }, []);

  const sortCommentsByPriority = useCallback((comments: any[]): any[] => {
    return [...comments].sort((a, b) => {
      const aHasPriority = hasPriorityTag(a.tags || []);
      const bHasPriority = hasPriorityTag(b.tags || []);
      
      if (aHasPriority && !bHasPriority) return -1;
      if (!aHasPriority && bHasPriority) return 1;
      
      // 同じ優先度の場合は作成日時で降順ソート
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [hasPriorityTag]);

  const isTagSelected = useCallback((tag: string): boolean => {
    return selectedTags.includes(tag);
  }, [selectedTags]);

  const isEditTagSelected = useCallback((tag: string): boolean => {
    return editTags.includes(tag);
  }, [editTags]);

  return {
    // State
    selectedTags,
    editTags,
    availableTags: AVAILABLE_TAGS,
    priorityTags: PRIORITY_TAGS,
    
    // Actions
    toggleSelectedTag,
    toggleEditTag,
    clearSelectedTags,
    clearEditTags,
    setEditTagsFromComment,
    
    // Utilities
    getTagStyle,
    hasPriorityTag,
    sortCommentsByPriority,
    isTagSelected,
    isEditTagSelected
  };
};