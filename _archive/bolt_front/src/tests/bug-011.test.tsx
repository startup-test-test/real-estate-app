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

describe('BUG_011: 全角数字変換', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('全角数字が半角に自動変換される', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    // 物件価格入力フィールドを取得
    const purchasePriceInput = screen.getByPlaceholderText('12000') as HTMLInputElement;
    
    // 全角数字を入力
    fireEvent.change(purchasePriceInput, { target: { value: '１２３４５' } });
    
    // 値が半角に変換されていることを確認
    await waitFor(() => {
      expect(purchasePriceInput.value).toBe('12345');
    });
  });

  it('全角数字とカンマが混在した入力も処理される', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    // 物件価格入力フィールドを取得
    const purchasePriceInput = screen.getByPlaceholderText('12000') as HTMLInputElement;
    
    // 全角数字とカンマを入力
    fireEvent.change(purchasePriceInput, { target: { value: '１，２３４，５６７' } });
    
    // カンマが除去され、半角に変換されていることを確認
    await waitFor(() => {
      expect(purchasePriceInput.value).toBe('1234567');
    });
  });

  it('全角ピリオドも半角に変換される', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    // 金利入力フィールドを取得（小数点を含む可能性のあるフィールド）
    const inputs = screen.getAllByRole('spinbutton');
    const interestRateInput = inputs.find(input => 
      input.getAttribute('placeholder') === '2.5' || 
      input.getAttribute('data-field') === 'interestRate'
    ) as HTMLInputElement;
    
    if (interestRateInput) {
      // 全角ピリオドを含む数字を入力
      fireEvent.change(interestRateInput, { target: { value: '２．５' } });
      
      // 半角に変換されていることを確認
      await waitFor(() => {
        expect(interestRateInput.value).toBe('2.5');
      });
    }
  });

  it('通常の半角数字はそのまま処理される', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    // 物件価格入力フィールドを取得
    const purchasePriceInput = screen.getByPlaceholderText('12000') as HTMLInputElement;
    
    // 半角数字を入力
    fireEvent.change(purchasePriceInput, { target: { value: '5000' } });
    
    // 値がそのまま設定されていることを確認
    await waitFor(() => {
      expect(purchasePriceInput.value).toBe('5000');
    });
  });
});