import React from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useAuthContext } from '../components/AuthProvider';
import { sanitizeUrl, openUrlSafely } from '../utils/validation';
import { handleError } from '../utils/secureErrorHandler';
import { SecureDataStorage } from '../utils/secureDataStorage';
import { 
  Calculator,
  Building,
  Search,
  Plus,
  Download,
  Edit,
  Trash2,
  ChevronDown,
  Loader,
  ChevronLeft,
  ChevronRight,
  BarChart3
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
  
  // Supabase state management
  const [simulations, setSimulations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState('newest');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isInitialLoad, setIsInitialLoad] = React.useState(true); // 初回読み込みフラグ
  const itemsPerPage = 12;
  
  
  // キャッシュからデータを読み込む（SEC-030: 暗号化対応）
  const loadFromCache = async () => {
    try {
      const cachedResult = await SecureDataStorage.getSimulations();
      
      if (cachedResult) {
        const { data, timestamp } = cachedResult;
        const cacheTime = new Date(timestamp);
        const now = new Date();
        const hoursSinceCache = (now.getTime() - cacheTime.getTime()) / (1000 * 60 * 60);
        
        // キャッシュが24時間以内なら有効とする
        if (hoursSinceCache < 24) {
          console.log('暗号化キャッシュからデータを読み込みました');
          return data;
        }
      }
    } catch (error) {
      console.error('キャッシュ読み込みエラー:', error);
    }
    return null;
  };
  
  // キャッシュにデータを保存（SEC-030: 暗号化対応）
  const saveToCache = async (data: any[]) => {
    try {
      await SecureDataStorage.saveSimulations(data);
      console.log('✅ シミュレーションデータを暗号化して保存しました');
    } catch (error) {
      console.error('暗号化キャッシュ保存エラー:', error);
    }
  };
  
  // データ読み込み関数
  const loadSimulations = async (forceRefresh = false) => {
    if (!user) {
      console.log('loadSimulations: ユーザーが登録されていません')
      return;
    }
    
    // 初回読み込み時はキャッシュをチェック
    if (isInitialLoad && !forceRefresh) {
      const cachedData = await loadFromCache();
      if (cachedData) {
        setSimulations(cachedData);
        setLoading(false);
        setIsInitialLoad(false);
        
        // バックグラウンドで最新データを取得
        setTimeout(() => {
          loadSimulations(true);
        }, 1000);
        return;
      }
    }
    
    console.log('loadSimulations: Supabaseからデータ読み込み開始, ユーザー:', user.email)
    
    try {
      // 強制リフレッシュでない場合は、既存データがあればローディングを表示しない
      if (!forceRefresh && simulations.length > 0) {
        // バックグラウンド更新
      } else {
        setLoading(true);
      }
      
      setError(null);
      // シミュレーションデータを取得（物件一覧用）
      const { data: simsData, error: simsError } = await getSimulations();
      
      const fetchError = simsError;
      // simulationsテーブルのデータを使用
      const data = simsData;
      
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
        // キャッシュに保存
        saveToCache(data || []);
      }
    } catch (err: any) {
      // SEC-026: エラー情報の詳細漏洩対策
      const secureError = handleError(err, 'Dashboard Data Load');
      setError(secureError.userMessage);
      setSimulations([]);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const refetch = () => {
    loadSimulations(true); // 強制リフレッシュ
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await deleteSimulation(id);
      if (error) {
        setError(error || 'エラーが発生しました');
        alert('削除に失敗しました: ' + error);
      } else {
        // 削除成功後、データを再読み込み（強制リフレッシュ）
        loadSimulations(true);
        // 成功フィードバック
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = '物件データを削除しました';
        document.body.appendChild(toast);
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
      }
    } catch (err: any) {
      // SEC-026: エラー情報の詳細漏洩対策
      const secureError = handleError(err, 'Dashboard Delete');
      setError(secureError.userMessage);
      alert('削除処理中にエラーが発生しました');
    } finally {
      setLoading(false);
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
    if (!simulations || simulations.length === 0) return [];
    
    return simulations.map(sim => {
      // simulationsテーブルのデータ構造に合わせて取得
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
        status: simulationData.propertyStatus || '検討中',
        thumbnail: simulationData.propertyImageUrl || 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=400',
        propertyUrl: simulationData.propertyUrl || '',
        propertyMemo: simulationData.propertyMemo || ''
      };
    });
  };

  const formattedSimulations = formatSimulationData(simulations);

  const quickActions = [
    {
      category: '物件収益シミュレーター',
      icon: Calculator,
      color: 'bg-slate-700',
      description: '物件の収益性と投資指標を詳細に計算・分析します。',
      actions: [
        { name: '物件を分析する', primary: true, path: '/simulator' }
      ]
    },
    // 2次リリース用: AI取引事例検索機能
    // {
    //   category: 'AI取引事例検索',
    //   icon: Search,
    //   color: 'bg-slate-700',
    //   description: '2億件超の取引データから類似物件の事例を検索・分析します。',
    //   actions: [
    //     { name: '取引事例を検索する', primary: true, path: '/transaction-search' }
    //   ]
    // },
    // 2次リリース用: AI市場分析機能
    // {
    //   category: 'AI市場分析',
    //   icon: TrendingUp,
    //   color: 'bg-slate-700',
    //   description: 'エリアの市場動向と将来性をAIが詳細に分析します。',
    //   actions: [
    //     { name: '市場分析を実行する', primary: true, path: '/market-analysis' }
    //   ]
    // },
  ];

  const filteredResults = formattedSimulations.filter(result => {
    const matchesSearch = result.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // ページネーション計算
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = filteredResults.slice(startIndex, startIndex + itemsPerPage);

  // 検索・フィルター変更時にページをリセット
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // ページ変更時にスムーズスクロール
  React.useEffect(() => {
    if (currentPage > 1) {
      const propertyListElement = document.getElementById('property-list');
      if (propertyListElement) {
        propertyListElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }, [currentPage]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}万円`;
    }
    return `${amount.toFixed(1)}万円`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
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
          <div id="property-list" className="bg-white rounded-lg border border-gray-200 p-6">
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
                      <option value="検討中">🔍 検討中</option>
                      <option value="内見予定">👀 内見予定</option>
                      <option value="申込検討">⏳ 申込検討</option>
                      <option value="契約手続中">📋 契約手続中</option>
                      <option value="取得済み">✅ 取得済み</option>
                      <option value="見送り">❌ 見送り</option>
                      <option value="保留">📝 保留</option>
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
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                {filteredResults.length}件中 {startIndex + 1}〜{Math.min(startIndex + itemsPerPage, filteredResults.length)}件を表示
                {totalPages > 1 && ` (${currentPage}/${totalPages}ページ)`}
              </p>
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
                {paginatedResults.map((sim) => (
                  <div key={sim.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                    {/* Property Image */}
                    <div className="relative h-40">
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
                        <div className="bg-black/70 text-white px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm">
                          <span className="text-xs text-gray-300 block">物件名</span>
                          <span className="text-sm font-medium">{sim.propertyName}</span>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 flex space-x-1">
                        {/* ステータスバッジ */}
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute bottom-3 left-3">
                        <span className={`px-2 py-1 text-xs rounded font-medium ${
                          sim.status === '検討中' ? 'bg-blue-100 text-blue-700' :
                          sim.status === '内見予定' ? 'bg-purple-100 text-purple-700' :
                          sim.status === '申込検討' ? 'bg-orange-100 text-orange-700' :
                          sim.status === '契約手続中' ? 'bg-yellow-100 text-yellow-700' :
                          sim.status === '取得済み' ? 'bg-green-100 text-green-700' :
                          sim.status === '見送り' ? 'bg-red-100 text-red-700' :
                          sim.status === '保留' ? 'bg-gray-100 text-gray-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {sim.status === '検討中' ? '🔍 検討中' :
                           sim.status === '内見予定' ? '👀 内見予定' :
                           sim.status === '申込検討' ? '⏳ 申込検討' :
                           sim.status === '契約手続中' ? '📋 契約手続中' :
                           sim.status === '取得済み' ? '✅ 取得済み' :
                           sim.status === '見送り' ? '❌ 見送り' :
                           sim.status === '保留' ? '📝 保留' :
                           '🔍 検討中'}
                        </span>
                      </div>

                    </div>

                    <div className="p-4">
                      {/* Property Info */}
                      <div className="mb-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-500">住所：</span>
                            <span className="text-base text-gray-900 font-medium">{sim.location}</span>
                          </div>
                          <span className="text-sm text-gray-600">{sim.date}</span>
                        </div>
                        
                        {/* Property URL and Memo - Compact */}
                        <div className="mb-3 p-2 bg-gray-50 rounded text-sm space-y-1">
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-2">URL:</span>
                            {sim.propertyUrl ? (
                              sanitizeUrl(sim.propertyUrl) ? (
                                <a 
                                  href={sanitizeUrl(sim.propertyUrl) || '#'} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline truncate flex-1"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    openUrlSafely(sim.propertyUrl);
                                  }}
                                >
                                  {sim.propertyUrl.replace(/^https?:\/\//, '')}
                                </a>
                              ) : (
                                <span className="text-red-600">無効なURL</span>
                              )
                            ) : (
                              <span className="text-gray-400">未登録</span>
                            )}
                          </div>
                          <div className="flex items-start">
                            <span className="text-gray-600 mr-2">メモ:</span>
                            <p className="text-gray-700 flex-1 line-clamp-1">
                              {sim.propertyMemo || <span className="text-gray-400">なし</span>}
                            </p>
                          </div>
                        </div>
                        
                        {/* Financial Details - Compact */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <span className="text-sm text-gray-500">取得価格</span>
                            <div className="font-bold text-base">{formatCurrency(sim.acquisitionPrice)}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">年間収入</span>
                            <div className="font-bold text-base">{sim.annualIncome}万円</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">表面利回り</span>
                            <div className="font-bold text-green-600 text-base">{sim.surfaceYield}%</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">月間CF</span>
                            <div className={`font-bold text-sm ${
                              sim.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {sim.cashFlow >= 0 ? '+' : ''}{formatNumber(sim.cashFlow)}円
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - メインアクション＋サブアクション */}
                      <div className="space-y-3">
                        {/* メインアクション: 結果表示（大きめ） */}
                        <button 
                          onClick={() => navigate(`/simulator?view=${sim.id}#results`)}
                          className="group w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                          title="シミュレーション結果を詳しく確認"
                        >
                          <BarChart3 className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                          シミュレーション結果を見る
                        </button>
                        
                        {/* サブアクション: 共有・編集・削除 */}
                        <div className="flex gap-2">
                          
                          <button 
                            onClick={() => navigate(`/simulator?edit=${sim.id}`)}
                            className="group flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200"
                            title="物件データを編集・再計算"
                          >
                            <Edit className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                            編集
                          </button>
                          
                          <button 
                            onClick={() => {
                              if (window.confirm(`「${sim.propertyName}」を削除してもよろしいですか？\n\nこの操作は取り消せません。`)) {
                                if (window.confirm('本当に削除しますか？\n\n削除後は復元できません。')) {
                                  handleDelete(sim.id);
                                }
                              }
                            }}
                            className="group flex-1 flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 transition-all duration-200"
                            title="この物件データを完全に削除"
                          >
                            <Trash2 className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
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