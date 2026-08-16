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
  RefreshCw,
  Flame,
  Sparkles,
  Zap,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { LeaderboardService } from '../../services/achievementService';
import type { LeaderboardEntry } from '../../services/achievementService';
import { useAuth } from '@/contexts/AuthContext';

export const LeaderboardView: React.FC = () => {
  const { user, userProfile } = useAuth();
  const currentUserId = user?.uid || 'default_student';
  const leaderboardService = useMemo(() => new LeaderboardService(), []);

  const [filter, setFilter] = useState<'global' | 'course' | 'weekly' | 'monthly'>('global');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // Real-time live subscription hook
  useEffect(() => {
    setIsRefreshing(true);
    const unsubscribe = leaderboardService.subscribeToLeaderboard(filter, currentUserId, (liveData) => {
      setEntries(liveData);
      setIsRefreshing(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    });

    return () => {
      unsubscribe();
    };
  }, [filter, currentUserId, leaderboardService]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await leaderboardService.getLeaderboardAsync(filter, currentUserId);
      if (fresh && fresh.length > 0) {
        setEntries(fresh);
      }
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('[LeaderboardView] Manual sync notice:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter by track and search query
  const filteredEntries = useMemo(() => {
    let result = entries;

    // Track filter
    if (selectedTrack !== 'all') {
      result = result.filter((e) => {
        const branchStr = (e.branch || '').toLowerCase();
        const collegeStr = (e.college || '').toLowerCase();
        if (selectedTrack === 'ai') return branchStr.includes('ai') || branchStr.includes('python') || collegeStr.includes('ai');
        if (selectedTrack === 'web') return branchStr.includes('web') || branchStr.includes('react') || branchStr.includes('cs') || branchStr.includes('computer');
        if (selectedTrack === 'cloud') return branchStr.includes('cloud') || branchStr.includes('devops') || branchStr.includes('systems');
        if (selectedTrack === 'cyber') return branchStr.includes('security') || branchStr.includes('cyber');
        return true;
      });
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.college && e.college.toLowerCase().includes(q)) ||
          (e.branch && e.branch.toLowerCase().includes(q)) ||
          (e.levelTitle && e.levelTitle.toLowerCase().includes(q))
      );
    }

    return result;
  }, [entries, selectedTrack, searchQuery]);

  const topThree = useMemo(() => {
    return filteredEntries.slice(0, 3);
  }, [filteredEntries]);

  const currentUserEntry = useMemo(() => {
    return entries.find((e) => e.isCurrentUser) || entries[0];
  }, [entries]);

  const nextRankEntry = useMemo(() => {
    if (!currentUserEntry || currentUserEntry.rank <= 1) return null;
    return entries.find((e) => e.rank === currentUserEntry.rank - 1) || null;
  }, [entries, currentUserEntry]);

  const xpToNextRank = nextRankEntry && currentUserEntry ? Math.max(0, nextRankEntry.xp - currentUserEntry.xp) : 0;

  // Cohort aggregate stats
  const cohortStats = useMemo(() => {
    const totalXp = entries.reduce((acc, curr) => acc + (curr.xp || 0), 0);
    const avgXp = entries.length > 0 ? Math.round(totalXp / entries.length) : 0;
    const userPercentile = currentUserEntry && entries.length > 0
      ? Math.max(1, Math.round(((entries.length - currentUserEntry.rank + 1) / entries.length) * 100))
      : 100;

    return {
      totalScholars: entries.length,
      totalXp,
      avgXp,
      userPercentile
    };
  }, [entries, currentUserEntry]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-amber-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/30 ring-2 ring-amber-300">
          👑 1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-800 dark:text-slate-100 font-extrabold text-xs flex items-center justify-center shadow-xs ring-1 ring-slate-300 dark:ring-slate-600">
          🥈 2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-100 to-amber-200 dark:from-amber-950/80 dark:to-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-extrabold text-xs flex items-center justify-center shadow-xs">
          🥉 3
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-lg bg-slate-100/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
        <span className="font-mono text-slate-500 dark:text-slate-400 text-xs font-bold">#{rank}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-['Sora'] text-slate-800 dark:text-slate-100 animate-in fade-in duration-300">
      
      {/* ── Top Header & Real-time Live Controls ─────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-colors">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
              <Trophy className="w-6 h-6 text-amber-500 fill-amber-400/20" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                  Cohort Leaderboard Standings
                </h2>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 -ml-3.5" />
                  Live Real-Time Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Real-time dynamic cohort rankings synced with Firestore & verified XP points.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scholar or institution..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-sky-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 dark:focus:border-cyan-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Timeframe Filter Pills */}
          <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-[11px] font-bold shrink-0 select-none">
            {[
              { id: 'global', label: 'Global', icon: <Users className="w-3 h-3" /> },
              { id: 'course', label: 'Tracks', icon: <BookOpen className="w-3 h-3" /> },
              { id: 'weekly', label: 'Weekly', icon: <Clock className="w-3 h-3" /> },
              { id: 'monthly', label: 'Monthly', icon: <Calendar className="w-3 h-3" /> },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id as any)}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  filter === opt.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Manual Refresh Button with Sync status */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-cyan-400 hover:bg-sky-100 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
            title={`Last synced: ${lastSyncTime}. Click to sync now.`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-600 dark:text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Track Selector Bar ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
          <GraduationCap className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" /> Focus Track:
        </span>
        {[
          { id: 'all', label: 'All Tracks' },
          { id: 'web', label: 'React & Frontend' },
          { id: 'ai', label: 'Python & AI Engineering' },
          { id: 'cloud', label: 'Cloud & DevOps' },
          { id: 'cyber', label: 'Cybersecurity' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTrack(t.id)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
              selectedTrack === t.id
                ? 'bg-blue-600 dark:bg-cyan-600 text-white border-blue-600 dark:border-cyan-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Cohort Real-Time Stats Grid ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Total Scholars</span>
            <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">{cohortStats.totalScholars}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Cohort XP Pool</span>
            <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">{cohortStats.totalXp.toLocaleString()} pts</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Your Percentile</span>
            <span className="font-heading font-extrabold text-lg text-emerald-600 dark:text-emerald-400">Top {cohortStats.userPercentile}%</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Avg Cohort XP</span>
            <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">{cohortStats.avgXp.toLocaleString()} pts</span>
          </div>
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-heading font-extrabold text-base tracking-tight">{currentUserEntry.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold backdrop-blur-xs">
                  Your Standing
                </span>
                {currentUserEntry.levelTitle && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-200 border border-amber-300/40 text-[9px] font-extrabold">
                    Level {currentUserEntry.level || 1} • {currentUserEntry.levelTitle}
                  </span>
                )}
                {currentUserEntry.streak && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/30 text-orange-200 border border-orange-400/40 text-[9px] font-bold">
                    <Flame className="w-3 h-3 text-orange-400" /> {currentUserEntry.streak} Day Streak
                  </span>
                )}
              </div>
              <p className="text-xs text-sky-100 font-medium mt-0.5">
                {currentUserEntry.rank === 1
                  ? '👑 Outstanding! You are leading the entire cohort leaderboard!'
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
      {topThree.length >= 3 && !searchQuery && selectedTrack === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* Rank 2 (Silver) */}
          <div className="p-5 rounded-3xl bg-linear-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center text-center space-y-3 relative order-2 md:order-1 transition-colors">
            <div className="absolute top-4 left-4">
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold uppercase tracking-wider">
                🥈 2nd Place
              </span>
            </div>
            <div className="relative mt-4">
              {topThree[1].avatarUrl ? (
                <img src={topThree[1].avatarUrl} alt={topThree[1].name} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-300 dark:border-slate-700 shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-extrabold text-xl shadow-sm">
                  {topThree[1].name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white truncate max-w-[180px]">{topThree[1].name}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[180px]">{topThree[1].college || 'Shaivika AI Foundation'}</p>
              {topThree[1].levelTitle && (
                <span className="inline-block mt-1 text-[9px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {topThree[1].levelTitle}
                </span>
              )}
            </div>
            <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-sans font-bold">XP Score</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{topThree[1].xp.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Rank 1 (Gold) - Highlighted */}
          <div className="p-6 rounded-3xl bg-linear-to-b from-amber-50/80 via-white to-amber-50/40 dark:from-amber-950/30 dark:via-slate-900 dark:to-amber-950/20 border-2 border-amber-300 dark:border-amber-600/60 shadow-lg shadow-amber-500/10 flex flex-col items-center text-center space-y-3 relative order-1 md:order-2 scale-100 md:-translate-y-2 transition-colors">
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
              <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white truncate max-w-[200px]">{topThree[0].name}</h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold truncate max-w-[200px]">{topThree[0].college || 'Shaivika AI Foundation Institute'}</p>
              {topThree[0].levelTitle && (
                <span className="inline-block mt-1 text-[10px] font-extrabold text-amber-900 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 px-2.5 py-0.5 rounded-md">
                  Level {topThree[0].level || 1} • {topThree[0].levelTitle}
                </span>
              )}
            </div>
            <div className="w-full pt-3 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs font-mono">
              <span className="text-amber-800 dark:text-amber-400 text-[10px] font-sans font-extrabold uppercase">Total XP Points</span>
              <span className="font-extrabold text-amber-600 dark:text-amber-300 text-sm">{topThree[0].xp.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="p-5 rounded-3xl bg-linear-to-b from-amber-50/30 to-white dark:from-slate-900 dark:to-slate-950 border border-amber-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center text-center space-y-3 relative order-3 transition-colors">
            <div className="absolute top-4 left-4">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                🥉 3rd Place
              </span>
            </div>
            <div className="relative mt-4">
              {topThree[2].avatarUrl ? (
                <img src={topThree[2].avatarUrl} alt={topThree[2].name} className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-600/30 dark:border-amber-700/40 shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-extrabold text-xl shadow-sm">
                  {topThree[2].name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white truncate max-w-[180px]">{topThree[2].name}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[180px]">{topThree[2].college || 'Shaivika AI Foundation'}</p>
              {topThree[2].levelTitle && (
                <span className="inline-block mt-1 text-[9px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {topThree[2].levelTitle}
                </span>
              )}
            </div>
            <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-sans font-bold">XP Score</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{topThree[2].xp.toLocaleString()} pts</span>
            </div>
          </div>

        </div>
      )}

      {/* ── Leaderboard Ranks Table ─────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-sky-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest select-none">
                <th className="py-4 px-6 w-20 text-center">Rank</th>
                <th className="py-4 px-4">Student Scholar</th>
                <th className="py-4 px-4">Institution / Branch</th>
                <th className="py-4 px-4 text-center">Streak</th>
                <th className="py-4 px-4 text-center">Badges</th>
                <th className="py-4 px-4 text-center">Tracks</th>
                <th className="py-4 px-6 text-right w-44">Experience XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                    No scholars matched the criteria "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr
                    key={`${entry.rank}-${entry.name}-${entry.id || ''}`}
                    className={`transition-all duration-200 ${
                      entry.isCurrentUser
                        ? 'bg-sky-50/70 dark:bg-cyan-950/30 border-l-4 border-l-sky-500 dark:border-l-cyan-400 font-bold'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
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
                            className="w-9 h-9 rounded-xl object-cover border border-sky-200 dark:border-slate-700 shadow-xs shrink-0"
                          />
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 select-none shadow-xs ${
                              entry.isCurrentUser
                                ? 'bg-sky-600 text-white'
                                : entry.rank === 1
                                ? 'bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {entry.name.charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="block truncate text-slate-900 dark:text-white font-bold">{entry.name}</span>
                            {entry.isCurrentUser && (
                              <span className="inline-block text-[8px] font-extrabold text-sky-700 dark:text-cyan-300 bg-sky-100 dark:bg-cyan-950/60 px-1.5 py-0.5 rounded-md border border-sky-300 dark:border-cyan-800 uppercase tracking-wide">
                                You
                              </span>
                            )}
                            {entry.levelTitle && (
                              <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                                Lvl {entry.level || 1}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* College & Branch */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px] font-normal">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{entry.college || 'Shaivika AI Foundation'}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]">{entry.branch || 'AI & Computer Science'}</div>
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 py-1 px-2.5 rounded-lg font-mono text-[10px] text-orange-700 dark:text-orange-300">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span>{entry.streak || 1}d</span>
                      </span>
                    </td>

                    {/* Badges count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-1 px-2.5 rounded-lg font-mono text-[10px] text-slate-600 dark:text-slate-300">
                        <BadgeIcon className="w-3 h-3 text-indigo-500" />
                        <span>{entry.badgesCount}</span>
                      </span>
                    </td>

                    {/* Courses count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-1 px-2.5 rounded-lg font-mono text-[10px] text-slate-600 dark:text-slate-300">
                        <Award className="w-3.5 h-3.5 text-cyan-500" />
                        <span>{entry.coursesCompleted}</span>
                      </span>
                    </td>

                    {/* XP Points */}
                    <td className="py-3.5 px-6 text-right font-mono">
                      <span
                        className={`font-bold ${
                          entry.isCurrentUser
                            ? 'text-sky-600 dark:text-cyan-400 text-sm'
                            : entry.rank === 1
                            ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {entry.xp.toLocaleString()} <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans font-normal">pts</span>
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
