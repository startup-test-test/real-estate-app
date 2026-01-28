'use client';

import { useState, useCallback } from 'react';

// CFシミュレーションの入力データ型
export interface CFSimulationInputData {
  propertyName: string;
  purchasePrice: number;      // 万円
  monthlyRent: number;        // 万円
  loanAmount: number;         // 万円
  interestRate: number;       // %
  loanYears: number;          // 年
}

// CFシミュレーションの計算結果型
export interface CFSimulationResults {
  surfaceYield: number;
  netYield: number;
  annualCashFlow: number;
  noi: number;
  irr: number;
  ccr: number;
  dscr: number;
  ltv: number;
}

// API から返されるCFシミュレーションデータ型
export interface CFSimulationData {
  id: string;
  userId: string;
  name: string;
  inputData: CFSimulationInputData;
  results: CFSimulationResults | null;
  cashFlowTable: Record<string, unknown>[] | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 保存時のデータ型
export interface SaveCFSimulationData {
  name: string;
  inputData: CFSimulationInputData;
  results?: CFSimulationResults;
  cashFlowTable?: Record<string, unknown>[];
  status?: string;
}

export function useCFSimulations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // シミュレーション一覧取得
  const getSimulations = useCallback(async (): Promise<CFSimulationData[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cf-simulations');
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
  const getSimulationById = useCallback(async (id: string): Promise<CFSimulationData | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/cf-simulations?id=${id}`);
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
  const saveSimulation = useCallback(async (data: SaveCFSimulationData): Promise<{ id: string } | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cf-simulations', {
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
  const updateSimulation = useCallback(async (id: string, data: Partial<SaveCFSimulationData>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/cf-simulations?id=${id}`, {
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
      const response = await fetch(`/api/cf-simulations?id=${id}`, {
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
      const original = await getSimulationById(id);
      if (!original) {
        throw new Error('複製元のシミュレーションが見つかりません');
      }

      // 物件名に「(コピー)」を付けて複製
      const originalName = original.inputData?.propertyName || original.name || '無題';
      const copiedName = `${originalName}（コピー）`;

      const duplicatedData: SaveCFSimulationData = {
        name: copiedName,
        inputData: {
          ...original.inputData,
          propertyName: copiedName,
        },
        results: original.results || undefined,
        cashFlowTable: original.cashFlowTable || undefined,
        status: original.status,
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
  }, [getSimulationById, saveSimulation]);

  return {
    loading,
    error,
    getSimulations,
    getSimulationById,
    saveSimulation,
    updateSimulation,
    deleteSimulation,
    duplicateSimulation,
  };
}
