import React, { useEffect } from 'react';
import { AlertCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

const MarketAnalysis: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'AI市場分析 | 大家DX';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* メンテナンス案内カード */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 rounded-full p-4">
              <AlertCircle className="h-16 w-16 text-blue-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI市場分析
          </h1>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 text-left rounded-r-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">
              現在メンテナンス中です
            </h2>
            <p className="text-blue-800 mb-4">
              サービス品質向上のため、AI市場分析機能は一時的にメンテナンス中とさせていただいております。
            </p>
            <p className="text-blue-700 text-sm">
              ご不便をおかけいたしますが、何卒ご理解のほどよろしくお願いいたします。
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              収益シミュレーターは通常通りご利用いただけます
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/simulator')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                収益シミュレーターを使う
              </button>

              <button
                onClick={() => navigate('/mypage')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center"
              >
                <Home className="h-5 w-5 mr-2" />
                マイページに戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;
