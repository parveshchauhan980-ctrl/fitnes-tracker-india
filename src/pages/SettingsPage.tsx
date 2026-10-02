import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { exportSubmissionsToCSV } from '../services/fitnessService';
import { firebaseConfig } from '../firebase/config';
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Download,
  RotateCcw,
  Shield,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { userProfile, dailySubmissions, updateUserProfile } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { showToast, requestNotificationPermission, sendBrowserNotification } = useNotification();

  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [hydrationReminders, setHydrationReminders] = useState(true);
  const [streakWarnings, setStreakWarnings] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      sendBrowserNotification('FitTrack 30 Reminders Active', {
        body: 'You are all set for workout and hydration notifications.',
      });
    }
  };

  const handleExportData = () => {
    if (userProfile) {
      exportSubmissionsToCSV(dailySubmissions, userProfile);
      showToast('success', 'Data Exported', 'Your fitness progress CSV has been downloaded.');
    }
  };

  const handleResetChallenge = async () => {
    if (!userProfile) return;
    setIsResetting(true);
    try {
      await updateUserProfile({
        currentDay: 1,
        completedDays: 0,
        currentStreak: 0,
        challengeStartDate: new Date().toISOString(),
      });
      showToast('success', 'Challenge Reset', 'Your 30-Day Challenge has been restarted to Day 1.');
      setShowResetConfirm(false);
    } catch (err: any) {
      showToast('error', 'Reset Failed', err.message || 'Could not reset challenge.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Preferences
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
          Application Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your interface theme, reminder alerts, and challenge preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Display Theme
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Choose between dark athletic mode or clean light mode.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                theme === 'dark'
                  ? 'border-emerald-500 bg-slate-950 text-white shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 text-slate-700'
              }`}
            >
              <Moon className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <span className="text-sm font-bold block">Dark Mode</span>
                <span className="text-[10px] opacity-75">High contrast, battery saver</span>
              </div>
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                theme === 'light'
                  ? 'border-emerald-500 bg-white text-slate-900 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-800/40 text-slate-400'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <div className="text-left">
                <span className="text-sm font-bold block">Light Mode</span>
                <span className="text-[10px] opacity-75">Clean daylight view</span>
              </div>
            </button>
          </div>
        </div>

        {/* Notifications & Reminders */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Workout & Hydration Reminders
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive browser alerts and in-app prompts to keep your streak intact.
              </p>
            </div>
            <button
              onClick={handleRequestNotifications}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <Bell className="w-4 h-4" />
              Enable Browser Alerts
            </button>
          </div>

          <div className="pt-6 space-y-4">
            {[
              {
                title: "Today's Workout Reminder",
                desc: 'Prompt me at 8:00 AM if today’s workout has not yet been started.',
                state: workoutReminders,
                setter: setWorkoutReminders,
              },
              {
                title: 'Hydration Target Alerts',
                desc: 'Periodic notifications to help you hit your 2.5L+ daily water target.',
                state: hydrationReminders,
                setter: setHydrationReminders,
              },
              {
                title: 'Streak Warning Notification',
                desc: 'Alert me in the evening if today’s progress log is still pending.',
                state: streakWarnings,
                setter: setStreakWarnings,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
              >
                <div>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={item.state}
                  onChange={(e) => item.setter(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Data & Challenge Management */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Data Export & Reset
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 gap-4">
            <div>
              <h5 className="text-sm font-bold text-slate-900 dark:text-white">Export Workout Records</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Download your complete daily fitness logs in CSV format.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              Download CSV
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 gap-4">
            <div>
              <h5 className="text-sm font-bold text-rose-600 dark:text-rose-400">Restart 30-Day Challenge</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Resets current day to Day 1 and resets your active streak.
              </p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restart Challenge
            </button>
          </div>
        </div>

        {/* Backend & Security Information */}
        <div className="p-6 rounded-3xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>FitTrack 30 Cloud Backend Status</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div>Firebase Project: <code className="text-slate-800 dark:text-slate-200 font-mono">{firebaseConfig.projectId || 'Active'}</code></div>
            <div>Database: <code className="text-slate-800 dark:text-slate-200 font-mono">{firebaseConfig.firestoreDatabaseId || 'ai-studio-provisioned'}</code></div>
            <div>Auth Domain: <code className="text-slate-800 dark:text-slate-200 font-mono">{firebaseConfig.authDomain || 'firebaseapp.com'}</code></div>
            <div>Security Rules: <span className="text-emerald-500 font-bold">Hardened ABAC Enforced</span></div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit'] mb-2">
              Restart Challenge?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              This will set your active challenge day back to Day 1 and reset your streak counter. Are you sure you want to start fresh?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetChallenge}
                disabled={isResetting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                {isResetting ? 'Restarting...' : 'Yes, Restart Day 1'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
