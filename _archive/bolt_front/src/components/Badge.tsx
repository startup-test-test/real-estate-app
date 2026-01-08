/**
 * 再利用可能なバッジ・ステータス表示コンポーネント
 */
import React from 'react';
import { LucideIcon } from 'lucide-react';

export type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'purple' | 'pink';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  rounded?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  rounded = true,
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    pink: 'bg-pink-100 text-pink-700'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const baseClasses = 'inline-flex items-center font-medium';
  const roundedClasses = rounded ? 'rounded-full' : 'rounded';

  const badgeClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${roundedClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span className={badgeClasses}>
      {Icon && iconPosition === 'left' && (
        <Icon className={`${iconSizeClasses[size]} mr-1`} />
      )}
      
      {children}
      
      {Icon && iconPosition === 'right' && (
        <Icon className={`${iconSizeClasses[size]} ml-1`} />
      )}
    </span>
  );
};

export default Badge;