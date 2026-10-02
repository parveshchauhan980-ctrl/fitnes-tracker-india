import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  colorScheme?: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'slate';
  change?: string;
  positive?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  colorScheme = 'emerald',
  change,
  positive = true,
}) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      iconBg: 'bg-emerald-500 text-white shadow-emerald-500/20',
    },
    blue: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
      iconBg: 'bg-blue-500 text-white shadow-blue-500/20',
    },
    purple: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
      iconBg: 'bg-purple-500 text-white shadow-purple-500/20',
    },
    amber: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
      iconBg: 'bg-amber-500 text-white shadow-amber-500/20',
    },
    rose: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
      iconBg: 'bg-rose-500 text-white shadow-rose-500/20',
    },
    slate: {
      bg: 'bg-slate-500/10 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20',
      iconBg: 'bg-slate-700 text-white shadow-slate-700/20',
    },
  };

  const scheme = colorMap[colorScheme];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {change && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium">
          <span className={positive ? 'text-emerald-500' : 'text-rose-500'}>
            {positive ? '↑' : '↓'} {change}
          </span>
          <span className="text-slate-400">vs start</span>
        </div>
      )}
    </div>
  );
};
