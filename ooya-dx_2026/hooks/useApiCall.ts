// @ts-nocheck
// TODO: Neon移行後に有効化
/**
 * API呼び出し管理フック
 */
import { useState } from 'react';
import { transformFormDataToApiData, transformApiResponseToSupabaseData } from '../utils/dataTransform';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useSupabaseData } from './useSupabaseData';
import { supabase } from '../lib/supabase';

export const useApiCall = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSupabaseAuth();
  const { saveSimulation } = useSupabaseData();

  // シミュレーション実行API
  const executeSimulation = async (inputs: any) => {
    setIsSimulating(true);
    
    try {
      // FAST API への送信データを構築
      const apiData = transformFormDataToApiData(inputs);
      
      console.log('FAST API送信データ:', apiData);
      console.log('ローン期間:', apiData.loan_years, '年');
      console.log('保有年数:', apiData.holding_years, '年');
      console.log('新機能フィールド確認:', {
        ownership_type: apiData.ownership_type,
        effective_tax_rate: apiData.effective_tax_rate,
        major_repair_cycle: apiData.major_repair_cycle,
        major_repair_cost: apiData.major_repair_cost,
        building_price: apiData.building_price,
        depreciation_years: apiData.depreciation_years
      });
      
      // テスト: 最大期間でのリクエスト
      if (apiData.holding_years > 10) {
        console.log('⚠️ 35年のキャッシュフローを要求中...');
      }
      
      // Vercel Python Functions を使用（同一ドメイン）
      // ローカル開発では vercel dev を使用すること
      const API_BASE_URL = '';

      console.log('🔧 Simulator API URL: Vercel Python Functions (same domain)');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2分でタイムアウト
      
      const response = await fetch(`${API_BASE_URL}/api/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`シミュレーション計算でエラーが発生しました (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      console.log('FAST API応答:', result);
      
      return result;
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('計算がタイムアウトしました。条件を見直してもう一度お試しください。');
      }
      
      console.error('シミュレーション実行エラー:', error);
      throw error;
    } finally {
      setIsSimulating(false);
    }
  };

  // 既存データ読み込みAPI
  const loadExistingData = async (simulationId: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .eq('id', simulationId)
        .single();

      if (error) {
        console.error('データ読み込みエラー:', error);
        throw new Error('データの読み込みに失敗しました');
      }

      if (data) {
        return {
          inputs: data.input_data,
          result: data.result_data
        };
      }
      
      return null;
      
    } catch (error: any) {
      console.error('既存データ読み込みエラー:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // データ保存API
  const saveSimulationData = async (inputs: any, result: any) => {
    if (!user) {
      throw new Error('ログインが必要です');
    }

    try {
      // Supabase用のデータに変換
      const supabaseData = transformApiResponseToSupabaseData(inputs, result);
      
      // データベースに保存
      const insertResult = await saveSimulation({
        simulation_name: inputs.propertyName || '未命名のシミュレーション',
        input_data: inputs,
        result_data: supabaseData
      });

      if (insertResult.error) {
        throw new Error('データの保存に失敗しました');
      }

      return insertResult.data;
      
    } catch (error: any) {
      console.error('データ保存エラー:', error);
      throw error;
    }
  };

  return {
    isSimulating,
    isLoading,
    executeSimulation,
    loadExistingData,
    saveSimulationData,
  };
};