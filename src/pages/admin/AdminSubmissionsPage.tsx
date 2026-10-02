import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllSubmissionsAdmin } from '../../services/adminService';
import { DailyProgress } from '../../types';
import {
  FileText,
  ArrowLeft,
  Filter,
  Camera,
  Search,
  CheckCircle2,
  Calendar,
  X,
  Droplet,
  Footprints,
  Clock,
  Moon,
} from 'lucide-react';

export const AdminSubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<(DailyProgress & { userName?: string; userEmail?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<(DailyProgress & { userName?: string; userEmail?: string }) | null>(null);

  useEffect(() => {
    async function loadSubs() {
      try {
        setLoading(true);
        const data = await fetchAllSubmissionsAdmin();
        setSubmissions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSubs();
  }, []);

  const filtered = submissions.filter((sub) => {
    const matchesDay = dayFilter === 'all' || sub.dayNumber.toString() === dayFilter;
    const matchesUser =
      (sub.userName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (sub.userEmail || '').toLowerCase().includes(userSearch.toLowerCase());
    return matchesDay && matchesUser;
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
            Athlete Submissions Feed
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review verified workout logs, hydration records, and progress photo transformations.
          </p>
        </div>

        <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 self-start sm:self-auto">
          Total Logs: {submissions.length}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Filter by athlete name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-900 dark:text-white outline-none w-full sm:w-auto"
          >
            <option value="all">All Days (1 - 30)</option>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d.toString()}>
                Day {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions Grid with Photos */}
      {loading ? (
        <div className="text-center py-12 text-xs font-bold text-slate-400">Loading submissions feed...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-xs text-slate-400">No workout submissions found matching query.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              onClick={() => setSelectedSubmission(sub)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Day {sub.dayNumber}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {sub.date || new Date(sub.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="text-base font-black text-slate-900 dark:text-white font-['Outfit']">
                    {sub.userName || 'Athlete'}
                  </h4>
                  <span className="text-[11px] text-slate-400">{sub.userEmail}</span>
                </div>

                {/* Photo Preview if uploaded */}
                {sub.progressPhotoUrl ? (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-800 shadow-sm relative">
                    <img
                      src={sub.progressPhotoUrl}
                      alt={`Day ${sub.dayNumber}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/70 text-white text-[10px] font-bold">
                      📸 Photo Attached
                    </span>
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 text-xs mb-4">
                    No photo uploaded
                  </div>
                )}
              </div>

              {/* Metrics Summary inside card */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Weight</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{sub.weight} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Steps</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{(sub.steps || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Duration</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{sub.workoutDuration} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedSubmission(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                Day {selectedSubmission.dayNumber} Submission
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit'] mt-2">
                {selectedSubmission.userName || 'Athlete'}
              </h3>
              <span className="text-xs text-slate-400">{selectedSubmission.userEmail}</span>
            </div>

            {selectedSubmission.progressPhotoUrl && (
              <div className="rounded-2xl overflow-hidden mb-6 border border-slate-200 dark:border-slate-800 shadow-md">
                <img
                  src={selectedSubmission.progressPhotoUrl}
                  alt="Submission"
                  className="w-full max-h-72 object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 text-xs mb-6 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Weight</span>
                <span className="text-base font-black font-['Outfit']">{selectedSubmission.weight} kg</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Steps</span>
                <span className="text-base font-black font-['Outfit']">{(selectedSubmission.steps || 0).toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Water</span>
                <span className="text-base font-black font-['Outfit']">{selectedSubmission.water} L</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Workout Time</span>
                <span className="text-base font-black font-['Outfit']">{selectedSubmission.workoutDuration} min</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Calories</span>
                <span className="text-base font-black font-['Outfit']">{selectedSubmission.caloriesBurned} kcal</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sleep</span>
                <span className="text-base font-black font-['Outfit']">{selectedSubmission.sleepHours} hrs</span>
              </div>
            </div>

            {selectedSubmission.notes && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300 mb-6">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">Athlete Notes:</span>
                "{selectedSubmission.notes}"
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400">
                Submitted at: {new Date(selectedSubmission.submittedAt).toLocaleString()}
              </span>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
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
