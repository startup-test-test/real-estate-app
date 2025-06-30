import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  AlertCircle,
  Home,
  Clock,
  Eye,
  Download
} from 'lucide-react';
import { getShareData, getTimeUntilExpiry } from '../utils/shareUtils';
import CashFlowChart from '../components/CashFlowChart';
import MetricCard from '../components/MetricCard';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ShareView: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const loadShareData = async () => {
      if (!shareId) {
        setError('共有IDが指定されていません');
        setLoading(false);
        return;
      }

      try {
        const data = await getShareData(shareId);
        setShareData(data);
        setTimeRemaining(getTimeUntilExpiry(data.expiresAt));
      } catch (err: any) {
        setError(err.message || '共有データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadShareData();
  }, [shareId]);

  // 有効期限の更新
  useEffect(() => {
    if (!shareData) return;

    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilExpiry(shareData.expiresAt));
    }, 60000); // 1分ごとに更新

    return () => clearInterval(interval);
  }, [shareData]);

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

      const fileName = `シミュレーション結果_${shareData?.propertyData?.propertyName || 'property'}_${new Date().toISOString().split('T')[0]}.pdf`;
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
          <p className="text-gray-600">共有データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">エラー</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Home className="h-4 w-4 mr-2" />
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const { simulationData, propertyData, viewCount } = shareData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                不動産投資シミュレーション結果
              </h1>
              <p className="text-sm text-gray-500 mt-1">共有されたシミュレーション結果</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {timeRemaining}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="h-4 w-4 mr-1" />
                {viewCount}回閲覧
              </div>
              <button
                onClick={handleSavePDF}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF保存
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div id="pdf-content">
          {/* 物件基本情報 */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">物件情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">物件名</p>
                <p className="font-medium">{propertyData.propertyName || '未設定'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">所在地</p>
                <p className="font-medium">{propertyData.location || '未設定'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">購入価格</p>
                <p className="font-medium">{propertyData.purchasePrice?.toLocaleString() || 0}円</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">想定家賃（月額）</p>
                <p className="font-medium">{propertyData.monthlyRent?.toLocaleString() || 0}円</p>
              </div>
            </div>
          </div>

          {/* 重要指標 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <MetricCard
              title="表面利回り"
              value={simulationData.surfaceYield || 0}
              unit="%"
              format="percentage"
            />
            <MetricCard
              title="実質利回り"
              value={simulationData.netYield || 0}
              unit="%"
              format="percentage"
            />
            <MetricCard
              title="月間キャッシュフロー"
              value={simulationData.monthlyCashFlow || 0}
              unit="円"
              format="currency"
            />
            <MetricCard
              title="IRR"
              value={simulationData.irr || null}
              unit="%"
              format="percentage"
            />
          </div>

          {/* 詳細指標 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">収益指標</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">年間家賃収入</span>
                  <span className="font-medium">{simulationData.annualRentalIncome?.toLocaleString() || 0}円</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">年間経費</span>
                  <span className="font-medium">{simulationData.annualExpenses?.toLocaleString() || 0}円</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">年間ローン返済</span>
                  <span className="font-medium">{simulationData.annualLoanPayment?.toLocaleString() || 0}円</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">年間キャッシュフロー</span>
                  <span className={`font-medium ${simulationData.annualCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {simulationData.annualCashFlow?.toLocaleString() || 0}円
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">投資効率指標</h3>
              <div className="space-y-3">
                {simulationData.ccr !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">CCR (自己資金回収率)</span>
                    <span className="font-medium">{simulationData.ccr}%</span>
                  </div>
                )}
                {simulationData.dscr !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">DSCR (返済余裕率)</span>
                    <span className="font-medium">{simulationData.dscr}</span>
                  </div>
                )}
                {simulationData.roi !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ROI</span>
                    <span className="font-medium">{simulationData.roi}%</span>
                  </div>
                )}
                {simulationData.ltv !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">LTV (融資比率)</span>
                    <span className="font-medium">{simulationData.ltv}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* キャッシュフローチャート */}
          {simulationData.cash_flow_data && (
            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">キャッシュフロー推移</h3>
              <CashFlowChart data={simulationData.cash_flow_data} />
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            このシミュレーション結果は参考値です。実際の投資判断は専門家にご相談ください。
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Home className="h-4 w-4 mr-2" />
            サービスを見る
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareView;