import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchTaskByDay } from '../services/taskService';
import { calculateBMI } from '../services/fitnessService';
import { ProgressRing } from '../components/common/ProgressRing';
import { StatsCard } from '../components/common/StatsCard';
import { StreakBadge } from '../components/common/StreakBadge';
import { BMICard } from '../components/common/BMICard';
import { PWAInstallButton } from '../components/pwa/PWAInstallButton';
import { DailyTask } from '../types';
import {
  Flame,
  Dumbbell,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingDown,
  Droplet,
  Footprints,
  Clock,
  Zap,
  Sparkles,
  Award,
  ChevronRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { userProfile, dailySubmissions, submissionsMap } = useAuth();
  const navigate = useNavigate();

  const [todayTask, setTodayTask] = useState<DailyTask | null>(null);
  const [loadingTask, setLoadingTask] = useState(true);

  const currentDay = userProfile?.currentDay || 1;
  const completedDays = userProfile?.completedDays || 0;
  const completionPercentage = Math.round((completedDays / 30) * 100);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    async function loadTodayTask() {
      try {
        setLoadingTask(true);
        const task = await fetchTaskByDay(currentDay);
        setTodayTask(task);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTask(false);
      }
    }
    loadTodayTask();
  }, [currentDay]);

  const isTodayCompleted = Boolean(submissionsMap[currentDay]?.completed);

  // Weight difference
  const weightChange = userProfile
    ? Math.round((userProfile.currentWeight - userProfile.startingWeight) * 10) / 10
    : 0;

  // Chart data points from submissions
  const sortedSubmissions = [...dailySubmissions].sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Overview & Daily Brief
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            {getGreeting()}, {userProfile?.name?.split(' ')[0] || 'Athlete'}! 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Focus on one day at a time. Consistency is how extraordinary transformations occur.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/challenge"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Calendar className="w-4 h-4 text-emerald-500" />
            30-Day Grid
          </Link>

          <Link
            to={`/day/${currentDay}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-md shadow-emerald-500/25 transition-all"
          >
            <Dumbbell className="w-4 h-4" />
            {isTodayCompleted ? `Review Day ${currentDay}` : `Today's Workout (Day ${currentDay})`}
          </Link>
        </div>
      </div>

      {/* In-App PWA Install Banner */}
      <PWAInstallButton variant="banner" />

      {/* Main Highlights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Challenge Completion Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold tracking-wider uppercase mb-3">
                <Flame className="w-3.5 h-3.5" />
                Challenge Status
              </div>
              <h2 className="text-3xl sm:text-5xl font-black font-['Outfit'] tracking-tight text-white mb-2">
                DAY {currentDay} <span className="text-slate-500 text-2xl sm:text-3xl font-normal">/ 30</span>
              </h2>
              <p className="text-slate-300 text-sm max-w-sm leading-relaxed">
                {isTodayCompleted
                  ? `Day ${currentDay} progress recorded! Tomorrow unlocks at midnight.`
                  : `Complete your Day ${currentDay} workout and submit your daily log to maintain your streak.`}
              </p>
            </div>

            <div className="shrink-0 flex items-center justify-center">
              <ProgressRing
                progress={completionPercentage}
                size={140}
                strokeWidth={12}
                color="stroke-emerald-400"
                trackColor="stroke-slate-800"
                label={`${completionPercentage}%`}
                sublabel="Finished"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed</span>
                <span className="text-lg font-black block font-['Outfit']">{completedDays} Days</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Remaining</span>
                <span className="text-lg font-black block font-['Outfit']">{30 - completedDays} Days</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Goal</span>
                <span className="text-lg font-black block font-['Outfit']">{userProfile?.fitnessGoal || 'General'}</span>
              </div>
            </div>

            <Link
              to={`/day/${currentDay}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Open Day {currentDay} Checklist
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Streak & Motivation Card */}
        <div className="space-y-6 flex flex-col justify-between">
          <StreakBadge
            currentStreak={userProfile?.currentStreak || 0}
            bestStreak={userProfile?.bestStreak || 0}
          />

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Tip</span>
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              "You don't have to be extreme, just consistent. Drink 500ml of water right after waking up to activate your metabolism."
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Goal: {userProfile?.fitnessGoal}</span>
              <span className="text-emerald-500 font-bold">Level: {userProfile?.fitnessLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard
          label="Current Weight"
          value={userProfile?.currentWeight || 70}
          unit="kg"
          icon={TrendingDown}
          colorScheme="emerald"
          change={weightChange !== 0 ? `${Math.abs(weightChange)} kg` : undefined}
          positive={weightChange <= 0}
        />
        <StatsCard
          label="Body Mass Index"
          value={userProfile?.bmi || 22.5}
          unit="BMI"
          icon={Zap}
          colorScheme="blue"
        />
        <StatsCard
          label="Workout Time"
          value={userProfile?.totalWorkoutMinutes || 0}
          unit="mins"
          icon={Clock}
          colorScheme="purple"
        />
        <StatsCard
          label="Total Steps"
          value={(userProfile?.totalSteps || 0).toLocaleString()}
          unit="steps"
          icon={Footprints}
          colorScheme="amber"
        />
        <StatsCard
          label="Total Water"
          value={userProfile?.totalWater || 0}
          unit="Liters"
          icon={Droplet}
          colorScheme="rose"
        />
        <StatsCard
          label="Badges Unlocked"
          value={completedDays >= 30 ? 8 : completedDays >= 15 ? 5 : completedDays >= 1 ? 2 : 0}
          unit="earned"
          icon={Award}
          colorScheme="slate"
        />
      </div>

      {/* Today's Task Card + BMI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Task card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Prescribed Workout
                </span>
                {isTodayCompleted && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Completed ✓
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Outfit'] mt-1">
                Day {currentDay}: {todayTask?.title || 'Loading Workout...'}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                ⏱ {todayTask?.duration || 25} mins
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {todayTask?.difficulty || 'Beginner'}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 my-4 leading-relaxed">
            {todayTask?.description}
          </p>

          {/* Exercise items list */}
          <div className="space-y-2.5 mb-6">
            {todayTask?.exercises.slice(0, 4).map((ex, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">{ex.name}</h5>
                    <span className="text-[11px] text-slate-400">{ex.targetArea}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {ex.reps || (ex.durationMinutes ? `${ex.durationMinutes} min` : '1 set')}
                </span>
              </div>
            ))}
          </div>

          {/* Button to Complete/View Task */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-4">
              <span>💧 Target: {todayTask?.waterTarget}L</span>
              <span>👟 Steps: {todayTask?.stepTarget?.toLocaleString()}</span>
            </div>

            <Link
              to={`/day/${currentDay}`}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                isTodayCompleted
                  ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'
              }`}
            >
              {isTodayCompleted ? 'View Submitted Progress' : 'Start & Submit Day Workout'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* BMI Card */}
        <BMICard
          currentWeight={userProfile?.currentWeight || 70}
          height={userProfile?.height || 175}
        />
      </div>

      {/* Progress Mini Charts & Recent Activity */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Activity History
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
              Challenge Progression Timeline
            </h3>
          </div>
          <Link
            to="/progress"
            className="text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1"
          >
            Full Analytics & Charts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {sortedSubmissions.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Dumbbell className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No workout submissions yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Complete your Day 1 workout and submit your progress to initiate your progress charts!
            </p>
            <Link
              to={`/day/${currentDay}`}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold"
            >
              Start Day 1 Task
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Day</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Weight</th>
                  <th className="py-3 px-4">Steps</th>
                  <th className="py-3 px-4">Water</th>
                  <th className="py-3 px-4">Workout</th>
                  <th className="py-3 px-4">Mood</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedSubmissions.slice(-5).reverse().map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      Day {sub.dayNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{sub.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {sub.weight} kg
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {sub.steps.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {sub.water} L
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {sub.workoutDuration} mins
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {sub.mood}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-emerald-500 font-bold">✓ Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
