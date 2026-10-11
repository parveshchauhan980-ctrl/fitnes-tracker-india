import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { computeAdminStats, AdminStats, subscribeToUsers, fetchAllSubmissionsAdmin } from '../../services/adminService';
import { StatsCard } from '../../components/common/StatsCard';
import {
  Users,
  Flame,
  CheckCircle2,
  TrendingUp,
  FileText,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Calendar,
  Layers,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      setRefreshing(true);
      const data = await computeAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading admin stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    // Real-time listener: updates Total Registered, Active, Completed, Recent Athletes instantly!
    const unsubscribe = subscribeToUsers(
      (liveUsers) => {
        const totalUsers = liveUsers.length;
        const completedChallenges = liveUsers.filter((u) => (u.completedDays || 0) >= 30).length;
        const activeChallenges = liveUsers.filter((u) => (u.completedDays || 0) > 0 && (u.completedDays || 0) < 30).length;
        const totalCompletedDaysSum = liveUsers.reduce((acc, u) => acc + (u.completedDays || 0), 0);
        const averageCompletionRate = totalUsers > 0 ? Math.round((totalCompletedDaysSum / (totalUsers * 30)) * 100) : 0;
        const recentRegistrations = [...liveUsers]
          .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
          .slice(0, 5);

        setStats((prev) => ({
          totalUsers,
          activeChallenges,
          completedChallenges,
          averageCompletionRate,
          totalSubmissions: prev?.totalSubmissions || 0,
          recentRegistrations,
        }));
        setLoading(false);

        // Fetch submissions asynchronously without blocking users display
        fetchAllSubmissionsAdmin(liveUsers)
          .then((allSubs) => {
            setStats((prev) => (prev ? { ...prev, totalSubmissions: allSubs.length } : null));
          })
          .catch((err) => {
            console.warn('Submissions load notice:', err);
          });
      },
      (err) => {
        console.warn('Real-time dashboard listener notice:', err);
        // Fallback to one-time loadStats
        loadStats();
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Superadmin Management Control
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            FitTrack 30 Admin Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global metrics, challenge completion telemetry, and athlete management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadStats}
            disabled={refreshing}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm inline-flex items-center gap-1.5 transition-all"
            title="Refresh Live Statistics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-600' : ''}`} />
            {refreshing ? 'Syncing...' : 'Sync Live'}
          </button>
          <Link
            to="/admin/users"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          >
            Manage Athletes
          </Link>
          <Link
            to="/admin/tasks"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          >
            Edit 30-Day Tasks
          </Link>
          <Link
            to="/admin/submissions"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25"
          >
            Submissions Feed
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          label="Total Registered"
          value={loading ? '...' : (stats?.totalUsers ?? 0)}
          unit="users"
          icon={Users}
          colorScheme="purple"
        />
        <StatsCard
          label="Active Challenges"
          value={loading ? '...' : (stats?.activeChallenges ?? 0)}
          unit="in progress"
          icon={Flame}
          colorScheme="amber"
        />
        <StatsCard
          label="Completed (Day 30)"
          value={loading ? '...' : (stats?.completedChallenges ?? 0)}
          unit="graduates"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <StatsCard
          label="Average Completion"
          value={loading ? '...' : (stats?.averageCompletionRate ?? 0)}
          unit="%"
          icon={TrendingUp}
          colorScheme="blue"
        />
        <StatsCard
          label="Daily Submissions"
          value={loading ? '...' : (stats?.totalSubmissions ?? 0)}
          unit="logs"
          icon={FileText}
          colorScheme="rose"
        />
      </div>

      {/* Admin Modules Quick Jump */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-500/50 hover:-translate-y-0.5 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit'] mb-1">
            User Management
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            Search athletes, filter by fitness goal, inspect individual progress, and toggle account states.
          </p>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
            Open Athletes Directory <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link
          to="/admin/tasks"
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 hover:-translate-y-0.5 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit'] mb-1">
            Task Management
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            Create, modify, or tune daily workouts for Days 1 through 30. Adjust exercise sets, reps, and targets.
          </p>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            Edit Daily Catalog <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link
          to="/admin/submissions"
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 hover:-translate-y-0.5 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit'] mb-1">
            Submissions Feed & Photos
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            Review live daily athlete workout submissions, filter by day number, and view uploaded progress photos.
          </p>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
            Open Submissions Feed <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Registrations
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
              Recent Athletes Joined
            </h3>
          </div>
          <Link
            to="/admin/users"
            className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1"
          >
            View All ({stats?.totalUsers || 0}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentRegistrations && stats.recentRegistrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Athlete</th>
                  <th className="py-3 px-4">Goal</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Current Day</th>
                  <th className="py-3 px-4">Streak</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.recentRegistrations.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {u.fitnessGoal}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {u.fitnessLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black font-['Outfit']">
                      Day {u.currentDay || 1}/30
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-500">
                      🔥 {u.currentStreak || 0}d
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-slate-400">
            No athletes found in the database.
          </div>
        )}
      </div>
    </div>
  );
};
