import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit,
  AlertCircle,
  Download
} from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useAuthContext } from '../components/AuthProvider';
import CashFlowChart from '../components/CashFlowChart';
import MetricCard from '../components/MetricCard';
import Breadcrumb from '../components/Breadcrumb';
import { ShareButton } from '../components/ShareButton';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const SimulationResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const { getSimulations } = useSupabaseData();
  
  const [simulation, setSimulation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrollHighlighted, setIsScrollHighlighted] = useState(false);

  useEffect(() => {
    const loadSimulation = async () => {
      if (!user || !id) {
        setError('ユーザー認証またはシミュレーションIDが無効です');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await getSimulations();
        
        if (fetchError) {
          setError('データの取得に失敗しました');
          return;
        }

        const foundSimulation = data?.find((sim: any) => sim.id === id);
        if (!foundSimulation) {
          setError('指定されたシミュレーションが見つかりません');
          return;
        }

        setSimulation(foundSimulation);
      } catch (err: any) {
        setError('データの読み込み中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    loadSimulation();
  }, [id, user, getSimulations]);

  // スクロール機能
  useEffect(() => {
    // URLクエリパラメータでscrollTo=resultsが指定されている場合
    const searchParams = new URLSearchParams(location.search);
    const scrollTo = searchParams.get('scrollTo');
    
    if (scrollTo === 'results' && !loading && simulation) {
      // ページロード完了後、少し遅延してスクロール
      const timer = setTimeout(() => {
        const resultsElement = document.getElementById('simulation-results');
        if (resultsElement) {
          // ハイライト効果を一時的に表示
          setIsScrollHighlighted(true);
          
          resultsElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });

          // 3秒後にハイライトを削除
          setTimeout(() => {
            setIsScrollHighlighted(false);
          }, 3000);
        }
      }, 500); // 500ms遅延でコンテンツの読み込み完了を待つ

      return () => clearTimeout(timer);
    }
  }, [location.search, loading, simulation]);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()}円`;
  };

  const formatPercent = (value: number) => {
    return `${value}%`;
  };

  // PDF保存機能
  const handleSavePDF = async () => {
    try {
      const element = document.getElementById('pdf-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `シミュレーション結果_${simulationData?.propertyName || 'property'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">シミュレーション結果を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            マイページに戻る
          </button>
        </div>
      </div>
    );
  }

  const simulationData = simulation.simulation_data || {};
  const results = simulation.results || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* PDF出力用のコンテンツラッパー */}
        <div id="pdf-content">
        {/* Header */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { name: 'マイページ', path: '/dashboard' },
              { name: simulationData.propertyName || '物件詳細', path: '', current: true }
            ]}
          />
          
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {simulationData.propertyName || '物件詳細'}
              </h1>
              <p className="text-gray-600 mt-1">
                {simulationData.location || '住所未設定'}
              </p>
            </div>
            
            <div className="flex space-x-3">
              {/* 共有ボタン */}
              {simulation && (
                <ShareButton
                  propertyId={id!}
                  simulationData={results}
                  propertyData={simulationData}
                  size="medium"
                />
              )}
              
              {/* PDF保存ボタン */}
              <button
                onClick={handleSavePDF}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF保存
              </button>
              
              <button
                onClick={() => navigate(`/simulator?edit=${id}`)}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                編集
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                マイページに戻る
              </button>
            </div>
          </div>
        </div>

        {/* Property Image and Basic Info */}
        {simulationData.propertyImageUrl && (
          <div className="mb-6">
            <img
              src={simulationData.propertyImageUrl}
              alt={simulationData.propertyName}
              className="w-full h-64 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Property URL and Memo */}
        {(simulationData.propertyUrl || simulationData.propertyMemo) && (
          <div className="bg-white rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📌 物件情報</h3>
            {simulationData.propertyUrl && (
              <div className="mb-3">
                <span className="text-gray-500 text-sm">物件URL:</span>
                <div>
                  <a 
                    href={simulationData.propertyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {simulationData.propertyUrl}
                  </a>
                </div>
              </div>
            )}
            {simulationData.propertyMemo && (
              <div>
                <span className="text-gray-500 text-sm">メモ:</span>
                <div className="text-gray-900">{simulationData.propertyMemo}</div>
              </div>
            )}
          </div>
        )}

        {/* Key Metrics Grid */}
        <div 
          id="simulation-results" 
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 scroll-mt-4 transition-all duration-1000 ${
            isScrollHighlighted ? 'ring-4 ring-blue-300 ring-opacity-50 bg-blue-50' : ''
          }`}
        >
          <MetricCard
            title="表面利回り"
            value={results.surfaceYield || 0}
            unit="%"
            format="percentage"
          />
          <MetricCard
            title="実質利回り"
            value={results.netYield || 0}
            unit="%"
            format="percentage"
          />
          <MetricCard
            title="月間キャッシュフロー"
            value={results.monthlyCashFlow || 0}
            unit="円"
            format="currency"
          />
          <MetricCard
            title="IRR"
            value={results.irr || null}
            unit="%"
            format="percentage"
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 収益指標</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">CCR（自己資本収益率）</span>
                <span className="font-semibold">{formatPercent(results.ccr || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ROI（投資収益率）</span>
                <span className="font-semibold">{formatPercent(results.roi || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">DSCR（返済余裕率）</span>
                <span className="font-semibold">{results.dscr || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">LTV（ローン比率）</span>
                <span className="font-semibold">{formatPercent(results.ltv || 0)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 投資概要</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">購入価格</span>
                <span className="font-semibold">{formatCurrency((simulationData.purchasePrice || 0) * 10000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">自己資金</span>
                <span className="font-semibold">{formatCurrency(results.selfFunding || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">借入額</span>
                <span className="font-semibold">{formatCurrency((simulationData.loanAmount || 0) * 10000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">年間家賃収入</span>
                <span className="font-semibold">{formatCurrency((simulationData.monthlyRent || 0) * 12)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Flow Chart */}
        {simulation.cash_flow_table && simulation.cash_flow_table.length > 0 && (
          <div className="bg-white rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 キャッシュフロー推移</h3>
            <CashFlowChart data={simulation.cash_flow_table} />
          </div>
        )}

        {/* Detailed Cash Flow Table */}
        {simulation.cash_flow_table && simulation.cash_flow_table.length > 0 && (
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 年次キャッシュフロー詳細</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3">年次</th>
                    <th className="text-right py-2 px-3">満室想定収入</th>
                    <th className="text-right py-2 px-3">実効収入</th>
                    <th className="text-right py-2 px-3">経費</th>
                    <th className="text-right py-2 px-3">ローン返済</th>
                    <th className="text-right py-2 px-3">営業CF</th>
                    <th className="text-right py-2 px-3">累計CF</th>
                  </tr>
                </thead>
                <tbody>
                  {simulation.cash_flow_table.slice(0, 10).map((row: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium">{row['年次']}</td>
                      <td className="py-2 px-3 text-right">{(row['満室想定収入'] || 0).toLocaleString()}円</td>
                      <td className="py-2 px-3 text-right">{(row['実効収入'] || 0).toLocaleString()}円</td>
                      <td className="py-2 px-3 text-right">{(row['経費'] || 0).toLocaleString()}円</td>
                      <td className="py-2 px-3 text-right">{(row['ローン返済'] || 0).toLocaleString()}円</td>
                      <td className={`py-2 px-3 text-right font-medium ${
                        (row['営業CF'] || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(row['営業CF'] || 0).toLocaleString()}円
                      </td>
                      <td className={`py-2 px-3 text-right font-medium ${
                        (row['累計CF'] || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(row['累計CF'] || 0).toLocaleString()}円
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {simulation.cash_flow_table.length > 10 && (
                <div className="text-center py-4 text-gray-500">
                  ...他 {simulation.cash_flow_table.length - 10}年分のデータ
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default SimulationResult;