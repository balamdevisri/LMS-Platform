import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Trophy,
  Award as BadgeIcon,
  Users,
  Calendar,
  Clock,
  BookOpen,
  Search,
  Medal,
  RefreshCw
} from 'lucide-react';
import { LeaderboardService } from '../../services/achievementService';
import type { LeaderboardEntry } from '../../services/achievementService';
import { useAuth } from '@/contexts/AuthContext';

export const LeaderboardView: React.FC = () => {
  const { user, userProfile } = useAuth();
  const currentUserId = user?.uid || 'default_student';
  const leaderboardService = useMemo(() => new LeaderboardService(), []);

  const [filter, setFilter] = useState<'global' | 'course' | 'weekly' | 'monthly'>('global');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      // 1. Initial fast load from memory/local storage
      const localData = leaderboardService.getLeaderboard(filter, currentUserId);
      if (localData && localData.length > 0) {
        setEntries(localData);
      }

      // 2. Fetch fresh real-time list directly from Firestore
      const remoteData = await leaderboardService.getLeaderboardAsync(filter, currentUserId);
      if (remoteData && remoteData.length > 0) {
        setEntries(remoteData);
      }
    } catch (err) {
      console.warn('[LeaderboardView] Sync warning:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter, currentUserId]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase().trim();
    return entries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.college && e.college.toLowerCase().includes(q)) ||
        (e.branch && e.branch.toLowerCase().includes(q))
    );
  }, [entries, searchQuery]);

  const topThree = useMemo(() => {
    return entries.slice(0, 3);
  }, [entries]);

  const currentUserEntry = useMemo(() => {
    return entries.find((e) => e.isCurrentUser) || entries[0];
  }, [entries]);

  const nextRankEntry = useMemo(() => {
    if (!currentUserEntry || currentUserEntry.rank <= 1) return null;
    return entries.find((e) => e.rank === currentUserEntry.rank - 1) || null;
  }, [entries, currentUserEntry]);

  const xpToNextRank = nextRankEntry && currentUserEntry ? Math.max(0, nextRankEntry.xp - currentUserEntry.xp) : 0;

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 shadow-sm" title="1st Place (Gold Medal)">
          <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 shadow-sm" title="2nd Place (Silver Medal)">
          <Medal className="w-4 h-4 text-slate-400 fill-slate-300" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-700/30 flex items-center justify-center text-amber-800 shadow-sm" title="3rd Place (Bronze Medal)">
          <Medal className="w-4 h-4 text-amber-700 fill-amber-600/60" />
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-lg bg-slate-100/80 border border-slate-200 flex items-center justify-center">
        <span className="font-mono text-slate-500 text-xs font-bold">#{rank}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-['Sora'] text-slate-800 animate-in fade-in duration-300">
      
      {/* ── Top Header & Filter Controls ─────────────────────────────── */}
      <div className="bg-white border border-sky-100 p-6 rounded-3xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Trophy className="w-6 h-6 text-amber-500 fill-amber-400/20" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xl text-slate-900 flex items-center gap-2">
                <span>Cohort Leaderboard Standings</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">Real-time cohort standings powered by verified XP, quizzes, and digital credentials.</p>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student scholar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all placeholder:text-slate-400 font-medium text-slate-800"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 text-[11px] font-bold shrink-0 select-none">
            {[
              { id: 'global', label: 'Global', icon: <Users className="w-3 h-3" /> },
              { id: 'course', label: 'Track', icon: <BookOpen className="w-3 h-3" /> },
              { id: 'weekly', label: 'Weekly', icon: <Clock className="w-3 h-3" /> },
              { id: 'monthly', label: 'Monthly', icon: <Calendar className="w-3 h-3" /> },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id as any)}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  filter === opt.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Active User Spotlight Banner ────────────────────────────── */}
      {currentUserEntry && (
        <div className="p-5 rounded-3xl bg-linear-to-r from-sky-600 via-blue-600 to-indigo-700 text-white shadow-lg shadow-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-sky-400/30">
          <div className="flex items-center gap-4">
            <div className="relative">
              {userProfile?.photoURL || user?.photoURL ? (
                <img
                  src={userProfile?.photoURL || user?.photoURL || ''}
                  alt={currentUserEntry.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white/80 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-heading font-extrabold text-xl border-2 border-white/40">
                  {currentUserEntry.name.charAt(0)}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] shadow-xs">
                #{currentUserEntry.rank}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-base tracking-tight">{currentUserEntry.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold backdrop-blur-xs">
                  Your Standing
                </span>
              </div>
              <p className="text-xs text-sky-100 font-medium mt-0.5">
                {currentUserEntry.rank === 1
                  ? '👑 You are leading the entire cohort leaderboard!'
                  : nextRankEntry
                  ? `Earn ${xpToNextRank.toLocaleString()} more XP to claim #${currentUserEntry.rank - 1} from ${nextRankEntry.name}`
                  : `Ranked #${currentUserEntry.rank} among active scholars`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end text-xs font-mono">
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="text-[10px] text-sky-200 block uppercase font-sans font-bold">Total XP</span>
              <span className="font-bold text-amber-300 text-sm">{currentUserEntry.xp.toLocaleString()} pts</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="text-[10px] text-sky-200 block uppercase font-sans font-bold">Badges</span>
              <span className="font-bold text-white text-sm">{currentUserEntry.badgesCount}</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="text-[10px] text-sky-200 block uppercase font-sans font-bold">Completed</span>
              <span className="font-bold text-cyan-200 text-sm">{currentUserEntry.coursesCompleted} Track</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Top 3 Scholars Podium ───────────────────────────────────── */}
      {topThree.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* Rank 2 (Silver) */}
          <div className="p-5 rounded-3xl bg-linear-to-b from-slate-50 to-white border border-slate-200 shadow-xs flex flex-col items-center text-center space-y-3 relative order-2 md:order-1">
            <div className="absolute top-4 left-4">
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider">
                🥈 2nd Place
              </span>
            </div>
            <div className="relative mt-4">
              {topThree[1].avatarUrl ? (
                <img src={topThree[1].avatarUrl} alt={topThree[1].name} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-300 shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-xl shadow-sm">
                  {topThree[1].name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-sm text-slate-900 truncate max-w-[180px]">{topThree[1].name}</h4>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">{topThree[1].college || 'Shaivika AI Foundation'}</p>
            </div>
            <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 text-[10px] font-sans font-bold">XP Score</span>
              <span className="font-bold text-slate-800">{topThree[1].xp.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Rank 1 (Gold) - Highlighted */}
          <div className="p-6 rounded-3xl bg-linear-to-b from-amber-50/80 via-white to-amber-50/40 border-2 border-amber-300 shadow-lg shadow-amber-500/10 flex flex-col items-center text-center space-y-3 relative order-1 md:order-2 scale-100 md:-translate-y-2">
            <div className="absolute top-4 left-4">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                👑 1st Place (Champion)
              </span>
            </div>
            <div className="relative mt-4">
              {topThree[0].avatarUrl ? (
                <img src={topThree[0].avatarUrl} alt={topThree[0].name} className="w-20 h-20 rounded-3xl object-cover border-4 border-amber-400 shadow-md shadow-amber-500/20" />
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-amber-500/20">
                  {topThree[0].name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-base text-slate-900 truncate max-w-[200px]">{topThree[0].name}</h4>
              <p className="text-xs text-amber-800 font-semibold truncate max-w-[200px]">{topThree[0].college || 'Shaivika AI Foundation Institute'}</p>
            </div>
            <div className="w-full pt-3 border-t border-amber-200 flex items-center justify-between text-xs font-mono">
              <span className="text-amber-800 text-[10px] font-sans font-extrabold uppercase">Total XP Points</span>
              <span className="font-extrabold text-amber-600 text-sm">{topThree[0].xp.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="p-5 rounded-3xl bg-linear-to-b from-amber-50/30 to-white border border-amber-200/80 shadow-xs flex flex-col items-center text-center space-y-3 relative order-3">
            <div className="absolute top-4 left-4">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider">
                🥉 3rd Place
              </span>
            </div>
            <div className="relative mt-4">
              {topThree[2].avatarUrl ? (
                <img src={topThree[2].avatarUrl} alt={topThree[2].name} className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-600/30 shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-xl shadow-sm">
                  {topThree[2].name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-sm text-slate-900 truncate max-w-[180px]">{topThree[2].name}</h4>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">{topThree[2].college || 'Shaivika AI Foundation'}</p>
            </div>
            <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 text-[10px] font-sans font-bold">XP Score</span>
              <span className="font-bold text-slate-800">{topThree[2].xp.toLocaleString()} pts</span>
            </div>
          </div>

        </div>
      )}

      {/* ── Leaderboard Ranks Table ─────────────────────────────────── */}
      <div className="bg-white border border-sky-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-sky-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest select-none">
                <th className="py-4 px-6 w-20 text-center">Rank</th>
                <th className="py-4 px-4">Student Scholar</th>
                <th className="py-4 px-4">Institution / Branch</th>
                <th className="py-4 px-4 text-center">Badges</th>
                <th className="py-4 px-4 text-center">Tracks</th>
                <th className="py-4 px-6 text-right w-40">Experience XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No scholars matched the criteria "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr
                    key={`${entry.rank}-${entry.name}`}
                    className={`transition-all duration-200 ${
                      entry.isCurrentUser
                        ? 'bg-sky-50/70 border-l-4 border-l-sky-500 font-bold'
                        : 'hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Rank Column */}
                    <td className="py-3.5 px-6 text-center shrink-0">
                      <div className="flex items-center justify-center">
                        {getRankBadge(entry.rank)}
                      </div>
                    </td>

                    {/* Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {entry.avatarUrl ? (
                          <img
                            src={entry.avatarUrl}
                            alt={entry.name}
                            className="w-9 h-9 rounded-xl object-cover border border-sky-200 shadow-xs shrink-0"
                          />
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 select-none shadow-xs ${
                              entry.isCurrentUser
                                ? 'bg-sky-600 text-white'
                                : entry.rank === 1
                                ? 'bg-amber-100 border border-amber-300 text-amber-800'
                                : 'bg-slate-100 border border-slate-200 text-slate-700'
                            }`}
                          >
                            {entry.name.charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="block truncate text-slate-900 font-bold">{entry.name}</span>
                            {entry.isCurrentUser && (
                              <span className="inline-block text-[8px] font-extrabold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded-md border border-sky-300 uppercase tracking-wide">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* College & Branch */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] font-normal">
                      <div className="font-semibold text-slate-800 truncate max-w-[200px]">{entry.college || 'Shaivika AI Foundation'}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{entry.branch || 'AI & Computer Science'}</div>
                    </td>

                    {/* Badges count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-lg font-mono text-[10px] text-slate-600">
                        <BadgeIcon className="w-3 h-3 text-indigo-500" />
                        <span>{entry.badgesCount}</span>
                      </span>
                    </td>

                    {/* Courses count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-lg font-mono text-[10px] text-slate-600">
                        <Award className="w-3.5 h-3.5 text-cyan-500" />
                        <span>{entry.coursesCompleted}</span>
                      </span>
                    </td>

                    {/* XP Points */}
                    <td className="py-3.5 px-6 text-right font-mono">
                      <span
                        className={`font-bold ${
                          entry.isCurrentUser
                            ? 'text-sky-600 text-sm'
                            : entry.rank === 1
                            ? 'text-amber-600 font-extrabold'
                            : 'text-slate-800'
                        }`}
                      >
                        {entry.xp.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans">pts</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

