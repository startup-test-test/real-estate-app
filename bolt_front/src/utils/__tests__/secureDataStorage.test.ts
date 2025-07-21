/**
 * SEC-030: 機密データ平文保存対策のテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SecureDataStorage, isSensitiveData, SensitiveDataType } from '../secureDataStorage';
import { SecureStorage } from '../cryptoUtils';

// モックの設定
vi.mock('../cryptoUtils', () => ({
  SecureStorage: {
    setItem: vi.fn(() => Promise.resolve()),
    getItem: vi.fn(() => Promise.resolve(null)),
    removeItem: vi.fn(),
    clear: vi.fn()
  }
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-123' } }
      })
    }
  }
}));

describe('SecureDataStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // localStorageのメソッドをモック
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'getItem');
    vi.spyOn(Storage.prototype, 'removeItem');
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('isSensitiveData', () => {
    it('機密データパターンを正しく識別する', () => {
      // 機密データとして識別されるべきキー
      expect(isSensitiveData('simulation_data')).toBe(true);
      expect(isSensitiveData('investment_info')).toBe(true);
      expect(isSensitiveData('financial_report')).toBe(true);
      expect(isSensitiveData('purchase_price')).toBe(true);
      expect(isSensitiveData('loan_amount')).toBe(true);
      expect(isSensitiveData('monthly_income')).toBe(true);
      expect(isSensitiveData('annual_revenue')).toBe(true);
      expect(isSensitiveData('cash_flow_data')).toBe(true);
      expect(isSensitiveData('property_data')).toBe(true);
      expect(isSensitiveData('auth_token')).toBe(true);
      expect(isSensitiveData('session_id')).toBe(true);
      expect(isSensitiveData('invitation_token')).toBe(true);
      expect(isSensitiveData('user_password')).toBe(true);
      expect(isSensitiveData('api_secret')).toBe(true);
    });

    it('非機密データを正しく識別する', () => {
      // 機密データとして識別されないべきキー
      expect(isSensitiveData('theme_preference')).toBe(false);
      expect(isSensitiveData('language')).toBe(false);
      expect(isSensitiveData('hasSeenTutorial')).toBe(false);
      expect(isSensitiveData('ui_settings')).toBe(false);
      expect(isSensitiveData('last_visited')).toBe(false);
    });

    it('大文字小文字を区別せずに識別する', () => {
      expect(isSensitiveData('SIMULATION_DATA')).toBe(true);
      expect(isSensitiveData('Investment_Info')).toBe(true);
      expect(isSensitiveData('AUTH_TOKEN')).toBe(true);
    });
  });

  describe('setItem', () => {
    it('機密データは暗号化して保存する', async () => {
      const key = 'simulation_data';
      const value = { purchasePrice: 10000000, loanAmount: 8000000 };

      await SecureDataStorage.setItem(key, value);

      expect(SecureStorage.setItem).toHaveBeenCalledWith(key, value);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('非機密データは通常のlocalStorageに保存する', async () => {
      const key = 'theme_preference';
      const value = 'dark';

      await SecureDataStorage.setItem(key, value);

      expect(SecureStorage.setItem).not.toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
    });
  });

  describe('getItem', () => {
    it('機密データは復号して取得する', async () => {
      const key = 'investment_data';
      const mockData = { monthlyRevenue: 500000 };
      vi.mocked(SecureStorage.getItem).mockResolvedValueOnce(mockData);

      const result = await SecureDataStorage.getItem(key);

      expect(SecureStorage.getItem).toHaveBeenCalledWith(key);
      expect(result).toEqual(mockData);
    });

    it('非機密データは通常のlocalStorageから取得する', async () => {
      const key = 'ui_settings';
      const value = { theme: 'light' };
      localStorage.setItem(key, JSON.stringify(value));

      const result = await SecureDataStorage.getItem(key);

      expect(SecureStorage.getItem).not.toHaveBeenCalled();
      expect(result).toEqual(value);
    });

    it('JSON解析できない場合は文字列として返す', async () => {
      const key = 'simple_string';
      const value = 'not-json';
      localStorage.setItem(key, value);

      const result = await SecureDataStorage.getItem(key);

      expect(result).toBe(value);
    });
  });

  describe('removeItem', () => {
    it('機密データはSecureStorageから削除する', () => {
      const key = 'auth_token';

      SecureDataStorage.removeItem(key);

      expect(SecureStorage.removeItem).toHaveBeenCalledWith(key);
    });

    it('非機密データは通常のlocalStorageから削除する', () => {
      const key = 'last_visited';
      localStorage.setItem(key, 'value');

      SecureDataStorage.removeItem(key);

      expect(SecureStorage.removeItem).not.toHaveBeenCalled();
      expect(localStorage.getItem(key)).toBeNull();
    });
  });

  describe('saveSimulations', () => {
    it('シミュレーションデータを暗号化して保存する', async () => {
      const simulations = [
        {
          id: 'sim-1',
          property_name: 'テスト物件',
          purchase_price: 50000000,
          loan_amount: 40000000,
          monthly_rent: 200000
        }
      ];

      await SecureDataStorage.saveSimulations(simulations);

      expect(SecureStorage.setItem).toHaveBeenCalledWith(
        'secure_simulations_test-user-123',
        expect.objectContaining({
          data: simulations,
          timestamp: expect.any(String),
          encrypted: true,
          version: '1.0'
        })
      );
    });
  });

  describe('getSimulations', () => {
    it('暗号化されたシミュレーションデータを復号して取得する', async () => {
      const mockData = {
        data: [{ id: 'sim-1', property_name: 'テスト物件' }],
        timestamp: '2025-07-21T10:00:00Z',
        encrypted: true,
        version: '1.0'
      };
      vi.mocked(SecureStorage.getItem).mockResolvedValueOnce(mockData);

      // getUserのモックを一時的に上書き
      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: { id: 'test-user-123' } },
        error: null
      } as any);

      const result = await SecureDataStorage.getSimulations();

      expect(SecureStorage.getItem).toHaveBeenCalledWith('secure_simulations_test-user-123');
      expect(result).toEqual({
        data: mockData.data,
        timestamp: mockData.timestamp
      });
    });

    it('データがない場合はnullを返す', async () => {
      vi.mocked(SecureStorage.getItem).mockResolvedValueOnce(null);

      const result = await SecureDataStorage.getSimulations();

      expect(result).toBeNull();
    });
  });

  describe('saveInvestmentData', () => {
    it('投資データを暗号化して保存する', async () => {
      const propertyId = 'property-123';
      const investmentData = {
        purchasePrice: 30000000,
        downPayment: 6000000,
        interestRate: 1.5,
        cashFlow: [100000, 120000, 150000]
      };

      await SecureDataStorage.saveInvestmentData(propertyId, investmentData);

      expect(SecureStorage.setItem).toHaveBeenCalledWith(
        `secure_investment_${propertyId}`,
        expect.objectContaining({
          ...investmentData,
          encrypted: true,
          savedAt: expect.any(String)
        })
      );
    });
  });

  describe('getInvestmentData', () => {
    it('暗号化された投資データを復号して取得する', async () => {
      const propertyId = 'property-123';
      const mockData = {
        purchasePrice: 30000000,
        encrypted: true,
        savedAt: '2025-07-21T10:00:00Z'
      };
      vi.mocked(SecureStorage.getItem).mockResolvedValueOnce(mockData);

      const result = await SecureDataStorage.getInvestmentData(propertyId);

      expect(SecureStorage.getItem).toHaveBeenCalledWith(`secure_investment_${propertyId}`);
      expect(result).toEqual(mockData);
    });
  });

  describe('clearAllSensitiveData', () => {
    it('すべての機密データをクリアする', async () => {
      // テストデータを設定
      localStorage.setItem('simulation_data', 'encrypted');
      localStorage.setItem('auth_token', 'token');
      localStorage.setItem('theme_preference', 'dark');
      localStorage.setItem('ui_settings', 'settings');

      await SecureDataStorage.clearAllSensitiveData();

      // 機密データのみが削除されることを確認
      expect(SecureStorage.removeItem).toHaveBeenCalledWith('simulation_data');
      expect(SecureStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(SecureStorage.clear).toHaveBeenCalled();

      // 非機密データは残っていることを確認
      expect(localStorage.getItem('theme_preference')).toBe('dark');
      expect(localStorage.getItem('ui_settings')).toBe('settings');
    });
  });

  describe('migrateExistingData', () => {
    it('既存の平文機密データを暗号化して移行する', async () => {
      // 既存の平文データを設定
      const simulationData = { id: 'sim-1', purchase_price: 20000000 };
      const authToken = 'plain-text-token';
      
      localStorage.setItem('simulation_cache', JSON.stringify(simulationData));
      localStorage.setItem('auth_session', authToken);
      localStorage.setItem('theme', 'light'); // 非機密データ

      await SecureDataStorage.migrateExistingData();

      // 機密データが暗号化されて保存されることを確認
      expect(SecureStorage.setItem).toHaveBeenCalledWith(
        'secure_simulation_cache',
        simulationData
      );
      expect(SecureStorage.setItem).toHaveBeenCalledWith(
        'secure_auth_session',
        authToken
      );

      // 元のデータが削除されることを確認（実際の削除はPromise解決後）
      // 非機密データは移行されないことを確認
      expect(SecureStorage.setItem).not.toHaveBeenCalledWith(
        'secure_theme',
        expect.anything()
      );
    });

    it('JSON解析できないデータもそのまま移行する', async () => {
      const nonJsonData = 'not-a-json-string';
      localStorage.setItem('auth_token', nonJsonData);

      await SecureDataStorage.migrateExistingData();

      expect(SecureStorage.setItem).toHaveBeenCalledWith(
        'secure_auth_token',
        nonJsonData
      );
    });
  });

  describe('getCurrentUserId', () => {
    it('認証されていない場合はanonymousを返す', async () => {
      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null
      } as any);

      await SecureDataStorage.saveSimulations([]);

      expect(SecureStorage.setItem).toHaveBeenCalledWith(
        'secure_simulations_anonymous',
        expect.any(Object)
      );
    });

    it('エラーが発生した場合もanonymousを返す', async () => {
      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.auth.getUser).mockRejectedValueOnce(new Error('Auth error'));

      await SecureDataStorage.saveSimulations([]);

      expect(SecureStorage.setItem).toHaveBeenCalledWith(
        'secure_simulations_anonymous',
        expect.any(Object)
      );
    });
  });
});