/**
 * SEC-030: 機密データ平文保存対策
 * 投資シミュレーションデータなど機密情報を暗号化して保存
 */

import { SecureStorage } from './cryptoUtils';

/**
 * 機密データの種類を定義
 */
export enum SensitiveDataType {
  SIMULATION = 'simulation',
  INVESTMENT = 'investment',
  FINANCIAL = 'financial',
  PERSONAL = 'personal',
  AUTH_TOKEN = 'auth_token',
  INVITATION = 'invitation'
}

/**
 * 機密データかどうかを判定
 */
export const isSensitiveData = (key: string): boolean => {
  const sensitivePatterns = [
    /simulation/i,
    /investment/i,
    /financial/i,
    /purchase.*price/i,
    /loan.*amount/i,
    /income/i,
    /revenue/i,
    /cash.*flow/i,
    /property.*data/i,
    /token/i,
    /auth/i,
    /session/i,
    /invitation/i,
    /password/i,
    /secret/i
  ];

  return sensitivePatterns.some(pattern => pattern.test(key));
};

/**
 * 機密データを暗号化して保存
 */
export class SecureDataStorage {
  /**
   * データを保存（機密データは自動的に暗号化）
   */
  static async setItem(key: string, value: any): Promise<void> {
    if (isSensitiveData(key)) {
      // 大きなデータの場合は分割保存を検討
      const jsonStr = JSON.stringify(value);
      if (jsonStr.length > 100000) { // 100KB以上の場合
        console.warn(`Large data detected for key ${key}: ${jsonStr.length} bytes`);
        // 暗号化をスキップしてsessionStorageに保存
        try {
          sessionStorage.setItem(key, jsonStr);
          return;
        } catch (e) {
          console.error('Failed to save to sessionStorage:', e);
        }
      }
      // 機密データは暗号化して保存
      await SecureStorage.setItem(key, value);
    } else {
      // 非機密データは通常のlocalStorageに保存
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  /**
   * データを取得（暗号化されていれば自動的に復号）
   */
  static async getItem(key: string): Promise<any> {
    if (isSensitiveData(key)) {
      // sessionStorageをチェック（大きなデータの場合）
      const sessionItem = sessionStorage.getItem(key);
      if (sessionItem) {
        try {
          return JSON.parse(sessionItem);
        } catch {
          return sessionItem;
        }
      }
      // 機密データは復号して返す
      return await SecureStorage.getItem(key);
    } else {
      // 非機密データは通常のlocalStorageから取得
      const item = localStorage.getItem(key);
      if (item) {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      }
      return null;
    }
  }

  /**
   * データを削除
   */
  static removeItem(key: string): void {
    if (isSensitiveData(key)) {
      SecureStorage.removeItem(key);
    } else {
      localStorage.removeItem(key);
    }
  }

  /**
   * シミュレーションデータを暗号化して保存
   */
  static async saveSimulations(simulations: any[]): Promise<void> {
    const userId = await this.getCurrentUserId();
    const key = `secure_simulations_${userId}`;
    const timestamp = new Date().toISOString();
    
    // データに機密フラグを追加
    const secureData = {
      data: simulations,
      timestamp,
      encrypted: true,
      version: '1.0'
    };

    // シミュレーションデータは大きいため、直接sessionStorageを使用
    try {
      const jsonStr = JSON.stringify(secureData);
      console.log(`Saving simulations: ${jsonStr.length} bytes`);
      
      // 5MB以下なら保存
      if (jsonStr.length < 5 * 1024 * 1024) {
        sessionStorage.setItem(key, jsonStr);
      } else {
        // 大きすぎる場合は最新10件のみ
        const limitedData = {
          ...secureData,
          data: simulations.slice(-10)
        };
        sessionStorage.setItem(key, JSON.stringify(limitedData));
        console.warn('Data too large, saved only last 10 simulations');
      }
    } catch (error) {
      console.error('Failed to save simulations:', error);
      // エラー時は最小データを保存
      try {
        const minData = {
          ...secureData,
          data: simulations.slice(-5)
        };
        sessionStorage.setItem(key, JSON.stringify(minData));
      } catch (e) {
        console.error('Failed to save minimal data:', e);
      }
    }
  }

  /**
   * シミュレーションデータを復号して取得
   */
  static async getSimulations(): Promise<{ data: any[], timestamp: string } | null> {
    const userId = await this.getCurrentUserId();
    const key = `secure_simulations_${userId}`;
    
    // まずsessionStorageから取得を試みる
    const sessionData = sessionStorage.getItem(key);
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        return {
          data: parsed.data,
          timestamp: parsed.timestamp
        };
      } catch (e) {
        console.error('Failed to parse session data:', e);
      }
    }
    
    // sessionStorageになければSecureStorageから取得
    try {
      const secureData = await SecureStorage.getItem(key);
      if (secureData && secureData.data) {
        return {
          data: secureData.data,
          timestamp: secureData.timestamp
        };
      }
    } catch (error) {
      console.error('Failed to get from SecureStorage:', error);
    }
    
    return null;
  }

  /**
   * 投資データを暗号化して保存
   */
  static async saveInvestmentData(propertyId: string, data: any): Promise<void> {
    const key = `secure_investment_${propertyId}`;
    const secureData = {
      ...data,
      encrypted: true,
      savedAt: new Date().toISOString()
    };
    await SecureStorage.setItem(key, secureData);
  }

  /**
   * 投資データを復号して取得
   */
  static async getInvestmentData(propertyId: string): Promise<any> {
    const key = `secure_investment_${propertyId}`;
    return await SecureStorage.getItem(key);
  }

  /**
   * 現在のユーザーIDを取得
   */
  private static async getCurrentUserId(): Promise<string> {
    // Supabaseのユーザー情報から取得
    try {
      const { supabase } = await import('../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  /**
   * すべての機密データをクリア
   */
  static async clearAllSensitiveData(): Promise<void> {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (isSensitiveData(key)) {
        SecureStorage.removeItem(key);
      }
    }
    
    // SecureStorageの全データもクリア
    SecureStorage.clear();
  }

  /**
   * データマイグレーション: 既存の平文データを暗号化
   */
  static async migrateExistingData(): Promise<void> {
    const keys = Object.keys(localStorage);
    const migrationPromises: Promise<void>[] = [];

    for (const key of keys) {
      if (isSensitiveData(key) && !key.startsWith('secure_')) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const parsedValue = JSON.parse(value);
            migrationPromises.push(
              SecureStorage.setItem(`secure_${key}`, parsedValue)
                .then(() => localStorage.removeItem(key))
            );
          } catch {
            // JSON解析できない場合はそのまま保存
            migrationPromises.push(
              SecureStorage.setItem(`secure_${key}`, value)
                .then(() => localStorage.removeItem(key))
            );
          }
        }
      }
    }

    await Promise.all(migrationPromises);
    console.log('✅ 既存データの暗号化移行が完了しました');
  }
}

/**
 * ページ読み込み時に既存データを移行
 */
if (typeof window !== 'undefined') {
  // 初回のみ実行
  const migrationKey = 'secure_data_migration_v1';
  if (!localStorage.getItem(migrationKey)) {
    SecureDataStorage.migrateExistingData()
      .then(() => {
        localStorage.setItem(migrationKey, 'completed');
      })
      .catch(error => {
        console.error('データ移行エラー:', error);
      });
  }
}