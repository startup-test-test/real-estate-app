import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAuthContext } from '../components/AuthProvider';

const EmailConfirmed: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    // 既にログイン済みの場合は即座にダッシュボードへ
    if (user) {
      navigate('/', { replace: true });
    } else {
      // ログインしていない場合は、ログインページへ
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 max-w-md w-full text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">メール認証完了！</h1>
        <p className="text-gray-600 mb-4">
          メールアドレスの確認が完了しました。
          {user ? 'ダッシュボードに移動します...' : 'ログインページに移動します...'}
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    </div>
  );
};

export default EmailConfirmed;