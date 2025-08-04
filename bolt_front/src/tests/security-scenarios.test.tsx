import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Simulator from '../pages/Simulator';
import Dashboard from '../pages/Dashboard';
import { AuthProvider } from '../components/AuthProvider';

// モックの設定
vi.mock('../hooks/useSupabaseData', () => ({
  useSupabaseData: () => ({
    saveSimulation: vi.fn().mockResolvedValue({ error: null }),
    getSimulations: vi.fn().mockResolvedValue({ data: [], error: null }),
    deleteSimulation: vi.fn().mockResolvedValue({ error: null })
  })
}));

vi.mock('../components/AuthProvider', async () => {
  const actual = await vi.importActual('../components/AuthProvider');
  return {
    ...actual,
    useAuthContext: () => ({
      user: { id: 'test-user', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false
    })
  };
});

// グローバルfetchのモック
global.fetch = vi.fn();

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('セキュリティシナリオテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // window.alert のモック
    window.alert = vi.fn();
    // fetchのデフォルトレスポンス
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: {
          '総収益': 10000000,
          '総費用': 8000000,
          '純利益': 2000000,
          'ROI': 25,
          'IRR': 8.5,
          'NPV': 1500000
        },
        cash_flow_table: []
      })
    });
  });

  describe('S-001: XSS攻撃シナリオ', () => {
    it('物件名にスクリプトタグを入力してもサニタイズされる', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Simulator />);

      // 物件名フィールドを探す
      const propertyNameInput = screen.getByPlaceholderText('例：カーサ○○マンション');
      
      // XSSペイロードを入力
      await user.clear(propertyNameInput);
      await user.type(propertyNameInput, '<script>alert("XSS")</script>テストマンション');

      // 他の必須フィールドも入力（placeholder でフィールドを探す）
      const locationInput = screen.getByPlaceholderText('例：東京都渋谷区1-1-1');
      await user.type(locationInput, '東京都渋谷区');
      
      const purchasePriceInput = screen.getByPlaceholderText('例：5000');
      await user.type(purchasePriceInput, '5000');
      
      const monthlyRentInput = screen.getByPlaceholderText('例：300000');
      await user.type(monthlyRentInput, '300000');

      // シミュレーション実行
      const simulateButton = screen.getByText('シミュレーション開始');
      await user.click(simulateButton);

      // エラーメッセージを確認
      await waitFor(() => {
        expect(screen.getByText(/HTMLタグは使用できません/)).toBeInTheDocument();
      });

      // alertが実行されていないことを確認
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('物件URLに危険なプロトコルを入力してもブロックされる', async () => {
      renderWithRouter(<Dashboard />);

      // ダッシュボードに危険なURLを含むデータを表示させる
      const mockData = [{
        id: '1',
        simulation_data: {
          propertyName: 'テスト物件',
          propertyUrl: 'javascript:alert("XSS")',
          location: '東京都',
          purchasePrice: 5000
        },
        results: {}
      }];

      // getSimulationsをモック
      const { useSupabaseData } = await import('../hooks/useSupabaseData');
      (useSupabaseData as any).mockReturnValue({
        getSimulations: vi.fn().mockResolvedValue({ data: mockData, error: null })
      });

      // 再レンダリング
      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        // 危険なURLがサニタイズされていることを確認
        const links = screen.queryAllByRole('link');
        links.forEach(link => {
          expect(link.getAttribute('href')).not.toContain('javascript:');
        });
      });
    });
  });

  describe('S-002/S-003: 入力値検証シナリオ', () => {
    it('境界値を超えた入力でエラーが表示される', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Simulator />);

      // 物件価格に上限を超える値を入力
      const purchasePriceInput = screen.getByPlaceholderText('例：5000');
      await user.clear(purchasePriceInput);
      await user.type(purchasePriceInput, '999999'); // 上限: 100000万円

      // シミュレーション実行
      const simulateButton = screen.getByText('シミュレーション開始');
      await user.click(simulateButton);

      // エラーメッセージを確認
      await waitFor(() => {
        expect(screen.getByText(/100000万円以下で入力してください/)).toBeInTheDocument();
      });
    });

    it('必須項目が空の場合にエラーが表示される', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Simulator />);

      // 何も入力せずにシミュレーション実行
      const simulateButton = screen.getByText('シミュレーション開始');
      await user.click(simulateButton);

      // 複数のエラーメッセージを確認
      await waitFor(() => {
        expect(screen.getByText(/物件名を入力してください/)).toBeInTheDocument();
        expect(screen.getByText(/所在地を入力してください/)).toBeInTheDocument();
        expect(screen.getByText(/物件価格を入力してください/)).toBeInTheDocument();
        expect(screen.getByText(/月額賃料を入力してください/)).toBeInTheDocument();
      });
    });

    it('文字列フィールドに長すぎるテキストを入力するとエラーになる', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Simulator />);

      // 101文字以上の物件名を生成
      const longPropertyName = 'あ'.repeat(101);
      
      const propertyNameInput = screen.getByPlaceholderText('例：カーサ○○マンション');
      await user.clear(propertyNameInput);
      await user.type(propertyNameInput, longPropertyName);

      // シミュレーション実行
      const simulateButton = screen.getByText('シミュレーション開始');
      await user.click(simulateButton);

      // エラーメッセージを確認
      await waitFor(() => {
        expect(screen.getByText(/100文字以下で入力してください/)).toBeInTheDocument();
      });
    });

    it('サーバーサイドでバリデーションエラーが発生した場合の処理', async () => {
      const user = userEvent.setup();
      
      // バックエンドが400エラーを返すようにモック
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: '入力値にエラーがあります',
          details: ['property_nameは必須項目です', 'locationは必須項目です']
        })
      });

      renderWithRouter(<Simulator />);

      // 必須フィールドを入力（フロントエンドのバリデーションは通過）
      const propertyNameInput = screen.getByPlaceholderText('例：カーサ○○マンション');
      await user.type(propertyNameInput, 'テスト物件');
      
      const locationInput = screen.getByPlaceholderText('例：東京都渋谷区1-1-1');
      await user.type(locationInput, '東京都');
      
      const purchasePriceInput = screen.getByPlaceholderText('例：5000');
      await user.type(purchasePriceInput, '5000');
      
      const monthlyRentInput = screen.getByPlaceholderText('例：300000');
      await user.type(monthlyRentInput, '300000');

      // シミュレーション実行
      const simulateButton = screen.getByText('シミュレーション開始');
      await user.click(simulateButton);

      // サーバーエラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText(/物件名は必須項目です/)).toBeInTheDocument();
      });
    });
  });

  describe('S-004: エラーハンドリングシナリオ', () => {
    it('ネットワークエラー時にユーザーフレンドリーなメッセージが表示される', async () => {
      const user = userEvent.setup();
      
      // ネットワークエラーをシミュレート
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      renderWithRouter(<Simulator />);

      // 必須フィールドを入力
      const propertyNameInput = screen.getByPlaceholderText('例：カーサ○○マンション');
      await user.type(propertyNameInput, 'テスト物件');
      
      const locationInput = screen.getByPlaceholderText('例：東京都渋谷区1-1-1');
      await user.type(locationInput, '東京都');
      
      const purchasePriceInput = screen.getByPlaceholderText('例：5000');
      await user.type(purchasePriceInput, '5000');
      
      const monthlyRentInput = screen.getByPlaceholderText('例：300000');
      await user.type(monthlyRentInput, '300000');

      // シミュレーション実行
      const simulateButton = screen.getByText('シミュレーション開始');
      await user.click(simulateButton);

      // ユーザーフレンドリーなエラーメッセージ
      await waitFor(() => {
        expect(screen.getByText(/ネットワーク接続に問題があります/)).toBeInTheDocument();
      });

      // 技術的な詳細が表示されていないことを確認
      expect(screen.queryByText(/Network error/)).not.toBeInTheDocument();
    });

    it('サーバーエラー（500）時に適切なメッセージが表示される', async () => {
      const user = userEvent.setup();
      
      // サーバーエラーをシミュレート
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      renderWithRouter(<Simulator />);

      // 必須フィールドを入力
      const propertyNameInput = screen.getByPlaceholderText('例：カーサ○○マンション');
      await user.type(propertyNameInput, 'テスト物件');
      
      const locationInput = screen.getByPlaceholderText('例：東京都渋谷区1-1-1');
      await user.type(locationInput, '東京都');
      
      const purchasePriceInput = screen.getByPlaceholderText('例：5000');
      await user.type(purchasePriceInput, '5000');
      
      const monthlyRentInput = screen.getByPlaceholderText('例：300000');
      await user.type(monthlyRentInput, '300000');

      // シミュレーション実行
      const simulateButton = screen.getByText('シミュレーション開始');
      await user.click(simulateButton);

      // ユーザーフレンドリーなエラーメッセージ
      await waitFor(() => {
        expect(screen.getByText(/サーバーエラーが発生しました/)).toBeInTheDocument();
      });
    });

    it('エラー時に再試行ボタンが表示され、動作する', async () => {
      const user = userEvent.setup();
      
      // 初回はエラー、再試行で成功するようにモック
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: {
              '総収益': 10000000,
              '総費用': 8000000,
              '純利益': 2000000,
              'ROI': 25,
              'IRR': 8.5,
              'NPV': 1500000
            },
            cash_flow_table: []
          })
        });

      renderWithRouter(<Simulator />);

      // 必須フィールドを入力
      const propertyNameInput = screen.getByPlaceholderText('例：カーサ○○マンション');
      await user.type(propertyNameInput, 'テスト物件');
      
      const locationInput = screen.getByPlaceholderText('例：東京都渋谷区1-1-1');
      await user.type(locationInput, '東京都');
      
      const purchasePriceInput = screen.getByPlaceholderText('例：5000');
      await user.type(purchasePriceInput, '5000');
      
      const monthlyRentInput = screen.getByPlaceholderText('例：300000');
      await user.type(monthlyRentInput, '300000');

      // シミュレーション実行（エラー発生）
      const simulateButton = screen.getByText('シミュレーション開始');
      await user.click(simulateButton);

      // エラーメッセージと再試行ボタンを確認
      await waitFor(() => {
        expect(screen.getByText(/ネットワーク接続に問題があります/)).toBeInTheDocument();
        expect(screen.getByText('再試行')).toBeInTheDocument();
      });

      // 再試行ボタンをクリック
      const retryButton = screen.getByText('再試行');
      await user.click(retryButton);

      // 成功メッセージまたは結果が表示される
      await waitFor(() => {
        expect(screen.queryByText(/ネットワーク接続に問題があります/)).not.toBeInTheDocument();
        // 結果が表示されることを確認（ROIなど）
        expect(screen.getByText(/ROI/)).toBeInTheDocument();
      });
    });
  });

  describe('統合シナリオ: 完全なユーザーフロー', () => {
    it('悪意のある入力を含む完全なシミュレーションフロー', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Simulator />);

      // 各フィールドに悪意のある入力を試みる
      const propertyNameInput = screen.getByPlaceholderText('例：カーサ○○マンション');
      await user.type(propertyNameInput, '<img src=x onerror=alert("XSS")>悪意のある物件');
      
      const locationInput = screen.getByPlaceholderText('例：東京都渋谷区1-1-1');
      await user.type(locationInput, '<script>alert("location")</script>東京都');
      
      // メモ欄にもXSSペイロードを入力
      const memoTextarea = screen.getByPlaceholderText(/物件に関するメモ/);
      await user.type(memoTextarea, 'onclick="alert(\'memo\')"');

      // URL欄に危険なプロトコル
      const urlInput = screen.getByPlaceholderText(/https:\/\/example.com/);
      await user.type(urlInput, 'javascript:void(0)');

      // シミュレーション実行
      const simulateButton = screen.getByText('シミュレーション開始');
      await user.click(simulateButton);

      // 複数のバリデーションエラーが表示される
      await waitFor(() => {
        expect(screen.getAllByText(/HTMLタグは使用できません/).length).toBeGreaterThan(0);
        expect(screen.getByText(/許可されていないプロトコルです/)).toBeInTheDocument();
      });

      // XSSが実行されていないことを確認
      expect(window.alert).not.toHaveBeenCalled();
    });
  });
});