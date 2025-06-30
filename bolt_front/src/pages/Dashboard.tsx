import React from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useAuthContext } from '../components/AuthProvider';
import { 
  Calculator, 
  LogOut, 
  User,
  Home,
  Menu,
  X,
  Bell,
  Settings,
  Building,
  BookOpen,
  TrendingUp,
  Search,
  HelpCircle,
  Crown,
  Key,
  ChevronRight,
  Plus,
  Download,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  Filter,
  ChevronDown,
  Users,
  Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Removed useSupabaseData hook dependency

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();
  const { getSimulations, deleteSimulation } = useSupabaseData();
  
  // 認証状態をログに記録
  React.useEffect(() => {
    console.log('Dashboard認証状態:', {
      user: user ? { id: user.id, email: user.email } : null,
      isAuthenticated,
      authLoading
    })
  }, [user, isAuthenticated, authLoading])
  
  // Mock data for simulations
  const mockSimulations = [
    {
      id: '1',
      property_name: 'プレミアムマンション池袋',
      property_data: {
        location: '東京都豊島区池袋',
        propertyType: '一棟マンション',
        purchasePrice: 85000000,
        managementFee: 120
      },
      simulation_results: {
        monthlyLoan: 45000,
        grossYield: 6.2,
        netYield: 4.8,
        irr: 12.5,
        dscr: 1.4,
        selfFunding: 2000000
      },
      ai_analysis: {},
      created_at: '2024-06-20T10:30:00Z',
      status: 'completed'
    },
    {
      id: '2',
      property_name: '駅近アパート新宿',
      property_data: {
        location: '東京都新宿区西新宿',
        propertyType: '一棟アパート',
        purchasePrice: 55000000,
        managementFee: 80
      },
      simulation_results: {
        monthlyLoan: 32000,
        grossYield: 5.8,
        netYield: 4.2,
        irr: 10.8,
        dscr: 1.2,
        selfFunding: 1500000
      },
      ai_analysis: {},
      created_at: '2024-06-18T14:15:00Z',
      status: 'completed'
    },
    {
      id: '3',
      property_name: '投資用マンション渋谷',
      property_data: {
        location: '東京都渋谷区渋谷',
        propertyType: '区分マンション',
        purchasePrice: 38000000,
        managementFee: 60
      },
      simulation_results: {
        monthlyLoan: 28000,
        grossYield: 5.4,
        netYield: 3.9,
        irr: 9.2,
        dscr: 1.1,
        selfFunding: 1200000
      },
      ai_analysis: {},
      created_at: '2024-06-15T09:45:00Z',
      status: 'draft'
    }
  ];

  // Supabase state management
  const [simulations, setSimulations] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [sortBy, setSortBy] = React.useState('newest');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // データ読み込み関数
  const loadSimulations = async () => {
    if (!user) {
      console.log('loadSimulations: ユーザーが登録されていません')
      return;
    }
    
    console.log('loadSimulations: データ読み込み開始, ユーザー:', user.email)
    
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await getSimulations();
      
      if (fetchError) {
        console.error('データ取得エラー:', fetchError);
        setError(fetchError);
        setSimulations([]);
      } else {
        console.log('Supabaseから取得したデータ:', data);
        // 最初のデータの詳細構造をログ出力
        if (data && data.length > 0) {
          console.log('最初のシミュレーションデータの詳細:', JSON.stringify(data[0], null, 2));
        }
        setSimulations(data || []);
      }
    } catch (err: any) {
      console.error('データ読み込みエラー:', err);
      setError(err.message);
      setSimulations([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    loadSimulations();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('この物件データを削除しますか？')) {
      try {
        setLoading(true);
        const { error } = await deleteSimulation(id);
        if (error) {
          setError(error);
        } else {
          // 削除成功後、データを再読み込み
          loadSimulations();
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // 初回読み込み
  React.useEffect(() => {
    console.log('Dashboard useEffect: 初回読み込み', { user: user?.email, authLoading })
    if (!authLoading) {
      loadSimulations();
    }
  }, [user, authLoading]);

  // Supabaseデータを表示用フォーマットに変換
  const formatSimulationData = (simulations: any[]) => {
    return simulations.map(sim => {
      // スキーマに合わせてデータを取得
      const simulationData = sim.simulation_data || {};
      const results = sim.results || {};
      
      return {
        id: sim.id,
        propertyName: simulationData.propertyName || '無題の物件',
        location: simulationData.location || '住所未設定',
        propertyType: simulationData.propertyType || '一棟アパート/マンション',
        acquisitionPrice: simulationData.purchasePrice || 0, // 既に万円単位で保存されている
        annualIncome: ((simulationData.monthlyRent || 0) * 12) / 10000, // 月額家賃から年間収入を計算、万円に変換
        managementFee: ((simulationData.managementFee || 0) * 12) / 10000, // 月額管理費×12を万円に変換
        surfaceYield: results.surfaceYield || 0,
        netYield: results.netYield || 0,
        cashFlow: results.monthlyCashFlow || 0,
        date: new Date(sim.created_at).toLocaleDateString('ja-JP'),
        status: 'completed',
        thumbnail: simulationData.propertyImageUrl || 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=400',
        propertyUrl: simulationData.propertyUrl || '',
        propertyMemo: simulationData.propertyMemo || '',
        radarData: {
          shortTermProfitability: Math.min(10, Math.max(1, Math.round((results.surfaceYield || 0) / 2))),
          longTermProfitability: Math.min(10, Math.max(1, Math.round((results.irr || 0) / 2))),
          shortTermRisk: Math.min(10, Math.max(1, 10 - Math.round((results.dscr || 1) * 3))),
          longTermRisk: Math.min(10, Math.max(1, Math.round(Math.random() * 5 + 3))),
          relativeFinancialPressure: Math.min(10, Math.max(1, Math.round((simulationData.selfFunding || 1000) / 200))),
          longTermAssetValue: Math.min(10, Math.max(1, Math.round((results.netYield || 0) / 1.5)))
        }
      };
    });
  };

  const formattedSimulations = formatSimulationData(simulations);

  const quickActions = [
    {
      category: 'AI物件シミュレーター',
      icon: Calculator,
      color: 'bg-slate-700',
      description: '物件の収益性と価格妥当性を、AIがまとめて分析します。',
      actions: [
        { name: '物件をAIで分析する', primary: true, path: '/simulator' }
      ]
    },
    {
      category: 'AI取引事例検索',
      icon: Search,
      color: 'bg-slate-700',
      description: '2億件超の取引データから類似物件の事例を検索・分析します。',
      actions: [
        { name: '取引事例を検索する', primary: true, path: '/transaction-search' }
      ]
    },
    {
      category: 'AI市場分析',
      icon: TrendingUp,
      color: 'bg-slate-700',
      description: 'エリアの市場動向と将来性をAIが詳細に分析します。',
      actions: [
        { name: '市場分析を実行する', primary: true, path: '/market-analysis' }
      ]
    }
  ];

  const filteredResults = formattedSimulations.filter(result => {
    const matchesSearch = result.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}万円`;
    }
    return `${amount.toFixed(1)}万円`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // レーダーチャートのSVGコンポーネント
  const RadarChart = ({ data }: { data: any }) => {
    const size = 120;
    const center = size / 2;
    const radius = 40;
    const angles = [0, 60, 120, 180, 240, 300].map(deg => (deg * Math.PI) / 180);
    
    const points = [
      data.shortTermProfitability,
      data.longTermProfitability,
      data.shortTermRisk,
      data.longTermRisk,
      data.relativeFinancialPressure,
      data.longTermAssetValue
    ];

    const pathData = points.map((point, index) => {
      const angle = angles[index];
      const r = (point / 10) * radius;
      const x = center + r * Math.cos(angle - Math.PI / 2);
      const y = center + r * Math.sin(angle - Math.PI / 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') + ' Z';

    return (
      <svg width={size} height={size} className="mx-auto">
        {/* Background circles */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius * scale}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* Axis lines */}
        {angles.map((angle, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(angle - Math.PI / 2)}
            y2={center + radius * Math.sin(angle - Math.PI / 2)}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* Data area */}
        <path
          d={pathData}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        
        {/* Data points */}
        {points.map((point, index) => {
          const angle = angles[index];
          const r = (point / 10) * radius;
          const x = center + r * Math.cos(angle - Math.PI / 2);
          const y = center + r * Math.sin(angle - Math.PI / 2);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill="#3b82f6"
            />
          );
        })}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">物件データを読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
            <p className="text-gray-600 mt-1">投資の成果を一目で確認できます</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {quickActions.map((section, index) => {
              const Icon = section.icon;
              return (
                <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className={`${section.color} px-6 py-4`}>
                    <div className="flex items-center text-white">
                      <Icon className="h-5 w-5 mr-2" />
                      <h3 className="font-semibold">{section.category}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                    
                    {section.actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={() => navigate(action.path)}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                          action.primary
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          <span>{action.name}</span>
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Property List Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Calculator className="h-5 w-5 text-purple-500 mr-2" />
                <h3 className="font-semibold text-gray-900">登録済み物件一覧</h3>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => navigate('/simulator')}
                  className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  新規シミュレーション
                </button>
                <button 
                  onClick={refetch}
                  className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  更新
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">エラー: {error}</p>
                <button 
                  onClick={refetch}
                  className="mt-2 text-red-600 hover:text-red-700 underline"
                >
                  再試行
                </button>
              </div>
            )}

            {/* Search and Filter Controls */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="物件名・住所で検索"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none pr-8"
                    >
                      <option value="all">すべて</option>
                      <option value="completed">完了</option>
                      <option value="draft">下書き</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  
                  <div className="relative">
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none pr-8"
                    >
                      <option value="newest">更新日：新しい順</option>
                      <option value="oldest">更新日：古い順</option>
                      <option value="yield-high">利回り：高い順</option>
                      <option value="yield-low">利回り：低い順</option>
                      <option value="price-high">価格：高い順</option>
                      <option value="price-low">価格：安い順</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-gray-600">{filteredResults.length}件の物件が見つかりました。</p>
            </div>
            
            {/* Card Grid - Responsive Layout */}
            {filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">物件がまだ登録されていません</h3>
                <p className="text-gray-600 mb-6">AI物件シミュレーターで物件を分析して保存してみましょう。</p>
                <button 
                  onClick={() => navigate('/simulator')}
                  className="inline-flex items-center px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  最初の物件を分析する
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredResults.map((sim) => (
                  <div key={sim.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                    {/* Property Image */}
                    <div className="relative h-48">
                      <img
                        src={sim.thumbnail}
                        alt={sim.propertyName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 画像読み込みエラー時のフォールバック
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=400';
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          {sim.propertyType}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex space-x-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          収益
                        </span>
                        {sim.status === 'draft' && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                            節税
                          </span>
                        )}
                        {sim.thumbnail !== 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=400' && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            📸
                          </span>
                        )}
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute bottom-3 left-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          sim.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {sim.status === 'completed' ? '完了' : '下書き'}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-1 bg-black/50 text-white text-xs rounded">
                          {sim.date}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Property Info */}
                      <div className="mb-4">
                        <h4 className="font-bold text-lg text-gray-900 mb-1">{sim.propertyName}</h4>
                        <p className="text-sm text-gray-600 mb-2">{sim.location}</p>
                        
                        {/* Property URL and Memo */}
                        {(sim.propertyUrl || sim.propertyMemo) && (
                          <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                            {sim.propertyUrl && (
                              <div className="mb-1">
                                <span className="text-gray-500">🔗 </span>
                                <a 
                                  href={sim.propertyUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline truncate inline-block max-w-[200px]"
                                >
                                  {sim.propertyUrl.replace(/^https?:\/\//, '')}
                                </a>
                              </div>
                            )}
                            {sim.propertyMemo && (
                              <div className="text-gray-600">
                                <span className="text-gray-500">📝 </span>
                                {sim.propertyMemo}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Financial Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">取得価格</span>
                            <div className="font-bold text-lg">{formatCurrency(sim.acquisitionPrice)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">年間収入</span>
                            <div className="font-bold text-lg">{sim.annualIncome}万円</div>
                          </div>
                          <div>
                            <span className="text-gray-500">表面利回り</span>
                            <div className="font-bold text-green-600">{sim.surfaceYield}%</div>
                          </div>
                          <div>
                            <span className="text-gray-500">実質利回り</span>
                            <div className="font-bold text-blue-600">{sim.netYield}%</div>
                          </div>
                        </div>
                      </div>

                      {/* Radar Chart and Metrics */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Radar Chart */}
                        <div>
                          <RadarChart data={sim.radarData} />
                        </div>
                        
                        {/* Key Metrics */}
                        <div className="space-y-2">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">月間CF</div>
                            <div className={`font-bold text-sm ${
                              sim.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {sim.cashFlow >= 0 ? '+' : ''}{formatNumber(sim.cashFlow)}円
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">運営費用</div>
                            <div className="font-bold text-sm text-gray-900">
                              {sim.managementFee}万円/年
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">総合評価</div>
                            <div className="flex justify-center">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full mx-0.5 ${
                                    i < Math.round(sim.netYield / 2) ? 'bg-blue-500' : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => navigate(`/simulator?edit=${sim.id}`)}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                        >
                          編集
                        </button>
                        <button 
                          onClick={() => navigate(`/property-detail/${sim.id}`)}
                          className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                        >
                          詳細表示
                        </button>
                        <button 
                          onClick={() => handleDelete(sim.id)}
                          className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {filteredResults.length > 6 && (
              <div className="mt-8 text-center">
                <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  さらに読み込む
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;