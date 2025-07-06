import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | null;
  unit?: string;
  subtitle?: string;
  description?: string;
  thresholds?: {
    excellent?: number;
    good?: number;
    warning?: number;
  };
  reversed?: boolean; // 値が低いほど良い場合（例：リスク指標）
  format?: 'number' | 'percentage' | 'currency';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  subtitle,
  description,
  thresholds = {},
  reversed = false,
  format = 'number',
  size = 'medium'
}) => {
  if (value === null || value === undefined) {
    return null;
  }

  // 値のフォーマット
  const formatValue = (val: number): string => {
    switch (format) {
      case 'percentage':
        return val.toFixed(2);
      case 'currency':
        return val.toLocaleString();
      case 'number':
      default:
        return val % 1 === 0 ? val.toString() : val.toFixed(2);
    }
  };

  // パフォーマンスレベルの判定
  const getPerformanceLevel = (): 'excellent' | 'good' | 'warning' | 'danger' => {
    const { excellent, good, warning } = thresholds;
    
    if (reversed) {
      if (warning && value >= warning) return 'danger';
      if (good && value >= good) return 'warning';
      if (excellent && value >= excellent) return 'good';
      return 'excellent';
    } else {
      if (excellent && value >= excellent) return 'excellent';
      if (good && value >= good) return 'good';
      if (warning && value >= warning) return 'warning';
      return 'danger';
    }
  };

  const performanceLevel = getPerformanceLevel();

  // スタイルの定義
  const getCardStyles = () => {
    const paddingSizes = {
      small: 'p-4',
      medium: 'p-6',
      large: 'p-6',
      xlarge: 'p-8'
    };
    const baseStyles = `rounded-xl border-2 ${paddingSizes[size]} transition-all duration-300 hover:shadow-lg`;
    
    switch (performanceLevel) {
      case 'excellent':
        return `${baseStyles} bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-300`;
      case 'good':
        return `${baseStyles} bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-300`;
      case 'warning':
        return `${baseStyles} bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 hover:border-amber-300`;
      case 'danger':
        return `${baseStyles} bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:border-red-300`;
      default:
        return `${baseStyles} bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300`;
    }
  };

  const getValueStyles = () => {
    const baseSizes = {
      small: 'text-xl',
      medium: 'text-2xl',
      large: 'text-4xl',
      xlarge: 'text-6xl'
    };

    const baseStyle = `${baseSizes[size]} font-bold`;

    switch (performanceLevel) {
      case 'excellent':
        return `${baseStyle} text-emerald-700`;
      case 'good':
        return `${baseStyle} text-blue-700`;
      case 'warning':
        return `${baseStyle} text-amber-700`;
      case 'danger':
        return `${baseStyle} text-red-700`;
      default:
        return `${baseStyle} text-gray-700`;
    }
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5";
    
    switch (performanceLevel) {
      case 'excellent':
        return <CheckCircle className={`${iconClass} text-emerald-600`} />;
      case 'good':
        return <TrendingUp className={`${iconClass} text-blue-600`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-amber-600`} />;
      case 'danger':
        return <TrendingDown className={`${iconClass} text-red-600`} />;
      default:
        return null;
    }
  };

  const getPerformanceText = () => {
    switch (performanceLevel) {
      case 'excellent':
        return '優秀';
      case 'good':
        return '良好';
      case 'warning':
        return '注意';
      case 'danger':
        return '要改善';
      default:
        return '';
    }
  };

  return (
    <div className={getCardStyles()}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className={`font-medium text-gray-600 mb-1 ${size === 'xlarge' ? 'text-lg' : 'text-sm'}`}>{title}</h4>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {getIcon()}
          <span className={`font-medium px-2 py-1 rounded-full ${size === 'xlarge' ? 'text-sm' : 'text-xs'} ${
            performanceLevel === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
            performanceLevel === 'good' ? 'bg-blue-100 text-blue-700' :
            performanceLevel === 'warning' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {getPerformanceText()}
          </span>
        </div>
      </div>

      <div className="mb-2">
        <span className={getValueStyles()}>
          {formatValue(value)}{unit}
        </span>
      </div>

      {description && (
        <p className="text-xs text-gray-600 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export default MetricCard;