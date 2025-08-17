import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/mypage');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* ロゴ */}
          <div className="flex justify-center mb-4">
            <img src="/img/logo_250709_2.png" alt="大家DX ロゴ" className="h-16 w-auto" />
          </div>
          
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            404 - ページが見つかりません
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
          <p className="mt-4 text-center text-sm text-indigo-600 font-medium">
            {countdown}秒後にマイページへ自動的に移動します
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Home className="h-4 w-4 mr-2" />
              トップページへ戻る
            </button>
            
            <button
              onClick={() => navigate('/mypage')}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              マイページへ戻る
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="w-full flex justify-center items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              前のページに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;