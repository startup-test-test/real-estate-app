import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertCircle,
  Users,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useAuthContext } from '../components/AuthProvider';
import SimpleCommentSection from '../components/SimpleCommentSection';
import MetricCard from '../components/MetricCard';
import { SecureStorage } from '../utils/cryptoUtils';

export default function SimpleCollaboration() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user: supabaseUser } = useSupabaseAuth();
  const { user: authUser, loading: authLoading } = useAuthContext();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 簡単な初期化処理
    const initPage = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔗 Simple collaboration page loaded with token:', token);
        console.log('👤 Supabase user state:', supabaseUser);
        console.log('👤 Auth context user state:', authUser);
        console.log('🔄 Auth loading:', authLoading);
        console.log('🔐 User authenticated?', !!(supabaseUser || authUser));
        
        // 両方のユーザー状態を確認
        const user = supabaseUser || authUser;
        
        if (!token) {
          setError('招待トークンが無効です');
          return;
        }

        // ログイン直後は認証状態の反映に少し時間がかかる場合があるため、短い待機時間を追加
        await new Promise(resolve => setTimeout(resolve, 100));

        // ユーザーが未認証の場合の処理
        if (!user && !authLoading) {
          console.log('🔐 User not authenticated, checking pending status...');
          
          // 認証処理中でない場合のみリダイレクト判断を行う
          // SEC-064: 暗号化されたトークンを取得
          const pendingToken = await SecureStorage.getItem('pendingCollaborationToken').catch(() => {
            // フォールバック: sessionStorageから取得
            return sessionStorage.getItem('pendingCollaborationToken');
          });
          const hasRecentlyLoggedIn = localStorage.getItem('recentLogin');
          
          // 最近ログインした場合は少し待機して認証状態を再確認
          if (hasRecentlyLoggedIn || pendingToken === token) {
            console.log('⏳ Recently logged in or already redirected, waiting for auth state...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 再度認証状態を確認
            const updatedUser = supabaseUser || authUser;
            if (!updatedUser && !authLoading) {
              console.log('🔄 Still not authenticated after waiting, redirecting to login');
              const simplePath = `/simple-collaboration/${token}`;
              localStorage.setItem('pendingReturnUrl', simplePath);
              // SEC-064: 招待トークンを暗号化して保存
              SecureStorage.setItem('pendingCollaborationToken', token).catch(err => {
                console.error('Failed to securely store token:', err);
                // フォールバック: sessionStorageに保存
                sessionStorage.setItem('pendingCollaborationToken', token);
              });
              navigate('/login?invitation=true');
              return;
            } else if (updatedUser) {
              console.log('✅ Auth state updated, user found');
              localStorage.removeItem('recentLogin');
              // SEC-064: 暗号化されたトークンを削除
              SecureStorage.removeItem('pendingCollaborationToken');
              // 認証済みなので続行
            }
          } else {
            console.log('🔐 First time, saving token and redirecting');
            // SEC-064: 招待トークンを暗号化して保存
            SecureStorage.setItem('pendingCollaborationToken', token).catch(err => {
              console.error('Failed to securely store token:', err);
              // フォールバック: sessionStorageに保存
              sessionStorage.setItem('pendingCollaborationToken', token);
            });
            const simplePath = `/simple-collaboration/${token}`;
            localStorage.setItem('pendingReturnUrl', simplePath);
            navigate('/login?invitation=true');
            return;
          }
        }

        // 認証済みの場合は成功
        console.log('✅ User authenticated, showing collaboration page');
        // SEC-064: 暗号化されたトークンを削除
        SecureStorage.removeItem('pendingCollaborationToken');
        
      } catch (err: any) {
        console.error('❌ Error initializing collaboration page:', err);
        setError('ページの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [token, supabaseUser, authUser, authLoading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">コラボレーションページを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ダッシュボードに戻る
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                投資検討コラボレーション
              </h1>
              <p className="text-gray-600 mt-2">
                招待された物件の投資判断について議論しましょう
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                招待参加中
              </span>
            </div>
          </div>
        </div>

        {/* 招待情報 */}
        <div className="bg-white rounded-lg p-6 mb-6 border-l-4 border-blue-500">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ExternalLink className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                コラボレーション招待
              </h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>招待トークン: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{token}</code></p>
                <p className="mt-1">参加者: {(supabaseUser || authUser)?.email}</p>
                <p className="mt-1">あなたは投資の専門家として招待されました。</p>
              </div>
            </div>
          </div>
        </div>

        {/* サンプル物件情報 */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">物件概要</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="想定利回り"
              value={8.5}
              unit="%"
              format="percentage"
            />
            <MetricCard
              title="物件価格"
              value={5000}
              unit="万円"
              format="currency"
            />
            <MetricCard
              title="月額家賃"
              value={120000}
              unit="円"
              format="currency"
            />
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">投資検討ポイント</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 駅徒歩5分の好立地</li>
              <li>• 築年数が浅く、修繕費負担が少ない</li>
              <li>• 周辺の賃貸需要が安定している</li>
              <li>• 価格交渉の余地があるか要確認</li>
            </ul>
          </div>
        </div>

        {/* コメント・ディスカッション */}
        <div className="bg-white rounded-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center mb-4">
            <MessageCircle className="h-6 w-6 mr-3 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              投資検討ディスカッション
            </h2>
          </div>
          
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 text-sm">
              💡 <strong>専門家の皆様へ：</strong> この物件の投資判断についてご意見をお聞かせください。
              リスク、収益性、市場動向など、あらゆる観点からのコメントをお待ちしています。
            </p>
          </div>
          
          <SimpleCommentSection
            pageId={token!}
            title="投資検討コメント"
          />
        </div>

        {/* デバッグ情報（開発環境のみ） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Debug Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Token:</strong> {token}</p>
              <p><strong>Supabase User:</strong> {supabaseUser?.email || 'Not logged in'}</p>
              <p><strong>Auth User:</strong> {authUser?.email || 'Not logged in'}</p>
              <p><strong>Page ID:</strong> {token}</p>
              <p><strong>Current Time:</strong> {new Date().toLocaleString('ja-JP')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}