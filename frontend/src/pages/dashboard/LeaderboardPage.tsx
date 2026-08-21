import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trophy, ChevronRight, Sparkles, Flame, ShieldCheck, Zap } from 'lucide-react';
import { LeaderboardView } from '../../components/courses/LeaderboardView';
import { XPService, AchievementService } from '../../services/achievementService';
import { useAuth } from '@/contexts/AuthContext';

export const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.uid || 'default_student';

  const [dynamicXp, setDynamicXp] = useState<number>(0);
  const [dynamicStreak, setDynamicStreak] = useState<number>(1);

  useEffect(() => {
    const xpService = new XPService();
    const achievementService = new AchievementService();

    const updateMetrics = () => {
      setDynamicXp(xpService.getXPPoints(currentUserId));
      setDynamicStreak(achievementService.getStreaks(currentUserId).dailyStreak);
    };

    updateMetrics();

    if (typeof window !== 'undefined') {
      window.addEventListener('shaivika_xp_updated', updateMetrics);
      window.addEventListener('shaivika_student_updated', updateMetrics);
      window.addEventListener('storage', updateMetrics);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('shaivika_xp_updated', updateMetrics);
        window.removeEventListener('shaivika_student_updated', updateMetrics);
        window.removeEventListener('storage', updateMetrics);
      }
    };
  }, [currentUserId]);

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 font-['Sora'] max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Top Header Banner & Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
            <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-cyan-400 font-semibold transition-colors">
              Main Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize font-extrabold text-blue-600 dark:text-cyan-400">Cohort Standings</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <span className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 shadow-xs">
              <Trophy className="w-6 h-6 fill-amber-400/20" />
            </span>
            <span>Cohort Leaderboard & Hall of Fame</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium max-w-2xl">
            Real-time standings across all tracks. Track daily learning streaks, earned achievement badges, and live verified XP points.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-blue-50/60 dark:hover:bg-slate-800 font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Hero Stats & Status Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="font-heading font-extrabold text-lg text-white">Gamified Cohort Telemetry</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE FIRESTORE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            XP and streaks are dynamically updated whenever students submit quizzes, solve coding labs, complete tracks, or maintain daily learning consistency.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
          <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 text-center">
            <span className="text-[10px] text-slate-300 block font-sans font-bold uppercase">Your Live Points</span>
            <span className="font-extrabold text-amber-300 text-sm flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> {dynamicXp.toLocaleString()} pts
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 text-center">
            <span className="text-[10px] text-slate-300 block font-sans font-bold uppercase">Active Streak</span>
            <span className="font-extrabold text-orange-400 text-sm flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" /> {dynamicStreak} Days (+15% XP)
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 text-center">
            <span className="text-[10px] text-slate-300 block font-sans font-bold uppercase">Tier Security</span>
            <span className="font-extrabold text-emerald-400 text-sm flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified
            </span>
          </div>
        </div>
      </div>

      {/* Main Leaderboard View Component */}
      <LeaderboardView />
    </div>
  );
};

export default LeaderboardPage;
