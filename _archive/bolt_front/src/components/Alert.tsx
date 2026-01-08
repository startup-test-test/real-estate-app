/**
 * 再利用可能なアラート・メッセージコンポーネント
 */
import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';
export type AlertSize = 'sm' | 'md' | 'lg';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  size?: AlertSize;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  size = 'md',
  dismissible = false,
  onDismiss,
  icon = true,
  className = '',
  children
}) => {
  const variantConfig = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      titleColor: 'text-green-900',
      iconColor: 'text-green-500',
      icon: CheckCircle
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      titleColor: 'text-red-900',
      iconColor: 'text-red-500',
      icon: AlertCircle
    },
    warning: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      titleColor: 'text-amber-900',
      iconColor: 'text-amber-500',
      icon: AlertTriangle
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      titleColor: 'text-blue-900',
      iconColor: 'text-blue-500',
      icon: Info
    }
  };

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const alertClasses = `
    ${config.bgColor}
    ${config.borderColor}
    ${sizeClasses[size]}
    border rounded-lg
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={alertClasses} role="alert">
      <div className="flex items-start">
        {icon && (
          <div className="flex-shrink-0 mr-3">
            <IconComponent className={`${iconSizeClasses[size]} ${config.iconColor}`} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold ${config.titleColor} mb-1`}>
              {title}
            </h4>
          )}
          
          <div className={`${config.textColor} ${title ? 'text-sm' : ''}`}>
            {message}
          </div>

          {children && (
            <div className="mt-2">
              {children}
            </div>
          )}
        </div>

        {dismissible && onDismiss && (
          <div className="flex-shrink-0 ml-3">
            <button
              type="button"
              onClick={onDismiss}
              className={`rounded-md p-1 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.iconColor}`}
            >
              <span className="sr-only">閉じる</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 使いやすさのためのショートカットコンポーネント
export const SuccessAlert: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert {...props} variant="success" />
);

export const ErrorAlert: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert {...props} variant="error" />
);

export const WarningAlert: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert {...props} variant="warning" />
);

export const InfoAlert: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert {...props} variant="info" />
);

export default Alert;