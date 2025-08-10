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

describe('BUG_010: 必須項目チェック', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ERROR_004: 必須項目が空欄の場合、エラーメッセージが表示される', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    // シミュレーション実行ボタンを探す
    const submitButton = await screen.findByText('シミュレーション実行');
    
    // 必須項目を空のままシミュレーション実行
    fireEvent.click(submitButton);

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      // 必須項目のエラーメッセージを確認
      expect(screen.getByText(/物件名を入力してください/i)).toBeInTheDocument();
      expect(screen.getByText(/所在地を入力してください/i)).toBeInTheDocument();
      expect(screen.getByText(/建築年を入力してください/i)).toBeInTheDocument();
      expect(screen.getByText(/物件価格を入力してください/i)).toBeInTheDocument();
      expect(screen.getByText(/月額賃料を入力してください/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('必須項目を入力後はエラーが消える', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    // 必要な入力フィールドを取得
    const propertyNameInput = screen.getByLabelText(/物件名/i);
    const locationInput = screen.getByLabelText(/所在地/i);
    const yearBuiltInput = screen.getByLabelText(/建築年/i);
    const purchasePriceInput = screen.getByLabelText(/物件価格/i);
    const monthlyRentInput = screen.getByLabelText(/月額賃料/i);

    // まずエラーを発生させる
    const submitButton = await screen.findByText('シミュレーション実行');
    fireEvent.click(submitButton);

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(/物件名を入力してください/i)).toBeInTheDocument();
    });

    // 必須項目を入力
    fireEvent.change(propertyNameInput, { target: { value: 'テストマンション' } });
    fireEvent.change(locationInput, { target: { value: '東京都渋谷区' } });
    fireEvent.change(yearBuiltInput, { target: { value: '2020' } });
    fireEvent.change(purchasePriceInput, { target: { value: '5000' } });
    fireEvent.change(monthlyRentInput, { target: { value: '200000' } });

    // 再度シミュレーション実行
    fireEvent.click(submitButton);

    // エラーメッセージが消えることを確認
    await waitFor(() => {
      expect(screen.queryByText(/物件名を入力してください/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/所在地を入力してください/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/建築年を入力してください/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/物件価格を入力してください/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/月額賃料を入力してください/i)).not.toBeInTheDocument();
    });
  });
});