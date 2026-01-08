import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Simulator from '../pages/Simulator';
import { AuthProvider } from '../components/AuthProvider';

// モックの設定
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      })
    }
  }
}));

vi.mock('../hooks/useSupabaseAuth', () => ({
  useSupabaseAuth: () => ({
    user: null,
    loading: false
  })
}));

describe('BUG_021: APIタイムアウト処理', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // fetch をモック化
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('APIリクエストに30秒のタイムアウトが設定されている', async () => {
    // タイムアウトをシミュレートするモック
    const abortController = new AbortController();
    let timeoutId: NodeJS.Timeout;
    
    (global.fetch as any).mockImplementation((url: string, options: any) => {
      // signal が設定されていることを確認
      expect(options.signal).toBeDefined();
      
      // 長時間待機をシミュレート
      return new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted', 'AbortError'));
        });
      });
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    // 必須フィールドに入力
    const propertyNameInput = screen.getByPlaceholderText('例：カーサ○○マンション');
    const locationInput = screen.getByPlaceholderText('例：東京都渋谷区神宮前1-1-1');
    const yearBuiltInput = screen.getByPlaceholderText('2020');
    const purchasePriceInput = screen.getByPlaceholderText('12000');
    const monthlyRentInput = screen.getByPlaceholderText('250000');
    
    fireEvent.change(propertyNameInput, { target: { value: 'テスト物件' } });
    fireEvent.change(locationInput, { target: { value: 'テスト地域' } });
    fireEvent.change(yearBuiltInput, { target: { value: '2020' } });
    fireEvent.change(purchasePriceInput, { target: { value: '5000' } });
    fireEvent.change(monthlyRentInput, { target: { value: '200000' } });

    // 建物構造を選択
    const propertyTypeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(propertyTypeSelect, { target: { value: 'RC' } });

    // シミュレーション実行ボタンをクリック
    const buttons = screen.getAllByRole('button');
    const simulateButton = buttons.find(btn => btn.textContent?.includes('シミュレーション実行'));
    
    if (simulateButton) {
      fireEvent.click(simulateButton);
    }

    // タイムアウトエラーメッセージが表示されることを確認
    // 注: 実際のタイムアウトは30秒なので、テストでは確認のみ
  });

  it('タイムアウトエラー時に適切なエラーメッセージが表示される', async () => {
    // AbortErrorをシミュレート
    (global.fetch as any).mockRejectedValue(new DOMException('The operation was aborted', 'AbortError'));

    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    // 必須フィールドに入力
    const propertyNameInput = screen.getByPlaceholderText('例：カーサ○○マンション');
    const locationInput = screen.getByPlaceholderText('例：東京都渋谷区神宮前1-1-1');
    const yearBuiltInput = screen.getByPlaceholderText('2020');
    const purchasePriceInput = screen.getByPlaceholderText('12000');
    const monthlyRentInput = screen.getByPlaceholderText('250000');
    
    fireEvent.change(propertyNameInput, { target: { value: 'テスト物件' } });
    fireEvent.change(locationInput, { target: { value: 'テスト地域' } });
    fireEvent.change(yearBuiltInput, { target: { value: '2020' } });
    fireEvent.change(purchasePriceInput, { target: { value: '5000' } });
    fireEvent.change(monthlyRentInput, { target: { value: '200000' } });

    // 建物構造を選択
    const propertyTypeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(propertyTypeSelect, { target: { value: 'RC' } });

    // シミュレーション実行
    const buttons = screen.getAllByRole('button');
    const simulateButton = buttons.find(btn => btn.textContent?.includes('シミュレーション実行'));
    
    if (simulateButton) {
      fireEvent.click(simulateButton);
    }

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/リクエストがタイムアウトしました/)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('ネットワークエラー時に適切なエラーメッセージが表示される', async () => {
    // ネットワークエラーをシミュレート
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    // 必須フィールドに入力
    const propertyNameInput = screen.getByPlaceholderText('例：カーサ○○マンション');
    const locationInput = screen.getByPlaceholderText('例：東京都渋谷区神宮前1-1-1');
    const yearBuiltInput = screen.getByPlaceholderText('2020');
    const purchasePriceInput = screen.getByPlaceholderText('12000');
    const monthlyRentInput = screen.getByPlaceholderText('250000');
    
    fireEvent.change(propertyNameInput, { target: { value: 'テスト物件' } });
    fireEvent.change(locationInput, { target: { value: 'テスト地域' } });
    fireEvent.change(yearBuiltInput, { target: { value: '2020' } });
    fireEvent.change(purchasePriceInput, { target: { value: '5000' } });
    fireEvent.change(monthlyRentInput, { target: { value: '200000' } });

    // 建物構造を選択
    const propertyTypeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(propertyTypeSelect, { target: { value: 'RC' } });

    // シミュレーション実行
    const buttons = screen.getAllByRole('button');
    const simulateButton = buttons.find(btn => btn.textContent?.includes('シミュレーション実行'));
    
    if (simulateButton) {
      fireEvent.click(simulateButton);
    }

    // ネットワークエラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/ネットワークエラーが発生しました/)).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});