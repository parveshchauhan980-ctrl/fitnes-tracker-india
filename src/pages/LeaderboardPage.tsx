import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { fetchLeaderboardAthletes } from '../services/leaderboardService';
import { LeaderboardAthlete, FitnessLevel } from '../types';
import {
  Trophy,
  Flame,
  Award,
  Crown,
  Search,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';

type SortMetric = 'streak' | 'completed' | 'consistency';

export const LeaderboardPage: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const { showToast } = useNotification();

  const [athletes, setAthletes] = useState<LeaderboardAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMetric, setSortMetric] = useState<SortMetric>('streak');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [highFivedIds, setHighFivedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchLeaderboardAthletes(userProfile);
        if (isMounted) setAthletes(data);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [userProfile]);

  // Privacy toggle handler
  const isVisible = userProfile?.leaderboardVisible !== false;
  const handleToggleVisibility = async () => {
    try {
      await updateUserProfile({ leaderboardVisible: !isVisible });
      showToast(
        'info',
        !isVisible ? 'Leaderboard Visible' : 'Leaderboard Hidden',
        !isVisible
          ? 'Your alias and streak are now visible on the leaderboard.'
          : 'You are now hidden from the public leaderboard.'
      );
    } catch (e) {
      showToast('error', 'Error', 'Could not update privacy setting.');
    }
  };

  const handleHighFive = (athleteId: string, alias: string) => {
    if (highFivedIds[athleteId]) return;
    setHighFivedIds(prev => ({ ...prev, [athleteId]: true }));
    showToast('success', 'High Five Sent! 🔥', `You cheered on ${alias}!`);
  };

  // Filter and sort athletes
  const filteredAthletes = useMemo(() => {
    let list = [...athletes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => a.alias.toLowerCase().includes(q));
    }

    if (levelFilter !== 'all') {
      list = list.filter(a => a.fitnessLevel === levelFilter);
    }

    list.sort((a, b) => {
      if (sortMetric === 'streak') {
        if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
        return b.completedDays - a.completedDays;
      }
      if (sortMetric === 'completed') {
        if (b.completedDays !== a.completedDays) return b.completedDays - a.completedDays;
        return b.currentStreak - a.currentStreak;
      }
      if (sortMetric === 'consistency') {
        if (b.consistencyScore !== a.consistencyScore) return b.consistencyScore - a.consistencyScore;
        return b.currentStreak - a.currentStreak;
      }
      return 0;
    });

    return list;
  }, [athletes, searchQuery, levelFilter, sortMetric]);

  // Podium top 3
  const topThree = filteredAthletes.slice(0, 3);
  const remainingList = filteredAthletes.slice(3);

  // Find user rank
  const userRankIndex = filteredAthletes.findIndex(a => a.isCurrentUser);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Trophy className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Community Consistency
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Athlete Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Celebrate streaks, discipline, and daily consistency. Private body metrics stay 100% confidential.
          </p>
        </div>

        {/* Privacy Setting Pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Leaderboard Privacy:
            </span>
          </div>
          <button
            onClick={handleToggleVisibility}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              isVisible
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {isVisible ? (
              <>
                <Eye className="w-3.5 h-3.5" /> Public
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" /> Private
              </>
            )}
          </button>
        </div>
      </div>

      {/* Current Athlete Standing Banner */}
      {userRank && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl shadow-emerald-600/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex flex-col items-center justify-center font-['Outfit'] font-black">
              <span className="text-[10px] uppercase tracking-wider text-emerald-100 font-bold">Rank</span>
              <span className="text-2xl text-white">#{userRank}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black font-['Outfit']">
                  {userProfile?.name} (You)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                  Day {userProfile?.currentDay} Active
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Current Streak: <b>{userProfile?.currentStreak || 0} Days</b> • Completed: <b>{userProfile?.completedDays || 0} / 30 Workouts</b>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Top {Math.max(5, Math.round((userRank / Math.max(1, filteredAthletes.length)) * 100))}% of Challengers
            </span>
          </div>
        </div>
      )}

      {/* Podium Top 3 */}
      {!loading && topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end">
          {/* 2nd Place Silver */}
          <PodiumCard athlete={topThree[1]} rank={2} metric={sortMetric} onHighFive={handleHighFive} hasCheered={!!highFivedIds[topThree[1].id]} />

          {/* 1st Place Gold */}
          <PodiumCard athlete={topThree[0]} rank={1} metric={sortMetric} onHighFive={handleHighFive} hasCheered={!!highFivedIds[topThree[0].id]} />

          {/* 3rd Place Bronze */}
          <PodiumCard athlete={topThree[2]} rank={3} metric={sortMetric} onHighFive={handleHighFive} hasCheered={!!highFivedIds[topThree[2].id]} />
        </div>
      )}

      {/* Control Bar: Search & Sort Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Metric Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
          <button
            onClick={() => setSortMetric('streak')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              sortMetric === 'streak'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Active Streaks
          </button>

          <button
            onClick={() => setSortMetric('completed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              sortMetric === 'completed'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
            Days Completed
          </button>

          <button
            onClick={() => setSortMetric('consistency')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              sortMetric === 'consistency'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
            Consistency %
          </button>
        </div>

        {/* Search & Level Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search athlete..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
          >
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Athletes Directory ({filteredAthletes.length})
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Zero private data exposed
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-slate-400 font-bold">Loading Community Standings...</span>
          </div>
        ) : filteredAthletes.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No athletes match your search or filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredAthletes.map((athlete, index) => {
              const rank = index + 1;
              const isCurrentUser = athlete.isCurrentUser;

              return (
                <div
                  key={athlete.id}
                  className={`px-4 sm:px-6 py-4 flex items-center justify-between gap-4 transition-colors ${
                    isCurrentUser
                      ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-l-4 border-emerald-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left: Rank & Avatar & Name */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <span className={`w-7 text-center font-['Outfit'] font-black text-sm shrink-0 ${
                      rank === 1 ? 'text-amber-500 text-lg' : rank === 2 ? 'text-slate-400 text-base' : rank === 3 ? 'text-amber-700 text-base' : 'text-slate-400'
                    }`}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </span>

                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${athlete.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}>
                      {athlete.alias.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-extrabold truncate ${isCurrentUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                          {athlete.alias}
                        </span>
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider">
                            You
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                          {athlete.fitnessLevel}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                        Goal: {athlete.fitnessGoal}
                      </span>
                    </div>
                  </div>

                  {/* Right: Metrics & Cheer Button */}
                  <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                    {/* Streaks */}
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-amber-500 font-extrabold text-sm font-['Outfit']">
                        <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span>{athlete.currentStreak}d</span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        Streak
                      </span>
                    </div>

                    {/* Completed */}
                    <div className="hidden sm:block text-right">
                      <span className="text-sm font-black text-slate-900 dark:text-white font-['Outfit']">
                        {athlete.completedDays}/30
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                        Done
                      </span>
                    </div>

                    {/* Consistency */}
                    <div className="hidden md:block text-right">
                      <span className="text-sm font-black text-emerald-500 font-['Outfit']">
                        {athlete.consistencyScore}%
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                        Consistency
                      </span>
                    </div>

                    {/* Cheer Button */}
                    {!isCurrentUser && (
                      <button
                        onClick={() => handleHighFive(athlete.id, athlete.alias)}
                        disabled={highFivedIds[athlete.id]}
                        title="Cheer athlete with a High Five!"
                        className={`p-2 rounded-xl text-xs font-bold transition-all ${
                          highFivedIds[athlete.id]
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 hover:text-amber-500 text-slate-400'
                        }`}
                      >
                        {highFivedIds[athlete.id] ? '🔥 Cheered' : '👏'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Privacy Guarantee Footer Card */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start sm:items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5 sm:mt-0" />
        <p className="leading-relaxed">
          <strong>FitTrack 30 Privacy Standard:</strong> Weight, BMI, body measurements, age, and email addresses are strictly confidential to your private account. The community leaderboard only tracks workout consistency and streaks to foster mutual motivation.
        </p>
      </div>
    </div>
  );
};

// Podium Card Component
interface PodiumProps {
  athlete: LeaderboardAthlete;
  rank: 1 | 2 | 3;
  metric: SortMetric;
  onHighFive: (id: string, alias: string) => void;
  hasCheered: boolean;
}

const PodiumCard: React.FC<PodiumProps> = ({ athlete, rank, onHighFive, hasCheered }) => {
  const isGold = rank === 1;
  const isSilver = rank === 2;

  const bgStyles = isGold
    ? 'bg-gradient-to-b from-amber-500/15 via-white dark:via-slate-900 to-white dark:to-slate-900 border-amber-400/50 shadow-amber-500/10 md:-translate-y-4'
    : isSilver
    ? 'bg-gradient-to-b from-slate-300/15 via-white dark:via-slate-900 to-white dark:to-slate-900 border-slate-300/60 dark:border-slate-700'
    : 'bg-gradient-to-b from-amber-700/15 via-white dark:via-slate-900 to-white dark:to-slate-900 border-amber-800/40';

  const badgeColor = isGold
    ? 'bg-amber-500 text-slate-950 font-black'
    : isSilver
    ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white font-bold'
    : 'bg-amber-800 text-white font-bold';

  return (
    <div className={`p-6 rounded-3xl border shadow-lg flex flex-col items-center text-center relative transition-transform hover:-translate-y-1 ${bgStyles}`}>
      {/* Crown / Trophy icon */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
        {isGold ? (
          <div className="p-2 rounded-full bg-amber-500 text-slate-950 shadow-md animate-pulse">
            <Crown className="w-5 h-5 fill-slate-950" />
          </div>
        ) : (
          <span className={`px-2.5 py-1 rounded-full text-xs shadow-md ${badgeColor}`}>
            #{rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className={`w-16 h-16 rounded-3xl bg-gradient-to-tr ${athlete.avatarColor} text-white flex items-center justify-center font-black text-lg shadow-md mt-2 mb-3`}>
        {athlete.alias.substring(0, 2).toUpperCase()}
      </div>

      <h3 className="font-extrabold text-slate-900 dark:text-white font-['Outfit'] text-base truncate max-w-[180px]">
        {athlete.alias}
      </h3>
      <span className="text-[11px] text-slate-400 mb-3">{athlete.fitnessGoal}</span>

      {/* Stats Pill */}
      <div className="w-full py-2.5 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-800 flex items-center justify-around text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Streak</span>
          <span className="font-black text-amber-500 flex items-center justify-center gap-0.5 mt-0.5">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            {athlete.currentStreak}d
          </span>
        </div>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Days</span>
          <span className="font-black text-slate-900 dark:text-white mt-0.5 block">
            {athlete.completedDays}/30
          </span>
        </div>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Score</span>
          <span className="font-black text-emerald-500 mt-0.5 block">
            {athlete.consistencyScore}%
          </span>
        </div>
      </div>

      {!athlete.isCurrentUser && (
        <button
          onClick={() => onHighFive(athlete.id, athlete.alias)}
          disabled={hasCheered}
          className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            hasCheered
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
          }`}
        >
          {hasCheered ? '🔥 Cheered!' : '👏 High Five!'}
        </button>
      )}
    </div>
  );
};
