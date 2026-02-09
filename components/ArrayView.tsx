
import React from 'react';
import { COLORS } from '../constants';

interface ArrayViewProps {
  array: number[];
  activeIndices: number[];
}

export const ArrayView: React.FC<ArrayViewProps> = ({ array, activeIndices }) => {
  const maxVal = Math.max(...array.filter(v => v !== null), 1);

  return (
    <div className="w-full h-48 bg-slate-900/50 rounded-xl border border-slate-800 p-6 flex items-end gap-1 relative overflow-hidden">
      <div className="absolute top-4 left-4 text-xs font-mono text-slate-500 uppercase tracking-widest">
        Sorted Result Stream
      </div>
      {array.map((val, idx) => (
        <div
          key={idx}
          className="flex-1 flex flex-col items-center group relative"
        >
          {val !== null && (
            <div
              className="w-full rounded-t-sm transition-all duration-300"
              style={{
                height: `${(val / maxVal) * 100}%`,
                backgroundColor: activeIndices.includes(idx) ? COLORS.ACCENT : COLORS.SUCCESS,
                opacity: activeIndices.includes(idx) ? 1 : 0.8,
                boxShadow: activeIndices.includes(idx) ? `0 0 15px ${COLORS.ACCENT}` : 'none',
              }}
            />
          )}
          {val === null && (
            <div className="w-full h-1 bg-slate-800 rounded-full" />
          )}
          <span className="text-[10px] text-slate-500 mt-2 font-mono">
            {val !== null ? val : '-'}
          </span>
        </div>
      ))}
    </div>
  );
};
