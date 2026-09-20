import React, { useState, useEffect } from 'react';
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
  Phone,
  Palette,
  Radio,
  Smartphone,
  Tablet,
  Monitor,
  Upload,
  Mail,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { CertificateService } from '@/services/achievementService';
import { CheckoutModal } from '../courses/CheckoutModal';

const Github: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
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
  const userId = userProfile?.uid || user?.uid || '';

  const getStorageKey = (key: string) => {
    return userId ? `shaivika_portfolio_${userId}_${key}` : `shaivika_portfolio_${key}`;
  };

  // 1. Core Profile Identity State - Defaults to Active Logged-in User
  const [fullName, setFullName] = useState(() => {
    return (
      userProfile?.name ||
      user?.displayName ||
      (user?.email ? user.email.split('@')[0] : 'Developer')
    );
  });
  const [headline, setHeadline] = useState(() => {
    return (
      userProfile?.headline ||
      userProfile?.bio ||
      'Full-Stack Developer & Software Engineer | Building Scalable Cloud Apps'
    );
  });
  const [handle, setHandle] = useState(() => {
    return (
      user?.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9_-]/g, '') ||
      'developer'
    );
  });
  const [email, setEmail] = useState(() => user?.email || userProfile?.email || '');
  const [location, setLocation] = useState('India');
  const [aboutBio, setAboutBio] = useState(
    'Passionate technologist mastering modern cloud systems, distributed platforms, and full-stack software architectures.'
  );
  const [avatarUrl, setAvatarUrl] = useState(() => {
    return (
      userProfile?.photoURL ||
      user?.photoURL ||
      ''
    );
  });

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        localStorage.setItem(getStorageKey('avatar'), result);
        toast.success('Profile image uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  // 2. Social Profiles
  const [githubUrl, setGithubUrl] = useState(() =>
    userProfile?.githubUsername
      ? `https://github.com/${userProfile.githubUsername}`
      : (user?.email ? `https://github.com/${user.email.split('@')[0]}` : '')
  );
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Auto-sync form changes live to user-scoped localStorage
  useEffect(() => {
    if (!userId) return;
    if (fullName) localStorage.setItem(getStorageKey('fullname'), fullName);
    if (headline) localStorage.setItem(getStorageKey('headline'), headline);
    if (location) localStorage.setItem(getStorageKey('location'), location);
    if (aboutBio) localStorage.setItem(getStorageKey('bio'), aboutBio);
    if (handle) localStorage.setItem(getStorageKey('handle'), handle);
    if (avatarUrl) localStorage.setItem(getStorageKey('avatar'), avatarUrl);
    if (githubUrl) localStorage.setItem(getStorageKey('github'), githubUrl);
    if (linkedinUrl) localStorage.setItem(getStorageKey('linkedin'), linkedinUrl);
    if (websiteUrl) localStorage.setItem(getStorageKey('website'), websiteUrl);
  }, [userId, fullName, headline, location, aboutBio, handle, avatarUrl, githubUrl, linkedinUrl, websiteUrl]);

  // 3. Technical Skills
  const [skills, setSkills] = useState<string[]>([
    'Linux Systems', 'TypeScript', 'React.js', 'Node.js Express', 'PostgreSQL', 'Docker', 'Git & CI/CD', 'AI Foundation'
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');

  // 4. Projects
  const [projects, setProjects] = useState<PortfolioProject[]>([
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
  ]);

  // 5. Work Experience & Education
  const [experiences] = useState<PortfolioExperience[]>([
    {
      id: 'e1',
      role: 'Junior Cloud & AI Intern',
      company: 'KaizenQ Innovation Lab',
      duration: '2025 - Present',
      description: 'Building micro-benchmarks for software execution and automating verified certificate delivery pipelines.',
    },
  ]);

  const [educations] = useState<PortfolioEducation[]>([
    {
      id: 'ed1',
      degree: 'B.Tech in Computer Science & Engineering',
      institution: 'Institute of Engineering & Technology',
      year: '2023 - 2027',
      score: '9.0 CGPA',
    },
  ]);

  // 6. Theme & Accent Settings
  const [accentColor, setAccentColor] = useState<'cyan' | 'purple' | 'emerald' | 'amber' | 'rose'>('cyan');
  const [isPublished, setIsPublished] = useState(false);

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [activeBuilderTab, setActiveBuilderTab] = useState<'identity' | 'skills' | 'projects' | 'experience' | 'theme'>('identity');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // VIP Unlock States
  const [isProUnlocked] = useState<boolean>(true);
  const [showVipModal, setShowVipModal] = useState(false);

  // LMS Telemetry data
  const [userCertificates, setUserCertificates] = useState<any[]>([]);

  // Load from backend & user-scoped local storage on mount / user change
  useEffect(() => {
    if (!userId) return;
    const certService = new CertificateService();
    setUserCertificates(certService.getCertificates(userId));

    // 1. Check user-scoped local storage
    const scopedName = localStorage.getItem(getStorageKey('fullname'));
    setFullName(scopedName || userProfile?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Developer'));

    const scopedEmail = user?.email || userProfile?.email || '';
    setEmail(scopedEmail);

    const scopedHandle = localStorage.getItem(getStorageKey('handle'));
    const defaultHandle = user?.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '') : 'developer';
    setHandle(scopedHandle || defaultHandle);

    const scopedHeadline = localStorage.getItem(getStorageKey('headline'));
    setHeadline(scopedHeadline || userProfile?.headline || userProfile?.bio || 'Full-Stack Developer & Software Engineer | Building Scalable Cloud Apps');

    const scopedBio = localStorage.getItem(getStorageKey('bio'));
    if (scopedBio) setAboutBio(scopedBio);

    const scopedAvatar = localStorage.getItem(getStorageKey('avatar'));
    setAvatarUrl(scopedAvatar || userProfile?.photoURL || user?.photoURL || '');

    const scopedGithub = localStorage.getItem(getStorageKey('github'));
    setGithubUrl(scopedGithub || (userProfile?.githubUsername ? `https://github.com/${userProfile.githubUsername}` : (user?.email ? `https://github.com/${user.email.split('@')[0]}` : '')));

    const scopedLinkedin = localStorage.getItem(getStorageKey('linkedin'));
    if (scopedLinkedin !== null) setLinkedinUrl(scopedLinkedin);

    const scopedWebsite = localStorage.getItem(getStorageKey('website'));
    if (scopedWebsite !== null) setWebsiteUrl(scopedWebsite);

    const scopedLocation = localStorage.getItem(getStorageKey('location'));
    if (scopedLocation) setLocation(scopedLocation);

    const scopedSkills = localStorage.getItem(getStorageKey('skills'));
    if (scopedSkills) {
      try { setSkills(JSON.parse(scopedSkills)); } catch {}
    }

    const scopedProjects = localStorage.getItem(getStorageKey('projects'));
    if (scopedProjects) {
      try { setProjects(JSON.parse(scopedProjects)); } catch {}
    }

    const scopedPublished = localStorage.getItem(getStorageKey('published'));
    if (scopedPublished !== null) setIsPublished(scopedPublished === 'true');

    // 2. Fetch authoritative cloud portfolio if available
    fetch(`${API_BASE_URL}/portfolio/me?studentId=${userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const p = data?.data || data?.portfolio;
        if (p) {
          if (p.fullName || p.name) setFullName(p.fullName || p.name);
          if (p.headline || p.title) setHeadline(p.headline || p.title);
          if (p.bio || p.aboutBio) setAboutBio(p.bio || p.aboutBio);
          if (p.customHandle || p.handle) setHandle(p.customHandle || p.handle);
          if (p.githubUrl || p.githubLink) setGithubUrl(p.githubUrl || p.githubLink);
          if (p.linkedinUrl || p.linkedinLink) setLinkedinUrl(p.linkedinUrl || p.linkedinLink);
          if (p.websiteUrl || p.websiteLink) setWebsiteUrl(p.websiteUrl || p.websiteLink);
          if (p.skills && Array.isArray(p.skills) && p.skills.length > 0) setSkills(p.skills);
          if (p.projects && Array.isArray(p.projects) && p.projects.length > 0) setProjects(p.projects);
          if (p.accentColor) setAccentColor(p.accentColor);
          if (typeof p.isPublished === 'boolean') setIsPublished(p.isPublished);
          if (p.avatarUrl || p.photoURL || p.avatar) setAvatarUrl(p.avatarUrl || p.photoURL || p.avatar);
          if (p.location) setLocation(p.location);
        }
      })
      .catch(() => {
        // Fallback to local storage
      });
  }, [userId, userProfile?.name, userProfile?.email, user?.email]);

  const publicPortfolioUrl = `https://www.kaizenq.in/portfolio/${handle || userId}`;

  // 1. Auto-Import Credentials from LMS
  const handleAutoImportLMS = () => {
    const certService = new CertificateService();
    const certs = certService.getCertificates(userId);

    const importedSkills = new Set(skills);
    importedSkills.add('Linux Systems');
    importedSkills.add('Git & GitHub');
    importedSkills.add('AI Foundations');
    importedSkills.add('Database Systems (DBMS)');
    importedSkills.add('Full-Stack Web Engineering');

    setSkills(Array.from(importedSkills));
    setUserCertificates(certs);

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
    localStorage.setItem(getStorageKey('avatar'), avatarUrl);
    localStorage.setItem(getStorageKey('fullname'), fullName);
    localStorage.setItem(getStorageKey('headline'), headline);
    localStorage.setItem(getStorageKey('location'), location);
    localStorage.setItem(getStorageKey('handle'), handle);
    localStorage.setItem(getStorageKey('github'), githubUrl);
    localStorage.setItem(getStorageKey('linkedin'), linkedinUrl);
    localStorage.setItem(getStorageKey('website'), websiteUrl);
    localStorage.setItem(getStorageKey('bio'), aboutBio);
    localStorage.setItem(getStorageKey('published'), String(targetPublished));
    localStorage.setItem(getStorageKey('skills'), JSON.stringify(skills));
    localStorage.setItem(getStorageKey('projects'), JSON.stringify(projects));

    const payload = {
      studentId: userId,
      name: fullName,
      fullName,
      headline,
      bio: aboutBio,
      avatarUrl,
      photoURL: avatarUrl,
      avatar: avatarUrl,
      customHandle: handle,
      githubUrl,
      githubLink: githubUrl,
      linkedinUrl,
      linkedinLink: linkedinUrl,
      websiteUrl,
      websiteLink: websiteUrl,
      phone: userProfile?.phone || '',
      location,
      skills,
      projects,
      experiences,
      experience: experiences,
      educations,
      education: educations,
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
            <span
              onClick={() => { if (!isProUnlocked) setShowVipModal(true); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all hover:scale-105 ${
                isProUnlocked
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                  : 'bg-gradient-to-r from-amber-500/30 via-indigo-500/20 to-amber-500/30 text-amber-200 border-amber-500/50 shadow-md animate-pulse'
              }`}
              title="Manage VIP All-Access Pro Pass"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {isProUnlocked ? 'VIP Unlocked 👑' : 'Upgrade to VIP Pass 👑'}
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

            {/* Profile Avatar Upload Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 via-blue-600 to-cyan-400 p-1 shrink-0 shadow-lg overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover rounded-[14px]" />
                ) : (
                  <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-3xl font-black text-white">
                    {(fullName || 'H').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white">Public Profile Picture / Avatar</h4>
                <p className="text-xs text-slate-400 font-medium">Upload a professional photo or paste an image URL. This photo will reflect live on your public showcase.</p>
                
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-95">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
                  </label>

                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Or paste image URL (https://...)"
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:border-cyan-500 focus:outline-hidden min-w-[240px] flex-1"
                  />
                  
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl('');
                        localStorage.removeItem('shaivika_portfolio_avatar');
                        toast.info('Avatar reset to default.');
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 text-xs font-bold transition-all cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
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
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Share Public Portfolio</h3>
                  <p className="text-[11px] text-slate-400">Promote your verified developer showcase to recruiters worldwide</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border border-amber-500/40 space-y-3 shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                    isProUnlocked ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {isProUnlocked ? 'VIP UNLOCKED 👑' : 'VIP PASS'}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {isProUnlocked ? 'VIP All-Access Active' : 'Unlock VIP All-Access Pro Pass'}
                  </span>
                </div>
                {!isProUnlocked && (
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="line-through text-slate-500">₹2,999</span>
                    <span className="text-emerald-400 font-extrabold text-sm">₹1,299</span>
                  </div>
                )}
              </div>

              {!isProUnlocked ? (
                <div className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-2">
                  <p className="text-xs text-slate-400 flex-1">Use code <strong className="text-amber-400 font-mono">VIP300</strong> at checkout → ₹300 OFF!</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowShareModal(false);
                      setShowVipModal(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
                  >
                    Unlock VIP Pass 👑
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 pt-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>All VIP features, Portfolio & Recruiter Suite active for your account.</span>
                </div>
              )}
            </div>

            {/* Link Copy Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-cyan-300 truncate select-all">{publicPortfolioUrl}</span>
              <button
                onClick={handleCopyUrl}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs transition-all active:scale-95"
              >
                {copiedUrl ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            {/* Multi-Channel Share Suite */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Broadcast & Recruiter Channels</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {/* 1. LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicPortfolioUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>

                {/* 2. X / Twitter */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my verified developer portfolio & live engineering projects on KaizenQ: ${publicPortfolioUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>X / Twitter</span>
                </a>

                {/* 3. WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🚀 Check out my verified developer portfolio on KaizenQ: ${publicPortfolioUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1fa851] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>

                {/* 4. Email Recruiter */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(`Developer Portfolio - ${fullName || 'KALIGIRI HEMADRI'}`)}&body=${encodeURIComponent(`Hi,\n\nCheck out my verified developer portfolio and live engineering projects:\n${publicPortfolioUrl}\n\nBest regards,\n${fullName || 'KALIGIRI HEMADRI'}`)}`}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Recruiter</span>
                </a>

                {/* 5. GitHub README Badge */}
                <button
                  type="button"
                  onClick={() => {
                    const badgeCode = `[![Portfolio](https://img.shields.io/badge/KaizenQ-Verified%20Portfolio-00F2FE?style=for-the-badge&logo=github)](${publicPortfolioUrl})`;
                    navigator.clipboard.writeText(badgeCode);
                    toast.success('GitHub README Badge Markdown copied to clipboard!');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Code className="w-4 h-4 text-cyan-400" />
                  <span>GitHub Badge</span>
                </button>

                {/* 6. Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(publicPortfolioUrl)}&text=${encodeURIComponent(`Verified Developer Portfolio of ${fullName || 'KALIGIRI HEMADRI'}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#229ED9] hover:bg-[#1a85b8] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Globe className="w-4 h-4" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>

            <a
              href={`/portfolio/${handle || userId}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 text-center transition-all cursor-pointer"
            >
              <span>Open Public Page Live</span>
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
      <CheckoutModal
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
        courses={[{ id: 'vip_pass_3m', title: 'VIP 3-Month All-Access Pro Pass' }]}
        totalPrice={1299}
      />
    </div>
  );
};

export default PortfolioBuilder;
