import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_ACHIEVEMENTS } from '../data/defaultAchievements';
import { Achievement } from '../types';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  Award,
  Zap,
  TrendingUp,
  Compass,
  ShieldCheck,
  Footprints,
  Droplet,
  Lock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const { userProfile, dailySubmissions } = useAuth();

  const completedDays = userProfile?.completedDays || 0;
  const currentStreak = userProfile?.currentStreak || 0;
  const bestStreak = userProfile?.bestStreak || 0;
  const maxStepsLogged = dailySubmissions.reduce((max, s) => Math.max(max, s.steps || 0), 0);
  const maxWaterLogged = dailySubmissions.reduce((max, s) => Math.max(max, s.water || 0), 0);

  // Check which badges are unlocked
  const isUnlocked = (ach: Achievement): boolean => {
    if (ach.id === 'first-step') return completedDays >= 1;
    if (ach.id === '3-day-streak') return bestStreak >= 3 || currentStreak >= 3;
    if (ach.id === '7-day-streak') return bestStreak >= 7 || currentStreak >= 7;
    if (ach.id === '10-days-completed') return completedDays >= 10;
    if (ach.id === '15-day-streak') return bestStreak >= 15 || currentStreak >= 15;
    if (ach.id === 'halfway-there') return completedDays >= 15;
    if (ach.id === '20-days-completed') return completedDays >= 20;
    if (ach.id === '30-day-champion') return completedDays >= 30;
    if (ach.id === 'step-master') return maxStepsLogged >= 10000;
    if (ach.id === 'hydration-hero') return maxWaterLogged >= 3.0;
    return false;
  };

  const getProgressToward = (ach: Achievement): { current: number; target: number; percent: number } => {
    if (ach.requiredDays) {
      const cur = Math.min(completedDays, ach.requiredDays);
      return { current: cur, target: ach.requiredDays, percent: Math.round((cur / ach.requiredDays) * 100) };
    }
    if (ach.requiredStreak) {
      const cur = Math.min(Math.max(currentStreak, bestStreak), ach.requiredStreak);
      return { current: cur, target: ach.requiredStreak, percent: Math.round((cur / ach.requiredStreak) * 100) };
    }
    if (ach.id === 'step-master') {
      const cur = Math.min(maxStepsLogged, 10000);
      return { current: cur, target: 10000, percent: Math.round((cur / 10000) * 100) };
    }
    if (ach.id === 'hydration-hero') {
      const cur = Math.min(maxWaterLogged, 3.0);
      return { current: cur, target: 3.0, percent: Math.round((cur / 3.0) * 100) };
    }
    return { current: 0, target: 1, percent: 0 };
  };

  const getBadgeIcon = (name: string, unlocked: boolean) => {
    const props = { className: `w-8 h-8 ${unlocked ? 'text-amber-400' : 'text-slate-400'}` };
    switch (name) {
      case 'Footprints': return <Footprints {...props} />;
      case 'Flame': return <Flame {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Award': return <Award {...props} />;
      case 'TrendingUp': return <TrendingUp {...props} />;
      case 'Compass': return <Compass {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      case 'Trophy': return <Trophy {...props} />;
      case 'Activity': return <Sparkles {...props} />;
      case 'Droplet': return <Droplet {...props} />;
      default: return <Trophy {...props} />;
    }
  };

  const unlockedCount = DEFAULT_ACHIEVEMENTS.filter(isUnlocked).length;

  const triggerCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Milestones & Badges
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Challenge Achievements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Unlock distinctive badges by maintaining workout streaks and completing program milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold">
            <span className="text-slate-400 mr-2">Badges Unlocked:</span>
            <span className="text-emerald-500 font-extrabold">{unlockedCount} / {DEFAULT_ACHIEVEMENTS.length}</span>
          </div>
          {unlockedCount > 0 && (
            <button
              onClick={triggerCelebrate}
              className="p-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 transition-colors"
              title="Celebrate achievements"
            >
              🎉
            </button>
          )}
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {DEFAULT_ACHIEVEMENTS.map((ach) => {
          const unlocked = isUnlocked(ach);
          const progress = getProgressToward(ach);

          return (
            <div
              key={ach.id}
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                unlocked
                  ? 'bg-gradient-to-br from-amber-500/10 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 border-amber-500/40 shadow-md ring-1 ring-amber-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
              }`}
            >
              {/* Unlocked stamp */}
              {unlocked ? (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <CheckCircle2 className="w-3 h-3" /> UNLOCKED
                </span>
              ) : (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" /> LOCKED
                </span>
              )}

              <div>
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${
                    unlocked
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-400 shadow-lg shadow-amber-500/30 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {getBadgeIcon(ach.icon, unlocked)}
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit'] mb-1">
                  {ach.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {ach.description}
                </p>
              </div>

              {/* Requirement & Progress Bar */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-slate-400">{ach.requirement}</span>
                  <span className={unlocked ? 'text-emerald-500' : 'text-slate-500'}>
                    {progress.percent}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      unlocked ? 'bg-gradient-to-r from-amber-400 to-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
