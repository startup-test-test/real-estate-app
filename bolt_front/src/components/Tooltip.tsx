import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children || (
          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-indigo-500 transition-colors" />
        )}
      </div>
      
      {isVisible && (
        <div className="absolute z-50 px-4 py-3 text-sm text-white bg-gray-800 rounded-lg shadow-lg whitespace-normal w-80 md:w-96 bottom-full left-1/2 transform -translate-x-1/2 mb-2 leading-relaxed">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;