import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAllTasks } from '../services/taskService';
import { getDayStatus } from '../services/fitnessService';
import { DailyTask, DayStatus } from '../types';
import {
  CalendarDays,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Flame,
  Filter,
  Trophy,
} from 'lucide-react';

export const ChallengePage: React.FC = () => {
  const { userProfile, dailySubmissions, submissionsMap } = useAuth();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'uncompleted'>('all');

  const currentDay = userProfile?.currentDay || 1;
  const completedDaysCount = userProfile?.completedDays || 0;
  const completedDayNumbers = dailySubmissions.filter(s => s.completed).map(s => s.dayNumber);

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        const allTasks = await fetchAllTasks();
        setTasks(allTasks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  const completionPercentage = Math.round((completedDaysCount / 30) * 100);

  const daysArray = Array.from({ length: 30 }, (_, i) => i + 1);

  const getStatusBadge = (status: DayStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> COMPLETED
          </span>
        );
      case 'TODAY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
            <Flame className="w-3 h-3" /> TODAY'S TASK
          </span>
        );
      case 'MISSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" /> MISSED
          </span>
        );
      case 'LOCKED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
            <Lock className="w-3 h-3" /> LOCKED
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            The Roadmap
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            30-Day Challenge Grid
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete daily workouts in order. Each day unlocks after submitting your verified progress.
          </p>
        </div>

        {/* Challenge summary pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold">
            <span className="text-slate-400 mr-2">Progress:</span>
            <span className="text-emerald-500">{completedDaysCount} / 30 Completed</span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs font-bold">
          <span className="text-slate-700 dark:text-slate-300">Challenge Completion Rate</span>
          <span className="text-emerald-500 font-['Outfit'] text-sm">{completionPercentage}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-1000"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Milestone markers */}
        <div className="flex justify-between mt-3 text-[11px] text-slate-400 font-semibold">
          <span>Day 1 (Start)</span>
          <span>Day 7 (Week 1)</span>
          <span>Day 15 (Halfway)</span>
          <span>Day 21 (Habit Formed)</span>
          <span>Day 30 (Champion)</span>
        </div>
      </div>

      {/* Grid Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All 30 Days
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === 'completed'
                ? 'bg-emerald-500 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Completed ({completedDaysCount})
          </button>
          <button
            onClick={() => setFilter('uncompleted')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filter === 'uncompleted'
                ? 'bg-amber-500 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Remaining ({30 - completedDaysCount})
          </button>
        </div>

        <span className="hidden sm:inline text-xs text-slate-400">
          Click any active day to view exercises
        </span>
      </div>

      {/* 30-Day Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {daysArray.map((dayNum) => {
          const status = getDayStatus(dayNum, currentDay, completedDayNumbers, submissionsMap);
          const task = tasks.find(t => t.dayNumber === dayNum);
          const isLocked = status === 'LOCKED';
          const isCompleted = status === 'COMPLETED';
          const isToday = status === 'TODAY';

          // Apply filter
          if (filter === 'completed' && !isCompleted) return null;
          if (filter === 'uncompleted' && isCompleted) return null;

          const cardContent = (
            <div
              className={`p-5 rounded-2xl border transition-all duration-200 h-full flex flex-col justify-between relative overflow-hidden ${
                isToday
                  ? 'bg-gradient-to-br from-amber-500/10 via-white to-white dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 border-amber-500/40 shadow-md ring-2 ring-amber-500/20'
                  : isCompleted
                  ? 'bg-white dark:bg-slate-900 border-emerald-500/30 shadow-sm'
                  : isLocked
                  ? 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 opacity-70'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header inside card */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
                    Day {dayNum}
                  </span>
                  {getStatusBadge(status)}
                </div>

                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2 mb-2">
                  {task?.title || `Day ${dayNum} Challenge Workout`}
                </h4>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {task?.description || 'Build strength, stamina, and consistency.'}
                </p>
              </div>

              {/* Bottom metadata */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">
                  ⏱ {task?.duration || 25} min
                </span>

                {isLocked ? (
                  <span className="text-slate-400 flex items-center gap-1 font-semibold">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                ) : (
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    {isCompleted ? 'Review' : 'Open'} <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          );

          if (isLocked) {
            return (
              <div key={dayNum} className="cursor-not-allowed">
                {cardContent}
              </div>
            );
          }

          return (
            <Link key={dayNum} to={`/day/${dayNum}`} className="group hover:-translate-y-1 transition-transform">
              {cardContent}
            </Link>
          );
        })}
      </div>

      {/* Day 30 Championship Banner */}
      {completedDaysCount >= 30 && (
        <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <Trophy className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <h3 className="text-2xl font-black font-['Outfit']">You Completed FitTrack 30!</h3>
              <p className="text-xs text-white/90 mt-1">
                You have transformed your daily lifestyle. View your official graduation report & certificate.
              </p>
            </div>
          </div>
          <Link
            to="/progress"
            className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 shadow-md shrink-0"
          >
            View Final Transformation Report
          </Link>
        </div>
      )}
    </div>
  );
};
