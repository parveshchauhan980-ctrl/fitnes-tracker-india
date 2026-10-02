import React from 'react';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  currentStreak: number;
  bestStreak: number;
  compact?: boolean;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ currentStreak, bestStreak, compact = false }) => {
  const isHot = currentStreak >= 3;
  const isLegendary = currentStreak >= 10;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold">
        <Flame className={`w-4 h-4 ${isHot ? 'text-orange-500 animate-pulse' : 'text-slate-400'}`} />
        <span>{currentStreak} Day Streak</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-rose-950/40 border border-orange-500/20 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
            <Flame className={`w-7 h-7 ${isHot ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Consistency Streak
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">
                {currentStreak}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {currentStreak === 1 ? 'Day Active' : 'Days Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right border-l border-orange-500/20 pl-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Personal Best
          </div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-200 font-['Outfit']">
            {bestStreak} Days
          </div>
        </div>
      </div>

      {isLegendary && (
        <div className="mt-3 pt-3 border-t border-orange-500/15 text-xs font-medium text-orange-600 dark:text-orange-300 flex items-center gap-1.5">
          <span>🔥</span> You are building unstoppable habit momentum!
        </div>
      )}
    </div>
  );
};
