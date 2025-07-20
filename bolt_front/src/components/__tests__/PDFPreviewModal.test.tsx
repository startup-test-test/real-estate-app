/**
 * SEC-045: innerHTML危険使用対策のテスト
 * SEC-063: document.write XSS対策のテスト
 * PDFPreviewModalの安全なDOM操作のテスト
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PDFPreviewModal from '../PDFPreviewModal';
import type { SimulationResult } from '../../types/simulation';

// jsPDFのモック
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    setFont: vi.fn(),
    rect: vi.fn(),
    line: vi.fn(),
    save: vi.fn(),
    output: vi.fn(() => 'mock-pdf-data-url')
  }))
}));

// window.openのモック
const mockPrintWindow = {
  document: {
    documentElement: {
      replaceWith: vi.fn(),
      innerHTML: ''
    },
    createElement: vi.fn((tagName: string) => {
      const element: any = {
        tagName,
        appendChild: vi.fn(),
        setAttribute: vi.fn(),
        style: {},
        cloneNode: vi.fn((_deep: boolean) => element),
        querySelectorAll: vi.fn(() => []),
        href: '',
        rel: '',
        media: '',
        innerHTML: '',
        className: ''
      };
      
      // styleタグ用の特別な処理
      if (tagName === 'style') {
        element.innerHTML = '';
      }
      
      return element;
    }),
    head: {
      appendChild: vi.fn()
    },
    body: {
      appendChild: vi.fn(),
      style: {}
    },
    title: ''
  },
  print: vi.fn(),
  close: vi.fn(),
  focus: vi.fn()
};

describe('PDFPreviewModal', () => {
  const mockOnClose = vi.fn();
  const mockOnDownloadPDF = vi.fn();
  
  const mockSimulation: SimulationResult = {
    id: 'test-id',
    property_id: 'test-property-id',
    simulation_name: 'テスト物件',
    user_id: 'test-user-id',
    created_at: new Date().toISOString(),
    input_data: {
      property_name: 'テストマンション',
      location: '東京都渋谷区',
      year_built: 2020,
      property_type: 'マンション',
      land_area: 100,
      building_area: 80,
      road_price: 50,
      purchase_price: 50000000,
      building_price: 30000000,
      other_costs: 500000,
      renovation_cost: 1000000,
      monthly_rent: 120000,
      management_fee: 10000,
      fixed_cost: 5000,
      property_tax: 200000,
      vacancy_rate: 5,
      rent_decline: 1,
      loan_type: '元利均等',
      loan_amount: 40000000,
      interest_rate: 1.5,
      loan_years: 35,
      holding_years: 10,
      exit_cap_rate: 5,
      market_value: 45000000,
      ownership_type: '個人',
      effective_tax_rate: 30,
      major_repair_cycle: 12,
      major_repair_cost: 1000000,
      building_price_for_depreciation: 25000000,
      depreciation_years: 47
    },
    result_data: {
      '表面利回り（%）': 8.5,
      '実質利回り（%）': 6.8,
      'IRR（%）': 15.2,
      'CCR（%）': 12.5,
      'ROI（%）': 15.2,
      'DSCR（返済余裕率）': 1.75,
      '月間キャッシュフロー（円）': 76667,
      '年間キャッシュフロー（円）': 920000,
      'NOI（円）': 1200000,
      'LTV（%）': 80,
      '想定売却価格（万円）': 4500,
      '残債（万円）': 3200,
      '売却コスト（万円）': 150,
      '売却益（万円）': 1150,
      '総投資額（円）': 10900000,
      '自己資金（円）': 10900000,
      '借入額（円）': 40000000,
      propertyName: 'テストマンション'
    },
    // SimulationResult固有のプロパティ
    property_price: 50000000,
    down_payment: 10000000,
    monthly_rent: 120000,
    irr: 15.2,
    ccr: 12.5,
    noi: 1200000,
    annual_cash_flow: 920000
  };
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    simulation: mockSimulation,
    onDownloadPDF: mockOnDownloadPDF
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // window.openのモック設定
    vi.spyOn(window, 'open').mockReturnValue(mockPrintWindow as any);
    
    // document.getElementByIdのモック
    const mockPrintContent = document.createElement('div');
    mockPrintContent.id = 'pdf-preview-content';
    mockPrintContent.cloneNode = vi.fn((_deep: boolean) => mockPrintContent);
    vi.spyOn(document, 'getElementById').mockReturnValue(mockPrintContent);
  });

  describe('レンダリング', () => {
    test('モーダルが正しくレンダリングされる', () => {
      render(<PDFPreviewModal {...defaultProps} />);

      expect(screen.getByText('PDF プレビュー')).toBeInTheDocument();
      expect(screen.getByText('PDF保存')).toBeInTheDocument();
      expect(screen.getByText('印刷')).toBeInTheDocument();
    });

    test('isOpenがfalseの場合は何も表示されない', () => {
      render(<PDFPreviewModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('物件詳細レポート')).not.toBeInTheDocument();
    });

    test('データが正しく表示される', () => {
      render(<PDFPreviewModal {...defaultProps} />);

      expect(screen.getByText('物件: テスト物件')).toBeInTheDocument();
    });
  });

  describe('SEC-045/SEC-063: 安全なDOM操作', () => {
    test('印刷時にdocument.writeを使用しない', async () => {
      render(<PDFPreviewModal {...defaultProps} />);
      
      const printButton = screen.getByText('印刷');
      fireEvent.click(printButton);

      await waitFor(() => {
        // window.openが呼ばれることを確認
        expect(window.open).toHaveBeenCalledWith('', '_blank', 'noopener,noreferrer');
      });

      // document.writeが呼ばれていないことを確認（mockに存在しないことで確認）
      expect((mockPrintWindow.document as any).write).toBeUndefined();
      
      // 安全なDOM操作メソッドが使用されていることを確認
      expect(mockPrintWindow.document.createElement).toHaveBeenCalled();
      expect(mockPrintWindow.document.documentElement.replaceWith).toHaveBeenCalled();
    });

    test('印刷時にinnerHTMLを使用しない', async () => {
      render(<PDFPreviewModal {...defaultProps} />);
      
      const printButton = screen.getByText('印刷');
      fireEvent.click(printButton);

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith('', '_blank', 'noopener,noreferrer');
      });

      // createElementで作成された要素にinnerHTMLが直接設定されないことを確認
      // （styleタグ以外にはinnerHTMLを使用しない）
      const createdElements = mockPrintWindow.document.createElement.mock.results;
      createdElements.forEach((result: any) => {
        if (result.value.tagName !== 'style') {
          expect(result.value.innerHTML).toBe('');
        }
      });
    });

    test('スタイルシートのリンクが安全に追加される', async () => {
      render(<PDFPreviewModal {...defaultProps} />);
      
      const printButton = screen.getByText('印刷');
      fireEvent.click(printButton);

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith('', '_blank', 'noopener,noreferrer');
      });

      // スタイルを追加するためにstyleタグが作成されることを確認
      expect(mockPrintWindow.document.createElement).toHaveBeenCalledWith('style');
      
      // head要素が作成されることを確認
      expect(mockPrintWindow.document.createElement).toHaveBeenCalledWith('head');
    });

    test('印刷ウィンドウのタイトルが安全に設定される', async () => {
      render(<PDFPreviewModal {...defaultProps} />);
      
      const printButton = screen.getByText('印刷');
      fireEvent.click(printButton);

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith('', '_blank', 'noopener,noreferrer');
      });

      // titleタグが作成されることを確認
      expect(mockPrintWindow.document.createElement).toHaveBeenCalledWith('title');
    });

    test('コンテンツがcloneNodeで安全にコピーされる', async () => {
      render(<PDFPreviewModal {...defaultProps} />);
      
      // DOM要素がcloneNodeメソッドを持つことを確認
      const contentElement = screen.getByTestId('pdf-content');
      expect(contentElement.cloneNode).toBeDefined();
      
      const printButton = screen.getByText('印刷');
      fireEvent.click(printButton);

      await waitFor(() => {
        expect(window.open).toHaveBeenCalledWith('', '_blank', 'noopener,noreferrer');
      });
      
      // printContainerが作成されることを確認
      expect(mockPrintWindow.document.createElement).toHaveBeenCalledWith('div');
      
      // getElementByIdで取得した要素のcloneNodeが呼ばれることを確認
      const getElementByIdMock = vi.mocked(document.getElementById);
      const mockPrintContent = getElementByIdMock.mock.results[0]?.value;
      expect(mockPrintContent?.cloneNode).toHaveBeenCalled();
    });
  });

  describe('PDFダウンロード機能', () => {
    test('PDFダウンロードボタンがクリックできる', async () => {
      render(<PDFPreviewModal {...defaultProps} />);
      
      const downloadButton = screen.getByText('PDF保存');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        // onDownloadPDFが呼ばれることを確認
        expect(mockOnDownloadPDF).toHaveBeenCalled();
      });
    });
  });

  describe('モーダル操作', () => {
    test('閉じるボタンでモーダルが閉じる', () => {
      render(<PDFPreviewModal {...defaultProps} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test('オーバーレイクリックでモーダルが閉じる', () => {
      render(<PDFPreviewModal {...defaultProps} />);
      
      // オーバーレイ要素を取得（data-testidを使用）
      const overlay = screen.getByTestId('modal-overlay');
      fireEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('エラーハンドリング', () => {
    test('印刷時のエラーが適切に処理される', async () => {
      // window.openがnullを返すようにモック
      vi.spyOn(window, 'open').mockReturnValue(null);
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<PDFPreviewModal {...defaultProps} />);
      
      const printButton = screen.getByText('印刷');
      fireEvent.click(printButton);

      // window.openがnullを返した場合、処理が中断されることを確認
      expect(window.open).toHaveBeenCalled();
      
      // document.getElementByIdが呼ばれないことを確認（処理が中断されるため）
      expect(document.getElementById).not.toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });
});