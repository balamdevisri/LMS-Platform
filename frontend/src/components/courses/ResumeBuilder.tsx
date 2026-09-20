import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Save, 
  Sparkles, 
  Plus, 
  Trash2, 
  Briefcase, 
  GraduationCap, 
  Wand2,
  LayoutTemplate,
  FolderGit2,
  Check,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { CertificateService } from '@/services/achievementService';
import { toast } from 'sonner';
import { CheckoutModal } from './CheckoutModal';
import { 
  RESUME_TEMPLATES_CONFIG, 
  ResumeTemplateRenderer 
} from './resume-templates/ResumeTemplates';
import type { 
  TemplateId, 
  ResumeData, 
  ExperienceItem, 
  EducationItem, 
  ProjectItem 
} from './resume-templates/ResumeTemplates';

export const ResumeBuilder: React.FC = () => {
  const { user, userProfile } = useAuth();
  const userId = userProfile?.uid || user?.uid || '';

  const getStorageKey = (key: string) => {
    return userId ? `shaivika_resume_${userId}_${key}` : `shaivika_resume_${key}`;
  };

  const [fullName, setFullName] = useState(() =>
    userProfile?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Student Scholar')
  );

  const [email, setEmail] = useState(() =>
    userProfile?.email || user?.email || ''
  );

  const [phone, setPhone] = useState(() => userProfile?.phone || '');
  const [location, setLocation] = useState('India');
  const [jobTitle, setJobTitle] = useState(() => userProfile?.headline || 'Full Stack & AI Engineer');
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState(() =>
    userProfile?.githubUsername
      ? `https://github.com/${userProfile.githubUsername}`
      : (user?.email ? `https://github.com/${user.email.split('@')[0]}` : '')
  );
  const [linkedin, setLinkedin] = useState('');
  const [summary, setSummary] = useState(
    'Dedicated engineering professional mastering system architecture, full stack React & Node.js development, and AI engineering practices.'
  );

  const [skills, setSkills] = useState<string[]>([
    'React.js',
    'TypeScript',
    'Node.js Express',
    'Python AI Engineering',
    'Git & GitHub',
    'Linux Systems',
    'SQL Database Normalization'
  ]);

  const [newSkill, setNewSkill] = useState('');

  const [experience, setExperience] = useState<ExperienceItem[]>([
    {
      role: 'Full Stack & AI Engineer Intern',
      company: 'Software Innovation Labs',
      duration: '2025 - Present',
      desc: 'Implemented modular course learning systems, optimized database queries, and integrated real-time WebSocket speed leaderboard telemetry.',
    },
  ]);

  const [education, setEducation] = useState<EducationItem[]>([
    {
      degree: 'Bachelor of Technology in Computer Science & AI',
      school: 'Institute of Engineering & Technology',
      duration: '2023 - 2027',
    },
  ]);

  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      name: 'KaizenQ AI LMS & Knowledge Studio',
      tech: 'React, Node.js, TypeScript, PostgreSQL, Gemini AI',
      link: 'https://github.com',
      desc: 'Engineered an interactive adaptive learning platform with real-time code sandboxes and AI automated tutor feedback.',
    },
  ]);

  const [certifications, setCertifications] = useState<string[]>([]);
  const [template, setTemplate] = useState<TemplateId>('overleaf_classic');

  const [newRole, setNewRole] = useState({ role: '', company: '', duration: '', desc: '' });
  const [newEd, setNewEd] = useState({ degree: '', school: '', duration: '' });
  const [newProj, setNewProj] = useState({ name: '', tech: '', link: '', desc: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [isVipUnlocked] = useState<boolean>(() =>
    localStorage.getItem('shaivika_vip_unlocked') === 'true' || userProfile?.role === 'admin'
  );

  // Load from user-scoped storage and cloud backend for the active user
  useEffect(() => {
    if (!userId) return;

    // 1. Initial hydration from user-scoped local storage
    const scopedName = localStorage.getItem(getStorageKey('fullname'));
    setFullName(scopedName || userProfile?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Student Scholar'));

    const scopedEmail = localStorage.getItem(getStorageKey('email'));
    setEmail(scopedEmail || userProfile?.email || user?.email || '');

    const scopedPhone = localStorage.getItem(getStorageKey('phone'));
    if (scopedPhone !== null) setPhone(scopedPhone);
    else if (userProfile?.phone) setPhone(userProfile.phone);

    const scopedLoc = localStorage.getItem(getStorageKey('location'));
    if (scopedLoc) setLocation(scopedLoc);

    const scopedTitle = localStorage.getItem(getStorageKey('title'));
    if (scopedTitle) setJobTitle(scopedTitle);
    else if (userProfile?.headline) setJobTitle(userProfile.headline);

    const scopedWebsite = localStorage.getItem(getStorageKey('website'));
    if (scopedWebsite !== null) setWebsite(scopedWebsite);

    const scopedGithub = localStorage.getItem(getStorageKey('github'));
    if (scopedGithub) setGithub(scopedGithub);
    else if (userProfile?.githubUsername) setGithub(`https://github.com/${userProfile.githubUsername}`);
    else if (user?.email) setGithub(`https://github.com/${user.email.split('@')[0]}`);

    const scopedLinkedin = localStorage.getItem(getStorageKey('linkedin'));
    if (scopedLinkedin !== null) setLinkedin(scopedLinkedin);

    const scopedSummary = localStorage.getItem(getStorageKey('summary'));
    if (scopedSummary) setSummary(scopedSummary);

    const scopedSkills = localStorage.getItem(getStorageKey('skills'));
    if (scopedSkills) {
      try { setSkills(JSON.parse(scopedSkills)); } catch {}
    }

    const scopedExp = localStorage.getItem(getStorageKey('experience'));
    if (scopedExp) {
      try { setExperience(JSON.parse(scopedExp)); } catch {}
    }

    const scopedEd = localStorage.getItem(getStorageKey('education'));
    if (scopedEd) {
      try { setEducation(JSON.parse(scopedEd)); } catch {}
    }

    const scopedProj = localStorage.getItem(getStorageKey('projects'));
    if (scopedProj) {
      try { setProjects(JSON.parse(scopedProj)); } catch {}
    }

    const scopedCert = localStorage.getItem(getStorageKey('certifications'));
    if (scopedCert) {
      try { setCertifications(JSON.parse(scopedCert)); } catch {}
    }

    const scopedTpl = localStorage.getItem(getStorageKey('template')) as TemplateId;
    if (scopedTpl && RESUME_TEMPLATES_CONFIG.some(t => t.id === scopedTpl)) {
      setTemplate(scopedTpl);
    }

    // 2. Authoritative backend resume fetch for this active user
    fetch(`${API_BASE_URL}/resume/me?studentId=${userId}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          const d = json.data;
          if (d.fullName) setFullName(d.fullName);
          if (d.email) setEmail(d.email);
          if (d.phone !== undefined) setPhone(d.phone);
          if (d.location) setLocation(d.location);
          if (d.title) setJobTitle(d.title);
          if (d.website !== undefined) setWebsite(d.website);
          if (d.github) setGithub(d.github);
          if (d.linkedin !== undefined) setLinkedin(d.linkedin);
          if (d.summary) setSummary(d.summary);
          if (Array.isArray(d.skills) && d.skills.length > 0) setSkills(d.skills);
          if (Array.isArray(d.experience) && d.experience.length > 0) setExperience(d.experience);
          if (Array.isArray(d.education) && d.education.length > 0) setEducation(d.education);
          if (Array.isArray(d.projects) && d.projects.length > 0) setProjects(d.projects);
          if (Array.isArray(d.certifications) && d.certifications.length > 0) setCertifications(d.certifications);
          if (d.template && RESUME_TEMPLATES_CONFIG.some(t => t.id === d.template)) {
            setTemplate(d.template as TemplateId);
          }
        }
      })
      .catch(() => {});
  }, [userId, userProfile?.name, userProfile?.email, user?.email]);

  const handleSave = async () => {
    setIsSaving(true);
    // 1. User-scoped LocalStorage
    localStorage.setItem(getStorageKey('fullname'), fullName);
    localStorage.setItem(getStorageKey('email'), email);
    localStorage.setItem(getStorageKey('phone'), phone);
    localStorage.setItem(getStorageKey('location'), location);
    localStorage.setItem(getStorageKey('title'), jobTitle);
    localStorage.setItem(getStorageKey('website'), website);
    localStorage.setItem(getStorageKey('github'), github);
    localStorage.setItem(getStorageKey('linkedin'), linkedin);
    localStorage.setItem(getStorageKey('summary'), summary);
    localStorage.setItem(getStorageKey('skills'), JSON.stringify(skills));
    localStorage.setItem(getStorageKey('experience'), JSON.stringify(experience));
    localStorage.setItem(getStorageKey('education'), JSON.stringify(education));
    localStorage.setItem(getStorageKey('projects'), JSON.stringify(projects));
    localStorage.setItem(getStorageKey('certifications'), JSON.stringify(certifications));
    localStorage.setItem(getStorageKey('template'), template);

    // 2. Database API
    try {
      let token: string | null = null;
      if (user) {
        try {
          token = await user.getIdToken();
        } catch {}
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${API_BASE_URL}/resume/me`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          studentId: userId,
          fullName,
          email,
          phone,
          location,
          title: jobTitle,
          website,
          github,
          linkedin,
          summary,
          skills,
          experience,
          education,
          projects,
          certifications,
          template,
        }),
      });

      toast.success('💾 Resume draft saved to cloud database & local workspace!');
    } catch {
      toast.success('💾 Resume saved locally.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoImport = () => {
    const certService = new CertificateService();
    const realCerts = certService.getCertificates(userId);
    
    if (realCerts.length > 0) {
      const importedCerts = realCerts.map(c => `KaizenQ LMS: ${c.courseTitle} (ID: ${c.verificationId})`);
      setCertifications(importedCerts);
      localStorage.setItem(getStorageKey('certifications'), JSON.stringify(importedCerts));
    }

    // Pull skills from portfolio if available
    try {
      const pSkillsRaw = localStorage.getItem(`shaivika_portfolio_${userId}_skills`) || localStorage.getItem('shaivika_portfolio_skills');
      if (pSkillsRaw) {
        const pSkills = JSON.parse(pSkillsRaw);
        if (Array.isArray(pSkills) && pSkills.length > 0) {
          const mergedSkills = Array.from(new Set([...skills, ...pSkills]));
          setSkills(mergedSkills);
          localStorage.setItem(getStorageKey('skills'), JSON.stringify(mergedSkills));
        }
      }
    } catch {}

    toast.success('⚡ Auto-imported verified certificates & skills into resume!');
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updated = [...skills, newSkill.trim()];
      setSkills(updated);
      setNewSkill('');
      localStorage.setItem(getStorageKey('skills'), JSON.stringify(updated));
    }
  };

  const handleRemoveSkill = (index: number) => {
    const updated = skills.filter((_, i) => i !== index);
    setSkills(updated);
    localStorage.setItem(getStorageKey('skills'), JSON.stringify(updated));
  };

  const handleAddExperience = () => {
    if (newRole.role && newRole.company) {
      const updated = [...experience, newRole];
      setExperience(updated);
      setNewRole({ role: '', company: '', duration: '', desc: '' });
      localStorage.setItem(getStorageKey('experience'), JSON.stringify(updated));
    }
  };

  const handleRemoveExperience = (index: number) => {
    const updated = experience.filter((_, i) => i !== index);
    setExperience(updated);
    localStorage.setItem(getStorageKey('experience'), JSON.stringify(updated));
  };

  const handleAddEducation = () => {
    if (newEd.degree && newEd.school) {
      const updated = [...education, newEd];
      setEducation(updated);
      setNewEd({ degree: '', school: '', duration: '' });
      localStorage.setItem(getStorageKey('education'), JSON.stringify(updated));
    }
  };

  const handleRemoveEducation = (index: number) => {
    const updated = education.filter((_, i) => i !== index);
    setEducation(updated);
    localStorage.setItem(getStorageKey('education'), JSON.stringify(updated));
  };

  const handleAddProject = () => {
    if (newProj.name) {
      const updated = [...projects, newProj];
      setProjects(updated);
      setNewProj({ name: '', tech: '', link: '', desc: '' });
      localStorage.setItem(getStorageKey('projects'), JSON.stringify(updated));
    }
  };

  const handleRemoveProject = (index: number) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
    localStorage.setItem(getStorageKey('projects'), JSON.stringify(updated));
  };

  const handleSelectTemplate = (id: TemplateId) => {
    setTemplate(id);
    localStorage.setItem(getStorageKey('template'), id);
    toast.success(`Applied template: ${RESUME_TEMPLATES_CONFIG.find(t => t.id === id)?.name}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const resumeData: ResumeData = {
    fullName,
    jobTitle,
    email,
    phone,
    location,
    website,
    github,
    linkedin,
    summary,
    skills,
    experience,
    education,
    projects,
    certifications,
  };

  return (
    <div className="space-y-8 font-sans text-slate-800 dark:text-zinc-100 animate-in fade-in duration-300">
      {/* Print styles injected directly for clean document export */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #shaivika-printable-resume, #shaivika-printable-resume * {
            visibility: visible;
          }
          #shaivika-printable-resume {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Banner Header */}
      <div className="no-print p-6 rounded-3xl border border-sky-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            <span>Interactive Resume Builder</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Build and export print-perfect ATS & LaTeX developer resumes with Shaivika verified credentials.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleAutoImport}
            className="px-3.5 py-2 text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer hover:bg-amber-100"
            title="Auto-import verified certificates and skills"
          >
            <Wand2 className="w-4 h-4 text-amber-500" />
            <span>Auto-Import Credentials</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF Export</span>
          </button>
        </div>
      </div>

      {/* Visual Template Switcher Bar */}
      <div className="no-print p-5 rounded-3xl border border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Choose Resume Layout & Style
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
            6 Professional Templates Available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {RESUME_TEMPLATES_CONFIG.map((t) => {
            const isSelected = template === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t.id)}
                className={`relative p-3 text-left rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {t.badge}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {t.name}
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-snug">
                  {t.tagline}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Editor (5 cols on lg) */}
        <div className="no-print lg:col-span-5 space-y-6">
          {/* Contact Details Editor */}
          <div className="p-6 rounded-3xl border border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span>Personal & Contact Info</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Job / Target Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">GitHub URL</label>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="p-6 rounded-3xl border border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Professional Summary</span>
            </h3>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full h-24 p-3.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none font-medium leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Tell recruiters about your core competencies..."
            />
          </div>

          {/* Core Technical Skills */}
          <div className="p-6 rounded-3xl border border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Skills Checklist
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                placeholder="Add new skill (e.g. Docker)..."
                className="flex-1 p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                onClick={handleAddSkill}
                className="px-3 py-2.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold cursor-pointer hover:bg-indigo-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  <span>{skill}</span>
                  <button onClick={() => handleRemoveSkill(index)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div className="p-6 rounded-3xl border border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-500" />
              <span>Professional Experience</span>
            </h3>

            {/* List of existing experience */}
            {experience.length > 0 && (
              <div className="space-y-2">
                {experience.map((exp, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-start gap-2">
                    <div className="text-xs">
                      <div className="font-bold text-slate-900 dark:text-white">{exp.role}</div>
                      <div className="text-[11px] text-slate-500">{exp.company} • {exp.duration}</div>
                    </div>
                    <button onClick={() => handleRemoveExperience(i)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
              <input
                type="text"
                placeholder="Role Title (e.g. Systems Engineer)"
                value={newRole.role}
                onChange={(e) => setNewRole({ ...newRole, role: e.target.value })}
                className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Company"
                  value={newRole.company}
                  onChange={(e) => setNewRole({ ...newRole, company: e.target.value })}
                  className="p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. 2025 - Present)"
                  value={newRole.duration}
                  onChange={(e) => setNewRole({ ...newRole, duration: e.target.value })}
                  className="p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <textarea
                placeholder="Key accomplishments (use new lines for bullet points)..."
                value={newRole.desc}
                onChange={(e) => setNewRole({ ...newRole, desc: e.target.value })}
                className="w-full h-16 p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                onClick={handleAddExperience}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Position</span>
              </button>
            </div>
          </div>

          {/* Featured Projects */}
          <div className="p-6 rounded-3xl border border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-purple-500" />
              <span>Key Projects & Portfolio</span>
            </h3>

            {projects.length > 0 && (
              <div className="space-y-2">
                {projects.map((proj, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-start gap-2">
                    <div className="text-xs">
                      <div className="font-bold text-slate-900 dark:text-white">{proj.name}</div>
                      <div className="text-[11px] text-slate-500">{proj.tech}</div>
                    </div>
                    <button onClick={() => handleRemoveProject(i)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
              <input
                type="text"
                placeholder="Project Name (e.g. Distributed Cache Engine)"
                value={newProj.name}
                onChange={(e) => setNewProj({ ...newProj, name: e.target.value })}
                className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Tech Stack (e.g. Go, Redis, Docker)"
                  value={newProj.tech}
                  onChange={(e) => setNewProj({ ...newProj, tech: e.target.value })}
                  className="p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <input
                  type="text"
                  placeholder="Project / Repo Link"
                  value={newProj.link}
                  onChange={(e) => setNewProj({ ...newProj, link: e.target.value })}
                  className="p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <textarea
                placeholder="Brief project description and achievements..."
                value={newProj.desc}
                onChange={(e) => setNewProj({ ...newProj, desc: e.target.value })}
                className="w-full h-16 p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                onClick={handleAddProject}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </div>
          </div>

          {/* Education timeline */}
          <div className="p-6 rounded-3xl border border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-500" />
              <span>Academic Education</span>
            </h3>

            {education.length > 0 && (
              <div className="space-y-2">
                {education.map((ed, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-start gap-2">
                    <div className="text-xs">
                      <div className="font-bold text-slate-900 dark:text-white">{ed.degree}</div>
                      <div className="text-[11px] text-slate-500">{ed.school} • {ed.duration}</div>
                    </div>
                    <button onClick={() => handleRemoveEducation(i)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
              <input
                type="text"
                placeholder="Degree Course (e.g. B.Tech Computer Science)"
                value={newEd.degree}
                onChange={(e) => setNewEd({ ...newEd, degree: e.target.value })}
                className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="School / University"
                  value={newEd.school}
                  onChange={(e) => setNewEd({ ...newEd, school: e.target.value })}
                  className="p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. 2023 - 2027)"
                  value={newEd.duration}
                  onChange={(e) => setNewEd({ ...newEd, duration: e.target.value })}
                  className="p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <button
                onClick={handleAddEducation}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Education Entry</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Printable Preview (7 cols on lg) */}
        <div className="lg:col-span-7 sticky top-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Live Printable Preview ({RESUME_TEMPLATES_CONFIG.find(t => t.id === template)?.name})
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>A4 / Letter Print Ready</span>
            </span>
          </div>

          <div 
            id="shaivika-printable-resume" 
            className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white shadow-2xl overflow-hidden min-h-[750px]"
          >
            <ResumeTemplateRenderer templateId={template} data={resumeData} />
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
        courses={[{ id: 'vip_pass_3m', title: 'VIP 3-Month All-Access Pro Pass' }]}
        totalPrice={1299}
      />
    </div>
  );
};
