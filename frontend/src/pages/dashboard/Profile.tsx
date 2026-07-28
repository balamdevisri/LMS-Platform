import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  ExternalLink,
  Flame,
  Zap,
  BookOpen,
  Heart,
  Bot,
  Code,
  Terminal,
  Sparkles,
  Lock
} from 'lucide-react';
import {
  XPService,
  BadgeService,
  CertificateService,
  AchievementService,
  getLevelForXP,
  getLevelTitle,
  getXPRequiredForNextLevel,
  getXPBaseForLevel
} from '../../services/achievementService';
import type {
  Badge,
  Certificate,
  StreakState,
  AchievementStats
} from '../../services/achievementService';
import { CertificatePreviewModal } from '../../components/courses/CertificatePreviewModal';

const getBadgeIcon = (iconName: string, className = "w-5 h-5") => {
  switch (iconName) {
    case 'Award': return <Award className={`${className} text-indigo-500`} />;
    case 'Zap': return <Zap className={`${className} text-yellow-500`} />;
    case 'BookOpen': return <BookOpen className={`${className} text-emerald-500`} />;
    case 'Code': return <Code className={`${className} text-cyan-500`} />;
    case 'Terminal': return <Terminal className={`${className} text-slate-500`} />;
    case 'CheckCircle2': return <CheckCircle2 className={`${className} text-sky-500`} />;
    case 'Bot': return <Bot className={`${className} text-purple-500`} />;
    case 'Sparkles': return <Sparkles className={`${className} text-amber-500`} />;
    case 'Clock': return <Clock className={`${className} text-rose-500`} />;
    case 'Heart': return <Heart className={`${className} text-rose-450`} />;
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

export const Profile: React.FC = () => {
  const { user, userProfile } = useAuth();
  const userId = userProfile?.uid || user?.uid || 'default_student';

  const xpService = new XPService();
  const badgeService = new BadgeService();
  const certificateService = new CertificateService();
  const statsService = new AchievementService();

  // Dynamic States
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [streaks, setStreaks] = useState<StreakState | null>(null);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    setXp(xpService.getXPPoints(userId));
    setBadges(badgeService.getEarnedBadges(userId));
    setCerts(certificateService.getCertificates(userId));
    setStreaks(statsService.getStreaks(userId));
    setStats(statsService.getStats(userId));
  }, [userId]);

  const level = getLevelForXP(xp);
  const levelTitle = getLevelTitle(level);
  const nextLevelXp = getXPRequiredForNextLevel(level);
  const baseLevelXp = getXPBaseForLevel(level);

  const levelProgressPercent = nextLevelXp > baseLevelXp
    ? Math.min(100, Math.round(((xp - baseLevelXp) / (nextLevelXp - baseLevelXp)) * 100))
    : 100;

  const isGithubUser =
    userProfile?.providerId === 'github.com' ||
    userProfile?.photoURL?.includes('githubusercontent') ||
    user?.providerData?.some((p) => p.providerId === 'github.com');

  const githubUsername =
    userProfile?.githubUsername ||
    user?.email?.split('@')[0] ||
    'github-user';

  const avatarUrl = userProfile?.photoURL || user?.photoURL;

  return (
    <div className="space-y-8 text-slate-900 font-['Sora'] max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Page Title */}
      <div className="border-b border-sky-100 pb-4 select-none">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
          Student Learner Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Manage your account credentials, GitHub integration, levels, and verified certificates.
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/5 flex flex-col md:flex-row items-center gap-6">
        
        {/* Dynamic Avatar */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userProfile?.name || 'GitHub Profile Avatar'}
            className="w-24 h-24 rounded-2xl object-cover border-4 border-sky-300 shadow-md shrink-0 select-none"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-linear-to-tr from-sky-500 to-blue-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0 border-4 border-sky-200 select-none">
            {(userProfile?.name || user?.displayName || 'S').charAt(0).toUpperCase()}
          </div>
        )}

        <div className="space-y-2 text-center md:text-left flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 truncate">
              {userProfile?.name || user?.displayName || 'Student Scholar'}
            </h2>
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider border border-sky-200 select-none">
              Level {level}: {levelTitle}
            </span>
            {isGithubUser && (
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs select-none">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub Connected</span>
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 flex items-center justify-center md:justify-start gap-2 font-medium">
            <Mail className="w-3.5 h-3.5 text-sky-600" />
            <span>{userProfile?.email || user?.email || 'student@shaivika.ai'}</span>
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-500 font-medium select-none">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              Member Since: {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Today'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              Streak: <span className="text-amber-600 font-bold flex items-center gap-0.5"><Flame className="w-3.5 h-3.5 fill-current" />{streaks?.dailyStreak || 0} Days</span>
            </span>
          </div>
        </div>
      </div>

      {/* Level XP Progress Bar */}
      <div className="bg-white border border-sky-150 p-6 rounded-3xl space-y-3 shadow-xs">
        <div className="flex justify-between text-xs font-bold text-slate-600 select-none">
          <span>Experience Level Progress</span>
          <span className="font-mono text-blue-600">{xp} / {nextLevelXp} XP</span>
        </div>
        <div className="w-full h-3.5 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden select-none">
          <div
            className="h-full bg-linear-to-r from-blue-500 via-indigo-500 to-violet-600 rounded-full transition-all duration-700"
            style={{ width: `${levelProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Dynamic Statistics counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 leading-normal select-none">
        {[
          { label: 'Certificates', val: certs.length, icon: <Award className="w-4 h-4 text-cyan-500" /> },
          { label: 'Skill Badges', val: badges.length, icon: <Zap className="w-4 h-4 text-amber-500" /> },
          { label: 'Lessons Completed', val: stats?.lessonsCompleted || 0, icon: <BookOpen className="w-4 h-4 text-emerald-500" /> },
          { label: 'Practice Time', val: `${Math.round((stats?.practiceTimeSeconds || 0) / 60)} mins`, icon: <Clock className="w-4 h-4 text-indigo-500" /> }
        ].map((item, idx) => (
          <div key={idx} className="p-4 bg-white border border-sky-100 rounded-2xl space-y-1 shadow-3xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">{item.label}</span>
              {item.icon}
            </div>
            <span className="font-heading font-extrabold text-xl text-slate-900 block pt-1 font-mono">
              {item.val}
            </span>
          </div>
        ))}
      </div>

      {/* Account Info and GitHub Profiles split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-text">
        
        {/* Account Info */}
        <div className="bg-white/90 border border-sky-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
          <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2 select-none">
            <User className="w-5 h-5 text-sky-600" />
            <span>Account Details</span>
          </h3>

          <div className="space-y-3 text-xs font-medium">
            <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl flex items-center justify-between">
              <span className="text-slate-500">Verification Status</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {user?.emailVerified || userProfile?.isVerified || isGithubUser ? 'Verified Student' : 'Pending Verification'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl flex items-center justify-between">
              <span className="text-slate-500">System Access Level</span>
              <span className="font-mono text-sky-700 font-bold uppercase">{userProfile?.role || 'student'}</span>
            </div>
          </div>
        </div>

        {/* GitHub Integration Info */}
        <div className="bg-white/90 border border-sky-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
          <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2 select-none">
            <svg className="w-5 h-5 text-slate-900 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub Developer Profile</span>
          </h3>

          <div className="space-y-3">
            {isGithubUser ? (
              <>
                <div className="p-3.5 bg-slate-50 border border-sky-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">GitHub Handle</span>
                    <span className="font-mono text-xs font-bold text-slate-900">@{githubUsername}</span>
                  </div>
                  <a
                    href={`https://github.com/${githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-white hover:bg-sky-50 text-sky-700 font-bold text-xs border border-sky-200 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>View GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                  </a>
                </div>

                <div className="p-3.5 bg-sky-50/70 border border-sky-200/80 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Single Sign-On Active</span>
                    <span className="text-[11px] text-slate-650">Your profile, avatar, and email are automatically synchronized with GitHub.</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-slate-50 border border-sky-100 rounded-2xl text-center space-y-2">
                <p className="text-xs text-slate-650 font-medium">No GitHub account linked yet.</p>
                <span className="text-[11px] text-slate-500 block">Log in using GitHub to automatically sync your developer avatar and profile.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* dynamic Certificates cabinet */}
      <div className="bg-white/90 border border-sky-200/80 p-6 rounded-3xl space-y-4 shadow-sm select-text">
        <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2 select-none">
          <Award className="w-5 h-5 text-sky-650" />
          <span>Verified Course Certificates ({certs.length})</span>
        </h3>

        {certs.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-150 rounded-2xl select-none text-slate-400 space-y-1 max-w-sm mx-auto">
            <Lock className="w-8 h-8 text-slate-350 mx-auto" />
            <p className="text-xs font-bold">No Earned Credentials Yet</p>
            <p className="text-[10px] text-slate-500 leading-normal">
              Complete 100% of any course track syllabus to unlock your verified digital certificate.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certs.map((c) => (
              <div key={c.id} className="p-4 bg-slate-50 border border-sky-100 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block truncate max-w-xs">{c.courseTitle}</span>
                    <span className="text-[10px] text-slate-500 block">ID: {c.verificationId} • Issued {c.completionDate}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCert(c)}
                  className="py-1.5 px-3 bg-white border border-slate-200 hover:border-blue-500 rounded-xl text-[10px] font-bold text-slate-700 transition-all cursor-pointer whitespace-nowrap shadow-3xs hover:text-blue-600"
                >
                  View Verified
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Earned Badges drawer */}
      <div className="bg-white border border-sky-200/80 p-6 rounded-3xl space-y-4 shadow-sm select-text">
        <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2 select-none">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>Earned Badges Showcase ({badges.length})</span>
        </h3>

        {badges.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-150 rounded-2xl select-none text-slate-400 space-y-1 max-w-sm mx-auto">
            <Lock className="w-8 h-8 text-slate-355 mx-auto" />
            <p className="text-xs font-bold">No Earned Badges Yet</p>
            <p className="text-[10px] text-slate-500 leading-normal">
              Earn level benchmarks, pass quizzes, and write practice code to collect badges.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge) => (
              <div key={badge.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex gap-3.5 items-start">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl shrink-0">
                  {getBadgeIcon(badge.iconName)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 truncate">{badge.name}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[7px] font-extrabold uppercase border ${getRarityStyle(badge.rarity)}`}>
                      {badge.rarity}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{badge.description}</p>
                  <span className="text-[8px] font-semibold text-emerald-600 block">Earned {badge.earnedDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ----------------- RENDER PREVIEW MODAL IF SELECTED ----------------- */}
      {selectedCert && (
        <CertificatePreviewModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}

    </div>
  );
};

export default Profile;
