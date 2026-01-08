/**
 * 再利用可能なボタンコンポーネント
 */
import React from 'react';
import { LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed touch-manipulation';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:from-purple-800 active:to-indigo-800 text-white shadow-lg hover:shadow-xl focus:ring-purple-500 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:shadow-none',
    secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400',
    success: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-md focus:ring-green-500 disabled:bg-gray-300 disabled:text-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-md focus:ring-red-500 disabled:bg-gray-300 disabled:text-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500 disabled:text-gray-400'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const isDisabled = disabled || loading;

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${variant === 'primary' && !isDisabled ? 'hover:-translate-y-0.5 active:scale-[0.98]' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={buttonClasses}
    >
      {loading && (
        <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconSizeClasses[size]} ${Icon || iconPosition === 'left' ? 'mr-2' : ''}`} />
      )}
      
      {Icon && !loading && iconPosition === 'left' && (
        <Icon className={`${iconSizeClasses[size]} mr-2`} />
      )}
      
      {children}
      
      {Icon && !loading && iconPosition === 'right' && (
        <Icon className={`${iconSizeClasses[size]} ml-2`} />
      )}
    </button>
  );
};

export default Button;