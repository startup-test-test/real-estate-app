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

describe('BUG_012: 建築年の範囲チェック', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('BOUNDARY_001: 建築年が5年以上未来の場合エラーメッセージが表示される', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    const currentYear = new Date().getFullYear();
    const futureYear = currentYear + 6; // 6年後（制限を超える）

    // 建築年入力フィールドを取得
    const yearBuiltInput = screen.getByPlaceholderText('2020') as HTMLInputElement;
    
    // 6年後の年を入力
    fireEvent.change(yearBuiltInput, { target: { value: futureYear.toString() } });
    
    // 必須項目を最小限入力
    const propertyNameInput = screen.getByPlaceholderText('例：カーサ○○マンション');
    const locationInput = screen.getByPlaceholderText('例：東京都渋谷区神宮前1-1-1');
    const purchasePriceInput = screen.getByPlaceholderText('12000');
    const monthlyRentInput = screen.getByPlaceholderText('例：180000');
    
    fireEvent.change(propertyNameInput, { target: { value: 'テスト物件' } });
    fireEvent.change(locationInput, { target: { value: 'テスト地域' } });
    fireEvent.change(purchasePriceInput, { target: { value: '5000' } });
    fireEvent.change(monthlyRentInput, { target: { value: '200000' } });
    
    // シミュレーション実行
    const buttons = screen.getAllByRole('button');
    const simulateButton = buttons.find(btn => btn.textContent?.includes('シミュレーション実行'));
    
    if (simulateButton) {
      fireEvent.click(simulateButton);
    }

    // エラーメッセージを確認（5年先までなので、currentYear + 5まで許可）
    await waitFor(() => {
      expect(screen.getByText(new RegExp(`建築年は1900年から${currentYear + 5}年の間で入力してください`))).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('建設予定物件（3年後）の入力は正常に受け付けられる', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    const currentYear = new Date().getFullYear();
    const futureYear = currentYear + 3; // 3年後（許可範囲内）

    // 建築年入力フィールドを取得
    const yearBuiltInput = screen.getByPlaceholderText('2020') as HTMLInputElement;
    
    // 3年後の年を入力
    fireEvent.change(yearBuiltInput, { target: { value: futureYear.toString() } });
    
    // 値が正しく設定されていることを確認
    expect(yearBuiltInput.value).toBe(futureYear.toString());
    
    // 「建設予定」の表示を確認
    await waitFor(() => {
      expect(screen.getByText(new RegExp(`建設予定.*${futureYear}年完成予定`))).toBeInTheDocument();
    });
  });

  it('現在年の入力は正常に受け付けられる', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    const currentYear = new Date().getFullYear();

    // 建築年入力フィールドを取得
    const yearBuiltInput = screen.getByPlaceholderText('2020') as HTMLInputElement;
    
    // 現在年を入力
    fireEvent.change(yearBuiltInput, { target: { value: currentYear.toString() } });
    
    // 値が正しく設定されていることを確認
    expect(yearBuiltInput.value).toBe(currentYear.toString());
  });

  it('1900年より前の年はエラーになる', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    const currentYear = new Date().getFullYear();

    // 建築年入力フィールドを取得
    const yearBuiltInput = screen.getByPlaceholderText('2020') as HTMLInputElement;
    
    // 1899年を入力
    fireEvent.change(yearBuiltInput, { target: { value: '1899' } });
    
    // 必須項目を最小限入力
    const propertyNameInput = screen.getByPlaceholderText('例：カーサ○○マンション');
    const locationInput = screen.getByPlaceholderText('例：東京都渋谷区神宮前1-1-1');
    const purchasePriceInput = screen.getByPlaceholderText('12000');
    const monthlyRentInput = screen.getByPlaceholderText('例：180000');
    
    fireEvent.change(propertyNameInput, { target: { value: 'テスト物件' } });
    fireEvent.change(locationInput, { target: { value: 'テスト地域' } });
    fireEvent.change(purchasePriceInput, { target: { value: '5000' } });
    fireEvent.change(monthlyRentInput, { target: { value: '200000' } });
    
    // シミュレーション実行
    const buttons = screen.getAllByRole('button');
    const simulateButton = buttons.find(btn => btn.textContent?.includes('シミュレーション実行'));
    
    if (simulateButton) {
      fireEvent.click(simulateButton);
    }

    // エラーメッセージを確認（5年先までなので、currentYear + 5まで許可）
    await waitFor(() => {
      expect(screen.getByText(new RegExp(`建築年は1900年から${currentYear + 5}年の間で入力してください`))).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});