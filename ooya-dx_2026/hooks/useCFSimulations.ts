'use client';

import { useState, useCallback } from 'react';

export interface CFSimulationData {
  id: string;
  propertyName: string;
  purchasePrice: number;      // 万円
  monthlyRent: number;        // 万円
  loanAmount: number;         // 万円
  interestRate: number;       // %
  loanYears: number;          // 年
  status: string;
  createdAt: string;
  updatedAt: string;
  results?: {
    surfaceYield: number;
    netYield: number;
    annualCashFlow: number;
    noi: number;
    irr: number;
    ccr: number;
    dscr: number;
    ltv: number;
  };
  cashFlowTable?: any[];
}

const STORAGE_KEY = 'cf_simulations';

export function useCFSimulations() {
  const [loading, setLoading] = useState(false);

  // ローカルストレージからデータを取得
  const getSimulations = useCallback((): CFSimulationData[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load CF simulations:', error);
      return [];
    }
  }, []);

  // シミュレーションを保存
  const saveSimulation = useCallback((simulation: Omit<CFSimulationData, 'id' | 'createdAt' | 'updatedAt'>): CFSimulationData => {
    const simulations = getSimulations();
    const now = new Date().toISOString();
    const newSimulation: CFSimulationData = {
      ...simulation,
      id: `cf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };
    simulations.unshift(newSimulation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(simulations));
    return newSimulation;
  }, [getSimulations]);

  // シミュレーションを更新
  const updateSimulation = useCallback((id: string, updates: Partial<CFSimulationData>): boolean => {
    const simulations = getSimulations();
    const index = simulations.findIndex(s => s.id === id);
    if (index === -1) return false;

    simulations[index] = {
      ...simulations[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(simulations));
    return true;
  }, [getSimulations]);

  // シミュレーションを削除
  const deleteSimulation = useCallback((id: string): boolean => {
    const simulations = getSimulations();
    const filtered = simulations.filter(s => s.id !== id);
    if (filtered.length === simulations.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }, [getSimulations]);

  // シミュレーションを複製
  const duplicateSimulation = useCallback((id: string): CFSimulationData | null => {
    const simulations = getSimulations();
    const original = simulations.find(s => s.id === id);
    if (!original) return null;

    const now = new Date().toISOString();
    const duplicated: CFSimulationData = {
      ...original,
      id: `cf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      propertyName: `${original.propertyName}（コピー）`,
      createdAt: now,
      updatedAt: now,
    };
    simulations.unshift(duplicated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(simulations));
    return duplicated;
  }, [getSimulations]);

  // IDでシミュレーションを取得
  const getSimulationById = useCallback((id: string): CFSimulationData | null => {
    const simulations = getSimulations();
    return simulations.find(s => s.id === id) || null;
  }, [getSimulations]);

  return {
    getSimulations,
    saveSimulation,
    updateSimulation,
    deleteSimulation,
    duplicateSimulation,
    getSimulationById,
    loading,
  };
}
