import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Simulator from '../pages/Simulator';
import { AuthProvider } from '../components/AuthProvider';
import React from 'react';

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

describe('BUG_009: 上限値チェック全般', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ERROR_003: 極端な値入力時にエラーメッセージが表示される', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    // 入力フィールドを探す
    const purchasePriceInput = screen.getByPlaceholderText('12000');
    const monthlyRentInput = screen.getByPlaceholderText('例：180000');
    
    // 極端な値を入力
    fireEvent.change(purchasePriceInput, { target: { value: '999999999' } }); // 999999999万円
    fireEvent.change(monthlyRentInput, { target: { value: '99999999' } }); // 99999999円
    
    // シミュレーション実行ボタンをクリック
    const buttons = screen.getAllByRole('button');
    const simulateButton = buttons.find(btn => btn.textContent?.includes('シミュレーション実行'));
    
    if (simulateButton) {
      fireEvent.click(simulateButton);
    }

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      const errorMessages = screen.getAllByText(/以下で入力してください/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('物件価格の上限値チェック（最大100億円）', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    const purchasePriceInput = screen.getByPlaceholderText('12000');
    
    // 100億円を超える値を入力
    fireEvent.change(purchasePriceInput, { target: { value: '1000001' } }); // 1000001万円
    
    // 必須項目を最小限入力
    const propertyNameInput = screen.getByPlaceholderText('例：カーサ○○マンション');
    const locationInput = screen.getByPlaceholderText('例：東京都渋谷区');
    const yearBuiltInput = screen.getByPlaceholderText('2020');
    const monthlyRentInput = screen.getByPlaceholderText('例：180000');
    
    fireEvent.change(propertyNameInput, { target: { value: 'テスト物件' } });
    fireEvent.change(locationInput, { target: { value: 'テスト地域' } });
    fireEvent.change(yearBuiltInput, { target: { value: '2020' } });
    fireEvent.change(monthlyRentInput, { target: { value: '100000' } });
    
    // シミュレーション実行
    const buttons = screen.getAllByRole('button');
    const simulateButton = buttons.find(btn => btn.textContent?.includes('シミュレーション実行'));
    
    if (simulateButton) {
      fireEvent.click(simulateButton);
    }

    // エラーメッセージを確認
    await waitFor(() => {
      expect(screen.getByText(/物件価格は100億円.*以下で入力してください/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('借入期間の上限値チェック（最大50年）', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    // 借入期間入力フィールドを探す（プレースホルダーから）
    const loanYearsInput = screen.getByPlaceholderText('35');
    
    // 50年を超える値を入力
    fireEvent.change(loanYearsInput, { target: { value: '100' } });
    
    // 必須項目を最小限入力
    const propertyNameInput = screen.getByPlaceholderText('例：カーサ○○マンション');
    const locationInput = screen.getByPlaceholderText('例：東京都渋谷区');
    const yearBuiltInput = screen.getByPlaceholderText('2020');
    const purchasePriceInput = screen.getByPlaceholderText('12000');
    const monthlyRentInput = screen.getByPlaceholderText('例：180000');
    
    fireEvent.change(propertyNameInput, { target: { value: 'テスト物件' } });
    fireEvent.change(locationInput, { target: { value: 'テスト地域' } });
    fireEvent.change(yearBuiltInput, { target: { value: '2020' } });
    fireEvent.change(purchasePriceInput, { target: { value: '5000' } });
    fireEvent.change(monthlyRentInput, { target: { value: '200000' } });
    
    // シミュレーション実行
    const buttons = screen.getAllByRole('button');
    const simulateButton = buttons.find(btn => btn.textContent?.includes('シミュレーション実行'));
    
    if (simulateButton) {
      fireEvent.click(simulateButton);
    }

    // エラーメッセージを確認
    await waitFor(() => {
      expect(screen.getByText(/借入期間は50年以下で入力してください/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});