import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Sparkles,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Save,
  Award,
  BookOpen,
  Code,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Flame,
  Palette,
  CheckCircle2,
  Radio,
  QrCode,
  Smartphone,
  Tablet,
  Monitor,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { CertificateService, XPService, AchievementService } from '@/services/achievementService';
import { useNavigate } from 'react-router-dom';

const Github: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
}

export interface PortfolioExperience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface PortfolioEducation {
  id: string;
  degree: string;
  institution: string;
  year: string;
  score?: string;
}

export const PortfolioBuilder: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const userId = user?.uid || 'default_student';

  // 1. Core Profile Identity State
  const [fullName, setFullName] = useState(userProfile?.name || user?.displayName || 'Student Developer');
  const [headline, setHeadline] = useState(
    userProfile?.bio || 'Full-Stack Developer & AI Systems Specialist | Building Scalable Cloud Apps'
  );
  const [handle, setHandle] = useState(() => {
    return (
      localStorage.getItem('shaivika_portfolio_handle') ||
      user?.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9_-]/g, '') ||
      'developer'
    );
  });
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [location, setLocation] = useState('Hyderabad, India');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.photoURL || user?.photoURL || '');
  const [aboutBio, setAboutBio] = useState(
    'Passionate technologist mastering Linux kernel systems, distributed cloud platforms, and generative AI foundations. Certified by Shaivika AI Foundation with proven project implementations.'
  );

  // 2. Social Profiles
  const [githubUrl, setGithubUrl] = useState(
    localStorage.getItem('shaivika_portfolio_github') ||
      (user?.email ? `https://github.com/${user.email.split('@')[0]}` : '')
  );
  const [linkedinUrl, setLinkedinUrl] = useState(
    localStorage.getItem('shaivika_portfolio_linkedin') || ''
  );
  const [websiteUrl, setWebsiteUrl] = useState(
    localStorage.getItem('shaivika_portfolio_website') || ''
  );

  // 3. Technical Skills
  const [skills, setSkills] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shaivika_portfolio_skills');
      return saved
        ? JSON.parse(saved)
        : ['Linux Systems', 'TypeScript', 'React.js', 'Node.js Express', 'PostgreSQL', 'Docker', 'Git & CI/CD', 'AI Foundation'];
    } catch {
      return ['Linux Systems', 'TypeScript', 'React.js', 'Node.js Express', 'PostgreSQL', 'Docker', 'Git & CI/CD', 'AI Foundation'];
    }
  });
  const [newSkillInput, setNewSkillInput] = useState('');

  // 4. Projects
  const [projects, setProjects] = useState<PortfolioProject[]>(() => {
    try {
      const saved = localStorage.getItem('shaivika_portfolio_projects');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'p1',
              title: 'KaizenQ AI Classroom & Learning Engine',
              description: 'Real-time WebSocket interactive learning platform with telemetry, AI tutor assistance, and live socket sync.',
              tags: ['React', 'TypeScript', 'Socket.IO', 'TailwindCSS'],
              githubUrl: 'https://github.com',
              liveUrl: 'https://www.kaizenq.in',
              featured: true,
            },
            {
              id: 'p2',
              title: 'Cloud DevOps Sandbox & CLI Orchestration',
              description: 'Automated container sandbox environment executing secure Linux bash scripts and kernel command logging.',
              tags: ['Linux', 'Docker', 'Bash', 'Express'],
              githubUrl: 'https://github.com',
              featured: false,
            },
          ];
    } catch {
      return [];
    }
  });

  // 5. Work Experience & Education
  const [experiences, setExperiences] = useState<PortfolioExperience[]>([
    {
      id: 'e1',
      role: 'Junior Cloud & AI Intern',
      company: 'Shaivika AI Foundation Innovation Lab',
      duration: '2026 - Present',
      description: 'Building micro-benchmarks for AI agent tool execution and automating verified certificate delivery pipelines.',
    },
  ]);

  const [educations, setEducations] = useState<PortfolioEducation[]>([
    {
      id: 'ed1',
      degree: 'B.Tech in Computer Science & AI',
      institution: 'Siddharth Institute of Engineering & Technology',
      year: '2023 - 2027',
      score: '9.2 CGPA',
    },
  ]);

  // 6. Theme & Accent Settings
  const [accentColor, setAccentColor] = useState<'cyan' | 'purple' | 'emerald' | 'amber' | 'rose'>('cyan');
  const [isPublished, setIsPublished] = useState(() => {
    return localStorage.getItem('shaivika_portfolio_published') === 'true';
  });

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [activeBuilderTab, setActiveBuilderTab] = useState<'identity' | 'skills' | 'projects' | 'experience' | 'theme'>('identity');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // LMS Telemetry data
  const [userCertificates, setUserCertificates] = useState<any[]>([]);
  const [userXp, setUserXp] = useState(1500);

  // Load from backend & local storage on mount
  useEffect(() => {
    const certService = new CertificateService();
    const xpService = new XPService();
    setUserCertificates(certService.getCertificates(userId));
    setUserXp(xpService.getXPPoints(userId));

    // Fetch cloud portfolio if available
    fetch(`${API_BASE_URL}/portfolio/me?studentId=${userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && data.portfolio) {
          const p = data.portfolio;
          if (p.fullName) setFullName(p.fullName);
          if (p.headline) setHeadline(p.headline);
          if (p.bio) setAboutBio(p.bio);
          if (p.customHandle) setHandle(p.customHandle);
          if (p.githubUrl) setGithubUrl(p.githubUrl);
          if (p.linkedinUrl) setLinkedinUrl(p.linkedinUrl);
          if (p.websiteUrl) setWebsiteUrl(p.websiteUrl);
          if (p.skills && Array.isArray(p.skills)) setSkills(p.skills);
          if (p.projects && Array.isArray(p.projects)) setProjects(p.projects);
          if (p.accentColor) setAccentColor(p.accentColor);
          if (typeof p.isPublished === 'boolean') setIsPublished(p.isPublished);
        }
      })
      .catch(() => {
        // Fallback to local storage
      });
  }, [userId]);

  const publicPortfolioUrl = `https://www.kaizenq.in/portfolio/${handle || userId}`;

  // 1. Auto-Import Credentials from LMS
  const handleAutoImportLMS = () => {
    const certService = new CertificateService();
    const certs = certService.getCertificates(userId);
    const xpService = new XPService();
    const pts = xpService.getXPPoints(userId);

    const importedSkills = new Set(skills);
    importedSkills.add('Linux Systems');
    importedSkills.add('Git & GitHub');
    importedSkills.add('AI Foundations');
    importedSkills.add('Database Systems (DBMS)');
    importedSkills.add('Full-Stack Web Engineering');

    setSkills(Array.from(importedSkills));
    setUserCertificates(certs);
    setUserXp(pts);

    toast.success(`⚡ Auto-imported ${certs.length} verified certificates and updated skills from Kaizen Q LMS!`);
  };

  // 2. Add / Edit Project
  const handleSaveProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const pTitle = (form.elements.namedItem('pTitle') as HTMLInputElement).value.trim();
    const pDesc = (form.elements.namedItem('pDesc') as HTMLTextAreaElement).value.trim();
    const pTags = (form.elements.namedItem('pTags') as HTMLInputElement).value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const pGithub = (form.elements.namedItem('pGithub') as HTMLInputElement).value.trim();
    const pLive = (form.elements.namedItem('pLive') as HTMLInputElement).value.trim();
    const pFeatured = (form.elements.namedItem('pFeatured') as HTMLInputElement).checked;

    if (!pTitle || !pDesc) {
      toast.error('Please enter a project title and description.');
      return;
    }

    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? { ...p, title: pTitle, description: pDesc, tags: pTags, githubUrl: pGithub, liveUrl: pLive, featured: pFeatured }
            : p
        )
      );
      toast.success(`Updated "${pTitle}"!`);
    } else {
      const newProj: PortfolioProject = {
        id: `proj_${Date.now()}`,
        title: pTitle,
        description: pDesc,
        tags: pTags.length ? pTags : ['TypeScript', 'React'],
        githubUrl: pGithub,
        liveUrl: pLive,
        featured: pFeatured,
      };
      setProjects((prev) => [newProj, ...prev]);
      toast.success(`Added project "${pTitle}"!`);
    }

    setShowProjectModal(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.info('Project removed from portfolio.');
  };

  // 3. Add Skill Tag
  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput('');
      toast.success(`Added skill "${trimmed}"!`);
    } else {
      toast.warning('Skill already listed in your portfolio.');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // 4. Save & Publish to Cloud Database
  const handleSaveAndPublish = async (publishOverride?: boolean) => {
    setIsSaving(true);
    const targetPublished = publishOverride !== undefined ? publishOverride : isPublished;

    // Cache locally
    localStorage.setItem('shaivika_portfolio_handle', handle);
    localStorage.setItem('shaivika_portfolio_github', githubUrl);
    localStorage.setItem('shaivika_portfolio_linkedin', linkedinUrl);
    localStorage.setItem('shaivika_portfolio_website', websiteUrl);
    localStorage.setItem('shaivika_portfolio_bio', aboutBio);
    localStorage.setItem('shaivika_portfolio_published', String(targetPublished));
    localStorage.setItem('shaivika_portfolio_skills', JSON.stringify(skills));
    localStorage.setItem('shaivika_portfolio_projects', JSON.stringify(projects));

    const payload = {
      studentId: userId,
      fullName,
      headline,
      bio: aboutBio,
      customHandle: handle,
      githubUrl,
      linkedinUrl,
      websiteUrl,
      phone,
      location,
      skills,
      projects,
      experiences,
      educations,
      accentColor,
      isPublished: targetPublished,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/portfolio/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsPublished(targetPublished);
        toast.success(
          targetPublished
            ? '🚀 Portfolio successfully saved & published live!'
            : '💾 Portfolio draft saved to cloud database.'
        );
      } else {
        toast.success('💾 Portfolio updated in local workspace cache.');
      }
    } catch {
      toast.success('💾 Portfolio saved locally.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicPortfolioUrl);
    setCopiedUrl(true);
    toast.success('📋 Public portfolio URL copied to clipboard!');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const getAccentGlow = () => {
    switch (accentColor) {
      case 'purple':
        return 'from-purple-600 to-indigo-600';
      case 'emerald':
        return 'from-emerald-600 to-teal-600';
      case 'amber':
        return 'from-amber-600 to-orange-600';
      case 'rose':
        return 'from-rose-600 to-red-600';
      default:
        return 'from-cyan-600 to-blue-600';
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto pb-16">
      {/* ── Top Header Banner & Publishing Status Bar ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Developer Showcase Builder
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isPublished
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              <Radio className="w-3 h-3 animate-pulse" />
              {isPublished ? 'Live & Published' : 'Draft Mode (Unpublished)'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
            Interactive Developer Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Build, customize, and publish your official developer portfolio on <strong className="text-cyan-300">kaizenq.in/portfolio/{handle}</strong>.
            Showcase your verified LMS certificates, projects, and skills to recruiters worldwide.
          </p>

          {/* Vanity URL Bar */}
          <div className="flex items-center gap-2 pt-2">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300 truncate max-w-md">
              <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate">{publicPortfolioUrl}</span>
            </div>
            <button
              onClick={handleCopyUrl}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
              title="Copy URL"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={`/portfolio/${handle || userId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition-all shadow-sm"
              title="Open Public Showcase"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="relative z-10 flex flex-wrap lg:flex-col gap-3 shrink-0">
          <button
            onClick={handleAutoImportLMS}
            className="flex-1 lg:flex-none px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Auto-Import LMS Data</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex-1 lg:flex-none px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>Share Portfolio</span>
          </button>

          <button
            onClick={() => setShowLivePreviewModal(true)}
            className="flex-1 lg:flex-none px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
          >
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>Live Preview</span>
          </button>

          <button
            onClick={() => handleSaveAndPublish(!isPublished)}
            disabled={isSaving}
            className={`flex-1 lg:flex-none px-5 py-2.5 rounded-2xl text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all active:scale-98 ${
              isPublished
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40'
                : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-cyan-950/40'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : isPublished ? 'Publish Updates' : 'Publish Portfolio Live'}</span>
          </button>
        </div>
      </div>

      {/* ── Builder Tab Navigation ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveBuilderTab('identity')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeBuilderTab === 'identity'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Identity & Bio</span>
        </button>

        <button
          onClick={() => setActiveBuilderTab('skills')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeBuilderTab === 'skills'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Skills & Verified LMS Badges</span>
        </button>

        <button
          onClick={() => setActiveBuilderTab('projects')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeBuilderTab === 'projects'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Featured Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveBuilderTab('experience')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeBuilderTab === 'experience'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Experience & Education</span>
        </button>

        <button
          onClick={() => setActiveBuilderTab('theme')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeBuilderTab === 'theme'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Theme & Vanity URL</span>
        </button>
      </div>

      {/* ── Tab Content Areas ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-6">
        {/* TAB 1: IDENTITY & BIO */}
        {activeBuilderTab === 'identity' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-heading font-bold text-white">Basic Profile & Headline</h3>
              <p className="text-xs text-slate-400 font-medium">Define your public brand, avatar, headline, and contact channels.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-cyan-500 focus:outline-hidden"
                  placeholder="e.g. Manoj Achari"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Professional Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-cyan-500 focus:outline-hidden"
                  placeholder="e.g. AI Engineer & Cloud Architect"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Public Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-cyan-500 focus:outline-hidden"
                  placeholder="name@gmail.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Location / City</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-cyan-500 focus:outline-hidden"
                  placeholder="Hyderabad, India"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">GitHub Profile URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-cyan-500 focus:outline-hidden"
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-cyan-500 focus:outline-hidden"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">About Me / Professional Summary</label>
              <textarea
                rows={4}
                value={aboutBio}
                onChange={(e) => setAboutBio(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-cyan-500 focus:outline-hidden leading-relaxed"
                placeholder="Write a concise overview of your background, technical focus, and achievements..."
              />
            </div>
          </div>
        )}

        {/* TAB 2: SKILLS & LMS BADGES */}
        {activeBuilderTab === 'skills' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-heading font-bold text-white">Technical Skills & Verified LMS Badges</h3>
              <p className="text-xs text-slate-400 font-medium">Add technical skills tags and view verified certifications earned on Kaizen Q.</p>
            </div>

            {/* Skills Tag Input */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <label className="text-xs font-bold text-slate-300">Add Technical Skills & Tooling</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:border-cyan-500 focus:outline-hidden"
                  placeholder="e.g. Kubernetes, PyTorch, GraphQL, Redis (Press Enter)"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>

              {/* Tag Cloud */}
              <div className="flex flex-wrap gap-2 pt-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 text-xs font-bold shadow-xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-500 hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Verified Certifications Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Verified LMS Credentials ({userCertificates.length})</span>
                </h4>
                <button
                  onClick={handleAutoImportLMS}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                >
                  Refresh LMS Records
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userCertificates.length > 0 ? (
                  userCertificates.map((cert) => (
                    <div
                      key={cert.id || cert.verificationId}
                      className="p-4 rounded-2xl bg-slate-950 border border-amber-500/20 flex items-start gap-3.5 shadow-md"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-white truncate">{cert.courseTitle}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">Issuer: Shaivika AI Foundation Faculty</p>
                        <span className="inline-block mt-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-md">
                          {cert.verificationId}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                    No certificates earned yet. Complete courses on Kaizen Q to unlock verified credentials on your portfolio!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROJECTS */}
        {activeBuilderTab === 'projects' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-heading font-bold text-white">Featured Projects Showcase</h3>
                <p className="text-xs text-slate-400 font-medium">Highlight your top development builds, live demos, and open source repositories.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingProject(null);
                  setShowProjectModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group hover:border-slate-700 transition-all shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                        {proj.featured && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">{proj.description}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProject(proj);
                          setShowProjectModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-slate-300 text-[10px] font-bold border border-slate-800">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2 text-xs font-semibold">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Source</span>
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EXPERIENCE & EDUCATION */}
        {activeBuilderTab === 'experience' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-heading font-bold text-white">Experience & Academic Background</h3>
              <p className="text-xs text-slate-400 font-medium">Showcase your internships, open source contributions, and university education.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Experience */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <span>Work Experience</span>
                </h4>
                {experiences.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <h5 className="text-xs font-bold text-white">{exp.role}</h5>
                    <p className="text-[11px] text-cyan-400 font-semibold">{exp.company} • {exp.duration}</p>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">{exp.description}</p>
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  <span>Education</span>
                </h4>
                {educations.map((ed) => (
                  <div key={ed.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <h5 className="text-xs font-bold text-white">{ed.degree}</h5>
                    <p className="text-[11px] text-indigo-400 font-semibold">{ed.institution} • {ed.year}</p>
                    {ed.score && <span className="text-[10px] text-slate-400 font-mono">Academic Score: {ed.score}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: THEME & VANITY URL */}
        {activeBuilderTab === 'theme' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-heading font-bold text-white">Visual Styling & Custom Vanity Handle</h3>
              <p className="text-xs text-slate-400 font-medium">Choose your portfolio theme accent color and personalized public URL handle.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vanity Handle */}
              <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <label className="text-xs font-bold text-slate-300">Vanity Username / Handle</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">kaizenq.in/portfolio/</span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 text-xs font-mono font-bold focus:border-cyan-500 focus:outline-hidden"
                    placeholder="manoj-achari"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Lowercase letters, numbers, hyphens, and underscores only.</p>
              </div>

              {/* Theme Color Palette */}
              <div className="space-y-3 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <label className="text-xs font-bold text-slate-300">Accent Color Theme</label>
                <div className="flex items-center gap-3 pt-1">
                  {[
                    { id: 'cyan', label: 'Cyber Cyan', bg: 'bg-cyan-500', ring: 'ring-cyan-500' },
                    { id: 'purple', label: 'Electric Purple', bg: 'bg-purple-500', ring: 'ring-purple-500' },
                    { id: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-500', ring: 'ring-emerald-500' },
                    { id: 'amber', label: 'Amber Gold', bg: 'bg-amber-500', ring: 'ring-amber-500' },
                    { id: 'rose', label: 'Rose Ruby', bg: 'bg-rose-500', ring: 'ring-rose-500' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAccentColor(t.id as any)}
                      className={`w-9 h-9 rounded-xl ${t.bg} transition-all cursor-pointer flex items-center justify-center ${
                        accentColor === t.id ? `ring-3 ${t.ring} scale-110 shadow-lg` : 'opacity-70 hover:opacity-100'
                      }`}
                      title={t.label}
                    >
                      {accentColor === t.id && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save / Actions Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => handleSaveAndPublish(false)}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Save Draft (Offline)
          </button>

          <button
            type="button"
            onClick={() => handleSaveAndPublish(true)}
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-900/40 active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save & Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* ── PROJECT ADD/EDIT MODAL ── */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-bold text-white">
                {editingProject ? 'Edit Project Details' : 'Add New Showcase Project'}
              </h3>
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Project Title *</label>
                <input
                  name="pTitle"
                  defaultValue={editingProject?.title || ''}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-cyan-500 focus:outline-hidden"
                  placeholder="e.g. Distributed Task Queue"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Project Description *</label>
                <textarea
                  name="pDesc"
                  rows={3}
                  defaultValue={editingProject?.description || ''}
                  required
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-cyan-500 focus:outline-hidden"
                  placeholder="Explain the problem solved, architecture, and impact..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Tech Stack Tags (Comma separated)</label>
                <input
                  name="pTags"
                  defaultValue={editingProject?.tags.join(', ') || ''}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-cyan-500 focus:outline-hidden"
                  placeholder="React, TypeScript, Docker, Redis"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">GitHub Repository URL</label>
                  <input
                    name="pGithub"
                    defaultValue={editingProject?.githubUrl || ''}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-cyan-500 focus:outline-hidden"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Live Demo URL</label>
                  <input
                    name="pLive"
                    defaultValue={editingProject?.liveUrl || ''}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-cyan-500 focus:outline-hidden"
                    placeholder="https://app.demo.com"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pFeatured"
                  name="pFeatured"
                  defaultChecked={editingProject?.featured}
                  className="w-4 h-4 rounded-md accent-cyan-500 cursor-pointer"
                />
                <label htmlFor="pFeatured" className="text-xs font-bold text-slate-300 cursor-pointer">
                  Mark as Featured Project on Portfolio Hero
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SHARE MODAL ── */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Share Public Portfolio</h3>
                  <p className="text-[11px] text-slate-400">Share your live developer showcase with recruiters</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-cyan-300 truncate">{publicPortfolioUrl}</span>
              <button
                onClick={handleCopyUrl}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs"
              >
                {copiedUrl ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicPortfolioUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out my verified developer portfolio: ${publicPortfolioUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1fa851] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>

            <a
              href={`/portfolio/${handle || userId}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 text-center"
            >
              <span>Open Public Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* ── LIVE PREVIEW MODAL ── */}
      {showLivePreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl flex flex-col shadow-2xl text-white overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Top Bar with Device Switchers */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-white">Live Portfolio Preview</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800">
                  /portfolio/{handle}
                </span>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                    previewDevice === 'desktop' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                    previewDevice === 'tablet' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                    previewDevice === 'mobile' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowLivePreviewModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Live Frame */}
            <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-y-auto">
              <div
                className={`h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
                  previewDevice === 'mobile'
                    ? 'w-[375px]'
                    : previewDevice === 'tablet'
                    ? 'w-[768px]'
                    : 'w-full'
                }`}
              >
                <iframe
                  src={`/portfolio/${handle || userId}`}
                  title="Portfolio Live Preview"
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioBuilder;
