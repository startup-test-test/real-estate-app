/**
 * SEC-057: データ永続化フック
 * バックエンドAPIを使用したデータの保存・読み込み機能
 */

import { useState, useCallback } from 'react';
import { secureApiClient } from '../utils/apiAuth';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from '../components/ui/use-toast';

interface SimulationData {
  id?: string;
  propertyData: any;
  results: any;
  createdAt?: string;
  updatedAt?: string;
}

interface SaveOptions {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export const useDataPersistence = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  /**
   * シミュレーションデータを保存
   */
  const saveSimulation = useCallback(async (
    data: SimulationData,
    options: SaveOptions = {}
  ): Promise<SimulationData | null> => {
    if (!user) {
      setError('ログインが必要です');
      toast({
        title: 'エラー',
        description: 'データを保存するにはログインが必要です',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await secureApiClient('/api/simulations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          ...options,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('データの保存に失敗しました');
      }

      const savedData = await response.json();
      
      toast({
        title: '保存完了',
        description: 'シミュレーションデータが保存されました',
      });

      return savedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの保存に失敗しました';
      setError(errorMessage);
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  /**
   * シミュレーションデータを読み込み
   */
  const loadSimulation = useCallback(async (
    simulationId: string
  ): Promise<SimulationData | null> => {
    if (!user) {
      setError('ログインが必要です');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await secureApiClient(`/api/simulations/${simulationId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('データの読み込みに失敗しました');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの読み込みに失敗しました';
      setError(errorMessage);
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  /**
   * ユーザーのシミュレーション一覧を取得
   */
  const listSimulations = useCallback(async (): Promise<SimulationData[]> => {
    if (!user) {
      setError('ログインが必要です');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await secureApiClient('/api/simulations', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('データの取得に失敗しました');
      }

      const data = await response.json();
      return data.simulations || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの取得に失敗しました';
      setError(errorMessage);
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  /**
   * シミュレーションデータを削除
   */
  const deleteSimulation = useCallback(async (
    simulationId: string
  ): Promise<boolean> => {
    if (!user) {
      setError('ログインが必要です');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await secureApiClient(`/api/simulations/${simulationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('データの削除に失敗しました');
      }

      toast({
        title: '削除完了',
        description: 'シミュレーションデータが削除されました',
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの削除に失敗しました';
      setError(errorMessage);
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  /**
   * シミュレーションデータを更新
   */
  const updateSimulation = useCallback(async (
    simulationId: string,
    data: Partial<SimulationData>,
    options: SaveOptions = {}
  ): Promise<SimulationData | null> => {
    if (!user) {
      setError('ログインが必要です');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await secureApiClient(`/api/simulations/${simulationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error('データの更新に失敗しました');
      }

      const updatedData = await response.json();
      
      toast({
        title: '更新完了',
        description: 'シミュレーションデータが更新されました',
      });

      return updatedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの更新に失敗しました';
      setError(errorMessage);
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  return {
    // 状態
    isLoading,
    error,
    
    // 操作関数
    saveSimulation,
    loadSimulation,
    listSimulations,
    deleteSimulation,
    updateSimulation,
  };
};

// 型定義のエクスポート
export type { SimulationData, SaveOptions };