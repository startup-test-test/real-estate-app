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
        
        // メール確認の場合、exchangeCodeForSessionを使用
        const code = searchParams.get('code');
        if (code) {
          console.log('Found authorization code, exchanging for session');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            throw exchangeError;
          }
          
          if (data.session) {
            setStatus('success');
            setMessage('メールアドレスの確認が完了しました。ダッシュボードに移動します...');
            setTimeout(() => {
              navigate('/mypage', { replace: true });
            }, 1500);
            return;
          }
        }
        
        // トークンベースの確認（メール確認リンクから）
        const token = searchParams.get('token') || hashParams.get('token');
        // typeは既に上で宣言済み
        
        if (token && type === 'signup') {
          console.log('Found signup token, verifying...');
          // OTPトークンを使用した検証
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });
          
          if (verifyError) {
            console.error('Token verification error:', verifyError);
            // トークンエラーの場合でも、セッションをチェック
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              setStatus('success');
              setMessage('既にログイン済みです。ダッシュボードに移動します...');
              setTimeout(() => {
                navigate('/mypage', { replace: true });
              }, 1500);
              return;
            }
            throw verifyError;
          }
          
          if (data.session || data.user) {
            setStatus('success');
            setMessage('メールアドレスの確認が完了しました。ダッシュボードに移動します...');
            setTimeout(() => {
              navigate('/mypage', { replace: true });
            }, 1500);
            return;
          }
        }

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
              navigate('/mypage', { replace: true });
            }, 1500);
            return;
          }
        }


        // どちらの形式でもない場合
        throw new Error('メールリンクの認証に失敗しました。新しいアカウント作成をお試しください。');
      } catch (error: any) {
        console.error('認証コールバックエラー:', error);
        setStatus('error');
        
        // ユーザーフレンドリーなエラーメッセージ
        if (error.message?.includes('otp_expired') || error.message?.includes('expired')) {
          setMessage('メールリンクの有効期限が切れています。新しいメールアドレスで再度アカウント作成をお試しください。');
        } else if (error.message?.includes('invalid') || error.message?.includes('403')) {
          setMessage('このメールリンクは無効です。既にアカウントをお持ちの場合はログインしてください。');
        } else {
          setMessage('メールアドレスの確認に失敗しました。しばらく待ってから再度お試しください。');
        }
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* Logo Header */}
        <div className="p-8 pb-0">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/img/logo_250709_2.png" 
              alt="Logo" 
              className="h-16 w-auto"
            />
          </div>
          <p className="text-sm text-gray-600 text-center mb-2">
            AIが導く、あなたの賃貸経営の未来。
          </p>
        </div>
        
        <div className="p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
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
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                ログインページに戻る
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;