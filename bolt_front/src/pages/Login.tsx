import React, { useState } from 'react';
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, loading } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  
  // URLパラメータから新規登録モードかどうかを判定（ハッシュ部分を除去）
  const cleanUrl = window.location.href.split('#')[0]; // ハッシュ部分を除去
  const cleanSearchParams = new URLSearchParams(new URL(cleanUrl).search);
  
  const isSignupMode = cleanSearchParams.get('signup') === 'true';
  const [isSignUp, setIsSignUp] = useState(isSignupMode);
  
  // 招待情報の取得（クリーンなURLから）
  const isInvitation = cleanSearchParams.get('invitation') === 'true';
  const inviterName = cleanSearchParams.get('from');
  const redirectUrl = cleanSearchParams.get('redirect');
  
  console.log('🔍 URL解析結果:', {
    原URL: window.location.href,
    クリーンURL: cleanUrl,
    isInvitation,
    inviterName,
    redirectUrl,
    hasError: window.location.hash.includes('error'),
    URLSearchParams: Object.fromEntries(cleanSearchParams)
  });
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      const returnUrl = redirectUrl || cleanSearchParams.get('return') || localStorage.getItem('pendingReturnUrl');
      
      // 常に現在のブラウザのURLを使用（Codespaceが変わっても自動対応）
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback${returnUrl ? `?return=${encodeURIComponent(returnUrl)}` : ''}`,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        setError('Googleログインに失敗しました: ' + error.message);
        console.error('Google sign in error:', error);
      }
    } catch (error) {
      setError('予期しないエラーが発生しました');
      console.error('Unexpected error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // 新規登録時は利用規約への同意を確認
    if (isSignUp && !agreedToTerms) {
      setError('利用規約・プライバシーポリシーへの同意が必要です。');
      return;
    }

    console.log('ログイン試行:', { email: formData.email, isSignUp });

    try {
      if (isSignUp) {
        const { data, error } = await signUp(formData.email, formData.password);
        console.log('サインアップ結果:', { data, error });
        
        // 既存ユーザーのエラーをチェック
        if (error) {
          // Supabaseの既存ユーザーエラーメッセージをチェック
          if (error.message?.includes('already registered') || 
              error.message?.includes('User already registered') ||
              error.message?.includes('already exists')) {
            setError('このメールアドレスは既に登録されています。ログインするか、パスワードをお忘れの場合はリセットしてください。');
            return;
          }
          throw error;
        }
        
        // Supabaseは既存ユーザーでもsuccessを返すことがあるので、追加チェック
        // identitiesが空の場合は既存ユーザーの可能性が高い
        if (data?.user) {
          // ユーザーのidentitiesをチェック
          const identities = data.user.identities;
          console.log('User identities:', identities);
          
          // identitiesが空または存在しない場合は既存ユーザー
          if (!identities || identities.length === 0) {
            setError('このメールアドレスは既に登録されています。ログインするか、パスワードをお忘れの場合はリセットしてください。');
            return;
          }
          
          // 新規ユーザーの場合（セッションがない = メール確認待ち）
          if (!data.session) {
            setSuccessMessage('アカウントが作成されました。メールアドレスに送信された確認リンクをクリックしてアカウントを有効化してください。');
            return;
          }
        }
        
        console.log('サインアップ成功、自動ログイン');
        
        // 招待からの場合は適切にリダイレクト（複数の方法でreturnURLを確認）
        const urlReturnParam = cleanSearchParams.get('return');
        const localStorageReturnUrl = localStorage.getItem('pendingReturnUrl');
        const returnUrl = redirectUrl || urlReturnParam || localStorageReturnUrl;
        console.log('📍 Checking return URL after signup:', {
          urlReturnParam,
          localStorageReturnUrl,
          finalReturnUrl: returnUrl
        });
        
        if (returnUrl) {
          localStorage.removeItem('pendingReturnUrl');
          const decodedUrl = decodeURIComponent(returnUrl);
          
          console.log('📍 Processing signup redirect URL:', {
            original: returnUrl,
            decoded: decodedUrl,
            isAbsolute: decodedUrl.startsWith('http'),
            currentOrigin: window.location.origin
          });
          
          // ログインページへのリダイレクトループを防ぐ（招待URLも含む）
          if (decodedUrl.includes('/login') || decodedUrl.includes('invitation=true')) {
            console.log('🔄 Detected login/invitation loop, redirecting to home instead');
            navigate('/mypage');
          } else {
            // 絶対URLの場合は、window.location.hrefで直接リダイレクト
            if (decodedUrl.startsWith('http')) {
              console.log('🌐 Absolute URL detected, using window.location.href:', decodedUrl);
              setTimeout(() => {
                window.location.href = decodedUrl;
              }, 200);
            } else {
              // 相対URLの場合はnavigate()を使用
              console.log('🔗 Relative URL detected, using navigate():', decodedUrl);
              setTimeout(() => {
                navigate(decodedUrl);
              }, 200);
            }
          }
        } else {
          console.log('🏠 No return URL, redirecting to mypage');
          navigate('/mypage');
        }
      } else {
        const { data, error } = await signIn(formData.email, formData.password, rememberMe);
        console.log('ログイン結果:', { data, error });
        if (error) {
          // 具体的なエラーメッセージを表示
          if (error.message.includes('Email not confirmed')) {
            throw new Error('メールアドレスが確認されていません。メールボックスを確認し、確認リンクをクリックしてください。');
          } else if (error.message.includes('Invalid login credentials')) {
            throw new Error('メールアドレスまたはパスワードが正しくありません。');
          } else {
            throw error;
          }
        }
        console.log('ログイン成功');
        
        // ログイン成功フラグを設定（認証状態反映の遅延対策）
        localStorage.setItem('recentLogin', 'true');
        setTimeout(() => {
          localStorage.removeItem('recentLogin');
        }, 5000); // 5秒後に削除
        
        // 招待からの場合は適切にリダイレクト（複数の方法でreturnURLを確認）
        const urlReturnParam = cleanSearchParams.get('return');
        const localStorageReturnUrl = localStorage.getItem('pendingReturnUrl');
        const returnUrl = redirectUrl || urlReturnParam || localStorageReturnUrl;
        console.log('📍 Checking return URL after login:', {
          redirectUrl,
          urlReturnParam,
          localStorageReturnUrl,
          finalReturnUrl: returnUrl,
          cleanSearchParamsAll: Object.fromEntries(cleanSearchParams)
        });
        
        if (returnUrl) {
          localStorage.removeItem('pendingReturnUrl');
          const decodedUrl = decodeURIComponent(returnUrl);
          
          console.log('📍 Processing redirect URL:', {
            original: returnUrl,
            decoded: decodedUrl,
            isAbsolute: decodedUrl.startsWith('http'),
            currentOrigin: window.location.origin
          });
          
          // ログインページへのリダイレクトループを防ぐ（招待URLも含む）
          if (decodedUrl.includes('/login') || decodedUrl.includes('invitation=true')) {
            console.log('🔄 Detected login/invitation loop, redirecting to home instead');
            navigate('/mypage');
          } else {
            // 絶対URLの場合は、window.location.hrefで直接リダイレクト
            if (decodedUrl.startsWith('http')) {
              console.log('🌐 Absolute URL detected, using window.location.href:', decodedUrl);
              setTimeout(() => {
                window.location.href = decodedUrl;
              }, 200);
            } else {
              // 相対URLの場合はnavigate()を使用
              console.log('🔗 Relative URL detected, using navigate():', decodedUrl);
              setTimeout(() => {
                navigate(decodedUrl);
              }, 200);
            }
          }
        } else {
          console.log('🏠 No return URL, redirecting to mypage');
          navigate('/mypage');
        }
      }
    } catch (err: any) {
      console.error('認証エラー:', err);
      
      // エラーメッセージのカスタマイズ
      let errorMessage = '認証に失敗しました';
      
      if (err.message?.includes('already registered') || 
          err.message?.includes('User already registered') ||
          err.message?.includes('already exists')) {
        errorMessage = 'このメールアドレスは既に登録されています。ログインするか、パスワードをお忘れの場合はリセットしてください。';
      } else if (err.message?.includes('Invalid email')) {
        errorMessage = '有効なメールアドレスを入力してください。';
      } else if (err.message?.includes('password')) {
        errorMessage = 'パスワードは6文字以上で入力してください。';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 sm:w-64 h-32 sm:h-64 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-4">
              <img src="/img/logo_250709_2.png" alt="大家DX ロゴ" className="h-12 w-auto" />
            </div>
            <p className="text-gray-600 text-sm sm:text-base">AIが導く、あなたの賃貸経営の未来。</p>
          </div>

          {/* Invitation Message */}
          {isInvitation && inviterName && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Building2 className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-blue-800 font-semibold text-sm">不動産投資シミュレーションに招待されました</span>
              </div>
              <p className="text-blue-700 text-sm">
                <strong>{inviterName}</strong>さんから投資判断の検討にご招待いただきました。
              </p>
              {window.location.hash.includes('otp_expired') && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-700">
                    ✉️ メールリンクの有効期限が切れていますが、下記からログインすることで共有コンテンツにアクセスできます。
                  </p>
                </div>
              )}
              <div className="mt-3 p-3 bg-white/70 rounded-md">
                <p className="text-xs text-blue-600">
                  <strong>新規の方：</strong> 無料でアカウント作成してアクセス<br/>
                  <strong>既存の方：</strong> ログイン後、自動でシミュレーション結果を表示
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-green-700 text-sm">{successMessage}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Form Title */}
            <div className="text-center mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                {isSignUp ? '新規会員登録' : 'ログイン'}
              </h2>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="your-email@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="パスワードを入力"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            {/* Terms Agreement (Sign up only) */}
            {isSignUp && (
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 underline">利用規約</a>
                  および
                  <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 underline">プライバシーポリシー</a>
                  に同意する
                </label>
              </div>
            )}

            {/* Remember Me & Forgot Password (Login only) */}
            {!isSignUp && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 space-y-2 sm:space-y-0">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    ログイン状態を保持する
                  </label>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-medium py-3 sm:py-4 px-6 rounded-lg transition-all duration-200 shadow-lg text-sm sm:text-base ${
                loading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-600/25 hover:shadow-blue-600/40 transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  {isSignUp ? 'アカウント作成中...' : 'ログイン中...'}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>{isSignUp ? 'アカウント作成' : 'ログイン'}</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 sm:my-8 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">または</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 sm:py-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 font-medium text-sm sm:text-base">
              Googleアカウントでログインする
            </span>
          </button>

          {/* Divider 2 */}
          <div className="my-6 sm:my-8 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">または</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Toggle Auth Mode */}
          <div className="text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              {isSignUp ? 'すでにアカウントをお持ちの方は' : 'アカウントをお持ちでない方は'}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccessMessage(null);
                  setFormData({ email: '', password: '' });
                  setAgreedToTerms(false);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {isSignUp ? 'ログイン' : '新規登録'}
              </button>
            </p>
            {!isSignUp && (
              <p className="mt-3">
                <a href="/reset-password" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  パスワードを忘れた方・変更したい方
                </a>
              </p>
            )}
          </div>

        </div>


        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            SSL暗号化通信により、お客様の情報を安全に保護しています
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;