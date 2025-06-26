import React from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  required?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  required = false,
  showValue = true,
  formatValue = (v) => v.toLocaleString()
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded">必須</span>}
        </label>
        {showValue && (
          <span className="text-sm font-semibold text-indigo-600">
            {formatValue(value)}{unit}
          </span>
        )}
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
          style={{
            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
          }}
        />
        
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">{formatValue(min)}{unit}</span>
          <span className="text-xs text-gray-500">{formatValue(max)}{unit}</span>
        </div>
      </div>
      
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base sm:text-sm min-h-[44px] sm:min-h-auto touch-manipulation"
      />
    </div>
  );
};

export default SliderInput;