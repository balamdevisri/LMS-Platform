import React, { useState, useEffect } from 'react';
import {
  Award,
  Zap,
  BookOpen,
  Code,
  Terminal,
  CheckCircle2,
  MessageSquare,
  Bot,
  Sparkles,
  Clock,
  Star,
  Search,
  Lock,
  Flame,
  Calendar,
  Layers,
  Heart,
  CalendarRange
} from 'lucide-react';
import {
  XPService,
  BadgeService,
  AchievementService,
  STATIC_BADGES,
  getLevelForXP,
  getLevelTitle,
  getXPRequiredForNextLevel,
  getXPBaseForLevel
} from '../../services/achievementService';
import type {
  Badge,
  StreakState,
  AchievementStats
} from '../../services/achievementService';
import { useAuth } from '@/contexts/AuthContext';

// Dynamic Icon Map helper
const getBadgeIcon = (iconName: string, className = "w-6 h-6") => {
  switch (iconName) {
    case 'Award': return <Award className={`${className} text-indigo-500`} />;
    case 'Zap': return <Zap className={`${className} text-yellow-500`} />;
    case 'BookOpen': return <BookOpen className={`${className} text-emerald-500`} />;
    case 'Code': return <Code className={`${className} text-cyan-500`} />;
    case 'Terminal': return <Terminal className={`${className} text-slate-500`} />;
    case 'CheckCircle2': return <CheckCircle2 className={`${className} text-sky-500`} />;
    case 'MessageSquare': return <MessageSquare className={`${className} text-teal-500`} />;
    case 'Bot': return <Bot className={`${className} text-purple-500`} />;
    case 'Sparkles': return <Sparkles className={`${className} text-amber-500`} />;
    case 'Clock': return <Clock className={`${className} text-rose-500`} />;
    case 'Star': return <Star className={`${className} text-amber-400`} />;
    case 'Heart': return <Heart className={`${className} text-rose-450`} />;
    case 'CalendarRange': return <CalendarRange className={`${className} text-indigo-500`} />;
    default: return <Award className={`${className} text-indigo-500`} />;
  }
};

const getRarityStyle = (rarity: string) => {
  switch (rarity) {
    case 'Common': return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Rare': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Epic': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Legendary': return 'bg-amber-50 text-amber-700 border-amber-250 animate-pulse';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const AchievementsDashboard: React.FC = () => {
  const { user } = useAuth();
  const activeUserId = user?.uid || 'default_student';

  const xpService = new XPService();
  const badgeService = new BadgeService();
  const statService = new AchievementService();

  // Load States
  const [xp, setXp] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [streaks, setStreaks] = useState<StreakState | null>(null);
  const [stats, setStats] = useState<AchievementStats | null>(null);

  // Filter States
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check and trigger streak updates on mount
    statService.checkAndUpdateStreak(activeUserId);
    badgeService.checkAndAwardBadges(activeUserId);

    setXp(xpService.getXPPoints(activeUserId));
    setEarnedBadges(badgeService.getEarnedBadges(activeUserId));
    setStreaks(statService.getStreaks(activeUserId));
    setStats(statService.getStats(activeUserId));
  }, [activeUserId]);

  const level = getLevelForXP(xp);
  const levelTitle = getLevelTitle(level);
  const nextLevelXp = getXPRequiredForNextLevel(level);
  const baseLevelXp = getXPBaseForLevel(level);

  const levelProgressPercent = nextLevelXp > baseLevelXp
    ? Math.min(100, Math.round(((xp - baseLevelXp) / (nextLevelXp - baseLevelXp)) * 100))
    : 100;

  // Build grid data for all possible badges
  const earnedIds = new Set(earnedBadges.map(b => b.id));
  const badgesGrid = STATIC_BADGES.map(meta => {
    const isEarned = earnedIds.has(meta.id);
    const earnedData = earnedBadges.find(b => b.id === meta.id);
    return {
      ...meta,
      isEarned,
      earnedDate: earnedData?.earnedDate
    };
  });

  const filteredBadges = badgesGrid.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (badgeFilter === 'earned') return b.isEarned;
    if (badgeFilter === 'locked') return !b.isEarned;
    return true;
  });

  // Streaks Motivational Message
  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your learning journey today to begin a daily streak!";
    if (streak <= 2) return "Off to a good start! Learn again tomorrow to build your streak.";
    if (streak <= 6) return "Keep the flame burning! You're building a great habit.";
    return "Phenomenal work! You are on fire. Keep pushing your boundaries!";
  };

  return (
    <div className="space-y-8 font-['Sora'] text-slate-800 pb-8 animate-in fade-in duration-300">
      
      {/* ---------------- 1. LEVEL & EXPERIENCE SUMMARY ---------------- */}
      <div className="bg-white border border-sky-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center gap-6 justify-between">
        <div className="space-y-3.5 flex-1 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md shrink-0 border border-blue-400/20">
              {level}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">CURRENT RANK</span>
              <h2 className="font-heading font-extrabold text-xl text-slate-900 leading-tight">
                Level {level}: {levelTitle}
              </h2>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Progress to Next Rank</span>
              <span className="font-mono text-blue-600">{xp} / {nextLevelXp} XP</span>
            </div>
            <div className="w-full h-3 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 via-indigo-500 to-violet-600 rounded-full transition-all duration-700"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total stats card */}
        <div className="p-4 bg-indigo-50/20 border border-indigo-100 rounded-2xl shrink-0 text-center space-y-1 md:min-w-[180px]">
          <Award className="w-6 h-6 text-indigo-600 mx-auto" />
          <span className="text-[10px] text-indigo-850 font-bold block uppercase tracking-wider">Total Accumulated XP</span>
          <span className="font-heading font-extrabold text-2xl text-indigo-900 font-mono block">{xp} pts</span>
        </div>
      </div>

      {/* ---------------- 2. STATS & STREAK SPLIT ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Flame Streak Card */}
        <div className="lg:col-span-4 p-6 rounded-3xl border border-sky-100 bg-white flex flex-col justify-between space-y-4 shadow-3xs">
          <div className="space-y-2">
            <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 animate-pulse fill-amber-500" />
              <span>Learning Streak</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {streaks ? getStreakMessage(streaks.dailyStreak) : 'Keep studying daily to maintain streaks!'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 leading-normal">
            <div className="p-3 rounded-2xl bg-amber-50/30 border border-amber-100 text-center space-y-1">
              <span className="text-[9px] text-amber-800 font-extrabold uppercase tracking-wide">Daily Streak</span>
              <span className="font-heading font-extrabold text-2xl text-amber-600 block font-mono flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-current text-amber-500 shrink-0" />
                {streaks?.dailyStreak || 0}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/30 border border-amber-100 text-center space-y-1">
              <span className="text-[9px] text-amber-800 font-extrabold uppercase tracking-wide">Weekly Streak</span>
              <span className="font-heading font-extrabold text-2xl text-amber-600 block font-mono flex items-center justify-center gap-1">
                <Calendar className="w-5 h-5 text-amber-500 shrink-0" />
                {streaks?.weeklyStreak || 0}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center text-[10px] text-slate-500 font-semibold select-none">
            Longest Streak Record: <span className="font-mono text-slate-700">{streaks?.longestStreak || 0} consecutive days</span>
          </div>
        </div>

        {/* Stats counter list */}
        <div className="lg:col-span-8 p-6 rounded-3xl border border-sky-100 bg-white space-y-4 shadow-3xs">
          <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Activity Milestones</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 leading-normal">
            {[
              { label: 'Lessons Read', val: stats?.lessonsCompleted || 0, color: 'text-indigo-650' },
              { label: 'Quizzes Taken', val: stats?.quizAttempts || 0, color: 'text-emerald-650' },
              { label: 'Assignments Done', val: stats?.assignmentsSubmitted || 0, color: 'text-sky-650' },
              { label: 'Challenges Solved', val: stats?.codingChallengesSolved || 0, color: 'text-amber-650' },
              { label: 'Discussions Started', val: stats?.discussionsStarted || 0, color: 'text-purple-650' },
              { label: 'Answers Published', val: stats?.repliesPosted || 0, color: 'text-rose-650' },
              { label: 'AI Tutor Queries', val: stats?.aiAssistantSessions || 0, color: 'text-teal-650' },
              { label: 'Code Practice', val: `${Math.round((stats?.practiceTimeSeconds || 0) / 60)}m`, color: 'text-slate-650' }
            ].map((stat, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">{stat.label}</span>
                <span className={`font-heading font-extrabold text-lg sm:text-xl block font-mono mt-1 ${stat.color}`}>
                  {stat.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- 3. BADGES SHOWCASE GRID ---------------- */}
      <div className="p-6 rounded-3xl border border-sky-100 bg-white space-y-6 shadow-3xs">
        
        {/* Badge controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>Skill Badges Cabinet</span>
            </h3>
            <p className="text-xs text-slate-500">Track and unlock modular learning badges.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-48">
              <input
                type="text"
                placeholder="Search badges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs focus:outline-hidden focus:bg-white focus:border-blue-500 font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
            </div>

            {/* Filter Swaps */}
            <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-0.5 text-[11px] font-bold">
              {[
                { id: 'all', label: 'All' },
                { id: 'earned', label: 'Earned' },
                { id: 'locked', label: 'Locked' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setBadgeFilter(opt.id as any)}
                  className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                    badgeFilter === opt.id ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Badges list */}
        {filteredBadges.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-slate-150 rounded-2xl text-center space-y-2 select-none max-w-md mx-auto">
            <Lock className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-heading font-extrabold text-xs text-slate-800">No Badges Match Your Filters</h4>
            <p className="text-[10px] text-slate-500 leading-normal max-w-xs mx-auto">
              Try adjusting your query filter, or complete curriculum items to unlock locked achievements.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 relative shadow-3xs ${
                  badge.isEarned 
                    ? 'bg-white border-sky-100 hover:shadow-md' 
                    : 'bg-slate-50/50 border-slate-200 opacity-60'
                }`}
              >
                {/* Badge Icon wrap */}
                <div className={`p-3 rounded-2xl shrink-0 ${
                  badge.isEarned ? 'bg-slate-50' : 'bg-slate-200/50'
                }`}>
                  {badge.isEarned ? getBadgeIcon(badge.iconName) : <Lock className="w-6 h-6 text-slate-400" />}
                </div>

                {/* Badge Details */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-900 truncate" title={badge.name}>
                      {badge.name}
                    </h4>
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase border ${getRarityStyle(badge.rarity)}`}>
                      {badge.rarity}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    {badge.description}
                  </p>

                  {badge.isEarned && badge.earnedDate ? (
                    <span className="text-[9px] font-bold text-emerald-600 block">
                      Unlocked on {badge.earnedDate}
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold text-slate-400 block flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
