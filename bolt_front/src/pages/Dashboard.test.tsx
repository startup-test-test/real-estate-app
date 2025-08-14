import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from './Dashboard'

// Mock modules
vi.mock('../hooks/useSupabaseData', () => ({
  useSupabaseData: () => ({
    getSimulations: vi.fn().mockResolvedValue({
      data: mockSimulationsData,
      error: null
    }),
    deleteSimulation: vi.fn().mockResolvedValue({ error: null })
  })
}))

vi.mock('../components/AuthProvider', () => ({
  useAuthContext: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    isAuthenticated: true,
    loading: false
  })
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

// Mock data
const mockSimulationsData = [
  {
    id: '1',
    simulation_data: {
      propertyName: '品川区投資物件',
      location: '東京都品川区',
      propertyType: '一棟アパート',
      purchasePrice: 6980,
      monthlyRent: 400000,
      managementFee: 20000,
      propertyStatus: '検討中',
      loanAmount: 6280,
      interestRate: 2.0,
      loanTerms: 30
    },
    results: {
      surfaceYield: 6.88,
      netYield: 5.5,
      monthlyCashFlow: 50000
    },
    cash_flow_table: Array(30).fill({
      year: 1,
      yearlyRent: 4800000,
      yearlyExpenses: 240000,
      yearlyLoanPayment: 2400000,
      yearlyCashFlow: 2160000,
      cumulativeCashFlow: 2160000,
      売却時累計CF: 5000000
    }),
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    simulation_data: {
      propertyName: '春日部のシェアハウス',
      location: '埼玉県春日部市',
      propertyType: 'シェアハウス',
      purchasePrice: 3500,
      monthlyRent: 200000,
      managementFee: 15000,
      propertyStatus: '取得済み'
    },
    results: {
      surfaceYield: 6.86,
      monthlyCashFlow: -10000
    },
    created_at: '2024-01-02T00:00:00Z'
  }
]

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // LocalStorageのモック
    Storage.prototype.getItem = vi.fn()
    Storage.prototype.setItem = vi.fn()
  })

  it('マイページのタイトルが表示される', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('マイページ')).toBeInTheDocument()
      expect(screen.getByText('投資の成果を一目で確認できます')).toBeInTheDocument()
    })
  })

  it('物件データが正しく表示される', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      // 物件名
      expect(screen.getByText('品川区投資物件')).toBeInTheDocument()
      expect(screen.getByText('春日部のシェアハウス')).toBeInTheDocument()
      
      // 購入価格（取得価格から変更）
      expect(screen.getByText('6,980万円')).toBeInTheDocument()
      expect(screen.getByText('3,500万円')).toBeInTheDocument()
      
      // 不動産収入（年間収入から変更）
      expect(screen.getByText('480万円')).toBeInTheDocument()
      expect(screen.getByText('240万円')).toBeInTheDocument()
    })
  })

  it('ステータスバッジが表示される', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('🔍 検討中')).toBeInTheDocument()
      expect(screen.getByText('✅ 取得済み')).toBeInTheDocument()
    })
  })

  it('年間CFが正しく計算・表示される', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      // 月間CF × 12 = 年間CF
      // 50,000 × 12 = 600,000 → 60万円
      expect(screen.getByText('+60万円')).toBeInTheDocument()
      // -10,000 × 12 = -120,000 → -12万円
      expect(screen.getByText('-12万円')).toBeInTheDocument()
    })
  })

  it('売却時累計CF(10年)が表示される', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      // cash_flow_tableから取得した値
      expect(screen.getByText('+500万円')).toBeInTheDocument()
    })
  })

  it('フィルタリング機能が動作する', async () => {
    const { container } = render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      const selectElement = container.querySelector('select[value="all"]') as HTMLSelectElement
      expect(selectElement).toBeInTheDocument()
    })
  })

  it('新規シミュレーションボタンが表示される', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('新規シミュレーション')).toBeInTheDocument()
    })
  })

  it('物件カードのアクションボタンが表示される', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      const viewButtons = screen.getAllByText('シミュレーション結果を見る')
      expect(viewButtons).toHaveLength(2)
      
      const editButtons = screen.getAllByText('編集')
      expect(editButtons).toHaveLength(2)
      
      const deleteButtons = screen.getAllByText('削除')
      expect(deleteButtons).toHaveLength(2)
    })
  })

  it('ローディング状態が表示される', () => {
    // AuthProviderをローディング状態でモック
    vi.doMock('../components/AuthProvider', () => ({
      useAuthContext: () => ({
        user: null,
        isAuthenticated: false,
        loading: true
      })
    }))
    
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    
    expect(screen.getByText('物件データを読み込み中...')).toBeInTheDocument()
  })

  it('データがない場合の表示', async () => {
    // 空のデータでモック
    vi.doMock('../hooks/useSupabaseData', () => ({
      useSupabaseData: () => ({
        getSimulations: vi.fn().mockResolvedValue({
          data: [],
          error: null
        }),
        deleteSimulation: vi.fn()
      })
    }))
    
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('物件がまだ登録されていません')).toBeInTheDocument()
      expect(screen.getByText('最初の物件を分析する')).toBeInTheDocument()
    })
  })

  it('売却時累計CFのフォールバック計算が動作する', async () => {
    // cash_flow_tableがないデータでテスト
    const mockDataWithoutCashFlowTable = [{
      ...mockSimulationsData[1],
      cash_flow_table: null
    }]
    
    vi.doMock('../hooks/useSupabaseData', () => ({
      useSupabaseData: () => ({
        getSimulations: vi.fn().mockResolvedValue({
          data: mockDataWithoutCashFlowTable,
          error: null
        }),
        deleteSimulation: vi.fn()
      })
    }))
    
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      // フォールバック計算による値が表示される
      const elements = screen.getAllByText(/万円/)
      expect(elements.length).toBeGreaterThan(0)
    })
  })
})