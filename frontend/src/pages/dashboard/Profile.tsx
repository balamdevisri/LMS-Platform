import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
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
  Lock,
  Globe,
  Plus
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
    case 'Common': return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    case 'Rare': return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'Epic': return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'Legendary': return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 animate-pulse';
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
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
  const [loadingCertId, setLoadingCertId] = useState<string | null>(null);

  // Social coordinates local caching
  const [githubLink, setGithubLink] = useState(localStorage.getItem('shaivika_portfolio_github') || '');
  const [linkedinLink, setLinkedinLink] = useState(localStorage.getItem('shaivika_portfolio_linkedin') || '');
  const [websiteLink, setWebsiteLink] = useState(localStorage.getItem('shaivika_portfolio_website') || '');
  const [bio, setBio] = useState(localStorage.getItem('shaivika_portfolio_bio') || 'Aspiring technology specialist mastering system architecture, relational databases, and collaborative workflow tools.');

  // Projects list
  const [projects, setProjects] = useState<{ name: string; desc: string; repo: string }[]>(() => {
    const cached = localStorage.getItem('shaivika_portfolio_projects');
    if (cached) return JSON.parse(cached);
    return [
      {
        name: 'Automated Git DAG Visualizer',
        desc: 'Constructed an interactive node graph in React reflecting local repo commit pipelines.',
        repo: 'https://github.com/shaivika/git-dag-parser',
      },
      {
        name: 'Database Transaction ACID Validator',
        desc: 'Implemented mock concurrency lock queues to demonstrate database isolations.',
        repo: 'https://github.com/shaivika/acid-validator',
      },
    ];
  });

  const [newProj, setNewProj] = useState({ name: '', desc: '', repo: '' });

  const getGitHubUsername = () => {
    if (githubLink) {
      const clean = githubLink.trim().replace(/\/$/, "");
      const parts = clean.split('/');
      const last = parts[parts.length - 1];
      if (last && !last.includes('github.com')) {
        return last;
      }
    }
    return userProfile?.githubUsername || user?.email?.split('@')[0] || 'github-user';
  };

  const username = getGitHubUsername();
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  useEffect(() => {
    if (!username || username === 'github-user') return;
    setLoadingRepos(true);
    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setGithubRepos(data);
        }
        setLoadingRepos(false);
      })
      .catch(() => {
        setLoadingRepos(false);
      });
  }, [username]);

  useEffect(() => {
    badgeService.checkAndAwardBadges(userId);
    setXp(xpService.getXPPoints(userId));
    setBadges(badgeService.getEarnedBadges(userId));
    setCerts(certificateService.getCertificates(userId));
    setStreaks(statsService.getStreaks(userId));
    setStats(statsService.getStats(userId));
  }, [userId]);

  const handleViewCertificate = async (cert: Certificate) => {
    if (loadingCertId) return;
    const isMock = String(cert.verificationId).startsWith('KQ-') || cert.verificationId === 'KQ-CERT-MOCK-ID';
    if (!isMock) {
      setSelectedCert(cert);
      return;
    }

    setLoadingCertId(cert.courseId);
    const toastId = toast.loading('Retrieving official verified certificate from registry...');
    try {
      const studentEmail = user?.email || userProfile?.email || 'shaivikagroups@gmail.com';
      const studentId = userId;
      const studentName = userProfile?.name || user?.displayName || 'Scholar student';

      const apiBase = import.meta.env.VITE_API_URL || '/api';

      const safeFetchJson = async (url: string, options: RequestInit) => {
        try {
          const res = await fetch(url, options);
          if (!res.ok) {
            console.error(`[API ERROR] ${options.method || 'GET'} ${url} returned ${res.status} ${res.statusText}`);
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errData = await res.json();
              return { success: false, status: res.status, error: errData.error || errData.message || res.statusText };
            }
            return { success: false, status: res.status, error: `HTTP ${res.status}: ${res.statusText}` };
          }
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            return { success: true, status: res.status, data };
          }
          return { success: true, status: res.status, data: {} };
        } catch (fetchErr) {
          console.error(`[API NETWORK ERROR] Failed to fetch ${url}:`, fetchErr);
          throw fetchErr;
        }
      };

      // 1. Query the student's certificates on backend to see if it's already there
      const verifyRes = await fetch(`${apiBase}/certificates/student/${studentEmail}`);
      if (verifyRes.ok) {
        const contentType = verifyRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const verifyData = await verifyRes.json();
          if (verifyData.success && Array.isArray(verifyData.data)) {
            const matched = verifyData.data.find((c: any) => String(c.courseId) === String(cert.courseId));
            if (matched && matched.certificateId) {
              const updated: Certificate = {
                ...cert,
                verificationId: matched.certificateId,
                googleDriveLink: matched.pdfUrl || matched.googleDriveLink,
              };
              certificateService.saveExternalCertificate(studentId, updated);
              
              // Reload certs
              setCerts(certificateService.getCertificates(studentId));
              
              toast.success('Certificate loaded successfully!', { id: toastId });
              setSelectedCert(updated);
              setLoadingCertId(null);
              return;
            }
          }
        }
      }

      // 2. Trigger generation
      let token: string | null = null;
      if (user) {
        try {
          token = await user.getIdToken();
        } catch {}
      }
      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('shaivika_auth_token');
      }

      const getHeaders = (t: string | null) => {
        const h: Record<string, string> = { 'Content-Type': 'application/json' };
        if (t) h['Authorization'] = `Bearer ${t}`;
        return h;
      };

      const deliverRes = await safeFetchJson(`${apiBase}/certificates/complete-and-deliver`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({
          studentId,
          studentName,
          studentEmail,
          courseId: cert.courseId,
          courseTitle: cert.courseTitle,
          completionPercentage: 100,
          instructorName: cert.instructorName || 'Shaivika Groups Board',
          courseDuration: cert.courseDuration || '24 Hours',
          modulesCount: cert.modulesCount || 8,
          verificationId: cert.verificationId,
          forceRegenerate: true
        }),
      });

      const deliverData = deliverRes.data || {};
      if (deliverRes.success && deliverData.success) {
        const updated: Certificate = {
          ...cert,
          verificationId: deliverData.certificateId,
          googleDriveLink: deliverData.googleDriveLink,
        };
        certificateService.saveExternalCertificate(studentId, updated);
        
        // Reload certs
        setCerts(certificateService.getCertificates(studentId));

        toast.success('Official Certificate generated successfully!', { id: toastId });
        setSelectedCert(updated);
      } else {
        toast.error(deliverRes.error || deliverData.error || 'Failed to retrieve official certificate.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Failed to retrieve official certificate.', { id: toastId });
    } finally {
      setLoadingCertId(null);
    }
  };

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
    user?.providerData?.some((p) => p.providerId === 'github.com') ||
    Boolean(githubLink);

  const githubUsername = username;

  const avatarUrl = userProfile?.photoURL || user?.photoURL;

  const handleSaveSocials = () => {
    localStorage.setItem('shaivika_portfolio_github', githubLink);
    localStorage.setItem('shaivika_portfolio_linkedin', linkedinLink);
    localStorage.setItem('shaivika_portfolio_website', websiteLink);
    localStorage.setItem('shaivika_portfolio_bio', bio);
    toast.success('💾 Portfolio profile updated successfully!');
  };

  const handleAddProject = () => {
    if (newProj.name && newProj.desc) {
      const updated = [...projects, newProj];
      setProjects(updated);
      localStorage.setItem('shaivika_portfolio_projects', JSON.stringify(updated));
      setNewProj({ name: '', desc: '', repo: '' });
      toast.success('📁 New project added to showcase.');
    }
  };

  const handleRemoveProject = (idx: number) => {
    const updated = projects.filter((_, i) => i !== idx);
    setProjects(updated);
    localStorage.setItem('shaivika_portfolio_projects', JSON.stringify(updated));
  };

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100 font-sans max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Portfolio Title */}
      <div className="border-b border-sky-100 dark:border-slate-800 pb-4 select-none">
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
          Developer Portfolio & Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
          Your public credentials showcase including skills, verified completions, certificates, and github projects.
        </p>
      </div>

      {/* Main Row layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar & Social Settings */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Avatar card */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-center space-y-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userProfile?.name || 'Profile Avatar'}
                className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-indigo-100 dark:border-slate-800 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0 border-4 border-indigo-150 mx-auto select-none">
                {(userProfile?.name || user?.displayName || 'S').charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h2 className="font-heading font-black text-base text-slate-900 dark:text-white truncate">
                {userProfile?.name || user?.displayName || 'Student Scholar'}
              </h2>
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mt-0.5">
                Level {level}: {levelTitle}
              </span>
              <div className="mt-2 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{userProfile?.email || user?.email}</span>
                {isGithubUser && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 text-cyan-300 text-[8px] font-extrabold flex items-center gap-1 shadow-xs select-none border border-slate-700">
                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>GitHub Connected (@{githubUsername})</span>
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              {bio}
            </p>
          </div>

          {/* Socials Manager */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Portfolio coordinates
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <svg className="w-4 h-4 text-slate-500 dark:text-slate-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <input
                  type="text"
                  placeholder="GitHub URL"
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  className="flex-1 text-xs bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <input
                  type="text"
                  placeholder="LinkedIn URL"
                  value={linkedinLink}
                  onChange={(e) => setLinkedinLink(e.target.value)}
                  className="flex-1 text-xs bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <Globe className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <input
                  type="text"
                  placeholder="Website URL"
                  value={websiteLink}
                  onChange={(e) => setWebsiteLink(e.target.value)}
                  className="flex-1 text-xs bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <textarea
                placeholder="Developer Bio / Goals..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full h-16 p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl resize-none focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />

              <button
                onClick={handleSaveSocials}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md transition-all"
              >
                Update Coordinates
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Credential Details & Projects */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Level XP Progress Bar */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
            <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 select-none">
              <span>Experience Progression Node</span>
              <span className="font-mono text-blue-600 dark:text-cyan-400 font-bold">{xp} / {nextLevelXp} XP</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full transition-all duration-700"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Verified Certs', val: certs.length, icon: <Award className="w-4 h-4 text-cyan-500" /> },
              { label: 'XP Badges', val: badges.length, icon: <Zap className="w-4 h-4 text-amber-500 animate-pulse" /> },
              { label: 'Lessons Complete', val: stats?.lessonsCompleted || 0, icon: <BookOpen className="w-4 h-4 text-emerald-500" /> },
              { label: 'Streaks Logged', val: `${streaks?.dailyStreak || 0} Days`, icon: <Flame className="w-4 h-4 text-rose-500 fill-current" /> }
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide">{item.label}</span>
                  {item.icon}
                </div>
                <span className="font-heading font-black text-sm text-slate-900 dark:text-white block pt-1 font-mono">
                  {item.val}
                </span>
              </div>
            ))}
          </div>

          {/* Project Showcase */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
              <span>Project Showcase Portfolio</span>
            </h3>

            {/* Live GitHub Repositories Grid */}
            {username && username !== 'github-user' && (
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  GitHub Repositories
                </span>
                {loadingRepos ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 animate-pulse h-24" />
                    ))}
                  </div>
                ) : githubRepos.length === 0 ? (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">No public repositories loaded or API limit reached.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {githubRepos.map((repo) => (
                      <div
                        key={repo.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-blue-400 dark:hover:border-cyan-500 transition-all group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[170px]">
                              {repo.name}
                            </span>
                            {repo.stargazers_count > 0 && (
                              <span className="text-[9px] font-bold text-amber-500 flex items-center gap-0.5">
                                ★ {repo.stargazers_count}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {repo.description || 'No description provided.'}
                          </p>
                        </div>
                        <div className="mt-3.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[9px] font-bold text-slate-400 dark:text-slate-500">
                          <span>{repo.language || 'Code'}</span>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            View Repo <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Manually Added Projects Showcase */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Local & Custom Projects
              </span>
              
              {/* Project List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between gap-2">
                        <span>{proj.name}</span>
                        <button
                          onClick={() => handleRemoveProject(idx)}
                          className="text-rose-500 opacity-0 group-hover:opacity-100 hover:text-rose-700 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {proj.desc}
                      </p>
                    </div>
                    <div className="mt-3.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      <span className="truncate max-w-[150px]">{proj.repo}</span>
                      <a
                        href={proj.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        Repo <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Project Form */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <input
                  type="text"
                  placeholder="Project Name (e.g. SQL Normalizer)"
                  value={newProj.name}
                  onChange={(e) => setNewProj({ ...newProj, name: e.target.value })}
                  className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newProj.desc}
                  onChange={(e) => setNewProj({ ...newProj, desc: e.target.value })}
                  className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="GitHub Repo URL"
                  value={newProj.repo}
                  onChange={(e) => setNewProj({ ...newProj, repo: e.target.value })}
                  className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:outline-none"
                />
                <button
                  onClick={handleAddProject}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project entry</span>
                </button>
              </div>
            </div>
          </div>

          {/* GitHub Activity & Contribution Calendar */}
          {username && username !== 'github-user' && (
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600 dark:text-cyan-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub Coding Contribution Activity</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Live calendar heatmaps resolved directly from your public repository commit coordinates.
              </p>
              <div className="pt-2 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 overflow-hidden space-y-4">
                <img
                  src={`https://ghchart.rshah.org/4f46e5/${username}`}
                  alt={`${username}'s GitHub Contributions`}
                  className="max-w-full h-auto select-none dark:invert dark:hue-rotate-180 brightness-95 dark:brightness-110"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div className="w-full flex flex-wrap justify-center gap-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <img
                    src={`https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=transparent&hide_border=true&title_color=0284c7&text_color=64748b&icon_color=0284c7`}
                    alt={`${username}'s stats card`}
                    className="h-28 max-w-full select-none"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <img
                    src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=transparent&hide_border=true&title_color=0284c7&text_color=64748b`}
                    alt={`${username}'s languages card`}
                    className="h-28 max-w-full select-none"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Verified Certificates cabinet */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm select-text">
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 select-none">
              <Award className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
              <span>Verified Course Certificates ({certs.length})</span>
            </h3>

            {certs.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl select-none text-slate-400 dark:text-slate-500 space-y-1 max-w-sm mx-auto">
                <Lock className="w-8 h-8 text-slate-350 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No Earned Credentials Yet</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                  Complete 100% of any course track syllabus to unlock your verified digital certificate.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {certs.map((c) => (
                  <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-800/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white block truncate max-w-xs">{c.courseTitle}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">ID: {c.verificationId} • Issued {c.completionDate}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewCertificate(c)}
                      className="py-1.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-cyan-500 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer whitespace-nowrap shadow-xs hover:text-blue-600 dark:hover:text-cyan-400"
                    >
                      View Verified
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Earned Badges Showcase */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm select-text">
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 select-none">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Earned Badges Showcase ({badges.length})</span>
            </h3>

            {badges.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl select-none text-slate-400 dark:text-slate-500 space-y-1 max-w-sm mx-auto">
                <Lock className="w-8 h-8 text-slate-355 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No Earned Badges Yet</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                  Earn level benchmarks, pass quizzes, and write practice code to collect badges.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {badges.map((badge) => (
                  <div key={badge.id} className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl flex gap-3 items-start">
                    <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shrink-0">
                      {getBadgeIcon(badge.iconName)}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{badge.name}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[7px] font-extrabold uppercase border ${getRarityStyle(badge.rarity)}`}>
                          {badge.rarity}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{badge.description}</p>
                      <span className="text-[8px] font-semibold text-emerald-600 dark:text-emerald-400 block">Earned {badge.earnedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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

// Mock trash icon locally to prevent compilation issues
const Trash2: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default Profile;
