import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useAuthContext } from '../components/AuthProvider';
import { useLocation } from 'react-router-dom';
import CashFlowChart from '../components/CashFlowChart';
import Tooltip from '../components/Tooltip';
import MetricCard from '../components/MetricCard';
import Tutorial from '../components/Tutorial';
import BackButton from '../components/BackButton';
import Breadcrumb from '../components/Breadcrumb';
import { SimulationResultData, CashFlowData, SimulationInputData } from '../types';

// FAST API のベースURL
// const API_BASE_URL = 'https://real-estate-app-1-iii4.onrender.com';

interface SimulationResult {
  results: SimulationResultData;
  cash_flow_table?: CashFlowData[];
}


// サンプル物件データ
const sampleProperties = {
  default: {
    name: 'オリジナル設定',
    description: '自由に設定してください',
    data: {
      propertyName: '物件名を入力してください',
      landArea: 100.00,
      buildingArea: 120.00,
      roadPrice: 200000,
      marketValue: 6000,
      purchasePrice: 5000,
      otherCosts: 250,
      renovationCost: 150,
      monthlyRent: 180000,
      managementFee: 9000,
      fixedCost: 0,
      propertyTax: 80000,
      vacancyRate: 5.00,
      rentDecline: 1.00,
      loanAmount: 4500,
      interestRate: 0.70,
      loanYears: 35,
      loanType: '元利均等',
      holdingYears: 10,
      exitCapRate: 5.0,
      ownershipType: '個人',
      effectiveTaxRate: 20,
      majorRepairCycle: 10,
      majorRepairCost: 200,
      buildingPriceForDepreciation: 3000,
      depreciationYears: 27,
    }
  },
  shibuya: {
    name: '🏙️ 渋谷区ワンルーム',
    description: '都心部の単身者向け高利回り物件',
    data: {
      propertyName: '渋谷区ワンルームマンション',
      landArea: 80.00,
      buildingArea: 25.00,
      roadPrice: 800000,
      marketValue: 4500,
      purchasePrice: 3800,
      otherCosts: 200,
      renovationCost: 100,
      monthlyRent: 120000,
      managementFee: 6000,
      fixedCost: 2000,
      propertyTax: 60000,
      vacancyRate: 3.00,
      rentDecline: 0.50,
      loanAmount: 3200,
      interestRate: 0.60,
      loanYears: 35,
      loanType: '元利均等',
      holdingYears: 15,
      exitCapRate: 4.5,
      ownershipType: '個人',
      effectiveTaxRate: 20,
      majorRepairCycle: 10,
      majorRepairCost: 200,
      buildingPriceForDepreciation: 2500,
      depreciationYears: 27,
    }
  },
  setagaya: {
    name: '🏡 世田谷区ファミリー',
    description: 'ファミリー向け安定収益物件',
    data: {
      propertyName: '世田谷区ファミリーマンション',
      landArea: 150.00,
      buildingArea: 80.00,
      roadPrice: 400000,
      marketValue: 8500,
      purchasePrice: 7200,
      otherCosts: 350,
      renovationCost: 250,
      monthlyRent: 220000,
      managementFee: 11000,
      fixedCost: 3000,
      propertyTax: 120000,
      vacancyRate: 8.00,
      rentDecline: 1.20,
      loanAmount: 6000,
      interestRate: 0.75,
      loanYears: 30,
      loanType: '元利均等',
      holdingYears: 12,
      exitCapRate: 5.2,
      ownershipType: '法人',
      effectiveTaxRate: 25,
      majorRepairCycle: 12,
      majorRepairCost: 300,
      buildingPriceForDepreciation: 4500,
      depreciationYears: 39,
    }
  },
  osaka: {
    name: '🌆 大阪市中央区',
    description: '関西圏の商業地域物件',
    data: {
      propertyName: '大阪市中央区投資マンション',
      landArea: 120.00,
      buildingArea: 65.00,
      roadPrice: 300000,
      marketValue: 5800,
      purchasePrice: 4900,
      otherCosts: 280,
      renovationCost: 180,
      monthlyRent: 165000,
      managementFee: 8500,
      fixedCost: 1500,
      propertyTax: 85000,
      vacancyRate: 6.00,
      rentDecline: 1.50,
      loanAmount: 4200,
      interestRate: 0.80,
      loanYears: 32,
      loanType: '元利均等',
      holdingYears: 10,
      exitCapRate: 5.5,
      ownershipType: '個人',
      effectiveTaxRate: 22,
      majorRepairCycle: 10,
      majorRepairCost: 250,
      buildingPriceForDepreciation: 3000,
      depreciationYears: 34,
    }
  },
  regional: {
    name: '🌾 地方都市アパート',
    description: '地方の一棟アパート投資',
    data: {
      propertyName: '地方都市一棟アパート',
      landArea: 300.00,
      buildingArea: 240.00,
      roadPrice: 80000,
      marketValue: 6500,
      purchasePrice: 5500,
      otherCosts: 300,
      renovationCost: 400,
      monthlyRent: 280000,
      managementFee: 14000,
      fixedCost: 8000,
      propertyTax: 95000,
      vacancyRate: 12.00,
      rentDecline: 2.00,
      loanAmount: 4800,
      interestRate: 1.20,
      loanYears: 25,
      loanType: '元利均等',
      holdingYears: 8,
      exitCapRate: 6.5,
      ownershipType: '法人',
      effectiveTaxRate: 23,
      majorRepairCycle: 15,
      majorRepairCost: 500,
      buildingPriceForDepreciation: 3500,
      depreciationYears: 22,
    }
  }
};

// 用語解説の定義
const tooltips = {
  landArea: '物件の土地の面積です。㎡単位で入力してください。登記簿謄本で確認できます。',
  buildingArea: '建物の延床面積です。㎡単位で入力してください。各階の床面積の合計です。',
  roadPrice: '国税庁が定める路線価格です。相続税評価額の基準となる価格で、実勢価格の約80%程度です。',
  marketValue: '将来の売却想定価格です。現在の市場価格や将来の市況を考慮して設定してください。',
  purchasePrice: '物件の購入価格です。土地と建物の合計金額を万円単位で入力してください。',
  otherCosts: '登記費用、仲介手数料、印紙税などの取得にかかる諸経費です。購入価格の3-8%程度が目安です。',
  renovationCost: 'リフォームや修繕にかかる費用です。入居前に必要な工事費用を見積もってください。',
  monthlyRent: '月額の賃料収入です。近隣相場を調査して適切な賃料を設定してください。',
  managementFee: '管理会社への委託料や共益費などの月額費用です。賃料の5-10%程度が一般的です。',
  fixedCost: '保険料、修繕積立金など毎月発生するその他の固定費用です。',
  propertyTax: '固定資産税と都市計画税の年額です。毎年5月頃に送付される納税通知書で確認できます。',
  vacancyRate: '年間を通じた空室の割合です。地域の特性や物件タイプを考慮して設定してください。',
  rentDecline: '年間の家賃下落率です。築年数の経過に伴う賃料の減少を想定します。一般的に1-2%程度です。',
  loanAmount: '金融機関からの借入金額です。自己資金と合わせて物件価格と諸経費をカバーします。',
  interestRate: '住宅ローンの年利です。金融機関や借入条件によって異なります。',
  loanYears: 'ローンの返済期間です。一般的に15-35年で設定します。期間が長いほど月々の返済額は少なくなります。',
  loanType: '元利均等は毎月の返済額が一定、元金均等は毎月の元金返済額が一定の方式です。',
  holdingYears: '物件を保有する予定年数です。売却タイミングの目安として設定してください。',
  exitCapRate: '売却時の利回りです。NOI（純収益）÷売却価格で算出されます。市場環境を考慮して設定してください。',
  ownershipType: '物件の所有形態です。個人所有と法人所有では税率や税務処理が異なります。',
  effectiveTaxRate: '実効税率（所得税＋住民税）です。個人：20-30%、法人：15-25%程度が目安です。',
  majorRepairCycle: '大規模修繕を行う周期です。一般的に10-15年に1回実施します。',
  majorRepairCost: '1回あたりの大規模修繕費用です。外壁塗装、屋根修理などの費用を見込んでください。',
  buildingPriceForDepreciation: '減価償却の対象となる建物価格です。購入価格から土地価格を除いた金額を設定してください。',
  depreciationYears: '減価償却の償却期間です。構造により異なります（木造22年、鉄骨造34年、RC造47年など）。'
};

const Simulator: React.FC = () => {
  const { user } = useAuthContext();
  const { saveSimulation, getSimulations, loading: dbLoading } = useSupabaseData();
  const location = useLocation();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [inputs, setInputs] = useState<any>(sampleProperties.default.data);




  // 初回アクセス時にチュートリアルを表示
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem('hasSeenTutorial', 'true');
    }
  }, []);

  // URLパラメータから編集IDを取得
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const editId = searchParams.get('edit');
    if (editId) {
      setEditingId(editId);
      loadExistingData(editId);
    }
  }, [location.search]);

  // 既存データを読み込む
  const loadExistingData = async (simulationId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await getSimulations();
      
      if (error) {
        setSaveError(`データ読み込みエラー: ${error}`);
        return;
      }
      
      const simulation = data?.find(sim => sim.id === simulationId);
      if (simulation && simulation.simulation_data) {
        const simData = simulation.simulation_data;
        setInputs({
          propertyName: simData.propertyName || '品川区投資物件',
          landArea: simData.landArea || 135.00,
          buildingArea: simData.buildingArea || 150.00,
          roadPrice: simData.roadPrice || 250000,
          marketValue: simData.marketValue || 8000,
          purchasePrice: simData.purchasePrice || 6980,
          otherCosts: simData.otherCosts || 300,
          renovationCost: simData.renovationCost || 200,
          monthlyRent: simData.monthlyRent || 250000,
          managementFee: simData.managementFee || 5000,
          fixedCost: simData.fixedCost || 0,
          propertyTax: simData.propertyTax || 100000,
          vacancyRate: simData.vacancyRate || 5.00,
          rentDecline: simData.rentDecline || 1.00,
          loanAmount: simData.loanAmount || 6500,
          interestRate: simData.interestRate || 0.70,
          loanYears: simData.loanTerm || 35,
          loanType: simData.loanType || '元利均等',
          holdingYears: simData.holdingYears || 10,
          exitCapRate: simData.exitCapRate || 6.00,
          ownershipType: simData.ownershipType || '個人',
          effectiveTaxRate: simData.effectiveTaxRate || 20,
          majorRepairCycle: simData.majorRepairCycle || 10,
          majorRepairCost: simData.majorRepairCost || 200,
          buildingPriceForDepreciation: simData.buildingPriceForDepreciation || 3000,
          depreciationYears: simData.depreciationYears || 27
        });
        
        // 既存の結果も表示
        if (simulation.results) {
          setSimulationResults({
            results: {
              '表面利回り（%）': simulation.results.surfaceYield,
              'IRR（%）': simulation.results.irr,
              'CCR（%）': simulation.results.ccr,
              'DSCR（返済余裕率）': simulation.results.dscr,
              '月間キャッシュフロー（円）': simulation.results.monthlyCashFlow,
              '年間キャッシュフロー（円）': simulation.results.annualCashFlow
            },
            cash_flow_table: simulation.cash_flow_table
          });
        }
        
        setSaveMessage('✏️ 編集モード：既存のデータを読み込みました');
      }
    } catch (err: any) {
      setSaveError(`データ読み込みエラー: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
        market_value: inputs.marketValue,
        expected_sale_price: inputs.marketValue,
        ownership_type: inputs.ownershipType || '個人',
        effective_tax_rate: inputs.effectiveTaxRate || 20,
        major_repair_cycle: inputs.majorRepairCycle || 10,
        major_repair_cost: inputs.majorRepairCost || 200,
        building_price: inputs.buildingPriceForDepreciation || inputs.purchasePrice * 0.7,
        depreciation_years: inputs.depreciationYears || 27
      };
      
      console.log('FAST API送信データ:', apiData);
      console.log('ローン期間:', apiData.loan_years, '年');
      console.log('保有年数:', apiData.holding_years, '年');
      console.log('新機能フィールド確認:', {
        ownership_type: apiData.ownership_type,
        effective_tax_rate: apiData.effective_tax_rate,
        major_repair_cycle: apiData.major_repair_cycle,
        major_repair_cost: apiData.major_repair_cost,
        building_price: apiData.building_price,
        depreciation_years: apiData.depreciation_years
      });
      
      // テスト: 最大期間でのリクエスト
      if (apiData.holding_years > 10) {
        console.log('⚠️ 35年のキャッシュフローを要求中...');
      }
      
      // FAST API呼び出し（タイムアウト対応）
      const API_BASE_URL = 'https://real-estate-app-1-iii4.onrender.com';
      
      // 最初にAPIを起動させる（Health Check）
      try {
        await fetch(`${API_BASE_URL}/`, { method: 'GET' });
      } catch (e) {
        console.log('API起動中...');
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2分でタイムアウト
      
      const response = await fetch(`${API_BASE_URL}/api/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('FAST APIレスポンス:', result);
      console.log('キャッシュフローテーブルの詳細:', result.cash_flow_table);
      console.log('キャッシュフローテーブルの件数:', result.cash_flow_table?.length);
      
      if (result.results) {
        console.log('受信したキャッシュフローテーブル長:', result.cash_flow_table?.length);
        console.log('最初の5行:', result.cash_flow_table?.slice(0, 5));
        console.log('最後の5行:', result.cash_flow_table?.slice(-5));
        setSimulationResults(result);
        
        // 結果表示後に自動スクロール
        setTimeout(() => {
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 100);
        
        // ユーザーがログインしている場合はSupabaseに保存
        if (user) {
          try {
            // Supabaseスキーマに合わせたデータ形式
            const simulationData = {
              // simulation_data (JSONB) - 入力データ
              simulation_data: {
                propertyName: apiData.property_name || '無題の物件',
                location: apiData.location,
                propertyType: apiData.property_type,
                purchasePrice: apiData.purchase_price,
                monthlyRent: apiData.monthly_rent,
                managementFee: apiData.management_fee || 0,
                loanTerm: apiData.loan_years,
                interestRate: apiData.interest_rate,
                loanAmount: apiData.loan_amount,
                holdingYears: apiData.holding_years,
                vacancyRate: apiData.vacancy_rate,
                propertyTax: apiData.property_tax,
                ownershipType: apiData.ownership_type,
                effectiveTaxRate: apiData.effective_tax_rate,
                majorRepairCycle: apiData.major_repair_cycle,
                majorRepairCost: apiData.major_repair_cost,
                buildingPriceForDepreciation: apiData.building_price,
                depreciationYears: apiData.depreciation_years
              },
              // results (JSONB) - 計算結果
              results: {
                surfaceYield: result.results['表面利回り（%）'] || 0,
                netYield: result.results['実質利回り（%）'] || 0,
                irr: result.results['IRR（%）'] || 0,
                ccr: result.results['CCR（%）'] || 0,
                dscr: result.results['DSCR（返済余裕率）'] || 0,
                monthlyCashFlow: result.results['月間キャッシュフロー（円）'] || 0,
                annualCashFlow: result.results['年間キャッシュフロー（円）'] || 0
              },
              // cash_flow_table (JSONB) - キャッシュフローテーブル
              cash_flow_table: result.cash_flow_table || []
            };
            
            console.log('保存データ:', simulationData);
            const { data, error: saveError } = await saveSimulation(simulationData);
            
            if (saveError) {
              throw new Error(saveError);
            }
            
            setSaveMessage('✅ シミュレーション結果を保存しました！');
            console.log('保存成功:', data);
            
          } catch (saveError) {
            console.error('保存エラー:', saveError);
            setSaveMessage('⚠️ シミュレーションは完了しましたが、保存に失敗しました。');
          }
        } else {
          setSaveMessage('ℹ️ シミュレーションが正常に完了しました！（ログインすると結果を保存できます）');
        }
      } else {
        throw new Error('APIから予期しない形式のレスポンスが返されました');
      }
      
    } catch (error) {
      console.error('シミュレーションエラー:', error);
      console.error('エラースタック:', error instanceof Error ? error.stack : 'スタックなし');
      let errorMessage = '不明なエラー';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'APIサーバーの応答がタイムアウトしました。Renderの無料プランでは初回アクセス時に時間がかかる場合があります。再度お試しください。';
        } else {
          errorMessage = error.message;
        }
      }
      
      setSaveError(`シミュレーション処理でエラーが発生しました: ${errorMessage}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // PDF保存機能
  const handleSaveToPDF = () => {
    // PDFの印刷時に表示するタイトル
    const originalTitle = document.title;
    document.title = `${inputs.propertyName} - 不動産投資シミュレーション結果`;
    
    // 印刷ダイアログを表示
    window.print();
    
    // タイトルを元に戻す
    document.title = originalTitle;
  };

  // 必須項目のチェック
  const isFormValid = inputs.propertyName && inputs.purchasePrice > 0;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">既存データを読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb />
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI物件シミュレーター
                {editingId && (
                  <span className="ml-3 text-lg text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                    編集モード
                  </span>
                )}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTutorial(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>使い方を見る</span>
                <span className="text-sm">📖</span>
              </button>
              <BackButton />
            </div>
          </div>
          <p className="text-gray-600">
            {editingId 
              ? '既存の物件データを編集して、新しいシミュレーションを実行できます。'
              : 'AIを活用した収益シミュレーションで、最適な投資判断をサポートします。'
            }
          </p>
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
        {/* サンプル物件選択 */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-3">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              🎯
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">初回の方におすすめ</h3>
              <p className="text-sm text-blue-700">サンプル物件で投資シミュレーションを体験してみましょう</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(sampleProperties).map(([key, property]) => (
              <button
                key={key}
                onClick={() => setInputs(property.data)}
                className="text-left p-4 sm:p-3 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-md active:scale-[0.98] active:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] touch-manipulation"
              >
                <div className="font-medium text-blue-900 mb-1">{property.name}</div>
                <div className="text-xs text-blue-600">{property.description}</div>
              </button>
            ))}
          </div>
        </div>

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
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">土地面積</label>
                  <Tooltip content={tooltips.landArea} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.landArea}
                    onChange={(e) => handleInputChange('landArea', Number(e.target.value))}
                    className="w-full sm:w-20 px-3 py-2 sm:px-2 sm:py-1 border border-gray-300 rounded text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px] sm:min-h-auto touch-manipulation"
                  />
                  <span className="text-sm text-gray-500">㎡</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">建物面積</label>
                  <Tooltip content={tooltips.buildingArea} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.buildingArea}
                    onChange={(e) => handleInputChange('buildingArea', Number(e.target.value))}
                    className="w-full sm:w-20 px-3 py-2 sm:px-2 sm:py-1 border border-gray-300 rounded text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px] sm:min-h-auto touch-manipulation"
                  />
                  <span className="text-sm text-gray-500">㎡</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">路線価</label>
                  <Tooltip content={tooltips.roadPrice} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.roadPrice}
                    onChange={(e) => handleInputChange('roadPrice', Number(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">円/㎡</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">想定売却価格</label>
                  <Tooltip content={tooltips.marketValue} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.marketValue}
                    onChange={(e) => handleInputChange('marketValue', Number(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">万円</span>
                </div>
              </div>
            </div>
          </div>

          {/* 💰 取得・初期費用 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 取得・初期費用</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">購入価格</label>
                  <Tooltip content={tooltips.purchasePrice} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.purchasePrice}
                    onChange={(e) => handleInputChange('purchasePrice', Number(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">万円</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">諸経費</label>
                  <Tooltip content={tooltips.otherCosts} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.otherCosts}
                    onChange={(e) => handleInputChange('otherCosts', Number(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">万円</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">改装費</label>
                  <Tooltip content={tooltips.renovationCost} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.renovationCost}
                    onChange={(e) => handleInputChange('renovationCost', Number(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">万円</span>
                </div>
              </div>
            </div>
          </div>

          {/* 📈 収益情報 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 収益情報</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">月額賃料</label>
                  <Tooltip content={tooltips.monthlyRent} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.monthlyRent}
                    onChange={(e) => handleInputChange('monthlyRent', Number(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">円</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">管理費</label>
                  <Tooltip content={tooltips.managementFee} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.managementFee}
                    onChange={(e) => handleInputChange('managementFee', Number(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">円</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">その他固定費</label>
                  <Tooltip content={tooltips.fixedCost} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.fixedCost}
                    onChange={(e) => handleInputChange('fixedCost', Number(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">円</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">固定資産税</label>
                  <Tooltip content={tooltips.propertyTax} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.propertyTax}
                    onChange={(e) => handleInputChange('propertyTax', Number(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">円</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">空室率</label>
                  <Tooltip content={tooltips.vacancyRate} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.vacancyRate}
                    onChange={(e) => handleInputChange('vacancyRate', Number(e.target.value))}
                    className="w-full sm:w-20 px-3 py-2 sm:px-2 sm:py-1 border border-gray-300 rounded text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px] sm:min-h-auto touch-manipulation"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">家賃下落率</label>
                  <Tooltip content={tooltips.rentDecline} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.rentDecline}
                    onChange={(e) => handleInputChange('rentDecline', Number(e.target.value))}
                    className="w-full sm:w-20 px-3 py-2 sm:px-2 sm:py-1 border border-gray-300 rounded text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px] sm:min-h-auto touch-manipulation"
                  />
                  <span className="text-sm text-gray-500">%/年</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🏦 借入条件 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏦 借入条件</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">借入額</label>
                  <Tooltip content={tooltips.loanAmount} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', Number(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">万円</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">金利</label>
                  <Tooltip content={tooltips.interestRate} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.interestRate}
                    onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                    className="w-full sm:w-20 px-3 py-2 sm:px-2 sm:py-1 border border-gray-300 rounded text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px] sm:min-h-auto touch-manipulation"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">返済期間</label>
                  <Tooltip content={tooltips.loanYears} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.loanYears}
                    onChange={(e) => handleInputChange('loanYears', Number(e.target.value))}
                    className="w-full sm:w-20 px-3 py-2 sm:px-2 sm:py-1 border border-gray-300 rounded text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px] sm:min-h-auto touch-manipulation"
                  />
                  <span className="text-sm text-gray-500">年</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">借入形式</label>
                  <Tooltip content={tooltips.loanType} />
                </div>
                <select
                  value={inputs.loanType}
                  onChange={(e) => handleInputChange('loanType', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
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
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">保有年数</label>
                  <Tooltip content={tooltips.holdingYears} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={inputs.holdingYears}
                    onChange={(e) => handleInputChange('holdingYears', Number(e.target.value))}
                    className="w-full sm:w-20 px-3 py-2 sm:px-2 sm:py-1 border border-gray-300 rounded text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px] sm:min-h-auto touch-manipulation"
                  />
                  <span className="text-sm text-gray-500">年</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">売却CapRate</label>
                  <Tooltip content={tooltips.exitCapRate} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.exitCapRate}
                    onChange={(e) => handleInputChange('exitCapRate', Number(e.target.value))}
                    className="w-full sm:w-20 px-3 py-2 sm:px-2 sm:py-1 border border-gray-300 rounded text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px] sm:min-h-auto touch-manipulation"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 📊 税金条件 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 税金条件</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">所有形態</label>
                  <Tooltip content={tooltips.ownershipType} />
                </div>
                <select
                  value={inputs.ownershipType || '個人'}
                  onChange={(e) => handleInputChange('ownershipType', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="個人">個人</option>
                  <option value="法人">法人</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">実効税率</label>
                  <Tooltip content={tooltips.effectiveTaxRate} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.effectiveTaxRate || 20}
                    onChange={(e) => handleInputChange('effectiveTaxRate', Number(e.target.value))}
                    className="w-full sm:w-20 px-3 py-2 sm:px-2 sm:py-1 border border-gray-300 rounded text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px] sm:min-h-auto touch-manipulation"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                💡 実効税率の目安: 個人(20-30%) / 法人(15-25%)
              </div>
            </div>
          </div>

          {/* 🔧 大規模修繕設定 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 大規模修繕設定</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">修繕周期</label>
                  <Tooltip content={tooltips.majorRepairCycle} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="1"
                    max="35"
                    value={inputs.majorRepairCycle || 10}
                    onChange={(e) => handleInputChange('majorRepairCycle', Number(e.target.value))}
                    className="w-full sm:w-20 px-3 py-2 sm:px-2 sm:py-1 border border-gray-300 rounded text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[44px] sm:min-h-auto touch-manipulation"
                  />
                  <span className="text-sm text-gray-500">年</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">修繕費用</label>
                  <Tooltip content={tooltips.majorRepairCost} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="10"
                    value={inputs.majorRepairCost || 200}
                    onChange={(e) => handleInputChange('majorRepairCost', Number(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">万円</span>
                </div>
              </div>
            </div>
          </div>

          {/* 📉 減価償却設定 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📉 減価償却設定</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">建物価格</label>
                  <Tooltip content={tooltips.buildingPriceForDepreciation} />
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="100"
                    value={inputs.buildingPriceForDepreciation || 3000}
                    onChange={(e) => handleInputChange('buildingPriceForDepreciation', Number(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">万円</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <label className="text-sm font-medium text-gray-700">償却年数</label>
                  <Tooltip content={tooltips.depreciationYears} />
                </div>
                <select
                  value={inputs.depreciationYears || 27}
                  onChange={(e) => handleInputChange('depreciationYears', Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={22}>22年（木造）</option>
                  <option value={27}>27年（軽量鉄骨）</option>
                  <option value={34}>34年（重量鉄骨）</option>
                  <option value={39}>39年（SRC造）</option>
                  <option value={47}>47年（RC造）</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6">
            <div className="flex justify-center">
              <button 
                onClick={handleSimulation}
                disabled={isSimulating || !isFormValid}
                className={`flex items-center justify-center px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 min-h-[56px] touch-manipulation ${
                  isSimulating || !isFormValid
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:from-purple-800 active:to-indigo-800 active:scale-[0.98] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
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

        {/* 保存状況表示 */}
        {(saveMessage || saveError) && (
          <div className="mt-6">
            {saveMessage && (
              <div className={`p-4 rounded-lg border flex items-center ${
                saveMessage.includes('✅') ? 'text-green-700 bg-green-50 border-green-200' :
                saveMessage.includes('⚠️') ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
                'text-blue-700 bg-blue-50 border-blue-200'
              }`}>
                <span>{saveMessage}</span>
              </div>
            )}
            {saveError && (
              <div className="p-4 rounded-lg border flex items-center text-red-700 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>{saveError}</span>
              </div>
            )}
          </div>
        )}

        {/* シミュレーション結果表示 */}
        {simulationResults && (
          <div 
            ref={resultsRef}
            className="mt-6 bg-white rounded-lg border-2 border-blue-200 shadow-lg p-6 scroll-mt-4 simulation-results print:m-0 print:shadow-none"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-1 h-8 bg-blue-500 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-gray-900">📊 シミュレーション結果</h2>
                <div className="ml-3 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full animate-pulse">
                  NEW!
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {user && saveMessage?.includes('✅') && (
                  <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    ✓ マイページに保存済み
                  </span>
                )}
                <button
                  onClick={handleSaveToPDF}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 print:hidden"
                  title="PDFとして保存"
                >
                  <Download size={18} />
                  <span>PDF保存</span>
                </button>
              </div>
            </div>
            
            {/* 重要投資指標 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 重要投資指標</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* IRR */}
                <MetricCard
                  title="IRR"
                  subtitle="内部収益率"
                  value={simulationResults.results['IRR（%）']}
                  unit="%"
                  format="percentage"
                  thresholds={{
                    excellent: 15,
                    good: 10,
                    warning: 5
                  }}
                  description="投資全体の年間収益率。15%以上で優秀、10%以上で良好。"
                />
                
                {/* CCR */}
                <MetricCard
                  title="CCR"
                  subtitle="自己資金回収率"
                  value={simulationResults.results['CCR（%）']}
                  unit="%"
                  format="percentage"
                  thresholds={{
                    excellent: 12,
                    good: 8,
                    warning: 5
                  }}
                  description="自己資金に対する年間収益率。12%以上で優秀、8%以上で良好。"
                />
                
                {/* DSCR */}
                <MetricCard
                  title="DSCR"
                  subtitle="返済余裕率"
                  value={simulationResults.results['DSCR（返済余裕率）']}
                  format="number"
                  thresholds={{
                    excellent: 1.5,
                    good: 1.3,
                    warning: 1.1
                  }}
                  description="債務返済能力の指標。1.3以上で安全、1.5以上で優秀。"
                />
                
                {/* 表面利回り */}
                <MetricCard
                  title="表面利回り"
                  subtitle="粗利回り"
                  value={simulationResults.results['表面利回り（%）']}
                  unit="%"
                  format="percentage"
                  thresholds={{
                    excellent: 8,
                    good: 6,
                    warning: 4
                  }}
                  description="年間賃料収入÷物件価格。8%以上で優秀、6%以上で良好。"
                />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 キャッシュフロー</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 月間キャッシュフロー */}
                <MetricCard
                  title="月間キャッシュフロー"
                  value={simulationResults.results['月間キャッシュフロー（円）']}
                  unit="円"
                  format="currency"
                  thresholds={{
                    excellent: 50000,
                    good: 20000,
                    warning: 0
                  }}
                  description="毎月の手取り収入。プラスであれば収益物件として機能。"
                />
                
                {/* 年間キャッシュフロー */}
                <MetricCard
                  title="年間キャッシュフロー"
                  value={simulationResults.results['年間キャッシュフロー（円）']}
                  unit="円"
                  format="currency"
                  thresholds={{
                    excellent: 600000,
                    good: 240000,
                    warning: 0
                  }}
                  description="年間の手取り収入。投資収益の実額。"
                />
              </div>
            </div>
            
            {/* 追加投資指標 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 詳細投資指標</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* NOI */}
                <MetricCard
                  title="NOI"
                  subtitle="純営業収益"
                  value={simulationResults.results['NOI（円）'] || 0}
                  unit="円"
                  format="currency"
                  thresholds={{
                    excellent: 1000000,
                    good: 500000,
                    warning: 100000
                  }}
                  description="年間賃料収入から運営費を差し引いた純収益。物件の収益力を示す。"
                />
                
                {/* ROI */}
                <MetricCard
                  title="ROI"
                  subtitle="投資収益率"
                  value={simulationResults.results['ROI（%）'] || 0}
                  unit="%"
                  format="percentage"
                  thresholds={{
                    excellent: 15,
                    good: 10,
                    warning: 5
                  }}
                  description="投資額に対する税引後キャッシュフローの割合。ROI=年間CF÷自己資金。"
                />
                
                {/* LTV */}
                <MetricCard
                  title="LTV"
                  subtitle="融資比率"
                  value={simulationResults.results['LTV（%）'] || 0}
                  unit="%"
                  format="percentage"
                  thresholds={{
                    excellent: 70,
                    good: 80,
                    warning: 90
                  }}
                  description="物件価格に対する融資額の割合。低いほど安全性が高い。"
                />
              </div>
            </div>
            
            {/* 売却分析 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 売却分析</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 想定売却価格 */}
                <MetricCard
                  title="想定売却価格"
                  value={simulationResults.results['想定売却価格（万円）'] || 0}
                  unit="万円"
                  format="number"
                  description="保有期間終了時の想定売却価格。"
                />
                
                {/* 残債 */}
                <MetricCard
                  title="残債"
                  value={simulationResults.results['残債（万円）'] || 0}
                  unit="万円"
                  format="number"
                  description="売却時のローン残高。"
                />
                
                {/* 売却コスト */}
                <MetricCard
                  title="売却コスト"
                  value={simulationResults.results['売却コスト（万円）'] || 0}
                  unit="万円"
                  format="number"
                  description="売却時にかかる諸費用（仲介手数料等）。"
                />
                
                {/* 売却益 */}
                <MetricCard
                  title="売却益"
                  value={simulationResults.results['売却益（万円）'] || 0}
                  unit="万円"
                  format="number"
                  thresholds={{
                    excellent: 500,
                    good: 100,
                    warning: 0
                  }}
                  description="売却価格から残債と売却コストを引いた手取り額。"
                />
              </div>
            </div>
            
            {/* キャッシュフロー表 */}
            {simulationResults.cash_flow_table && simulationResults.cash_flow_table.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">📋 年次キャッシュフロー詳細</h3>
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                    {simulationResults.cash_flow_table.length}年分のデータ
                  </span>
                </div>
                
                {/* キャッシュフローグラフ */}
                <div className="mb-6">
                  <CashFlowChart data={simulationResults.cash_flow_table} />
                </div>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">年次</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">満室想定収入</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">空室率</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">実効収入</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">経費</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">減価償却</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">税金</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">大規模修繕</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">初期リフォーム</th>
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
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{(row['減価償却'] || 0).toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{(row['税金'] || 0).toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{row['大規模修繕'].toLocaleString()}円</td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-b">{(row['初期リフォーム'] || 0).toLocaleString()}円</td>
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


        {/* チュートリアル */}
        <Tutorial 
          isOpen={showTutorial} 
          onClose={() => setShowTutorial(false)} 
        />
      </div>
    </div>
  );
};

export default Simulator;