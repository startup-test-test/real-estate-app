/**
 * フォーム状態管理フック
 */
import { useState, useCallback } from 'react';
import { validatePropertyUrl } from '../utils/validation';

export const useFormState = (initialData: any = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // フィールド値の更新
  const updateField = useCallback((field: string, value: string | number | boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // 複数フィールドの一括更新
  const updateFields = useCallback((data: Record<string, any>) => {
    setFormData((prev: any) => ({
      ...prev,
      ...data
    }));
    setIsDirty(true);
  }, []);

  // フォームリセット
  const resetForm = useCallback((newData?: any) => {
    setFormData(newData || initialData);
    setErrors({});
    setIsDirty(false);
  }, [initialData]);

  // バリデーション実行
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // 必須フィールドチェック
    const requiredFields = [
      'propertyName',
      'purchasePrice',
      'monthlyRent',
      'landArea',
      'buildingArea'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field] === '') {
        newErrors[field] = `${getFieldLabel(field)}は必須です`;
      }
    });

    // 数値フィールドの範囲チェック
    if (formData.purchasePrice && (formData.purchasePrice <= 0 || formData.purchasePrice > 100000)) {
      newErrors.purchasePrice = '購入価格は1万円以上1億円以下で入力してください';
    }

    if (formData.monthlyRent && (formData.monthlyRent <= 0 || formData.monthlyRent > 10000000)) {
      newErrors.monthlyRent = '月額賃料は1円以上1000万円以下で入力してください';
    }

    if (formData.landArea && (formData.landArea <= 0 || formData.landArea > 10000)) {
      newErrors.landArea = '土地面積は0.01㎡以上10000㎡以下で入力してください';
    }

    if (formData.buildingArea && (formData.buildingArea <= 0 || formData.buildingArea > 10000)) {
      newErrors.buildingArea = '建物面積は0.01㎡以上10000㎡以下で入力してください';
    }

    // URL形式チェック
    if (formData.propertyUrl) {
      const urlError = validatePropertyUrl(formData.propertyUrl);
      if (urlError) {
        newErrors.propertyUrl = urlError;
      }
    }

    // 利回り妥当性チェック
    if (formData.purchasePrice && formData.monthlyRent) {
      const grossYield = (formData.monthlyRent * 12) / (formData.purchasePrice * 10000) * 100;
      if (grossYield < 0.1 || grossYield > 50) {
        newErrors.grossYield = '表面利回りが異常な値です。購入価格と賃料を確認してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // フィールドラベル取得
  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      propertyName: '物件名',
      purchasePrice: '購入価格',
      monthlyRent: '月額賃料',
      landArea: '土地面積',
      buildingArea: '建物面積',
      propertyUrl: '物件URL'
    };
    return labels[field] || field;
  };

  // フィールドエラー取得
  const getFieldError = useCallback((field: string) => {
    return errors[field] || null;
  }, [errors]);

  // フォームの有効性チェック
  const isValid = Object.keys(errors).length === 0;
  const hasErrors = Object.keys(errors).length > 0;

  return {
    // 状態
    formData,
    errors,
    isDirty,
    isValid,
    hasErrors,
    
    // 操作
    updateField,
    updateFields,
    resetForm,
    validateForm,
    getFieldError,
  };
};

// コメントフォーム専用フック
export const useCommentForm = () => {
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetCommentForm = useCallback(() => {
    setComment('');
    setSelectedTags([]);
    setReplyingTo(null);
    setEditingComment(null);
  }, []);

  const startReply = useCallback((commentId: string) => {
    setReplyingTo(commentId);
    setEditingComment(null);
  }, []);

  const startEdit = useCallback((commentId: string, currentContent: string) => {
    setEditingComment(commentId);
    setComment(currentContent);
    setReplyingTo(null);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingComment(null);
    setComment('');
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  return {
    // 状態
    comment,
    selectedTags,
    replyingTo,
    editingComment,
    isSubmitting,
    
    // 操作
    setComment,
    setSelectedTags,
    setIsSubmitting,
    resetCommentForm,
    startReply,
    startEdit,
    cancelEdit,
    toggleTag,
  };
};