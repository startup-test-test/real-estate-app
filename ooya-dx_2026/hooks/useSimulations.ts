'use client';

import { useState, useCallback } from 'react';

// 型定義
export interface SimulationSummary {
  id: string;
  name: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  summary: {
    surfaceYield?: number;
    realYield?: number;
    irr?: number;
  } | null;
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

  return {
    loading,
    error,
    getSimulations,
    getSimulation,
    saveSimulation,
    updateSimulation,
    deleteSimulation,
  };
}
