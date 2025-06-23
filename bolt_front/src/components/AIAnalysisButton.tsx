// AI分析ボタンコンポーネント

import React from 'react';
import { Zap, AlertTriangle, Crown } from 'lucide-react';

interface AIAnalysisButtonProps {
  onAnalyze: () => void;
  isAnalyzing: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const AIAnalysisButton: React.FC<AIAnalysisButtonProps> = ({
  onAnalyze,
  isAnalyzing,
  disabled = false,
  variant = 'primary',
  size = 'md',
  children
}) => {
  // モックデータ（フロントエンドのみ）
  const [usage] = React.useState({ used: 2, limit: 5 });

  const isUsageLimitReached = usage && usage.used >= usage.limit;
  const isDisabled = disabled || isAnalyzing || isUsageLimitReached;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const variantClasses = {
    primary: isDisabled 
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    secondary: isDisabled
      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 border'
  };

  return (
    <div>
      <button
        onClick={onAnalyze}
        disabled={isDisabled}
        className={`
          w-full rounded-lg font-medium transition-all duration-200
          ${sizeClasses[size]}
          ${variantClasses[variant]}
        `}
      >
        {isAnalyzing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
            AI分析中...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Zap className="h-5 w-5 mr-2" />
            {children}
          </div>
        )}
      </button>

      {/* 使用量表示 */}
      {usage && (
        <div className="mt-2 text-center">
          <div className="text-xs text-gray-600">
            AI分析使用量: {usage.used}/{usage.limit}回
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                usage.used >= usage.limit ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 制限到達時の警告 */}
      {isUsageLimitReached && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center text-yellow-800">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="text-sm">
              今月のAI分析回数上限に達しました
            </span>
          </div>
          <button 
            onClick={() => alert('プレミアムプラン機能は準備中です')}
            className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Crown className="h-4 w-4 mr-1" />
            プロプランにアップグレード
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisButton;