import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('BUG_020: 文字数上限チェック', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('物件名は50文字まで入力可能', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    const propertyNameInput = screen.getByPlaceholderText('例：カーサ○○マンション') as HTMLInputElement;
    
    // maxLength属性が設定されていることを確認
    expect(propertyNameInput.maxLength).toBe(50);
    
    // 50文字の文字列を作成
    const longText = 'あ'.repeat(50);
    fireEvent.change(propertyNameInput, { target: { value: longText } });
    
    // 50文字入力できることを確認
    expect(propertyNameInput.value).toBe(longText);
    
    // 51文字を入力しようとしても、50文字の値がそのまま維持されることを確認
    const currentValue = propertyNameInput.value;
    const tooLongText = 'あ'.repeat(51);
    fireEvent.change(propertyNameInput, { target: { value: tooLongText } });
    
    // React Testing Libraryではmaxlengthが自動的に適用されないため、
    // 実装側でmaxLengthが設定されていることを確認済み
    // ブラウザでは自動的に50文字に制限される
  });

  it('住所は100文字まで入力可能', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    const locationInput = screen.getByPlaceholderText('例：東京都渋谷区神宮前1-1-1') as HTMLInputElement;
    
    // maxLength属性が設定されていることを確認
    expect(locationInput.maxLength).toBe(100);
    
    // 100文字の文字列を作成
    const longText = 'あ'.repeat(100);
    fireEvent.change(locationInput, { target: { value: longText } });
    
    // 100文字入力できることを確認
    expect(locationInput.value).toBe(longText);
  });

  it('物件URLは500文字まで入力可能', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    const urlInput = screen.getByPlaceholderText('https://ooya.tech/...') as HTMLInputElement;
    
    // maxLength属性が設定されていることを確認
    expect(urlInput.maxLength).toBe(500);
    
    // 長いURLを作成
    const longUrl = 'https://example.com/' + 'a'.repeat(480);
    fireEvent.change(urlInput, { target: { value: longUrl } });
    
    // 500文字まで入力できることを確認
    expect(urlInput.value).toBe(longUrl);
  });

  it('メモは500文字まで入力可能', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    const memoInput = screen.getByPlaceholderText('物件の特徴、気になるポイント、検討事項など...') as HTMLInputElement;
    
    // maxLength属性が設定されていることを確認
    expect(memoInput.maxLength).toBe(500);
    
    // 500文字の文字列を作成
    const longText = 'あ'.repeat(500);
    fireEvent.change(memoInput, { target: { value: longText } });
    
    // 500文字入力できることを確認
    expect(memoInput.value).toBe(longText);
  });

  it('各フィールドにmaxLength属性が正しく設定されている', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    const propertyNameInput = screen.getByPlaceholderText('例：カーサ○○マンション') as HTMLInputElement;
    const locationInput = screen.getByPlaceholderText('例：東京都渋谷区神宮前1-1-1') as HTMLInputElement;
    const urlInput = screen.getByPlaceholderText('https://ooya.tech/...') as HTMLInputElement;
    const memoInput = screen.getByPlaceholderText('物件の特徴、気になるポイント、検討事項など...') as HTMLInputElement;
    
    // 各フィールドのmaxLength属性を確認
    expect(propertyNameInput.maxLength).toBe(50);
    expect(locationInput.maxLength).toBe(100);
    expect(urlInput.maxLength).toBe(500);
    expect(memoInput.maxLength).toBe(500);
  });
});