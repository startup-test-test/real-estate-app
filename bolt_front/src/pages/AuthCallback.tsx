import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URLからアクセストークンとリフレッシュトークンを取得
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        if (type === 'signup' && accessToken && refreshToken) {
          // セッションを設定
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }

          if (data.user) {
            setStatus('success');
            setMessage('メールアドレスの確認が完了しました。ダッシュボードに移動します...');
            
            // 3秒後にダッシュボードにリダイレクト
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 3000);
          }
        } else {
          throw new Error('無効な確認リンクです。');
        }
      } catch (error: any) {
        console.error('認証コールバックエラー:', error);
        setStatus('error');
        setMessage(error.message || 'メールの確認に失敗しました。');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader className="h-12 w-12 text-indigo-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">確認中...</h2>
            <p className="text-gray-600">メールアドレスの確認を処理しています。</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">確認完了</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">確認エラー</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-indigo-600 hover:via-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              ログインページに戻る
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;