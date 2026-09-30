import React from 'react';

// KPI card in the Dashboard pattern: icon tile on the left, label on the right, big value, free footer.
export const StatCard: React.FC<{
  icon: React.FC<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  iconBg?: string;
  valueCls?: string;
  dark?: boolean; // black highlight card, same as the Dashboard's Volume Total
  children?: React.ReactNode;
}> = ({ icon: Icon, label, value, iconBg = 'bg-[#07A33E] text-white shadow-md shadow-primary-500/20', valueCls, dark, children }) => (
  <div className={`rounded-2xl p-5 min-h-[156px] ${dark ? 'bg-[#080C0A] text-white border-slate-800 shadow-md' : 'bg-white text-slate-900 border-slate-100 shadow-sm'} border relative flex flex-col justify-between transition-all hover:translate-y-[-2px] hover:shadow-md`}>
    <div className="flex items-start justify-between gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className={`text-xs font-semibold text-right ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
    </div>
    <div className="mt-4">
      <h3 className={`text-2xl font-extrabold tracking-tight font-display ${valueCls ?? (dark ? 'text-white' : 'text-slate-900')}`}>{value}</h3>
      {children && <div className="mt-2 text-xs">{children}</div>}
    </div>
  </div>
);
