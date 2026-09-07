import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Zap,
  ChevronRight,
  X,
  Flame
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LeaderboardService,
  getLevelTitle,
  type LeaderboardEntry
} from '@/services/achievementService';

export const RibbonLeaderboardWidget: React.FC = () => {
  const { user, userProfile } = useAuth();
  const activeUserId = user?.uid || userProfile?.uid || 'default_student';

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!activeUserId) return;
    const leaderboardService = new LeaderboardService();
    const unsubscribe = leaderboardService.subscribeToLeaderboard('weekly', activeUserId, (data) => {
      setEntries(data);
    });
    return () => unsubscribe();
  }, [activeUserId]);

  const top5Entries = useMemo(() => entries.slice(0, 5), [entries]);

  const currentUserInfo = useMemo(() => {
    const userEmail = (user?.email || '').toLowerCase().trim();
    const userEntry = entries.find(
      (e) =>
        e.isCurrentUser ||
        e.id === activeUserId ||
        e.id === user?.uid ||
        (userEmail && (e as any).email && (e as any).email.toLowerCase() === userEmail)
    );

    if (!userEntry) {
      return {
        rank: entries.length > 0 ? entries.length : 1,
        xp: 150,
        name: userProfile?.name || user?.displayName || 'Learner',
        nextRankName: entries[0]?.name || null,
        nextRankXpDiff: entries[0] ? Math.max(10, entries[0].xp - 150) : 0,
        isFirst: false,
      };
    }

    const rank = userEntry.rank;
    const nextEntry = entries.find((e) => e.rank === rank - 1);

    return {
      rank,
      xp: userEntry.xp,
      name: userEntry.name,
      nextRankName: nextEntry ? nextEntry.name : null,
      nextRankXpDiff: nextEntry ? Math.max(0, nextEntry.xp - userEntry.xp) : 0,
      isFirst: rank === 1,
    };
  }, [entries, activeUserId, user, userProfile]);

  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-xs shadow-amber-500/40 ring-1 ring-amber-300';
      case 2:
        return 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900 font-bold shadow-xs ring-1 ring-slate-300';
      case 3:
        return 'bg-gradient-to-r from-amber-700 to-orange-700 text-white font-bold shadow-xs ring-1 ring-amber-600';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold';
    }
  };

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <aside
      className={`ribbon-leaderboard-widget ${isOpen ? 'is-open' : ''}`}
      aria-label="Cohort Leaderboard Widget"
    >
      {/* ── 1. The Folded 3D Ribbon Tab (Always visible on screen edge) ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="ribbon-tab-handle group focus:outline-none"
        title="Hover or click to view Cohort Leaderboard"
        aria-expanded={isOpen}
      >
        {/* Glowing Trophy Icon with live pulse indicator */}
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-amber-900/30 flex items-center justify-center border border-amber-200/50 shadow-inner group-hover:scale-110 transition-transform">
            <Trophy className="w-4 h-4 text-amber-100 fill-amber-300" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-300 border border-amber-800" />
          </span>
        </div>

        {/* Current User Quick Rank Mini-Pill */}
        <div className="bg-amber-950/40 border border-amber-300/40 rounded-full px-1.5 py-0.5 text-[9px] font-mono font-black text-amber-100 tracking-tight">
          #{currentUserInfo.rank}
        </div>

        {/* Vertical Ribbon Text */}
        <span className="ribbon-text-vertical">
          LEADERBOARD
        </span>

        {/* Arrow hint icon */}
        <ChevronRight className="w-3.5 h-3.5 text-amber-950/70 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {/* ── 2. The Expanded Leaderboard Card (Revealed on Hover / Open) ── */}
      <div className="ribbon-drawer-card">
        {/* Header Strip */}
        <div className="px-4 py-3 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent dark:from-amber-950/40 dark:via-yellow-950/20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 shadow-xs">
              <Trophy className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                Cohort Leaderboard
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Live Weekly Standings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Current Student's Rank Spotlight Banner */}
        <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs border border-white/20">
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={currentUserInfo.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  currentUserInfo.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUserInfo.name} (You)
                </p>
                <p className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold truncate">
                  {getLevelTitle(currentUserInfo.xp)}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-black font-mono">
                Rank #{currentUserInfo.rank}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                {currentUserInfo.xp.toLocaleString()} XP
              </span>
            </div>
          </div>

          {/* Motivational XP gap ticker */}
          {!currentUserInfo.isFirst && currentUserInfo.nextRankName && currentUserInfo.nextRankXpDiff > 0 && (
            <div className="text-[10px] px-2.5 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/20 text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
              <span className="truncate">
                Only <strong>{currentUserInfo.nextRankXpDiff} XP</strong> to overtake {currentUserInfo.nextRankName}!
              </span>
            </div>
          )}
        </div>

        {/* Top 5 Scholars List */}
        <div className="p-3 space-y-1.5 flex-1 overflow-y-auto max-h-[220px]">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 pb-1">
            <span>Scholar</span>
            <span>XP</span>
          </div>

          {top5Entries.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4 italic">
              Loading cohort standings...
            </p>
          ) : (
            top5Entries.map((scholar, idx) => {
              const isMe =
                scholar.isCurrentUser ||
                scholar.id === activeUserId ||
                scholar.id === user?.uid;
              const maxXP = top5Entries[0]?.xp || 1;
              const barPercent = Math.min(100, Math.round((scholar.xp / maxXP) * 100));

              return (
                <div
                  key={scholar.id || idx}
                  className={`p-2 rounded-xl transition-colors border text-xs flex items-center justify-between gap-2 relative overflow-hidden ${
                    isMe
                      ? 'bg-sky-500/10 border-sky-400/40 text-slate-900 dark:text-white font-semibold'
                      : 'bg-white/60 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {/* Background progress bar indicator */}
                  <div
                    className="absolute left-0 bottom-0 top-0 bg-amber-500/5 dark:bg-amber-500/10 pointer-events-none transition-all duration-300"
                    style={{ width: `${barPercent}%` }}
                  />

                  {/* Left: Rank & Scholar Info */}
                  <div className="flex items-center gap-2 min-w-0 z-10">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${getRankBadgeStyle(
                        scholar.rank
                      )}`}
                    >
                      {getRankMedal(scholar.rank)}
                    </span>

                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-white/20">
                      {scholar.avatarUrl ? (
                        <img
                          src={scholar.avatarUrl}
                          alt={scholar.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        scholar.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <span className="truncate text-xs font-semibold">
                      {scholar.name} {isMe ? '(You)' : ''}
                    </span>
                  </div>

                  {/* Right: XP */}
                  <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white shrink-0 z-10 flex items-center gap-0.5">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    {scholar.xp.toLocaleString()}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Link to Full Hall of Fame */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <Link
            to="/dashboard?tab=leaderboard"
            onClick={() => setIsOpen(false)}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-98 cursor-pointer"
          >
            <span>Open Full Hall of Fame</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default RibbonLeaderboardWidget;
