import { useState } from 'react';

const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <div className="absolute z-50 px-3 py-2 text-sm text-gray-100 bg-gray-800 border border-gray-700 rounded-lg shadow-lg min-w-48 max-w-64 -top-2 left-6 transform -translate-y-full">
          <div className="relative">
            {text}
            {/* Arrow pointing down */}
            <div className="absolute top-full left-4 transform -translate-x-1/2">
              <div className="border-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
