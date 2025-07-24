/**
 * API呼び出し管理フック
 * SEC-022: API認証システムを統合
 * SEC-069: エラーメッセージの詳細露出対策
 * SEC-025: レート制限の実装
 */
import { useState, useEffect } from 'react';
import { transformFormDataToApiData, transformApiResponseToSupabaseData } from '../utils/dataTransform';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useSupabaseData } from './useSupabaseData';
import { supabase } from '../lib/supabase';
import { apiAuth } from '../utils/apiAuth';
import { rbacClient } from '../utils/rbacClient';
import { handleError, handleApiError } from '../utils/secureErrorHandler';
import { simulationRateLimiter, apiRateLimiter } from '../utils/rateLimiter';
import { SessionManager } from '../utils/sessionManager';

export const useApiCall = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const { user } = useSupabaseAuth();
  const { saveSimulation } = useSupabaseData();

  // Supabaseセッションが利用可能になったらAPIトークンを取得
  useEffect(() => {
    const initializeApiAuth = async () => {
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const success = await apiAuth.obtainToken(session);
          setIsAuthInitialized(success);
          
          // 権限情報を取得
          if (success && import.meta.env.VITE_DISABLE_API_AUTH !== 'true') {
            try {
              const response = await apiAuth.authenticatedFetch(`${import.meta.env.VITE_API_URL || 'https://real-estate-app-1-iii4.onrender.com'}/api/auth/me`);
              if (response.ok) {
                const data = await response.json();
                if (data.user) {
                  rbacClient.setUserPermissions(data.user.role, data.user.permissions);
                }
              }
            } catch (error) {
              console.error('Failed to fetch user permissions:', error);
            }
          } else if (import.meta.env.VITE_DISABLE_API_AUTH === 'true') {
            // 認証が無効の場合は標準ユーザー権限を設定
            rbacClient.setUserPermissions('standard', ['simulate_basic', 'data_read', 'data_write', 'market_analysis_basic']);
          }
        }
      }
    };

    initializeApiAuth();
  }, [user]);

  // シミュレーション実行API
  const executeSimulation = async (inputs: any) => {
    setIsSimulating(true);
    
    try {
      // シミュレーション実行前にセッションをリフレッシュ
      const sessionManager = SessionManager.getInstance();
      sessionManager.refreshSession();
      
      // SEC-025: レート制限チェック
      const userId = user?.id || 'anonymous';
      const isAllowed = await simulationRateLimiter.checkLimit(userId);
      
      if (!isAllowed) {
        const resetTime = simulationRateLimiter.getResetTime(userId);
        const minutes = Math.ceil(resetTime / 60000);
        throw new Error(`リクエスト制限に達しました。${minutes}分後に再度お試しください。`);
      }
      
      // FAST API への送信データを構築
      const propertyData = transformFormDataToApiData(inputs);
      const apiData = {
        property_data: propertyData
      };
      
      // 開発環境のみデバッグ情報を出力
      if (import.meta.env.DEV) {
        console.log('FAST API送信データ:', apiData);
        console.log('変換後のproperty_data:', apiData.property_data);
        console.log('ローン期間:', propertyData.loan_years, '年');
        console.log('保有年数:', propertyData.holding_years, '年');
        console.log('新機能フィールド確認:', {
          ownership_type: propertyData.ownership_type,
          effective_tax_rate: propertyData.effective_tax_rate,
          major_repair_cycle: propertyData.major_repair_cycle,
          major_repair_cost: propertyData.major_repair_cost,
          building_price: propertyData.building_price,
          depreciation_years: propertyData.depreciation_years
        });
        
        // テスト: 最大期間でのリクエスト
        if (propertyData.holding_years > 10) {
          console.log('⚠️ 35年のキャッシュフローを要求中...');
        }
      }
      
      // FAST API呼び出し（タイムアウト対応）
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      
      // 最初にAPIを起動させる（Health Check）
      try {
        await fetch(`${API_BASE_URL ? API_BASE_URL : ''}/`, { method: 'GET' });
      } catch (e) {
        console.log('API起動中...');
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2分でタイムアウト
      
      // 認証チェック
      const isAuthDisabled = import.meta.env.VITE_DISABLE_API_AUTH === 'true';
      if (!isAuthDisabled && !isAuthInitialized) {
        // 認証が初期化されていない場合は、トークンを再取得
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await apiAuth.obtainToken(session);
        }
      }

      const response = await apiAuth.authenticatedFetch(`${API_BASE_URL}/api/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // エラーレスポンスの内容を取得
        let errorDetail = '';
        try {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          errorDetail = JSON.stringify(errorData);
        } catch (e) {
          console.error('Failed to parse error response');
        }
        
        const errorInfo = handleApiError(response);
        throw new Error(errorInfo.userMessage + (errorDetail ? ` Details: ${errorDetail}` : ''));
      }
      
      const result = await response.json();
      // 開発環境のみログ出力
      if (import.meta.env.DEV) {
        console.log('FAST API応答:', result);
      }
      
      return result;
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('計算がタイムアウトしました。条件を見直してもう一度お試しください。');
      }
      
      // デバッグ用：詳細なエラー情報を表示
      console.error('executeSimulation error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // セキュアなエラーハンドリング
      const errorInfo = handleError(error, 'executeSimulation');
      throw new Error(`${errorInfo.userMessage} (Debug: ${error.message})`);
    } finally {
      setIsSimulating(false);
    }
  };

  // 既存データ読み込みAPI
  const loadExistingData = async (simulationId: string) => {
    setIsLoading(true);
    
    try {
      // SEC-025: レート制限チェック（API読み込み用）
      const userId = user?.id || 'anonymous';
      const isAllowed = await apiRateLimiter.checkLimit(userId);
      
      if (!isAllowed) {
        const resetTime = apiRateLimiter.getResetTime(userId);
        const minutes = Math.ceil(resetTime / 60000);
        throw new Error(`リクエスト制限に達しました。${minutes}分後に再度お試しください。`);
      }
      
      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .eq('id', simulationId)
        .single();

      if (error) {
        const errorInfo = handleError(error, 'loadExistingData');
        throw new Error(errorInfo.userMessage);
      }

      if (data) {
        return {
          inputs: data.input_data,
          result: data.result_data
        };
      }
      
      return null;
      
    } catch (error: any) {
      const errorInfo = handleError(error, 'loadExistingData');
      throw new Error(errorInfo.userMessage);
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
      const supabaseData = transformApiResponseToSupabaseData(result, inputs);
      
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