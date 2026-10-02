import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { exportSubmissionsToCSV } from '../services/fitnessService';
import { BMICard } from '../components/common/BMICard';
import { StatsCard } from '../components/common/StatsCard';
import {
  LineChart as LineChartIcon,
  Download,
  Calendar,
  Footprints,
  Droplet,
  Clock,
  Moon,
  TrendingDown,
  Trophy,
  Sparkles,
  Camera,
  Award,
} from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { userProfile, dailySubmissions } = useAuth();
  const [activeMetric, setActiveMetric] = useState<'weight' | 'steps' | 'workout' | 'water' | 'sleep'>('weight');

  const sortedSubmissions = [...dailySubmissions].sort((a, b) => a.dayNumber - b.dayNumber);

  // Compute Averages
  const count = sortedSubmissions.length;
  const avgSteps = count > 0 ? Math.round(sortedSubmissions.reduce((a, b) => a + (b.steps || 0), 0) / count) : 0;
  const avgWorkout = count > 0 ? Math.round(sortedSubmissions.reduce((a, b) => a + (b.workoutDuration || 0), 0) / count) : 0;
  const avgWater = count > 0 ? Math.round((sortedSubmissions.reduce((a, b) => a + (b.water || 0), 0) / count) * 10) / 10 : 0;
  const avgSleep = count > 0 ? Math.round((sortedSubmissions.reduce((a, b) => a + (b.sleepHours || 0), 0) / count) * 10) / 10 : 0;

  const startingWeight = userProfile?.startingWeight || 70;
  const currentWeight = userProfile?.currentWeight || startingWeight;
  const weightChange = Math.round((currentWeight - startingWeight) * 10) / 10;
  const completionRate = Math.round(((userProfile?.completedDays || 0) / 30) * 100);

  // Find Day 1 and Day 30 photos for Before / After
  const day1Photo = sortedSubmissions.find(s => s.dayNumber === 1)?.progressPhotoUrl;
  const latestPhoto = sortedSubmissions.filter(s => s.progressPhotoUrl).pop()?.progressPhotoUrl;
  const isChallengeCompleted = (userProfile?.completedDays || 0) >= 30;

  const handleExportCSV = () => {
    if (!userProfile) return;
    exportSubmissionsToCSV(sortedSubmissions, userProfile);
  };

  // Helper to build SVG chart
  const renderChart = () => {
    if (sortedSubmissions.length === 0) {
      return (
        <div className="py-20 text-center text-slate-400 text-xs">
          No data logged yet. Complete today's task to render dynamic charts.
        </div>
      );
    }

    const dataKey =
      activeMetric === 'weight'
        ? 'weight'
        : activeMetric === 'steps'
        ? 'steps'
        : activeMetric === 'workout'
        ? 'workoutDuration'
        : activeMetric === 'water'
        ? 'water'
        : 'sleepHours';

    const unit =
      activeMetric === 'weight'
        ? 'kg'
        : activeMetric === 'steps'
        ? 'steps'
        : activeMetric === 'workout'
        ? 'min'
        : activeMetric === 'water'
        ? 'L'
        : 'hrs';

    const color =
      activeMetric === 'weight'
        ? '#10B981'
        : activeMetric === 'steps'
        ? '#F59E0B'
        : activeMetric === 'workout'
        ? '#8B5CF6'
        : activeMetric === 'water'
        ? '#3B82F6'
        : '#6366F1';

    const values = sortedSubmissions.map(s => Number(s[dataKey]) || 0);
    const minVal = Math.min(...values) * 0.95;
    const maxVal = Math.max(...values, 1) * 1.05;
    const range = maxVal - minVal || 1;

    const width = 800;
    const height = 260;
    const padding = 45;

    const points = sortedSubmissions.map((s, idx) => {
      const x = padding + (idx / Math.max(sortedSubmissions.length - 1, 1)) * (width - padding * 2);
      const val = Number(s[dataKey]) || 0;
      const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
      return { x, y, val, day: s.dayNumber };
    });

    const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`), '');
    const areaD = points.length > 0 ? `${pathD} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z` : '';

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64 sm:h-72">
          <defs>
            <linearGradient id={`grad-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = height - padding - pct * (height - padding * 2);
            const labelVal = Math.round((minVal + pct * range) * 10) / 10;
            return (
              <g key={i}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                <text x={padding - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* Fill Area */}
          <path d={areaD} fill={`url(#grad-${activeMetric})`} />

          {/* Stroke Line */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx} className="group">
              <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke={color} strokeWidth="2.5" className="hover:scale-150 transition-transform" />
              <text x={p.x} y={height - 15} textAnchor="middle" className="text-[10px] fill-slate-400 font-bold">
                D{p.day}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Analytics & Progress
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Comprehensive Progress Tracking
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyze your body metrics, consistency, and transformation over the 30-day challenge.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-sm transition-colors"
        >
          <Download className="w-4 h-4 text-emerald-500" />
          Export Progress CSV
        </button>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Start Weight</span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-['Outfit'] block mt-1">
            {startingWeight} kg
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Weight</span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-['Outfit'] block mt-1">
            {currentWeight} kg
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Weight Change</span>
          <span className={`text-xl font-black font-['Outfit'] block mt-1 ${weightChange <= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {weightChange > 0 ? `+${weightChange}` : weightChange} kg
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Completion</span>
          <span className="text-xl font-black text-emerald-500 font-['Outfit'] block mt-1">
            {completionRate}%
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Steps</span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-['Outfit'] block mt-1">
            {avgSteps.toLocaleString()}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Workout</span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-['Outfit'] block mt-1">
            {avgWorkout} min
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Water</span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-['Outfit'] block mt-1">
            {avgWater} L
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Sleep</span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-['Outfit'] block mt-1">
            {avgSleep} hrs
          </span>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Progression Curve
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
              Metric Trajectory Over 30 Days
            </h3>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
            {[
              { id: 'weight', label: 'Weight', icon: TrendingDown },
              { id: 'steps', label: 'Steps', icon: Footprints },
              { id: 'workout', label: 'Workout', icon: Clock },
              { id: 'water', label: 'Water', icon: Droplet },
              { id: 'sleep', label: 'Sleep', icon: Moon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeMetric === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMetric(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-6">
          {renderChart()}
        </div>
      </div>

      {/* Before / After Progress Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Visual Transformation
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
              Before & After Progress Gallery
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Upload daily photos in workout logs to compare
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Day 1 Photo */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/40 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Day 1 Baseline Photo
            </span>
            {day1Photo ? (
              <div className="aspect-square w-full max-w-xs mx-auto rounded-xl overflow-hidden shadow-md">
                <img src={day1Photo} alt="Day 1" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-square w-full max-w-xs mx-auto rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 p-4">
                <Camera className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs font-semibold">No Day 1 photo uploaded</span>
              </div>
            )}
            <div className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
              Starting: {startingWeight} kg
            </div>
          </div>

          {/* Latest / Day 30 Photo */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/40 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2 block">
              {isChallengeCompleted ? 'Day 30 Final Photo' : 'Latest Milestone Photo'}
            </span>
            {latestPhoto ? (
              <div className="aspect-square w-full max-w-xs mx-auto rounded-xl overflow-hidden shadow-md ring-2 ring-emerald-500/20">
                <img src={latestPhoto} alt="Latest Progress" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-square w-full max-w-xs mx-auto rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 p-4">
                <Camera className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs font-semibold">No recent photo uploaded</span>
              </div>
            )}
            <div className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Current: {currentWeight} kg ({weightChange <= 0 ? `${weightChange} kg` : `+${weightChange} kg`})
            </div>
          </div>
        </div>
      </div>

      {/* FINAL 30-DAY REPORT SECTION (Item 27 requirement) */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white border border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-emerald-500/20 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Trophy className="w-3.5 h-3.5" />
              Official FitTrack 30 Transformation Report
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-['Outfit']">
              {isChallengeCompleted ? 'Congratulations! You Completed FitTrack 30.' : 'Your 30-Day Milestone Journey'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Verified summary of total workouts, endurance, hydration, and habit metrics logged during your program.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 shrink-0 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Progress Report
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6 pt-8 text-center">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Starting Weight</span>
            <span className="text-2xl font-black block font-['Outfit'] mt-1">{startingWeight} kg</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Final / Current</span>
            <span className="text-2xl font-black block font-['Outfit'] mt-1">{currentWeight} kg</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Net Weight Change</span>
            <span className="text-2xl font-black text-emerald-400 block font-['Outfit'] mt-1">
              {weightChange} kg
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Workout Time</span>
            <span className="text-2xl font-black block font-['Outfit'] mt-1">
              {userProfile?.totalWorkoutMinutes || 0} mins
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Steps Logged</span>
            <span className="text-2xl font-black block font-['Outfit'] mt-1">
              {(userProfile?.totalSteps || 0).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Average Water</span>
            <span className="text-2xl font-black block font-['Outfit'] mt-1">{avgWater} L / day</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Average Sleep</span>
            <span className="text-2xl font-black block font-['Outfit'] mt-1">{avgSleep} hrs / night</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Days Completed</span>
            <span className="text-2xl font-black block font-['Outfit'] mt-1">{userProfile?.completedDays || 0} / 30</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Best Streak</span>
            <span className="text-2xl font-black text-amber-400 block font-['Outfit'] mt-1">
              {userProfile?.bestStreak || 0} Days
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Overall Completion</span>
            <span className="text-2xl font-black text-teal-400 block font-['Outfit'] mt-1">
              {completionRate}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
