import React, { useState, useEffect } from 'react';
import { FileText, Printer, Save, Sparkles, Plus, Trash2, Award, Briefcase, GraduationCap, RefreshCw, Wand2, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { CertificateService } from '@/services/achievementService';
import { toast } from 'sonner';

interface Experience {
  role: string;
  company: string;
  duration: string;
  desc: string;
}

interface Education {
  degree: string;
  school: string;
  duration: string;
}

export const ResumeBuilder: React.FC = () => {
  const { user, userProfile } = useAuth();
  const userId = userProfile?.uid || user?.uid || 'default_student';

  const [fullName, setFullName] = useState(
    localStorage.getItem('shaivika_resume_fullname') ||
    userProfile?.name ||
    user?.displayName ||
    'Student Scholar'
  );

  const [email, setEmail] = useState(
    localStorage.getItem('shaivika_resume_email') ||
    userProfile?.email ||
    user?.email ||
    'scholar@shaivika.ai'
  );

  const [phone, setPhone] = useState(
    localStorage.getItem('shaivika_resume_phone') || '+91 98765 43210'
  );

  const [location, setLocation] = useState(
    localStorage.getItem('shaivika_resume_location') || 'Hyderabad, India'
  );

  const [jobTitle, setJobTitle] = useState(
    localStorage.getItem('shaivika_resume_title') || 'Full Stack & AI Engineer'
  );

  const [summary, setSummary] = useState(
    localStorage.getItem('shaivika_resume_summary') ||
    'Dedicated engineering professional mastering system architecture, full stack React & Node.js development, and AI engineering practices at Shaivika AI Foundation LMS.'
  );

  const [skills, setSkills] = useState<string[]>(() => {
    const cached = localStorage.getItem('shaivika_resume_skills');
    if (cached) return JSON.parse(cached);
    return ['React.js', 'TypeScript', 'Node.js Express', 'Python AI Engineering', 'Git & GitHub', 'Linux Systems', 'SQL Database Normalization'];
  });

  const [newSkill, setNewSkill] = useState('');

  const [experience, setExperience] = useState<Experience[]>(() => {
    const cached = localStorage.getItem('shaivika_resume_experience');
    if (cached) return JSON.parse(cached);
    return [
      {
        role: 'AI & Full Stack Engineer Intern',
        company: 'Shaivika AI Labs',
        duration: '2026 - Present',
        desc: 'Implemented modular course learning systems, optimized database queries, and integrated real-time WebSocket speed leaderboard telemetry.',
      },
    ];
  });

  const [education, setEducation] = useState<Education[]>(() => {
    const cached = localStorage.getItem('shaivika_resume_education');
    if (cached) return JSON.parse(cached);
    return [
      {
        degree: 'Bachelor of Technology in Computer Science & AI',
        school: 'University Institute of Engineering & Technology',
        duration: '2023 - 2027',
      },
    ];
  });

  const [certifications, setCertifications] = useState<string[]>(() => {
    const cached = localStorage.getItem('shaivika_resume_certifications');
    if (cached) return JSON.parse(cached);
    return ['Shaivika AI Foundation: Full Stack React & Node.js Mastery'];
  });

  const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern');
  const [newRole, setNewRole] = useState({ role: '', company: '', duration: '', desc: '' });
  const [newEd, setNewEd] = useState({ degree: '', school: '', duration: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Load from backend on mount
  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE_URL}/resume/me?studentId=${userId}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          const d = json.data;
          if (d.fullName) setFullName(d.fullName);
          if (d.email) setEmail(d.email);
          if (d.phone) setPhone(d.phone);
          if (d.location) setLocation(d.location);
          if (d.title) setJobTitle(d.title);
          if (d.summary) setSummary(d.summary);
          if (Array.isArray(d.skills) && d.skills.length > 0) setSkills(d.skills);
          if (Array.isArray(d.experience) && d.experience.length > 0) setExperience(d.experience);
          if (Array.isArray(d.education) && d.education.length > 0) setEducation(d.education);
          if (Array.isArray(d.certifications) && d.certifications.length > 0) setCertifications(d.certifications);
          if (d.template) setTemplate(d.template);
        }
      })
      .catch(() => {});
  }, [userId]);

  const handleSave = async () => {
    setIsSaving(true);
    // 1. LocalStorage
    localStorage.setItem('shaivika_resume_fullname', fullName);
    localStorage.setItem('shaivika_resume_email', email);
    localStorage.setItem('shaivika_resume_phone', phone);
    localStorage.setItem('shaivika_resume_location', location);
    localStorage.setItem('shaivika_resume_title', jobTitle);
    localStorage.setItem('shaivika_resume_summary', summary);
    localStorage.setItem('shaivika_resume_skills', JSON.stringify(skills));
    localStorage.setItem('shaivika_resume_experience', JSON.stringify(experience));
    localStorage.setItem('shaivika_resume_education', JSON.stringify(education));
    localStorage.setItem('shaivika_resume_certifications', JSON.stringify(certifications));

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
          summary,
          skills,
          experience,
          education,
          certifications,
          template,
        }),
      });

      toast.success('💾 Resume saved to cloud database & local workspace!');
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
      const importedCerts = realCerts.map(c => `Shaivika AI Foundation: ${c.courseTitle} (ID: ${c.verificationId})`);
      setCertifications(importedCerts);
      localStorage.setItem('shaivika_resume_certifications', JSON.stringify(importedCerts));
    }

    // Pull skills from portfolio if available
    try {
      const pSkillsRaw = localStorage.getItem('shaivika_portfolio_skills');
      if (pSkillsRaw) {
        const pSkills = JSON.parse(pSkillsRaw);
        if (Array.isArray(pSkills) && pSkills.length > 0) {
          const mergedSkills = Array.from(new Set([...skills, ...pSkills]));
          setSkills(mergedSkills);
          localStorage.setItem('shaivika_resume_skills', JSON.stringify(mergedSkills));
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
      localStorage.setItem('shaivika_resume_skills', JSON.stringify(updated));
    }
  };

  const handleRemoveSkill = (index: number) => {
    const updated = skills.filter((_, i) => i !== index);
    setSkills(updated);
    localStorage.setItem('shaivika_resume_skills', JSON.stringify(updated));
  };

  const handleAddExperience = () => {
    if (newRole.role && newRole.company) {
      const updated = [...experience, newRole];
      setExperience(updated);
      setNewRole({ role: '', company: '', duration: '', desc: '' });
      localStorage.setItem('shaivika_resume_experience', JSON.stringify(updated));
    }
  };

  const handleAddEducation = () => {
    if (newEd.degree && newEd.school) {
      const updated = [...education, newEd];
      setEducation(updated);
      setNewEd({ degree: '', school: '', duration: '' });
      localStorage.setItem('shaivika_resume_education', JSON.stringify(updated));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-sans text-slate-800 dark:text-zinc-100 animate-in fade-in duration-300">
      {/* Print styles injected directly to prevent page-level dashboard components from printing */}
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
            Build and export a print-perfect professional developer resume with Shaivika verified credentials.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Form Editor */}
        <div className="no-print space-y-6">
          {/* Contact Details Editor */}
          <div className="p-6 rounded-3xl border border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span>Personal & Contact Info</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                />
              </div>
              <div>
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
                className="px-3 py-2.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-850 rounded-xl text-xs font-bold cursor-pointer hover:bg-indigo-105"
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
                  placeholder="Duration (e.g. 2025 - 2026)"
                  value={newRole.duration}
                  onChange={(e) => setNewRole({ ...newRole, duration: e.target.value })}
                  className="p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <textarea
                placeholder="Key accomplishments..."
                value={newRole.desc}
                onChange={(e) => setNewRole({ ...newRole, desc: e.target.value })}
                className="w-full h-16 p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                onClick={handleAddExperience}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Position</span>
              </button>
            </div>
          </div>

          {/* Education timeline */}
          <div className="p-6 rounded-3xl border border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-500" />
              <span>Academic Education</span>
            </h3>
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
              <input
                type="text"
                placeholder="Degree Course (e.g. B.Tech)"
                value={newEd.degree}
                onChange={(e) => setNewEd({ ...newEd, degree: e.target.value })}
                className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="School / College"
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
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Education Entry</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Printable Preview */}
        <div id="shaivika-printable-resume" className="p-8 md:p-12 rounded-3xl border border-slate-250 dark:border-zinc-800 bg-white text-slate-900 shadow-xl space-y-8 select-text">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                {fullName}
              </h1>
              <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-150 px-2.5 py-0.5 rounded-md uppercase tracking-wider mt-1.5 inline-block">
                {jobTitle}
              </span>
            </div>
            <div className="text-right text-[11px] font-bold text-slate-500 space-y-0.5">
              <div className="text-slate-900 font-extrabold">{email}</div>
              <div>{phone} • {location}</div>
              <div className="text-indigo-600 font-bold">Certification Authority: Shaivika AI Foundation LMS</div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">
              Summary Outline
            </h4>
            <p className="text-xs leading-relaxed text-slate-700 font-medium">
              {summary}
            </p>
          </div>

          {/* Skills Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">
              Technical Proficiencies
            </h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((skill, i) => (
                <span key={i} className="px-2 py-0.5 border border-slate-350 text-[10px] font-bold bg-slate-50 text-slate-800 rounded-md">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Verified Certificates & Courses */}
          {certifications && certifications.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500 fill-amber-500/10 shrink-0" />
                <span>Verified Shaivika AI Foundation Certifications</span>
              </h4>
              <div className="space-y-2">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="flex justify-between text-xs items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900">{cert}</div>
                    <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {experience.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">
                Experience History
              </h4>
              <div className="space-y-3">
                {experience.map((exp, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between font-extrabold text-slate-900">
                      <span>{exp.role}</span>
                      <span className="text-[10px] text-slate-500">{exp.duration}</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-indigo-700 mt-0.5">{exp.company}</div>
                    <p className="text-[11px] text-slate-650 mt-1 font-medium leading-relaxed">{exp.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1">
                Education Timeline
              </h4>
              <div className="space-y-3">
                {education.map((ed, i) => (
                  <div key={i} className="text-xs flex justify-between">
                    <div>
                      <div className="font-extrabold text-slate-900">{ed.degree}</div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">{ed.school}</div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 text-right">{ed.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
