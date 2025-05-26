import React from 'react';
import { formatNumber } from '../utils/formatters';

interface ProgressBarProps {
  current: number;
  max: number;
  colorClass: string; // e.g., "bg-green-500"
  label?: string;
  showValue?: boolean;
}

export const ProgressBar = ({ current, max, colorClass, label, showValue = true }: ProgressBarProps): React.ReactNode => {
  const percentage = max > 0 ? (current / max) * 100 : 0;

  return (
    <div className="w-full">
      {label && <div className="text-xs text-slate-400 mb-1">{label}</div>}
      <div className="h-6 w-full bg-slate-700 rounded-md overflow-hidden relative border border-slate-600">
        <div
          className={`h-full transition-all duration-300 ease-out ${colorClass}`}
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        />
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white mix-blend-difference px-2">
            {formatNumber(current,0)} / {formatNumber(max,0)} ({percentage.toFixed(0)}%)
          </div>
        )}
      </div>
    </div>
  );
};
