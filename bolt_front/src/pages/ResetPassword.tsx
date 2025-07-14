import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/AuthProvider';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuthContext();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('パスワードリセット試行:', email);
      const { data, error } = await resetPassword(email);
      console.log('レスポンス:', { data, error });
      
      if (error) {
        console.error('Supabaseエラー:', error);
        throw error;
      }
      
      setIsSuccess(true);
    } catch (err: any) {
      console.error('パスワードリセットエラー:', err);
      
      // より詳細なエラーメッセージ
      if (err.message?.includes('User not found')) {
        setError('このメールアドレスは登録されていません。');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('メールアドレスが確認されていません。先にメールアドレスの確認を完了してください。');
      } else {
        setError(`メールの送信に失敗しました: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/20">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <img src="/img/logo_250709_2.png" alt="大家DX ロゴ" className="h-12 w-auto" />
              </div>
              <p className="text-gray-600 text-sm sm:text-base">AIが導く、あなたの賃貸経営の未来。</p>
            </div>

            {/* Success Message */}
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                メール送信完了
              </h2>
              <p className="text-gray-600 mb-6">
                <span className="font-medium">{email}</span> 宛に再設定のご案内メールを送信しました。
                <br />
                メールボックスをご確認ください。
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
              >
                ログインページに戻る
              </button>
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-4">
              <img src="/img/logo_250709_2.png" alt="大家DX ロゴ" className="h-12 w-auto" />
            </div>
            <p className="text-gray-600 text-sm sm:text-base">AIが導く、あなたの賃貸経営の未来。</p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ログインページに戻る
          </button>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Title */}
            <div className="text-center mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                パスワードリセット・変更
              </h2>
              <p className="text-gray-600 text-sm">
                入力していただいたメールアドレス宛に再設定のご案内メールが届きます。<br />
                パスワードを忘れた方・変更したい方共通の手順です。
              </p>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="your-email@example.com"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-medium py-3 sm:py-4 px-6 rounded-lg transition-all duration-200 shadow-lg text-sm sm:text-base ${
                isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-600/25 hover:shadow-blue-600/40 transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  送信中...
                </div>
              ) : (
                '送信する'
              )}
            </button>
          </form>

          {/* SNS Login Notice */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              SNSログインで登録されている場合は、まずパスワードを設定してください。
            </p>
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

export default ResetPassword;