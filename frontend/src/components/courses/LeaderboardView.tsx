import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Award,
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
  GraduationCap,
  X,
  ExternalLink,
  ShieldCheck,
  Medal,
} from 'lucide-react';
import { LeaderboardService, type LeaderboardEntry } from '../../services/achievementService';
import { useAuth } from '@/contexts/AuthContext';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

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
  const [selectedScholar, setSelectedScholar] = useState<LeaderboardEntry | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Real-time live subscription
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

  const triggerCelebration = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  // Filter by track and search query
  const filteredEntries = useMemo(() => {
    let result = entries;

    // Track filter
    if (selectedTrack !== 'all') {
      result = result.filter((e) => {
        const trackStr = (e.track || '').toLowerCase();
        const branchStr = (e.branch || '').toLowerCase();
        const collegeStr = (e.college || '').toLowerCase();
        if (selectedTrack === 'ai') return trackStr.includes('ai') || branchStr.includes('ai') || branchStr.includes('python') || collegeStr.includes('ai');
        if (selectedTrack === 'web') return trackStr.includes('web') || trackStr.includes('react') || branchStr.includes('web') || branchStr.includes('react') || branchStr.includes('cs');
        if (selectedTrack === 'cloud') return trackStr.includes('cloud') || trackStr.includes('devops') || branchStr.includes('cloud') || branchStr.includes('devops');
        if (selectedTrack === 'cyber') return trackStr.includes('cyber') || trackStr.includes('security') || branchStr.includes('security');
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
          (e.track && e.track.toLowerCase().includes(q)) ||
          (e.levelTitle && e.levelTitle.toLowerCase().includes(q)) ||
          (e.githubUsername && e.githubUsername.toLowerCase().includes(q))
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
  const xpProgressPercent = nextRankEntry && currentUserEntry && nextRankEntry.xp > 0
    ? Math.min(100, Math.max(10, Math.round((currentUserEntry.xp / nextRankEntry.xp) * 100)))
    : 100;

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
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 text-amber-950 font-black text-xs flex items-center justify-center shadow-lg shadow-amber-500/40 ring-2 ring-amber-300 transform hover:scale-110 transition-transform">
          👑 1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-600 dark:to-slate-500 text-slate-800 dark:text-slate-100 font-extrabold text-xs flex items-center justify-center shadow-md ring-1 ring-slate-300 dark:ring-slate-500">
          🥈 2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-100 via-amber-200 to-amber-300 dark:from-amber-950 dark:via-amber-900 dark:to-amber-800 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-extrabold text-xs flex items-center justify-center shadow-md">
          🥉 3
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
        <span className="font-mono text-slate-600 dark:text-slate-400 text-xs font-bold">#{rank}</span>
      </div>
    );
  };

  const getRarityBadgeStyle = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-xs shadow-amber-500/20';
      case 'Epic':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'Rare':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-6 font-['Sora'] text-slate-800 dark:text-slate-100 animate-in fade-in duration-300">
      {/* Celebration Banner when Champion is clicked */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-amber-950 font-heading font-black text-xs sm:text-sm text-center shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 select-none"
          >
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>🎉 All Hail the Cohort Champion! Keep learning & climbing the leaderboard! 🚀👑</span>
            <Sparkles className="w-4 h-4 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Header & Real-time Live Controls ─────────────────────────────── */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/90 border border-sky-100 dark:border-slate-800 p-6 sm:p-7 rounded-3xl shadow-sm backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-colors">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/10">
              <Trophy className="w-7 h-7 text-amber-500 fill-amber-400/30 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                  Cohort Leaderboard Standings
                </h2>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 -ml-3.5" />
                  Live Real-Time Telemetry
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                Real-time dynamic cohort rankings synced with Firestore, student streaks, badges & verified XP.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scholar, track, handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-sky-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 dark:focus:border-cyan-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Timeframe Filter Pills */}
          <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-[11px] font-bold shrink-0 select-none">
            {[
              { id: 'global', label: 'All-Time', icon: <Users className="w-3 h-3" /> },
              { id: 'weekly', label: 'Weekly Sprint', icon: <Clock className="w-3 h-3" /> },
              { id: 'monthly', label: 'Monthly', icon: <Calendar className="w-3 h-3" /> },
              { id: 'course', label: 'Track Sprint', icon: <BookOpen className="w-3 h-3" /> },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id as any)}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  filter === opt.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-extrabold'
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
            className="p-2.5 rounded-xl bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-cyan-400 hover:bg-sky-100 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-2xs active:scale-95"
            title={`Last synced: ${lastSyncTime}. Click to sync live data now.`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-600 dark:text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Track Selector Bar ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-blue-500 dark:text-cyan-400" /> Focus Track:
        </span>
        {[
          { id: 'all', label: '🌟 All Tracks' },
          { id: 'web', label: '⚛️ React & Full-Stack' },
          { id: 'ai', label: '🧠 Python & AI Engineering' },
          { id: 'cloud', label: '☁️ Cloud Architecture' },
          { id: 'cyber', label: '🛡️ Cybersecurity' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTrack(t.id)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
              selectedTrack === t.id
                ? 'bg-blue-600 dark:bg-cyan-600 text-white border-blue-600 dark:border-cyan-600 shadow-md shadow-blue-500/20 scale-102'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Cohort Real-Time Stats Grid ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Total Active Scholars</span>
            <span className="font-heading font-black text-xl text-slate-900 dark:text-white">{cohortStats.totalScholars}</span>
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/50">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Cohort XP Pool</span>
            <span className="font-heading font-black text-xl text-amber-600 dark:text-amber-400">{cohortStats.totalXp.toLocaleString()} pts</span>
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Your Rank Percentile</span>
            <span className="font-heading font-black text-xl text-emerald-600 dark:text-emerald-400">Top {cohortStats.userPercentile}%</span>
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/50">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Average Scholar XP</span>
            <span className="font-heading font-black text-xl text-purple-600 dark:text-purple-400">{cohortStats.avgXp.toLocaleString()} pts</span>
          </div>
        </div>
      </div>

      {/* ── Active User Spotlight & Gamified XP Gauge Banner ────────────────────────────── */}
      {currentUserEntry && (
        <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white shadow-xl shadow-sky-600/20 border border-sky-400/40">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4.5">
              <div className="relative shrink-0">
                <img
                  src={currentUserEntry.avatarUrl || userProfile?.photoURL || user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserEntry.name)}&background=0284c7&color=fff&bold=true`}
                  alt={currentUserEntry.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg bg-slate-900"
                />
                <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] shadow-md ring-2 ring-white">
                  #{currentUserEntry.rank}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-black text-lg sm:text-xl tracking-tight text-white">{currentUserEntry.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold backdrop-blur-md">
                    Your Standing
                  </span>
                  {currentUserEntry.githubUsername && (
                    <a
                      href={`https://github.com/${currentUserEntry.githubUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-sky-200 hover:text-white border border-white/20 text-[10px] font-mono font-bold transition-all shadow-xs"
                      title="View GitHub Profile"
                    >
                      <GithubIcon className="w-3 h-3" />
                      <span>@{currentUserEntry.githubUsername}</span>
                    </a>
                  )}
                  {currentUserEntry.levelTitle && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400/30 text-amber-200 border border-amber-300/40 text-[10px] font-extrabold flex items-center gap-1">
                      <Medal className="w-3 h-3 text-amber-300" />
                      Level {currentUserEntry.level || 1} • {currentUserEntry.levelTitle}
                    </span>
                  )}
                  {currentUserEntry.streak && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/30 text-orange-100 border border-orange-400/40 text-[10px] font-extrabold">
                      <Flame className="w-3.5 h-3.5 text-orange-400 animate-bounce" /> {currentUserEntry.streak} Day Streak
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-sky-100 font-medium mt-1">
                  {currentUserEntry.rank === 1
                    ? '👑 Outstanding! You are currently leading the entire cohort leaderboard!'
                    : nextRankEntry
                    ? `Earn ${xpToNextRank.toLocaleString()} more XP to overtake #${currentUserEntry.rank - 1} (${nextRankEntry.name})`
                    : `Ranked #${currentUserEntry.rank} among active scholars`}
                </p>

                {/* Progress Bar towards Next Rank */}
                {nextRankEntry && (
                  <div className="mt-3 max-w-md">
                    <div className="flex items-center justify-between text-[11px] font-bold text-sky-200 mb-1">
                      <span>Progress to Rank #{currentUserEntry.rank - 1}</span>
                      <span>{xpProgressPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-sky-950/50 rounded-full overflow-hidden border border-white/20 p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgressPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end text-xs font-mono">
              <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center flex-1 lg:flex-initial">
                <span className="text-[10px] text-sky-200 block uppercase font-sans font-bold">Total XP</span>
                <span className="font-extrabold text-amber-300 text-base">{currentUserEntry.xp.toLocaleString()} pts</span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center flex-1 lg:flex-initial">
                <span className="text-[10px] text-sky-200 block uppercase font-sans font-bold">Badges</span>
                <span className="font-extrabold text-white text-base">{currentUserEntry.badgesCount}</span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center flex-1 lg:flex-initial">
                <span className="text-[10px] text-sky-200 block uppercase font-sans font-bold">Tracks</span>
                <span className="font-extrabold text-cyan-200 text-base">{currentUserEntry.coursesCompleted || 1}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Top 3 Scholars Podium ───────────────────────────────────── */}
      {topThree.length >= 3 && !searchQuery && selectedTrack === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 items-end">
          
          {/* Rank 2 (Silver) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onClick={() => setSelectedScholar(topThree[1])}
            className="group cursor-pointer p-6 rounded-3xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-400 dark:hover:border-slate-600 transition-all flex flex-col items-center text-center space-y-3.5 relative order-2 md:order-1"
          >
            <div className="absolute top-4 left-4">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                🥈 2nd Place
              </span>
            </div>
            <div className="relative mt-3">
              <img
                src={topThree[1].avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[1].name)}&background=64748b&color=fff&bold=true`}
                alt={topThree[1].name}
                className="w-18 h-18 rounded-2xl object-cover border-3 border-slate-300 dark:border-slate-600 shadow-md bg-slate-800 group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white truncate max-w-[200px]">{topThree[1].name}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px] mt-0.5">{topThree[1].track || topThree[1].college}</p>
              
              <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
                {topThree[1].streak && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-900/50">
                    <Flame className="w-3 h-3 text-orange-500" /> {topThree[1].streak}d
                  </span>
                )}
                {topThree[1].levelTitle && (
                  <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {topThree[1].levelTitle}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-sans font-bold">XP Score</span>
              <span className="font-black text-slate-800 dark:text-slate-200 text-sm">{topThree[1].xp.toLocaleString()} pts</span>
            </div>
          </motion.div>

          {/* Rank 1 (Gold - Champion) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => {
              setSelectedScholar(topThree[0]);
              triggerCelebration();
            }}
            className="group cursor-pointer p-7 rounded-3xl bg-gradient-to-b from-amber-50/90 via-white to-amber-50/50 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/30 border-2 border-amber-300 dark:border-amber-500/70 shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:border-amber-400 transition-all flex flex-col items-center text-center space-y-4 relative order-1 md:order-2 md:-translate-y-4"
          >
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1.5">
                👑 1st (Cohort Champion)
              </span>
            </div>

            <div className="relative mt-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-3xl blur-sm opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />
              <img
                src={topThree[0].avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[0].name)}&background=f59e0b&color=fff&bold=true`}
                alt={topThree[0].name}
                className="relative w-22 h-22 rounded-3xl object-cover border-4 border-amber-300 shadow-xl bg-slate-900 group-hover:scale-105 transition-transform"
              />
            </div>

            <div>
              <h4 className="font-heading font-black text-lg text-slate-900 dark:text-white truncate max-w-[220px]">{topThree[0].name}</h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-bold truncate max-w-[220px] mt-0.5">{topThree[0].track || topThree[0].branch || 'Software Track'}</p>
              
              <div className="flex items-center justify-center gap-2 mt-2.5 flex-wrap">
                {topThree[0].streak && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/60 px-2.5 py-0.5 rounded-full border border-orange-300 dark:border-orange-800">
                    <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> {topThree[0].streak}d Streak
                  </span>
                )}
                {topThree[0].levelTitle && (
                  <span className="text-[10px] font-extrabold text-amber-900 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 px-2.5 py-0.5 rounded-md">
                    Level {topThree[0].level || 1} • {topThree[0].levelTitle}
                  </span>
                )}
              </div>
            </div>

            <div className="w-full pt-3.5 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs font-mono">
              <span className="text-amber-800 dark:text-amber-400 text-[10px] font-sans font-extrabold uppercase">Total XP Points</span>
              <span className="font-black text-amber-600 dark:text-amber-300 text-base">{topThree[0].xp.toLocaleString()} pts</span>
            </div>
          </motion.div>

          {/* Rank 3 (Bronze) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            onClick={() => setSelectedScholar(topThree[2])}
            className="group cursor-pointer p-6 rounded-3xl bg-gradient-to-b from-amber-50/40 to-white dark:from-slate-900 dark:to-slate-950 border border-amber-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-400/60 transition-all flex flex-col items-center text-center space-y-3.5 relative order-3"
          >
            <div className="absolute top-4 left-4">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                🥉 3rd Place
              </span>
            </div>
            <div className="relative mt-3">
              <img
                src={topThree[2].avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[2].name)}&background=d97706&color=fff&bold=true`}
                alt={topThree[2].name}
                className="w-18 h-18 rounded-2xl object-cover border-3 border-amber-600/40 dark:border-amber-700/50 shadow-md bg-slate-800 group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white truncate max-w-[200px]">{topThree[2].name}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px] mt-0.5">{topThree[2].track || topThree[2].college}</p>
              
              <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
                {topThree[2].streak && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-900/50">
                    <Flame className="w-3 h-3 text-orange-500" /> {topThree[2].streak}d
                  </span>
                )}
                {topThree[2].levelTitle && (
                  <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {topThree[2].levelTitle}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-sans font-bold">XP Score</span>
              <span className="font-black text-slate-800 dark:text-slate-200 text-sm">{topThree[2].xp.toLocaleString()} pts</span>
            </div>
          </motion.div>

        </div>
      )}

      {/* ── Leaderboard Ranks Table ─────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900/90 border border-sky-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm backdrop-blur-xl transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-950/90 border-b border-sky-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-widest select-none">
                <th className="py-4 px-6 w-20 text-center">Rank</th>
                <th className="py-4 px-4">Student Scholar</th>
                <th className="py-4 px-4">Track / Institution</th>
                <th className="py-4 px-4 text-center">Streak</th>
                <th className="py-4 px-4 text-center">Badges</th>
                <th className="py-4 px-4 text-center">Level</th>
                <th className="py-4 px-6 text-right w-44">Experience XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400 dark:text-slate-500 font-medium">
                    No scholars matched the criteria "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr
                    key={`${entry.rank}-${entry.name}-${entry.id || ''}`}
                    onClick={() => setSelectedScholar(entry)}
                    className={`cursor-pointer transition-all duration-200 group ${
                      entry.isCurrentUser
                        ? 'bg-sky-50/80 dark:bg-cyan-950/30 border-l-4 border-l-sky-500 dark:border-l-cyan-400 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
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
                      <div className="flex items-center gap-3.5">
                        <img
                          src={entry.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name)}&background=0284c7&color=fff&bold=true`}
                          alt={entry.name}
                          className="w-10 h-10 rounded-xl object-cover border border-sky-200 dark:border-slate-700 shadow-xs shrink-0 bg-slate-900 group-hover:scale-105 transition-transform"
                        />

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="block truncate text-slate-900 dark:text-white font-bold text-sm">
                              {entry.name}
                            </span>
                            {entry.isCurrentUser && (
                              <span className="inline-block text-[9px] font-extrabold text-sky-700 dark:text-cyan-300 bg-sky-100 dark:bg-cyan-950/70 px-2 py-0.5 rounded-md border border-sky-300 dark:border-cyan-800 uppercase tracking-wide">
                                You
                              </span>
                            )}
                          </div>
                          {entry.githubUsername && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors mt-0.5">
                              <GithubIcon className="w-2.5 h-2.5" />
                              <span>@{entry.githubUsername}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Track & College */}
                    <td className="py-3.5 px-4 text-[11px] font-normal">
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {entry.track || entry.branch || 'Software Engineering'}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
                        {entry.college || 'Shaivika AI Foundation'}
                      </div>
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 py-1 px-2.5 rounded-lg font-mono text-[11px] font-bold text-orange-700 dark:text-orange-300">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span>{entry.streak || 1}d</span>
                      </span>
                    </td>

                    {/* Badges count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-1 px-2.5 rounded-lg font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <Award className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{entry.badgesCount}</span>
                      </span>
                    </td>

                    {/* Level */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 py-1 px-2 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        Lvl {entry.level || 1}
                      </span>
                    </td>

                    {/* XP Points */}
                    <td className="py-3.5 px-6 text-right font-mono">
                      <span
                        className={`font-black text-sm ${
                          entry.isCurrentUser
                            ? 'text-sky-600 dark:text-cyan-400 text-base'
                            : entry.rank === 1
                            ? 'text-amber-600 dark:text-amber-400 font-extrabold text-base'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {entry.xp.toLocaleString()}{' '}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans font-normal">pts</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Scholar Details & Badges Drawer/Modal ───────────────────────────── */}
      <AnimatePresence>
        {selectedScholar && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans pointer-events-auto"
            onClick={() => setSelectedScholar(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-100 overflow-hidden space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedScholar.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedScholar.name)}&background=0284c7&color=fff&bold=true`}
                    alt={selectedScholar.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shadow-md bg-slate-800"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-white">{selectedScholar.name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black">
                        Rank #{selectedScholar.rank}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedScholar.track || selectedScholar.college}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedScholar(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scholar Stats Grid */}
              <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-sans font-bold text-slate-400 block uppercase">Experience XP</span>
                  <span className="font-extrabold text-amber-400 text-sm">{selectedScholar.xp.toLocaleString()} pts</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-sans font-bold text-slate-400 block uppercase">Streak</span>
                  <span className="font-extrabold text-orange-400 text-sm flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    {selectedScholar.streak || 1} Days
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-sans font-bold text-slate-400 block uppercase">Level</span>
                  <span className="font-extrabold text-cyan-400 text-sm">Lvl {selectedScholar.level || 1}</span>
                </div>
              </div>

              {/* Badges Collection */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-400" />
                    Earned Badges ({selectedScholar.badges?.length || selectedScholar.badgesCount})
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Achievements
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {(selectedScholar.badges && selectedScholar.badges.length > 0
                    ? selectedScholar.badges
                    : [
                        { id: '1', name: 'Course Completed', description: 'Mastered syllabus track.', rarity: 'Common' },
                        { id: '2', name: 'Quiz Master', description: 'Cleared assessments with distinction.', rarity: 'Rare' },
                        { id: '3', name: 'AI Learner', description: 'Engaged with AI Assistant.', rarity: 'Epic' },
                        { id: '4', name: 'Top Performer', description: 'Accumulated over 2,000 XP.', rarity: 'Legendary' }
                      ]
                  ).map((b, idx) => (
                    <div
                      key={b.id || idx}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5"
                    >
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{b.name}</span>
                        <span
                          className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase border ${getRarityBadgeStyle(
                            b.rarity || 'Common'
                          )}`}
                        >
                          {b.rarity || 'Common'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GitHub profile action */}
              {selectedScholar.githubUsername && (
                <div className="pt-2">
                  <a
                    href={`https://github.com/${selectedScholar.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <GithubIcon className="w-4 h-4" />
                    <span>View GitHub Profile (@{selectedScholar.githubUsername})</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LeaderboardView;
