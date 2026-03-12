import React from 'react';

interface Option {
  label: string;
  value: string;
}

interface ToggleSwitchProps {
  options: [Option, Option]; 
  currentValue: string;
  onChange: (value: any) => void;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ options, currentValue, onChange, className = "" }) => {
  const isFirstActive = currentValue === options[0].value;

  return (
    <div className={`flex bg-gray-200 p-1 rounded-xl relative shadow-inner ${className}`}>
      <div
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-md transition-all duration-300 ease-in-out ${
          isFirstActive ? 'right-1' : 'right-[calc(50%+1px)]'
        }`}
      />
      
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 py-1.5 text-xs font-bold z-10 transition-colors cursor-pointer outline-none ${
            currentValue === option.value ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ToggleSwitch;