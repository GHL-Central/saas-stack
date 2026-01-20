
import React from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (val: number) => void;
}

const SliderInput: React.FC<SliderInputProps> = ({ label, value, min, max, step, unit = '', onChange }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-bold text-slate-900">{label}</label>
        <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 shadow-sm transition-all">
          {unit && <span className="pl-2 text-xs font-bold text-slate-500">{unit}</span>}
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const val = e.target.value === '' ? 0 : Number(e.target.value);
              onChange(val);
            }}
            className="w-16 px-2 py-1 text-sm font-mono font-bold text-indigo-700 focus:outline-none bg-transparent appearance-none"
          />
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500"
      />
    </div>
  );
};

export default SliderInput;
