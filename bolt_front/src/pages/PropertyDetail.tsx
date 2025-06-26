import React, { useState } from 'react';
import { 
  Building,
  MapPin,
  Calendar,
  Ruler,
  TrendingUp,
  TrendingDown,
  Download,
  Printer,
  Calculator,
  BarChart3,
  PieChart,
  Target,
  DollarSign,
  Percent,
  Home,
  ArrowLeft,
  ChevronDown,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Star,
  Award,
  CreditCard,
  Users,
  Shield,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Breadcrumb from '../components/Breadcrumb';

const PropertyDetail: React.FC = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(10);

  // 物件データ
  const propertyData = {
    id: 'SIM-001',
    name: '天沼町',
    fullName: '【指値相談可能‼】【八王子市高利回り8.44%!!】',
    location: '埼玉県さいたま市大宮区天沼町',
    fullAddress: '東京都八王子市並木町',
    nearestStation: 'ＪＲ中央本線 西八王子駅 徒歩13分',
    buildYear: '1995年2月（築30年）',
    structure: 'RC',
    totalUnits: 16,
    floors: 3,
    layout: 'ワンルーム',
    landArea: '258.6㎡',
    buildingArea: '407.12㎡',
    propertyType: '一棟アパート/マンション',
    acquisitionPrice: 12000, // 万円
    annualIncome: 1012.8, // 万円
    surfaceYield: 8.44,
    netYield: 6.2,
    managementFee: 0,
    cashFlow: 32000,
    date: '2025/01/14',
    status: 'completed',
    thumbnail: 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=800'
  };

  // AI評価データ
  const aiEvaluation = {
    overallGrade: 'A',
    gradeColor: 'bg-green-500',
    surfaceYield: 8.44,
    netYield: 6.2,
    cashOnCash: 8.63,
    dscr: 1.28,
    irr: 16.94,
    comment: '優良案件: IRRが15%を超えており、非常に魅力的な投資案件です',
    commentColor: 'text-green-600'
  };

  // 市場分析データ
  const marketAnalysis = {
    marketAverage: 54.81,
    propertyPrice: 51.70,
    difference: -5.7,
    similarProperties: 370,
    totalData: 1450
  };

  // キャッシュフロー分析データ
  const cashFlowData = {
    monthlyIncome: 84.4,
    monthlyExpenses: 32.2,
    monthlyCashFlow: 24.5,
    annualCashFlow: 294,
    loanPayment: 209.4,
    selfCapital: 980
  };

  // 年次データ（10年分）
  const yearlyData = [
    { year: 1, income: 1012.8, expenses: 152, repairs: 592, cashFlow: -190.6, cumulative: -190.6 },
    { year: 2, income: 1000.1, expenses: 152, repairs: 0, cashFlow: 389.0, cumulative: 198.4 },
    { year: 3, income: 987.5, expenses: 152, repairs: 0, cashFlow: 376.6, cumulative: 575.0 },
    { year: 4, income: 974.8, expenses: 152, repairs: 0, cashFlow: 364.3, cumulative: 939.3 },
    { year: 5, income: 962.2, expenses: 152, repairs: 0, cashFlow: 352.0, cumulative: 1291.3 },
    { year: 6, income: 949.7, expenses: 152, repairs: 300, cashFlow: 139.8, cumulative: 1431.1 },
    { year: 7, income: 937.2, expenses: 152, repairs: 0, cashFlow: 327.3, cumulative: 1758.4 },
    { year: 8, income: 924.8, expenses: 152, repairs: 0, cashFlow: 314.9, cumulative: 2073.3 },
    { year: 9, income: 912.5, expenses: 152, repairs: 0, cashFlow: 302.6, cumulative: 2375.9 },
    { year: 10, income: 900.3, expenses: 152, repairs: 400, cashFlow: -39.6, cumulative: 2336.3 }
  ];

  // 将来予測データ
  const futureProjection = {
    exitPrice: 8000,
    totalReturn: 3690,
    irr: 16.94,
    totalCashFlow: 2336.3,
    saleProfit: 1353.7
  };

  // 人口推移データ（将来推計人口250mメッシュ）
  const populationData = [
    { year: 2025, age0to14: 4.0052, age15to64: 26.5672, age65plus: 4.6597, total: 35.2321 },
    { year: 2030, age0to14: 6.3083, age15to64: 25.2371, age65plus: 5.1399, total: 36.6853 },
    { year: 2035, age0to14: 5.5584, age15to64: 26.0012, age65plus: 5.6367, total: 37.1963 },
    { year: 2040, age0to14: 5.2822, age15to64: 25.2657, age65plus: 7.0973, total: 37.6452 },
    { year: 2045, age0to14: 4.1742, age15to64: 25.0210, age65plus: 8.4590, total: 37.6542 },
    { year: 2050, age0to14: 3.7596, age15to64: 23.9571, age65plus: 9.6746, total: 37.3913 },
    { year: 2055, age0to14: 3.0981, age15to64: 19.7426, age65plus: 14.0151, total: 36.8559 },
    { year: 2060, age0to14: 3.0493, age15to64: 20.3068, age65plus: 12.9767, total: 36.3328 },
    { year: 2065, age0to14: 3.2795, age15to64: 19.3075, age65plus: 13.0836, total: 35.6705 },
    { year: 2070, age0to14: 3.6312, age15to64: 18.9953, age65plus: 12.0800, total: 34.7065 }
  ];

  // 再シミュレーション用の入力値
  const [simulationInputs, setSimulationInputs] = useState({
    selfCapital: 980,
    loanAmount: 6500,
    interestRate: 0.70,
    loanTerm: 35
  });

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()}万円`;
  };

  const handleInputChange = (field: string, value: number) => {
    setSimulationInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 人口推移チャートコンポーネント
  const PopulationChart = () => {
    const maxTotal = Math.max(...populationData.map(d => d.total));
    const chartHeight = 200;
    const chartWidth = 600;
    const padding = 40;

    return (
      <div className="bg-white p-6 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 text-blue-600 mr-2" />
          エリア人口推移（250mメッシュ）
        </h4>
        
        {/* チャート */}
        <div className="mb-6">
          <svg width={chartWidth} height={chartHeight + padding * 2} className="w-full">
            {/* 背景グリッド */}
            {[0, 10, 20, 30, 40].map((value) => {
              const y = chartHeight - (value / maxTotal) * chartHeight + padding;
              return (
                <g key={value}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text
                    x={padding - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-500"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* X軸ラベル */}
            {populationData.map((data, index) => {
              const x = padding + (index / (populationData.length - 1)) * (chartWidth - padding * 2);
              return (
                <text
                  key={data.year}
                  x={x}
                  y={chartHeight + padding + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {data.year}
                </text>
              );
            })}

            {/* 総人口ライン */}
            <path
              d={populationData.map((data, index) => {
                const x = padding + (index / (populationData.length - 1)) * (chartWidth - padding * 2);
                const y = chartHeight - (data.total / maxTotal) * chartHeight + padding;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke="#3b82f6"
              strokeWidth="3"
              fill="none"
            />

            {/* 15-64歳人口ライン */}
            <path
              d={populationData.map((data, index) => {
                const x = padding + (index / (populationData.length - 1)) * (chartWidth - padding * 2);
                const y = chartHeight - (data.age15to64 / maxTotal) * chartHeight + padding;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke="#10b981"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
            />

            {/* 65歳以上人口ライン */}
            <path
              d={populationData.map((data, index) => {
                const x = padding + (index / (populationData.length - 1)) * (chartWidth - padding * 2);
                const y = chartHeight - (data.age65plus / maxTotal) * chartHeight + padding;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke="#f59e0b"
              strokeWidth="2"
              fill="none"
              strokeDasharray="3,3"
            />

            {/* データポイント */}
            {populationData.map((data, index) => {
              const x = padding + (index / (populationData.length - 1)) * (chartWidth - padding * 2);
              const y = chartHeight - (data.total / maxTotal) * chartHeight + padding;
              return (
                <circle
                  key={data.year}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3b82f6"
                />
              );
            })}
          </svg>
        </div>

        {/* 凡例 */}
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
            <span className="text-gray-600">総人口</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-green-500 mr-2" style={{ borderTop: '2px dashed #10b981', backgroundColor: 'transparent' }}></div>
            <span className="text-gray-600">15-64歳（生産年齢人口）</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-yellow-500 mr-2" style={{ borderTop: '2px dotted #f59e0b', backgroundColor: 'transparent' }}></div>
            <span className="text-gray-600">65歳以上</span>
          </div>
        </div>

        {/* 人口データサマリー */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">現在人口（2025年）</div>
            <div className="text-lg font-bold text-blue-600">{populationData[0].total.toFixed(1)}人</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">ピーク人口（2045年）</div>
            <div className="text-lg font-bold text-green-600">{Math.max(...populationData.map(d => d.total)).toFixed(1)}人</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">2070年予測</div>
            <div className="text-lg font-bold text-yellow-600">{populationData[populationData.length - 1].total.toFixed(1)}人</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">人口変化率</div>
            <div className="text-lg font-bold text-red-600">
              {(((populationData[populationData.length - 1].total - populationData[0].total) / populationData[0].total) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* 分析コメント */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">人口動向分析</p>
              <p>
                このエリアの人口は2045年頃にピークを迎え、その後緩やかに減少する予測です。
                生産年齢人口（15-64歳）の減少と高齢化の進行が見込まれますが、
                賃貸需要の中心となる生産年齢人口は2050年頃まで比較的安定しており、
                中長期的な賃貸経営には良好な環境と考えられます。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb />
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <BackButton />
              <h1 className="text-2xl font-bold text-gray-900">投資用物件詳細</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50">
                <Printer className="h-4 w-4 mr-2" />
                この画面をPDFで出力
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 1. 物件ビジュアル & 概要 - ブロック型レイアウト */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* タグ */}
            <div className="p-6 pb-0">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded">一棟</span>
                <span className="px-3 py-1 bg-green-600 text-white text-sm rounded">会員限定</span>
                <span className="px-3 py-1 bg-red-600 text-white text-sm rounded">NEW</span>
              </div>

              {/* 物件タイトル */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{propertyData.fullName}</h2>
            </div>

            <div className="flex flex-col lg:flex-row p-6 pt-0">
              {/* 左側: 物件画像 - ブロック型 */}
              <div className="lg:w-1/3 mb-6 lg:mb-0 lg:mr-8">
                <div className="relative">
                  <img
                    src={propertyData.thumbnail}
                    alt={propertyData.name}
                    className="w-full h-64 lg:h-80 object-cover rounded-lg"
                  />
                </div>
              </div>

              {/* 右側: 物件情報 */}
              <div className="lg:w-2/3">
                {/* 物件詳細情報 - 2列レイアウト */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  {/* 左列 */}
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">価格</span>
                      <span className="font-bold text-lg">{formatCurrency(propertyData.acquisitionPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">年間総収入</span>
                      <span className="font-medium">{propertyData.annualIncome}万円</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">所在地</span>
                      <span className="font-medium">{propertyData.fullAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">最寄駅</span>
                      <span className="font-medium">{propertyData.nearestStation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">築年月</span>
                      <span className="font-medium">{propertyData.buildYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">総戸数</span>
                      <span className="font-medium">{propertyData.totalUnits}戸</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">間取り</span>
                      <span className="font-medium">{propertyData.layout}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">土地面積</span>
                      <span className="font-medium">{propertyData.landArea}</span>
                    </div>
                  </div>

                  {/* 右列 */}
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">表面利回り</span>
                      <span className="font-bold text-lg text-green-600">{propertyData.surfaceYield}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium"></span>
                      <span className="font-medium"></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium"></span>
                      <span className="font-medium"></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium"></span>
                      <span className="font-medium"></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">建物構造</span>
                      <span className="font-medium">{propertyData.structure}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">階数</span>
                      <span className="font-medium">{propertyData.floors}階</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium"></span>
                      <span className="font-medium"></span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">延床面積</span>
                      <span className="font-medium">{propertyData.buildingArea}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. AI評価サマリー */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">AI評価サマリー</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-12 h-12 ${aiEvaluation.gradeColor} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold text-xl">{aiEvaluation.overallGrade}</span>
                </div>
                <div className="text-sm text-gray-600">総合評価</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">表面利回り</div>
                <div className="text-2xl font-bold text-blue-600">{aiEvaluation.surfaceYield}%</div>
                <div className="text-xs text-green-600">優良</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">実質利回り</div>
                <div className="text-2xl font-bold text-green-600">{aiEvaluation.netYield}%</div>
                <div className="text-xs text-green-600">良好</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">CCR</div>
                <div className="text-2xl font-bold text-purple-600">{aiEvaluation.cashOnCash}%</div>
                <div className="text-xs text-green-600">良好</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">DSCR</div>
                <div className="text-2xl font-bold text-orange-600">{aiEvaluation.dscr}</div>
                <div className="text-xs text-yellow-600">注意</div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className={`font-medium ${aiEvaluation.commentColor}`}>{aiEvaluation.comment}</span>
              </div>
            </div>
          </div>

          {/* 4. 価格の妥当性 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">価格の妥当性</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">市場分析データ</div>
                  <div className="text-xs text-gray-500">
                    {marketAnalysis.totalData}件のデータから{marketAnalysis.similarProperties}件の類似物件を抽出
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">市場平均価格</span>
                    <span className="font-bold text-lg">{marketAnalysis.marketAverage}万円/㎡</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-600">あなたの物件</span>
                    <span className="font-bold text-lg text-blue-600">{marketAnalysis.propertyPrice}万円/㎡</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-600">価格差</span>
                    <span className="font-bold text-lg text-green-600">{marketAnalysis.difference}%</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-4">価格分布比較</div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="relative h-32">
                    <div className="absolute bottom-0 left-0 w-full flex items-end justify-center space-x-1">
                      {[20, 35, 45, 60, 40, 25, 15, 10].map((height, index) => (
                        <div
                          key={index}
                          className={`w-8 rounded-t ${index === 3 ? 'bg-blue-500' : 'bg-gray-300'}`}
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="text-xs text-red-600 mt-1">あなたの物件</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>40万円/㎡</span>
                    <span>60万円/㎡</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 人口推移グラフ */}
          <PopulationChart />

          {/* 5. キャッシュフロー分析 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">キャッシュフロー分析</h3>
            
            {/* 月次・年次サマリー */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">月間収入</div>
                <div className="text-xl font-bold text-blue-600">{cashFlowData.monthlyIncome}万円</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">月間支出</div>
                <div className="text-xl font-bold text-red-600">{cashFlowData.monthlyExpenses}万円</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">月間CF</div>
                <div className="text-xl font-bold text-green-600">{cashFlowData.monthlyCashFlow}万円</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">年間CF</div>
                <div className="text-xl font-bold text-purple-600">{cashFlowData.annualCashFlow}万円</div>
              </div>
            </div>

            {/* 年次キャッシュフロー表 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">年</th>
                    <th className="px-4 py-2 text-right">収入</th>
                    <th className="px-4 py-2 text-right">運営費用</th>
                    <th className="px-4 py-2 text-right">大規模修繕</th>
                    <th className="px-4 py-2 text-right">年間CF</th>
                    <th className="px-4 py-2 text-right">累計CF</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyData.map((data) => (
                    <tr key={data.year} className="border-b">
                      <td className="px-4 py-2">{data.year}年目</td>
                      <td className="px-4 py-2 text-right">{data.income.toFixed(1)}万円</td>
                      <td className="px-4 py-2 text-right">{data.expenses}万円</td>
                      <td className="px-4 py-2 text-right">{data.repairs}万円</td>
                      <td className={`px-4 py-2 text-right font-medium ${data.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.cashFlow.toFixed(1)}万円
                      </td>
                      <td className="px-4 py-2 text-right font-medium">{data.cumulative.toFixed(1)}万円</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. 将来予測 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">将来予測（AI算出）</h3>
            
            {/* 売却時期選択 */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">売却時期を変更してシミュレーション</h4>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="flex-1"
                />
                <div className="text-lg font-bold text-indigo-600">{selectedYear}年目</div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1年</span>
                <span>15年</span>
                <span>30年</span>
              </div>
            </div>

            {/* 予測結果 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">予想売却価格</div>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(futureProjection.exitPrice)}</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">総収益</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(futureProjection.totalReturn)}</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">IRR</div>
                <div className="text-2xl font-bold text-purple-600">{futureProjection.irr}%</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  {selectedYear}年後の売却で、累計キャッシュフロー{futureProjection.totalCashFlow}万円 + 売却益{futureProjection.saleProfit}万円の収益が見込まれます
                </span>
              </div>
            </div>
          </div>

          {/* 7. 再シミュレーション入力 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">条件を変更して再シミュレーション</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">自己資金（万円）</label>
                <input
                  type="number"
                  value={simulationInputs.selfCapital}
                  onChange={(e) => handleInputChange('selfCapital', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">借入額（万円）</label>
                <input
                  type="number"
                  value={simulationInputs.loanAmount}
                  onChange={(e) => handleInputChange('loanAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">金利（%）</label>
                <input
                  type="number"
                  step="0.01"
                  value={simulationInputs.interestRate}
                  onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">返済期間（年）</label>
                <input
                  type="number"
                  value={simulationInputs.loanTerm}
                  onChange={(e) => handleInputChange('loanTerm', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <button className="w-full px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 font-medium">
              <Calculator className="h-5 w-5 mr-2 inline" />
              再シミュレーション実行
            </button>
          </div>

          {/* 8. 物件スペック詳細 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">物件スペック詳細</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">建物情報</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">建物構造</span>
                    <span className="font-medium">{propertyData.structure}造</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">階数</span>
                    <span className="font-medium">{propertyData.floors}階建て</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">総戸数</span>
                    <span className="font-medium">{propertyData.totalUnits}戸</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">土地面積</span>
                    <span className="font-medium">{propertyData.landArea}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">延床面積</span>
                    <span className="font-medium">{propertyData.buildingArea}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">法的情報</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">土地権利</span>
                    <span className="font-medium">所有権</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">用途地域</span>
                    <span className="font-medium">第一種住居地域</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">建ぺい率</span>
                    <span className="font-medium">60%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">容積率</span>
                    <span className="font-medium">200%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">接道状況</span>
                    <span className="font-medium">南側6m公道</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;