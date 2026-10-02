import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllUsers, toggleUserStatus } from '../../services/adminService';
import { UserProfile, FitnessGoal } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import {
  Users,
  Search,
  Filter,
  Shield,
  CheckCircle2,
  Ban,
  ArrowLeft,
  Flame,
  Award,
  ChevronRight,
  X,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { showToast } = useNotification();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Error', 'Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user: UserProfile) => {
    const newDisabled = !user.disabled;
    try {
      await toggleUserStatus(user.id, newDisabled);
      showToast('success', 'Status Updated', `${user.name} has been ${newDisabled ? 'disabled' : 'enabled'}.`);
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, disabled: newDisabled } : u)));
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => (prev ? { ...prev, disabled: newDisabled } : null));
      }
    } catch (err: any) {
      showToast('error', 'Failed', err.message || 'Could not update user status.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesGoal = goalFilter === 'all' || u.fitnessGoal === goalFilter;
    return matchesSearch && matchesGoal;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Admin Overview
          </Link>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Athlete Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse registered athletes, inspect physical baseline parameters, and govern access.
          </p>
        </div>

        <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 self-start sm:self-auto">
          Total Users: {users.length}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by athlete name or email address..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-900 dark:text-white outline-none w-full sm:w-auto"
          >
            <option value="all">All Goals</option>
            <option value="Weight Loss">Weight Loss</option>
            <option value="Muscle Gain">Muscle Gain</option>
            <option value="General Fitness">General Fitness</option>
            <option value="Improve Stamina">Improve Stamina</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-xs font-bold text-slate-400">Loading user catalog...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">No athletes match the search criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Athlete</th>
                  <th className="py-3 px-4">Goal & Level</th>
                  <th className="py-3 px-4">Challenge Day</th>
                  <th className="py-3 px-4">Streak</th>
                  <th className="py-3 px-4">Weight / BMI</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {u.name}
                        {u.role === 'admin' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{u.fitnessGoal}</div>
                      <div className="text-[10px] text-slate-400">{u.fitnessLevel}</div>
                    </td>
                    <td className="py-3.5 px-4 font-black font-['Outfit']">
                      Day {u.currentDay || 1}/30
                      <span className="text-[10px] font-normal text-slate-400 block">
                        {u.completedDays || 0} completed
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-500">
                      🔥 {u.currentStreak || 0}d
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{u.currentWeight || u.startingWeight} kg</span>
                      <span className="text-[10px] text-slate-400 block">BMI: {u.bmi || '--'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.disabled ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                          Disabled
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                          u.disabled
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                        }`}
                      >
                        {u.disabled ? 'Enable' : 'Disable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Drawer / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-600 font-black text-xl flex items-center justify-center overflow-hidden">
                {selectedUser.profilePhoto ? (
                  <img src={selectedUser.profilePhoto} alt={selectedUser.name} className="w-full h-full object-cover" />
                ) : (
                  selectedUser.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
                  {selectedUser.name}
                </h3>
                <span className="text-xs text-slate-400">{selectedUser.email}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-6">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Day</span>
                <span className="text-base font-black font-['Outfit']">Day {selectedUser.currentDay}/30</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed</span>
                <span className="text-base font-black font-['Outfit']">{selectedUser.completedDays} Days</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Streak</span>
                <span className="text-base font-black text-amber-500 font-['Outfit']">{selectedUser.currentStreak} Days</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Best Streak</span>
                <span className="text-base font-black font-['Outfit']">{selectedUser.bestStreak} Days</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Weight Progress</span>
                <span className="text-base font-black font-['Outfit']">{selectedUser.startingWeight} → {selectedUser.currentWeight} kg</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Height / BMI</span>
                <span className="text-base font-black font-['Outfit']">{selectedUser.height} cm / {selectedUser.bmi}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400">User ID: <code className="font-mono text-[10px]">{selectedUser.id}</code></span>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
