import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../components/AuthProvider';

const ResetPasswordConfirm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePassword } = useAuthContext();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // URLパラメータからメールアドレスを取得
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validatePassword = () => {
    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください。');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('確認用パスワードが一致しません。');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePassword()) return;

    setIsLoading(true);

    try {
      const { error } = await updatePassword(formData.password);
      if (error) throw error;
      
      setIsSuccess(true);
    } catch (err: any) {
      console.error('パスワード更新エラー:', err);
      if (err.message?.includes('session')) {
        setError('セッションが無効です。もう一度パスワードリセットを申請してください。');
      } else {
        setError('パスワードの更新に失敗しました。もう一度お試しください。');
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
                パスワード変更完了
              </h2>
              <p className="text-gray-600 mb-6">
                パスワードの変更が完了しました。
                <br />
                新しいパスワードでログインしてください。
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
              >
                ログインページに移動
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Form Title */}
            <div className="text-center mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                パスワードリセット
              </h2>
              <p className="text-gray-600 text-sm">
                新しいパスワードを設定してください。
              </p>
              {email && (
                <p className="text-gray-500 text-xs mt-2">
                  メールアドレス: {email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                新しいパスワード
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
                  placeholder="6文字以上で入力"
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                確認用パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="上記と同じパスワードを入力"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
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
                  更新中...
                </div>
              ) : (
                'パスワードを変更'
              )}
            </button>
          </form>
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

export default ResetPasswordConfirm;