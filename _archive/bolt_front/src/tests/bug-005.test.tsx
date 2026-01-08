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

describe('BUG_005: 管理手数料％入力', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('管理費フィールドにパーセント入力ができる', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    // まず月額賃料を設定
    const monthlyRentInput = screen.getByPlaceholderText('250000') as HTMLInputElement;
    fireEvent.change(monthlyRentInput, { target: { value: '250000' } });
    expect(monthlyRentInput.value).toBe('250000');

    // 管理費フィールドを取得
    const managementFeeInput = screen.getByPlaceholderText('12500円 または 5%') as HTMLInputElement;
    
    // パーセント入力をテスト
    fireEvent.change(managementFeeInput, { target: { value: '5%' } });
    
    // 250000円の5% = 12500円が計算されることを期待
    await waitFor(() => {
      expect(managementFeeInput.value).toBe('12500');
    });
  });

  it('全角パーセント記号も処理できる', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    // 月額賃料を設定
    const monthlyRentInput = screen.getByPlaceholderText('250000') as HTMLInputElement;
    fireEvent.change(monthlyRentInput, { target: { value: '200000' } });

    // 管理費フィールド
    const managementFeeInput = screen.getByPlaceholderText('12500円 または 5%') as HTMLInputElement;
    
    // 全角パーセント入力
    fireEvent.change(managementFeeInput, { target: { value: '３％' } });
    
    // 200000円の3% = 6000円
    await waitFor(() => {
      expect(managementFeeInput.value).toBe('6000');
    });
  });

  it('小数点を含むパーセント入力も処理できる', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    // 月額賃料を設定
    const monthlyRentInput = screen.getByPlaceholderText('250000') as HTMLInputElement;
    fireEvent.change(monthlyRentInput, { target: { value: '300000' } });

    // 管理費フィールド
    const managementFeeInput = screen.getByPlaceholderText('12500円 または 5%') as HTMLInputElement;
    
    // 小数点パーセント入力
    fireEvent.change(managementFeeInput, { target: { value: '4.5%' } });
    
    // 300000円の4.5% = 13500円
    await waitFor(() => {
      expect(managementFeeInput.value).toBe('13500');
    });
  });

  it('通常の円単位入力も引き続き動作する', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    const managementFeeInput = screen.getByPlaceholderText('12500円 または 5%') as HTMLInputElement;
    
    // 通常の円単位入力
    fireEvent.change(managementFeeInput, { target: { value: '15000' } });
    expect(managementFeeInput.value).toBe('15000');
  });

  it('月額賃料が未入力の場合はパーセント計算されない', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    const managementFeeInput = screen.getByPlaceholderText('12500円 または 5%') as HTMLInputElement;
    
    // 月額賃料が未入力の状態でパーセント入力
    fireEvent.change(managementFeeInput, { target: { value: '5%' } });
    
    // パーセント入力が無視されて空のままになることを確認
    expect(managementFeeInput.value).toBe('');
  });

  it('プレースホルダーに使用方法が表示される', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Simulator />
        </AuthProvider>
      </BrowserRouter>
    );

    const managementFeeInput = screen.getByPlaceholderText('12500円 または 5%');
    expect(managementFeeInput).toBeInTheDocument();
    
    // ヘルプテキストの存在を確認
    const helpText = screen.getByText('※「5%」のように入力すると月額賃料から自動計算されます');
    expect(helpText).toBeInTheDocument();
  });
});