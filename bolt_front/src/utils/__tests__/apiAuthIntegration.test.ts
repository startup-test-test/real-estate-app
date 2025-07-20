/**
 * SEC-022: API認証システムの統合テスト
 * useApiCallとapiAuthの連携をテスト
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApiCall } from '../../hooks/useApiCall';
import { apiAuth } from '../apiAuth';
import { SecureStorage } from '../cryptoUtils';

// モジュールをモック
vi.mock('../cryptoUtils', () => ({
  SecureStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
}));

vi.mock('../../hooks/useSupabaseAuth', () => ({
  useSupabaseAuth: () => ({
    user: { id: 'test-user-123', email: 'test@example.com' }
  })
}));

vi.mock('../../hooks/useSupabaseData', () => ({
  useSupabaseData: () => ({
    saveSimulation: vi.fn()
  })
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'supabase-token',
            user: { id: 'test-user-123', email: 'test@example.com' }
          }
        }
      })
    }
  }
}));

// グローバルのfetchをモック
global.fetch = vi.fn() as Mock;

describe('API認証統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 環境変数を設定
    vi.stubEnv('VITE_API_URL', 'https://test-api.example.com');
  });

  it('初回利用時にトークンを取得してAPIを呼び出すこと', async () => {
    // トークン取得のモック
    (fetch as Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'api-token-123',
          token_type: 'bearer',
          expires_in: 3600
        })
      })
      // シミュレーションAPIのモック
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: {
            '表面利回り（%）': 5.5,
            '実質利回り（%）': 4.2,
            'IRR（%）': 8.3
          },
          cash_flow_table: []
        })
      });

    const { result } = renderHook(() => useApiCall());

    // 初期化を待つ
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/auth/token',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    // シミュレーション実行
    const simulationResult = await result.current.executeSimulation({
      propertyName: 'テスト物件',
      purchasePrice: 10000,
      monthlyRent: 100000,
      loanAmount: 8000
    });

    // APIが認証ヘッダー付きで呼ばれたことを確認
    expect(fetch).toHaveBeenLastCalledWith(
      'https://test-api.example.com/api/simulate',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer api-token-123',
          'Content-Type': 'application/json'
        })
      })
    );

    expect(simulationResult.results['表面利回り（%）']).toBe(5.5);
  });

  it('トークンが期限切れの場合は再取得すること', async () => {
    // 期限切れトークンをセット
    const expiredToken = {
      access_token: 'expired-token',
      token_type: 'bearer',
      expires_in: -3600 // 既に期限切れ
    };
    await apiAuth.saveToken(expiredToken);

    // 新しいトークン取得のモック
    (fetch as Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-token-456',
          token_type: 'bearer',
          expires_in: 3600
        })
      })
      // シミュレーションAPIのモック
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: { '表面利回り（%）': 5.5 },
          cash_flow_table: []
        })
      });

    const { result } = renderHook(() => useApiCall());

    await result.current.executeSimulation({
      propertyName: 'テスト物件',
      purchasePrice: 10000,
      monthlyRent: 100000,
      loanAmount: 8000
    });

    // 新しいトークンでAPIが呼ばれたことを確認
    expect(fetch).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer new-token-456'
        })
      })
    );
  });

  it('401エラーの場合はトークンをクリアしてエラーを投げること', async () => {
    // 有効なトークンをセット
    await apiAuth.saveToken({
      access_token: 'valid-token',
      token_type: 'bearer',
      expires_in: 3600
    });

    // 401エラーを返すモック
    (fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized'
    });

    const { result } = renderHook(() => useApiCall());

    await expect(
      result.current.executeSimulation({
        propertyName: 'テスト物件',
        purchasePrice: 10000,
        monthlyRent: 100000,
        loanAmount: 8000
      })
    ).rejects.toThrow('Authentication required');

    // トークンがクリアされたことを確認
    expect(SecureStorage.removeItem).toHaveBeenCalledWith('api_access_token');
  });

  it('ネットワークエラーの場合は適切なエラーメッセージを返すこと', async () => {
    // 有効なトークンをセット
    await apiAuth.saveToken({
      access_token: 'valid-token',
      token_type: 'bearer',
      expires_in: 3600
    });

    // ネットワークエラーをシミュレート
    (fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useApiCall());

    await expect(
      result.current.executeSimulation({
        propertyName: 'テスト物件',
        purchasePrice: 10000,
        monthlyRent: 100000,
        loanAmount: 8000
      })
    ).rejects.toThrow('Network error');
  });
});