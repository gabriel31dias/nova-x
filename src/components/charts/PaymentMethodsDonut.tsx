import React from 'react';
import { MoreVertical } from 'lucide-react';

const COLORS = ['#07A33E', '#0C1A11', '#4ADE80', '#CBD5E1', '#94A3B8'];

interface PaymentMethodsDonutProps {
  data: { name: string; percentage: number }[];
  totalTransactions: number;
}

export const PaymentMethodsDonut: React.FC<PaymentMethodsDonutProps> = ({ data, totalTransactions }) => {
  const methods = data.map((m, i) => ({ label: m.name, percentage: m.percentage, color: COLORS[i % COLORS.length] }));
  const size = 150;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-full w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
          Métodos de Pagamento
        </h3>
        <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Responsive Donut + Legend Container */}
      <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-between gap-4 xl:gap-5 my-auto w-full">
        {/* Donut Chart with Scaled Center Text */}
        <div className="relative flex items-center justify-center shrink-0 w-[140px] h-[140px] xl:w-[150px] xl:h-[150px]">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full h-full transform -rotate-90 overflow-visible"
          >
            {methods.map((item, idx) => {
              const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
              const rotation = (cumulativePercent / 100) * 360;
              cumulativePercent += item.percentage;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
                  className="transition-all duration-700 ease-out"
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span className="text-xl xl:text-2xl font-black text-slate-900 tracking-tight leading-none font-display">
              {totalTransactions.toLocaleString('pt-BR')}
            </span>
            <span className="text-[10px] xl:text-[11px] text-slate-400 font-medium mt-0.5">
              transações
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 w-full sm:w-auto lg:w-full xl:w-auto flex-1 min-w-0">
          {methods.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs font-semibold w-full"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-slate-700 font-medium truncate">{item.label}</span>
              </div>
              <span className="text-slate-900 font-bold ml-3 shrink-0">{item.percentage.toLocaleString('pt-BR')}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
