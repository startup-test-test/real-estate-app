'use client';

import { useState, useCallback } from 'react';

// 型定義（マイページ用 - 旧Supabase形式と互換）
export interface SimulationSummary {
  id: string;
  simulation_data: Record<string, unknown> | null;
  results: Record<string, unknown> | null;
  cash_flow_table: Array<Record<string, unknown>> | null;
  created_at: string;
  updated_at: string;
}

export interface SimulationDetail {
  id: string;
  userId: string;
  name: string;
  propertyUrl: string | null;
  imageUrl: string | null;
  inputData: Record<string, unknown>;
  results: Record<string, unknown> | null;
  cashFlow: Array<Record<string, unknown>> | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveSimulationData {
  name: string;
  propertyUrl?: string;
  imageUrl?: string;
  inputData: Record<string, unknown>;
  results?: Record<string, unknown>;
  cashFlow?: Array<Record<string, unknown>>;
}

export function useSimulations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // シミュレーション一覧取得
  const getSimulations = useCallback(async (): Promise<SimulationSummary[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/simulations');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '一覧の取得に失敗しました');
      }

      return data.simulations;
    } catch (err) {
      const message = err instanceof Error ? err.message : '一覧の取得に失敗しました';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // シミュレーション詳細取得
  const getSimulation = useCallback(async (id: string): Promise<SimulationDetail | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/simulations/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '取得に失敗しました');
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : '取得に失敗しました';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // シミュレーション保存
  const saveSimulation = useCallback(async (data: SaveSimulationData): Promise<{ id: string } | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '保存に失敗しました');
      }

      return { id: result.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : '保存に失敗しました';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // シミュレーション更新
  const updateSimulation = useCallback(async (id: string, data: Partial<SaveSimulationData>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/simulations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '更新に失敗しました');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新に失敗しました';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // シミュレーション削除
  const deleteSimulation = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/simulations/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '削除に失敗しました');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '削除に失敗しました';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // シミュレーション複製
  const duplicateSimulation = useCallback(async (id: string): Promise<{ id: string } | null> => {
    setLoading(true);
    setError(null);
    try {
      // 元のシミュレーションを取得
      const original = await getSimulation(id);
      if (!original) {
        throw new Error('複製元のシミュレーションが見つかりません');
      }

      // 物件名に「(コピー)」を付けて複製
      const inputData = original.inputData as Record<string, unknown>;
      const originalName = (inputData.propertyName as string) || original.name || '無題';
      const copiedName = `${originalName}（コピー）`;

      const duplicatedData: SaveSimulationData = {
        name: copiedName,
        propertyUrl: original.propertyUrl || undefined,
        imageUrl: original.imageUrl || undefined,
        inputData: {
          ...inputData,
          propertyName: copiedName,
        },
        results: original.results || undefined,
        cashFlow: original.cashFlow || undefined,
      };

      // 新規保存
      const result = await saveSimulation(duplicatedData);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '複製に失敗しました';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getSimulation, saveSimulation]);

  return {
    loading,
    error,
    getSimulations,
    getSimulation,
    saveSimulation,
    updateSimulation,
    deleteSimulation,
    duplicateSimulation,
  };
}
