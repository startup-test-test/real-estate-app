/**
 * 再利用可能なローディングスピナーコンポーネント
 */
import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'default' | 'dots' | 'pulse';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  message?: string;
  center?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  message,
  center = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const containerClasses = `
    ${center ? 'flex items-center justify-center' : 'flex items-center'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className={`${sizeClasses[size]} bg-indigo-600 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`${sizeClasses[size]} bg-indigo-600 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`${sizeClasses[size]} bg-indigo-600 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-indigo-600 rounded-full animate-pulse`}></div>
        );
      
      case 'default':
      default:
        return (
          <div className={`${sizeClasses[size]} border-2 border-indigo-600 border-t-transparent rounded-full animate-spin`}></div>
        );
    }
  };

  if (center) {
    return (
      <div className={containerClasses}>
        <div className="text-center">
          <div className="flex justify-center mb-2">
            {renderSpinner()}
          </div>
          {message && (
            <p className={`text-gray-600 ${textSizeClasses[size]}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {renderSpinner()}
      {message && (
        <span className={`ml-2 text-gray-600 ${textSizeClasses[size]}`}>
          {message}
        </span>
      )}
    </div>
  );
};

// 便利なプリセットコンポーネント
export const PageLoader: React.FC<{ message?: string }> = ({ message = "読み込み中..." }) => (
  <div className="flex items-center justify-center h-64">
    <LoadingSpinner size="lg" center message={message} />
  </div>
);

export const ButtonLoader: React.FC = () => (
  <LoadingSpinner size="sm" variant="default" />
);

export const InlineLoader: React.FC<{ message?: string }> = ({ message }) => (
  <LoadingSpinner size="sm" message={message} />
);

export default LoadingSpinner;