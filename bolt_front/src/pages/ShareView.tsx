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
import { usePdfGenerator } from '../hooks/usePdfGenerator';
import ShareMetrics from '../components/ShareMetrics';

const ShareView: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  const { generatePDF, isGenerating, error: pdfError } = usePdfGenerator();

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
    const fileName = `シミュレーション結果_${shareData?.propertyData?.propertyName || 'property'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    const success = await generatePDF({
      elementId: 'pdf-content',
      fileName
    });
    
    if (!success && pdfError) {
      alert(pdfError);
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
                disabled={isGenerating}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? 'PDF生成中...' : 'PDF保存'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div id="pdf-content">
          <ShareMetrics 
            simulationData={simulationData} 
            propertyData={propertyData} 
          />
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