/**
 * シミュレーション状態管理フック
 */
import { useState, useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { sampleProperties } from '@/lib/constants/sampleData';

export const useSimulationState = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // フォーム入力データ
  const [inputs, setInputs] = useState<any>(sampleProperties.shibuya?.data || {});
  
  // UI状態管理
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // エラー・メッセージ管理
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // データ管理
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // フォーム入力変更ハンドラー
  const handleInputChange = (field: string, value: string | number) => {
    setInputs((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // サンプルデータ読み込み
  const loadSampleData = (sampleKey: string) => {
    if (sampleProperties[sampleKey as keyof typeof sampleProperties]) {
      setInputs(sampleProperties[sampleKey as keyof typeof sampleProperties].data);
      setSaveMessage(`${sampleProperties[sampleKey as keyof typeof sampleProperties].name}のデータを読み込みました`);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // 初回アクセス時にチュートリアルを表示
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem('hasSeenTutorial', 'true');
    }
  }, []);

  // URLパラメータ監視
  useEffect(() => {
    const editId = searchParams?.get('edit');
    const viewId = searchParams?.get('view');

    if (editId) {
      setEditingId(editId);
    } else if (viewId) {
      setEditingId(viewId);
    }
  }, [searchParams]);

  // エラーメッセージの自動クリア
  useEffect(() => {
    if (saveError) {
      const timer = setTimeout(() => setSaveError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [saveError]);

  // 成功メッセージの自動クリア
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  return {
    // 状態
    inputs,
    showTutorial,
    showInviteModal,
    isSimulating,
    isLoading,
    saveMessage,
    saveError,
    simulationResult,
    editingId,
    
    // 状態更新関数
    setInputs,
    setShowTutorial,
    setShowInviteModal,
    setIsSimulating,
    setIsLoading,
    setSaveMessage,
    setSaveError,
    setSimulationResult,
    setEditingId,
    
    // ヘルパー関数
    handleInputChange,
    loadSampleData,
  };
};