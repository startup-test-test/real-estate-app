import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback - Full URL:', window.location.href);
        console.log('AuthCallback - Search params:', Object.fromEntries(searchParams));
        console.log('AuthCallback - Hash:', location.hash);

        // Supabase v2のメール確認フローを処理
        // URLにaccess_tokenが含まれている場合（#以降のハッシュフラグメントとして来ることもある）
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = searchParams.get('access_token') || hashParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token') || hashParams.get('refresh_token');
        const type = searchParams.get('type') || hashParams.get('type');
        const error = searchParams.get('error') || hashParams.get('error');
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

        // エラーがある場合
        if (error) {
          throw new Error(errorDescription || error);
        }

        // トークンがある場合はセッションを設定
        if (accessToken && refreshToken) {
          console.log('Setting session with tokens');
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }

          if (data.user) {
            setStatus('success');
            setMessage('メールアドレスの確認が完了しました。ダッシュボードに移動します...');
            
            // 即座にダッシュボードにリダイレクト
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 1500);
            return;
          }
        }

        // Supabase v1形式のトークン確認も試みる
        const token = searchParams.get('token');
        if (token && type === 'signup') {
          console.log('Attempting to verify with token:', token);
          // tokenベースの確認を試みる（古い形式）
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });

          if (verifyError) {
            console.error('Token verification error:', verifyError);
            throw verifyError;
          }

          // 認証成功後、現在のセッションを確認
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setStatus('success');
            setMessage('メールアドレスの確認が完了しました。ダッシュボードに移動します...');
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 1500);
            return;
          }
        }

        // どちらの形式でもない場合
        throw new Error('無効な確認リンクです。');
      } catch (error: any) {
        console.error('認証コールバックエラー:', error);
        setStatus('error');
        setMessage(error.message || 'メールの確認に失敗しました。');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, location]);

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