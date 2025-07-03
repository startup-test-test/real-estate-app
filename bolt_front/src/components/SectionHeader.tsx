/**
 * 再利用可能なセクションヘッダーコンポーネント
 */
import React from 'react';
import { LucideIcon } from 'lucide-react';

export type SectionHeaderVariant = 'main' | 'sub' | 'mini';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  icon?: LucideIcon;
  variant?: SectionHeaderVariant;
  divider?: boolean;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  emoji,
  icon: Icon,
  variant = 'main',
  divider = false,
  actions,
  className = '',
  children
}) => {
  const variantClasses = {
    main: {
      container: 'mb-6',
      title: 'text-xl font-bold text-gray-900',
      subtitle: 'text-sm text-gray-600 mt-1',
      iconSize: 'h-6 w-6'
    },
    sub: {
      container: 'mb-4',
      title: 'text-lg font-semibold text-gray-800',
      subtitle: 'text-sm text-gray-600 mt-1',
      iconSize: 'h-5 w-5'
    },
    mini: {
      container: 'mb-3',
      title: 'text-base font-medium text-gray-700',
      subtitle: 'text-xs text-gray-500 mt-0.5',
      iconSize: 'h-4 w-4'
    }
  };

  const config = variantClasses[variant];

  const containerClasses = `
    ${config.container}
    ${divider ? 'border-t pt-6' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {emoji && (
            <span className="text-lg" role="img" aria-label="section icon">
              {emoji}
            </span>
          )}
          
          {Icon && (
            <Icon className={`${config.iconSize} text-gray-600`} />
          )}
          
          <div>
            <h3 className={config.title}>
              {title}
            </h3>
            {subtitle && (
              <p className={config.subtitle}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>

      {children && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;