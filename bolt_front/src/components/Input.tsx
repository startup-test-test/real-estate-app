/**
 * 再利用可能な入力コンポーネント
 */
import React from 'react';
import { LucideIcon } from 'lucide-react';
import Tooltip from './Tooltip';

export type InputVariant = 'default' | 'error' | 'success';
export type InputSize = 'sm' | 'md' | 'lg';

interface BaseInputProps {
  label?: string;
  error?: string;
  success?: string;
  required?: boolean;
  tooltip?: string;
  unit?: string;
  variant?: InputVariant;
  size?: InputSize;
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

interface TextInputProps extends BaseInputProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  type?: 'text' | 'email' | 'url' | 'password' | 'search';
}

interface NumberInputProps extends BaseInputProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}

interface SelectInputProps extends BaseInputProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  type: 'select';
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export type InputProps = TextInputProps | NumberInputProps | SelectInputProps;

const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  required = false,
  tooltip,
  unit,
  variant: propVariant,
  size = 'md',
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  // バリアントを自動決定
  const variant = propVariant || (error ? 'error' : success ? 'success' : 'default');

  const baseClasses = 'border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-100 disabled:cursor-not-allowed touch-manipulation';

  const variantClasses = {
    default: 'border-gray-300 focus:ring-indigo-500 focus:border-transparent',
    error: 'border-red-300 focus:ring-red-500 focus:border-transparent',
    success: 'border-green-300 focus:ring-green-500 focus:border-transparent'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm min-h-[36px]',
    md: 'px-3 py-2 text-base min-h-[44px]',
    lg: 'px-4 py-3 text-lg min-h-[52px]'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const inputClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${Icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''}
    ${unit ? 'pr-12' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const renderInput = () => {
    if (props.type === 'select') {
      const { options, placeholder, ...selectProps } = props as SelectInputProps;
      return (
        <select {...selectProps} className={inputClasses}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return <input {...props as TextInputProps | NumberInputProps} className={inputClasses} />;
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <div className="flex items-center space-x-1 mb-1">
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {tooltip && <Tooltip content={tooltip} />}
        </div>
      )}

      <div className="relative">
        {Icon && (
          <div className={`absolute ${iconPosition === 'left' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400`}>
            <Icon className={iconSizeClasses[size]} />
          </div>
        )}

        {renderInput()}

        {unit && !Icon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
            {unit}
          </div>
        )}

        {unit && Icon && iconPosition === 'right' && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
            {unit}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}

      {success && (
        <p className="mt-1 text-sm text-green-600 flex items-center">
          <span className="mr-1">✅</span>
          {success}
        </p>
      )}
    </div>
  );
};

export default Input;