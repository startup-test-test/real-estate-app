import React, { useState } from 'react';
import { 
  Save,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useAuthContext } from '../components/AuthProvider';

// FAST API のベースURL
// const API_BASE_URL = 'https://real-estate-app-1-iii4.onrender.com';

interface SimulationResult {
  results: {
    '表面利回り（%）': number | null;
    'IRR（%）': number | null;
    'CCR（%）': number | null;
    'DSCR（返済余裕率）': number | null;
    '月間キャッシュフロー（円）': number | null;
    '年間キャッシュフロー（円）': number | null;
  };
  cash_flow_table?: {
    '年次': number;
    '満室想定収入': number;
    '空室率（%）': number;
    '実効収入': number;
    '経費': number;
    '大規模修繕': number;
    'ローン返済': number;
    '営業CF': number;
    '累計CF': number;
  }[];
}

const Simulator: React.FC = () => {
  const { user } = useAuthContext();
  const { saveSimulation, loading: dbLoading } = useSupabaseData();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);

  const [inputs, setInputs] = useState({
    // 物件基本情報
    propertyName: '品川区投資物件',
    
    // 🏠 物件情報
    landArea: 135.00, // ㎡
    buildingArea: 150.00, // ㎡
    roadPrice: 250000, // 円/㎡
    marketValue: 8000, // 万円（想定売却価格）
    
    // 💰 取得・初期費用
    purchasePrice: 6980, // 万円
    otherCosts: 300, // 万円（諸経費）
    renovationCost: 200, // 万円（改装費）
    
    // 📈 収益情報
    monthlyRent: 250000, // 円
    managementFee: 5000, // 円（月額）
    fixedCost: 0, // 円（その他固定費月額）
    propertyTax: 100000, // 円（年額）
    vacancyRate: 5.00, // %
    rentDecline: 1.00, // %/年
    
    // 🏦 借入条件
    loanAmount: 6500, // 万円
    interestRate: 0.70, // %
    loanYears: 35, // 年
    loanType: '元利均等',
    
    // 🎯 出口戦略
    holdingYears: 10, // 年
    exitCapRate: 6.00 // %
  });

  const handleInputChange = (field: string, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSimulation = async () => {
    setIsSimulating(true);
    setSaveError(null);
    
    try {
      // FAST API への送信データを構築
      const apiData = {
        property_name: inputs.propertyName,
        location: '東京都品川区', // デフォルト値
        year_built: 2010, // デフォルト値
        property_type: '一棟アパート/マンション', // デフォルト値
        land_area: inputs.landArea,
        building_area: inputs.buildingArea,
        road_price: inputs.roadPrice,
        purchase_price: inputs.purchasePrice,
        building_price: inputs.purchasePrice * 0.7, // 建物価格は購入価格の70%と仮定
        other_costs: inputs.otherCosts,
        renovation_cost: inputs.renovationCost,
        monthly_rent: inputs.monthlyRent,
        management_fee: inputs.managementFee,
        fixed_cost: inputs.fixedCost,
        property_tax: inputs.propertyTax,
        vacancy_rate: inputs.vacancyRate,
        rent_decline: inputs.rentDecline,
        loan_type: inputs.loanType,
        loan_amount: inputs.loanAmount,
        interest_rate: inputs.interestRate,
        loan_years: inputs.loanYears,
        holding_years: inputs.holdingYears,
        exit_cap_rate: inputs.exitCapRate,
        market_value: inputs.marketValue
      };
      
      console.log('FAST API送信データ:', apiData);
      
      // FAST API呼び出し
      const API_BASE_URL = 'https://real-estate-app-1-iii4.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('FAST APIレスポンス:', result);
      
      if (result.results) {
        setSimulationResults(result);
        
        // ユーザーがログインしている場合はSupabaseに保存
        if (user) {
          try {
            const simulationData = {
              simulation_data: apiData,
              results: {
                surface_yield: result.results['表面利回り（%）'],
                irr: result.results['IRR（%）'],
                ccr: result.results['CCR（%）'],
                dscr: result.results['DSCR（返済余裕率）'],
                monthly_cash_flow: result.results['月間キャッシュフロー（円）'],
                annual_cash_flow: result.results['年間キャッシュフロー（円）']
              },
              cash_flow_table: result.cash_flow_table || []
            };
            
            await saveSimulation(simulationData);
            setSaveMessage('シミュレーション結果を保存しました！');
          } catch (saveError) {
            console.error('保存エラー:', saveError);
            setSaveMessage('シミュレーションは完了しましたが、保存に失敗しました。');
          }
        } else {
          setSaveMessage('シミュレーションが正常に完了しました！（ログインすると結果を保存できます）');
        }
      } else {
        throw new Error('APIから予期しない形式のレスポンスが返されました');
      }
      
    } catch (error) {
      console.error('シミュレーションエラー:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      setSaveError(`シミュレーション処理でエラーが発生しました: ${errorMessage}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSaveDraft = () => {
    // 下書き保存処理
    console.log('下書き保存:', inputs);
    setSaveMessage('下書きを保存しました');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // 必須項目のチェック
  const isFormValid = inputs.propertyName && inputs.purchasePrice > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">AI物件シミュレーター</h1>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50">
                物件一覧へ戻る
              </button>
            </div>
          </div>
          <p className="text-gray-600">AIを活用した収益シミュレーションで、最適な投資判断をサポートします。</p>
        </div>

        {/* Success/Error Messages */}
        {saveMessage && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-blue-800">{saveMessage}</span>
            </div>
          </div>
        )}

        {saveError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-800">{saveError}</span>
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* 物件名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              物件名 <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded">必須</span>
            </label>
            <input
              type="text"
              value={inputs.propertyName}
              onChange={(e) => handleInputChange('propertyName', e.target.value)}
              placeholder="物件名を入力してください"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* 🏠 物件情報 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏠 物件情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">土地面積(㎡)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.landArea}
                  onChange={(e) => handleInputChange('landArea', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">建物面積(㎡)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.buildingArea}
                  onChange={(e) => handleInputChange('buildingArea', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">路線価(円/㎡)</label>
                <input
                  type="number"
                  value={inputs.roadPrice}
                  onChange={(e) => handleInputChange('roadPrice', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">想定売却価格(万円)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.marketValue}
                  onChange={(e) => handleInputChange('marketValue', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 💰 取得・初期費用 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 取得・初期費用</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">購入価格(万円)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.purchasePrice}
                  onChange={(e) => handleInputChange('purchasePrice', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">諸経費(万円)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.otherCosts}
                  onChange={(e) => handleInputChange('otherCosts', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">改装費(万円)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.renovationCost}
                  onChange={(e) => handleInputChange('renovationCost', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 📈 収益情報 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 収益情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">月額賃料(円)</label>
                <input
                  type="number"
                  value={inputs.monthlyRent}
                  onChange={(e) => handleInputChange('monthlyRent', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">管理費(月額円)</label>
                <input
                  type="number"
                  value={inputs.managementFee}
                  onChange={(e) => handleInputChange('managementFee', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">その他固定費(月額円)</label>
                <input
                  type="number"
                  value={inputs.fixedCost}
                  onChange={(e) => handleInputChange('fixedCost', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">固定資産税(年額円)</label>
                <input
                  type="number"
                  value={inputs.propertyTax}
                  onChange={(e) => handleInputChange('propertyTax', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">空室率(%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.vacancyRate}
                  onChange={(e) => handleInputChange('vacancyRate', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">家賃下落率(%/年)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.rentDecline}
                  onChange={(e) => handleInputChange('rentDecline', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 🏦 借入条件 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏦 借入条件</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">借入額(万円)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.loanAmount}
                  onChange={(e) => handleInputChange('loanAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">金利(%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.interestRate}
                  onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">返済期間(年)</label>
                <input
                  type="number"
                  value={inputs.loanYears}
                  onChange={(e) => handleInputChange('loanYears', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">借入形式</label>
                <select
                  value={inputs.loanType}
                  onChange={(e) => handleInputChange('loanType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="元利均等">元利均等</option>
                  <option value="元金均等">元金均等</option>
                </select>
              </div>
            </div>
          </div>

          {/* 🎯 出口戦略 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 出口戦略</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">保有年数(年)</label>
                <input
                  type="number"
                  value={inputs.holdingYears}
                  onChange={(e) => handleInputChange('holdingYears', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">売却CapRate(%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.exitCapRate}
                  onChange={(e) => handleInputChange('exitCapRate', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button 
                onClick={handleSaveDraft}
                className="flex items-center justify-center px-4 py-2 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
              >
                <Save className="h-4 w-4 mr-2" />
                下書き保存
              </button>
              <button 
                onClick={handleSimulation}
                disabled={isSimulating || !isFormValid}
                className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium text-lg transition-all duration-200 ${
                  isSimulating || !isFormValid
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isSimulating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    AI分析中...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    AI物件シミュレーターを実行する
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* シミュレーション結果表示 */}
        {simulationResults && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">📊 シミュレーション結果</h2>
            
            {/* 投資パフォーマンス指標 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">投資パフォーマンス指標</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 表面利回り */}
                {simulationResults.results['表面利回り（%）'] !== null && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">表面利回り</h4>
                    <div className={`text-2xl font-bold ${
                      simulationResults.results['表面利回り（%）']! > 5 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {simulationResults.results['表面利回り（%）']}%
                    </div>
                  </div>
                )}
                
                {/* IRR */}
                {simulationResults.results['IRR（%）'] !== null && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">IRR（内部収益率）</h4>
                    <div className={`text-2xl font-bold ${
                      simulationResults.results['IRR（%）']! > 10 
                        ? 'text-green-600' 
                        : simulationResults.results['IRR（%）']! > 5 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`}>
                      {simulationResults.results['IRR（%）']}%
                    </div>
                  </div>
                )}
                
                {/* CCR */}
                {simulationResults.results['CCR（%）'] !== null && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">CCR（自己資金回収率）</h4>
                    <div className={`text-2xl font-bold ${
                      simulationResults.results['CCR（%）']! > 8 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {simulationResults.results['CCR（%）']}%
                    </div>
                  </div>
                )}
                
                {/* DSCR */}
                {simulationResults.results['DSCR（返済余裕率）'] !== null && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">DSCR（返済余裕率）</h4>
                    <div className={`text-2xl font-bold ${
                      simulationResults.results['DSCR（返済余裕率）']! > 1.3 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {simulationResults.results['DSCR（返済余裕率）']!.toFixed(2)}
                    </div>
                  </div>
                )}
                
                {/* 月間キャッシュフロー */}
                {simulationResults.results['月間キャッシュフロー（円）'] !== null && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">月間キャッシュフロー</h4>
                    <div className="text-2xl font-bold text-gray-800">
                      {simulationResults.results['月間キャッシュフロー（円）']!.toLocaleString()}円
                    </div>
                  </div>
                )}
                
                {/* 年間キャッシュフロー */}
                {simulationResults.results['年間キャッシュフロー（円）'] !== null && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">年間キャッシュフロー</h4>
                    <div className="text-2xl font-bold text-gray-800">
                      {simulationResults.results['年間キャッシュフロー（円）']!.toLocaleString()}円
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* キャッシュフロー表 */}
            {simulationResults.cash_flow_table && simulationResults.cash_flow_table.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 年次キャッシュフロー詳細</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">年次</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">満室想定収入</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">空室率</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">実効収入</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">経費</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">大規模修繕</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">ローン返済</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">営業CF</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">累計CF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulationResults.cash_flow_table.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['年次']}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['満室想定収入'].toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['空室率（%）']}%</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['実効収入'].toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['経費'].toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['大規模修繕'].toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['ローン返済'].toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['営業CF'].toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['累計CF'].toLocaleString()}円</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Simulator;