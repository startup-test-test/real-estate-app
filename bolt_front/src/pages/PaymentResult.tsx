import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../components/AuthProvider';

const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [isVerifying, setIsVerifying] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'pending' | 'failed'>('pending');
  
  const paymentStatus = searchParams.get('payment');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifySubscription = async () => {
      if (!user || paymentStatus !== 'success') {
        setIsVerifying(false);
        return;
      }

      try {
        // サブスクリプション状態を確認（最大10秒待機）
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          const { data, error } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .single();

          if (!error && data?.status === 'active') {
            setSubscriptionStatus('active');
            break;
          }

          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
          }
        }

        if (attempts === maxAttempts) {
          setSubscriptionStatus('pending');
        }
      } catch (error) {
        console.error('Subscription verification error:', error);
        setSubscriptionStatus('failed');
      } finally {
        setIsVerifying(false);
      }
    };

    if (paymentStatus === 'success') {
      verifySubscription();
    } else {
      setIsVerifying(false);
    }
  }, [user, paymentStatus]);

  const handleContinue = () => {
    navigate('/mypage');
  };

  const handleRetry = () => {
    navigate('/mypage');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            決済を確認中...
          </h2>
          <p className="text-gray-600">
            しばらくお待ちください
          </p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              決済が完了しました！
            </h1>
            <p className="text-gray-600">
              プレミアムプランへようこそ
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-2">
              プレミアムプランの特典
            </h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>全機能が無制限で利用可能</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>新機能への早期アクセス</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>優先サポート</span>
              </li>
            </ul>
          </div>

          {subscriptionStatus === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800">
                ※ プランの反映に少し時間がかかる場合があります
              </p>
            </div>
          )}

          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>ダッシュボードへ</span>
            <ArrowRight className="h-5 w-5" />
          </button>

          {sessionId && (
            <p className="text-xs text-gray-500 mt-4 text-center">
              決済ID: {sessionId.substring(0, 20)}...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (paymentStatus === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              決済がキャンセルされました
            </h1>
            <p className="text-gray-600">
              アップグレードは完了していません
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              決済処理中に問題が発生したか、キャンセルされました。
              再度お試しいただくか、お問い合わせください。
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ダッシュボードに戻る
            </button>
            <button
              onClick={() => navigate('/mypage')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              後で決める
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 不正なパラメータの場合
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          エラーが発生しました
        </h2>
        <p className="text-gray-600 mb-6">
          不正なアクセスです
        </p>
        <button
          onClick={() => navigate('/mypage')}
          className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors"
        >
          ダッシュボードへ戻る
        </button>
      </div>
    </div>
  );
};

export default PaymentResult;