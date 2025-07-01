import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertCircle,
  Lock,
  Users,
  MessageCircle
} from 'lucide-react';
import { usePropertyShare } from '../hooks/usePropertyShare';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import CommentSection from '../components/CommentSection';
import MetricCard from '../components/MetricCard';
import CashFlowChart from '../components/CashFlowChart';
import { PropertyShare, ShareInvitation } from '../types';

export default function CollaborationView() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const { fetchShare, acceptInvitation, logAccess } = usePropertyShare();
  const { getSimulations, getProperties } = useSupabaseData();

  const [share, setShare] = useState<PropertyShare | null>(null);
  const [property, setProperty] = useState<any>(null);
  const [simulation, setSimulation] = useState<any>(null);
  const [invitation, setInvitation] = useState<ShareInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canComment, setCanComment] = useState(false);

  useEffect(() => {
    if (token) {
      loadShareData();
    }
  }, [token, user]);

  const loadShareData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 共有情報を取得
      console.log('Token:', token);
      const shareData = await fetchShare(token!);
      console.log('Share data:', shareData);
      
      if (!shareData) {
        setError('共有リンクが無効です');
        return;
      }

      setShare(shareData);

      // アクセスログを記録
      await logAccess(shareData.id, 'view');

      // 物件情報を取得（模擬データで代用）
      console.log('Setting up mock property data...');
      const mockProperty = {
        id: shareData.property_id,
        property_name: shareData.title || '共有された物件',
        location: '東京都',
        property_type: '区分マンション',
        year_built: 2020,
        purchase_price: 5000,
        monthly_rent: 120000,
        building_area: 50,
        land_area: 0
      };
      setProperty(mockProperty);

      // シミュレーション情報を取得（模擬データで代用）
      const mockSimulation = {
        id: 'mock-sim-id',
        property_id: shareData.property_id,
        input_data: mockProperty,
        result_data: {
          '表面利回り（%）': 8.5,
          'IRR（%）': 12.3,
          'CCR（%）': 15.2,
          '月間キャッシュフロー（円）': 25000
        },
        cash_flow_table: [
          { 年次: 1, 満室想定収入: 1440000, 実効収入: 1400000, 経費: 200000, 営業CF: 300000, 累計CF: 300000 },
          { 年次: 2, 満室想定収入: 1440000, 実効収入: 1400000, 経費: 205000, 営業CF: 295000, 累計CF: 595000 }
        ]
      };
      setSimulation(mockSimulation);

      // ユーザーの権限を確認
      if (user) {
        // TODO: 招待情報から権限を確認
        setCanComment(true); // 仮実装
      }

    } catch (err) {
      console.error('Error loading share data:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationToken: string) => {
    const success = await acceptInvitation(invitationToken);
    if (success) {
      await loadShareData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">エラー</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!simulation || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">データが見つかりません</h2>
          <p className="text-gray-600">共有されたデータが見つかりませんでした。</p>
        </div>
      </div>
    );
  }

  const simulationData = simulation.input_data;
  const results = simulation.result_data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {share?.title || `${property.property_name}のシミュレーション結果`}
                </h1>
                {share?.description && (
                  <p className="text-gray-600 mt-1">{share.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">共有ビュー</span>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 権限に関する通知 */}
        {!user && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Lock className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800">
                  ログインすると、コメントの投稿や詳細な分析が可能になります。
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  ログインする →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 物件基本情報 */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">物件情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">物件名</span>
              <p className="text-gray-900">{property.property_name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">所在地</span>
              <p className="text-gray-900">{property.location}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">物件タイプ</span>
              <p className="text-gray-900">{property.property_type}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">築年数</span>
              <p className="text-gray-900">{new Date().getFullYear() - property.year_built}年</p>
            </div>
          </div>
        </div>

        {/* 主要指標 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="表面利回り"
            value={results['表面利回り（%）'] || 0}
            unit="%"
            format="percentage"
          />
          <MetricCard
            title="IRR"
            value={results['IRR（%）'] || 0}
            unit="%"
            format="percentage"
          />
          <MetricCard
            title="CCR"
            value={results['CCR（%）'] || 0}
            unit="%"
            format="percentage"
          />
          <MetricCard
            title="月間CF"
            value={results['月間キャッシュフロー（円）'] || 0}
            unit="円"
            format="currency"
          />
        </div>

        {/* キャッシュフローチャート */}
        {simulation.cash_flow_table && (
          <div className="bg-white rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              キャッシュフロー推移
            </h2>
            <div className="h-64">
              <CashFlowChart data={simulation.cash_flow_table} />
            </div>
          </div>
        )}

        {/* コメントセクション */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              ディスカッション
            </h2>
            <MessageCircle className="h-5 w-5 text-gray-400" />
          </div>
          {share && (
            <CommentSection
              shareId={share.id}
              canComment={canComment}
            />
          )}
        </div>
      </div>
    </div>
  );
}