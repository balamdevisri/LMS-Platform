import React from 'react';
import {
  Globe,
  ExternalLink,
  MapPin,
  Mail,
  Briefcase,
  GraduationCap,
  Sparkles,
  Award,
  ArrowRight,
  Code2,
  Terminal,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronRight,
  Share2
} from 'lucide-react';

export type PortfolioTemplateId =
  | 'modern_tech'
  | 'canva_creative'
  | 'executive_minimal'
  | 'cyberpunk_terminal';

export interface PortfolioTemplateMeta {
  id: PortfolioTemplateId;
  name: string;
  tagline: string;
  badge: string;
  accentColor: string;
  previewClass: string;
}

export const PORTFOLIO_TEMPLATES_CONFIG: PortfolioTemplateMeta[] = [
  {
    id: 'modern_tech',
    name: 'Modern Tech SaaS',
    tagline: 'Clean developer portfolio with production metric counters and live cards',
    badge: 'Madhan P Style',
    accentColor: '#4f46e5',
    previewClass: 'from-indigo-600/20 to-blue-600/20 border-indigo-500/40',
  },
  {
    id: 'canva_creative',
    name: 'Canva Creative Spotlight',
    tagline: 'Vibrant hero spotlight with typing badge, animated skill bars & card zoom',
    badge: 'Canva Spotlight',
    accentColor: '#ec4899',
    previewClass: 'from-pink-600/20 to-amber-600/20 border-pink-500/40',
  },
  {
    id: 'executive_minimal',
    name: 'Executive Minimalist',
    tagline: 'High-contrast typography, clean whitespace, and corporate case study layout',
    badge: 'Silicon Minimal',
    accentColor: '#0f172a',
    previewClass: 'from-slate-700/20 to-slate-900/20 border-slate-600/40',
  },
  {
    id: 'cyberpunk_terminal',
    name: 'Cyberpunk Terminal',
    tagline: 'Dark neon glassmorphism, terminal commands, and dense DevOps/AI tags',
    badge: 'Hacker Terminal',
    accentColor: '#06b6d4',
    previewClass: 'from-cyan-600/20 to-purple-600/20 border-cyan-500/40',
  },
];

export interface PortfolioData {
  fullName?: string;
  name?: string;
  headline?: string;
  bio?: string;
  aboutBio?: string;
  customHandle?: string;
  handle?: string;
  email?: string;
  contactEmail?: string;
  location?: string;
  avatarUrl?: string;
  photoURL?: string;
  avatar?: string;
  githubUrl?: string;
  githubLink?: string;
  linkedinUrl?: string;
  linkedinLink?: string;
  websiteUrl?: string;
  websiteLink?: string;
  phone?: string;
  skills?: string[];
  projects?: Array<{
    id?: string;
    title: string;
    description: string;
    tags?: string[];
    githubUrl?: string;
    liveUrl?: string;
    featured?: boolean;
  }>;
  experiences?: Array<{
    id?: string;
    role: string;
    company: string;
    duration: string;
    description: string;
  }>;
  educations?: Array<{
    id?: string;
    degree: string;
    institution: string;
    year: string;
    score?: string;
  }>;
  accentColor?: string;
  isPublished?: boolean;
  template?: PortfolioTemplateId;
}

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// ============================================================================
// TEMPLATE 1: MODERN TECH SAAS (Inspired by Madhan P style)
// ============================================================================
export const ModernTechPortfolio: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const name = data.fullName || data.name || 'Software Developer';
  const headline = data.headline || 'Full Stack Software Engineer';
  const bio = data.bio || data.aboutBio || 'I build and ship robust production software systems, REST APIs, and scalable user interfaces.';
  const avatarUrl = data.avatarUrl || data.photoURL || data.avatar;
  const skills = data.skills || [];
  const projects = data.projects || [];
  const experiences = data.experiences || [];
  const educations = data.educations || [];
  const location = data.location || 'India';
  const email = data.email || data.contactEmail || '';
  const githubUrl = data.githubUrl || data.githubLink;
  const linkedinUrl = data.linkedinUrl || data.linkedinLink;
  const websiteUrl = data.websiteUrl || data.websiteLink;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-indigo-600 selection:text-white pb-24">
      {/* Sticky Header Nav */}
      <nav className="sticky top-0 z-30 bg-[#090d16]/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono font-black text-sm text-indigo-400">
            <span>&lt;</span>
            <span className="text-white">{name.split(' ')[0]}</span>
            <span>/&gt;</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
            <a href="#projects" className="hover:text-indigo-400 transition-colors">Projects</a>
            <a href="#skills" className="hover:text-indigo-400 transition-colors">Skills</a>
            <a href="#experience" className="hover:text-indigo-400 transition-colors">Experience</a>
            <a href="#contact" className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/20">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-xl shadow-indigo-500/10 shrink-0"
            />
          ) : (
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-4xl font-black text-white shrink-0 shadow-xl">
              {name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Available for Engineering Roles</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {name}
            </h1>
            <p className="text-lg font-semibold text-indigo-300">
              {headline}
            </p>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {bio}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all hover:scale-105"
                >
                  <GithubIcon className="w-4 h-4 text-white" />
                  <span>GitHub</span>
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all hover:scale-105"
                >
                  <LinkedinIcon className="w-4 h-4 text-sky-400" />
                  <span>LinkedIn</span>
                </a>
              )}
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* By The Numbers / Impact Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="text-center sm:text-left">
            <div className="text-2xl sm:text-3xl font-black text-indigo-400">{projects.length}+</div>
            <div className="text-xs text-slate-400 font-medium">Shipped Projects</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">{skills.length}+</div>
            <div className="text-xs text-slate-400 font-medium">Core Technologies</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-2xl sm:text-3xl font-black text-cyan-400">100%</div>
            <div className="text-xs text-slate-400 font-medium">Verified Code</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-2xl sm:text-3xl font-black text-purple-400">{location.split(',')[0]}</div>
            <div className="text-xs text-slate-400 font-medium">Location Base</div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section id="projects" className="max-w-5xl mx-auto px-6 py-12 border-t border-slate-800/60">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Featured Projects</h2>
            <p className="text-xs text-slate-400 mt-1">Live implementations and production code repositories.</p>
          </div>
          <span className="text-xs font-bold text-indigo-400">{projects.length} Total</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between group hover:shadow-xl hover:shadow-indigo-500/5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                    Full-Stack Application
                  </span>
                  {proj.featured && (
                    <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {proj.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {proj.description}
                </p>

                {proj.tags && proj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {proj.tags.map((t, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-5 border-t border-slate-800/80 mt-4">
                {proj.liveUrl && (
                  <a
                    href={proj.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Visit Live Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {proj.githubUrl && (
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors ml-auto"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>Source Code</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="max-w-5xl mx-auto px-6 py-12 border-t border-slate-800/60">
        <h2 className="text-2xl font-black text-white tracking-tight mb-2">Technical Skills</h2>
        <p className="text-xs text-slate-400 mb-6">Core competencies, languages, frameworks, and developer tools.</p>

        <div className="flex flex-wrap gap-2.5">
          {skills.map((s, idx) => (
            <div
              key={idx}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all hover:translate-y-[-2px]"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Experience & Education */}
      {(experiences.length > 0 || educations.length > 0) && (
        <section id="experience" className="max-w-5xl mx-auto px-6 py-12 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-8">
          {experiences.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <span>Work Experience</span>
              </h3>
              <div className="space-y-4">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="font-bold text-white text-sm">{exp.role}</div>
                    <div className="text-xs text-indigo-400 font-medium">{exp.company} • {exp.duration}</div>
                    <p className="text-xs text-slate-300 mt-2">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {educations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
                <span>Academic Education</span>
              </h3>
              <div className="space-y-4">
                {educations.map((ed, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="font-bold text-white text-sm">{ed.degree}</div>
                    <div className="text-xs text-cyan-400 font-medium">{ed.institution} • {ed.year}</div>
                    {ed.score && <div className="text-[11px] text-slate-400">Score: {ed.score}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Contact CTA */}
      <section id="contact" className="max-w-5xl mx-auto px-6 pt-12">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/80 border border-indigo-700/40 text-center space-y-4 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Let's Build Something Great Together
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            I am currently open to full-time engineering roles, high-impact projects, and freelance engagements.
          </p>
          {email && (
            <div className="pt-2">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Mail className="w-4 h-4" />
                <span>Email Me ({email})</span>
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// TEMPLATE 2: CANVA CREATIVE SPOTLIGHT (Inspired by Madhankumar S / Canva)
// ============================================================================
export const CanvaCreativePortfolio: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const name = data.fullName || data.name || 'Creative Developer';
  const headline = data.headline || 'Full Stack Engineer & Creative Technologist';
  const bio = data.bio || data.aboutBio || 'Building aesthetic and high-performance digital experiences with cutting-edge web stacks.';
  const avatarUrl = data.avatarUrl || data.photoURL || data.avatar;
  const skills = data.skills || [];
  const projects = data.projects || [];
  const experiences = data.experiences || [];
  const educations = data.educations || [];
  const email = data.email || data.contactEmail || '';
  const githubUrl = data.githubUrl || data.githubLink;
  const linkedinUrl = data.linkedinUrl || data.linkedinLink;

  return (
    <div className="min-h-screen bg-[#0d0915] text-slate-100 font-sans selection:bg-pink-600 selection:text-white pb-24">
      {/* Top Ambient Light Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-pink-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="max-w-5xl mx-auto px-6 pt-12 pb-8 flex flex-col items-center text-center relative z-10 space-y-5">
        {/* Spotlight Avatar with Glowing Ring */}
        <div className="relative">
          <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-400 shadow-2xl shadow-pink-500/20">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-5xl font-black text-pink-400">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="absolute bottom-1 right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950" title="Online" />
        </div>

        {/* Name and Typing Badge */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/40 border border-pink-700/50 text-pink-300 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Hello, I am {name.split(' ')[0]}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            {name}
          </h1>
          <p className="text-base sm:text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300 bg-clip-text text-transparent max-w-2xl">
            {headline}
          </p>
        </div>

        {/* Quick Social Buttons */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-slate-900 border border-slate-800 hover:border-pink-500 text-slate-200 transition-transform hover:scale-110">
              <GithubIcon className="w-4 h-4" />
            </a>
          )}
          {linkedinUrl && (
            <a href={linkedinUrl} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-slate-900 border border-slate-800 hover:border-pink-500 text-sky-400 transition-transform hover:scale-110">
              <LinkedinIcon className="w-4 h-4" />
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition-transform hover:scale-105 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>Hire Me</span>
            </a>
          )}
        </div>
      </header>

      {/* About & Skill Progress Showcase */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div className="md:col-span-5 space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-pink-400">About Me</span>
            <h2 className="text-2xl font-bold text-white leading-snug">
              Transforming Ideas Into Clean, Scalable Code
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {bio}
            </p>
          </div>

          <div className="md:col-span-7 space-y-3.5">
            <span className="text-xs font-black uppercase tracking-wider text-purple-400">Skills & Proficiency</span>
            <div className="space-y-3 pt-1">
              {skills.slice(0, 6).map((skill, idx) => {
                const percentages = [95, 90, 88, 85, 82, 80];
                const pct = percentages[idx % percentages.length];
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-200">{skill}</span>
                      <span className="text-pink-400">{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Showcase with Zoom Card Effect */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-black text-white tracking-tight mb-2 text-center">Featured Projects</h2>
        <p className="text-xs text-slate-400 text-center mb-10">Hand-crafted digital creations with verified source code.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj, idx) => (
            <div
              key={idx}
              className="group relative p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-pink-500/60 transition-all overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:shadow-pink-500/10"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-950/60 text-pink-300 border border-pink-800/40">
                    Project #{idx + 1}
                  </span>
                  {proj.liveUrl && (
                    <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-pink-400 hover:text-white transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-pink-300 transition-colors">
                  {proj.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {proj.description}
                </p>

                {proj.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {proj.tags.map((t, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-200 border border-purple-800/50">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {proj.githubUrl && (
                <div className="pt-5 border-t border-slate-800/80 mt-4 flex items-center justify-end">
                  <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>View Repository</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// TEMPLATE 3: EXECUTIVE MINIMALIST (Editorial & Silicon Valley Clean)
// ============================================================================
export const ExecutiveMinimalPortfolio: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const name = data.fullName || data.name || 'Engineer Portfolio';
  const headline = data.headline || 'Principal Software Systems Architect';
  const bio = data.bio || data.aboutBio || 'Designing robust architectures, enterprise software solutions, and high-reliability platforms.';
  const skills = data.skills || [];
  const projects = data.projects || [];
  const experiences = data.experiences || [];
  const educations = data.educations || [];
  const location = data.location || 'India';
  const email = data.email || data.contactEmail || '';
  const githubUrl = data.githubUrl || data.githubLink;
  const linkedinUrl = data.linkedinUrl || data.linkedinLink;

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0c0d0e] text-slate-900 dark:text-slate-100 font-serif selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-black pb-24 transition-colors">
      <div className="max-w-4xl mx-auto px-6 pt-16">
        {/* Editorial Masthead */}
        <header className="border-b-2 border-slate-900 dark:border-slate-100 pb-8 space-y-4">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
            Developer Dossier • {location}
          </div>
          <h1 className="text-4xl sm:text-6xl font-normal tracking-tight">
            {name}
          </h1>
          <p className="text-lg sm:text-xl font-sans font-medium text-slate-600 dark:text-slate-400">
            {headline}
          </p>

          <div className="flex flex-wrap items-center gap-4 font-sans text-xs font-bold pt-2">
            {email && (
              <a href={`mailto:${email}`} className="text-slate-900 dark:text-white underline underline-offset-4 hover:opacity-75">
                {email}
              </a>
            )}
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noreferrer" className="text-slate-900 dark:text-white underline underline-offset-4 hover:opacity-75">
                GitHub
              </a>
            )}
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-slate-900 dark:text-white underline underline-offset-4 hover:opacity-75">
                LinkedIn
              </a>
            )}
          </div>
        </header>

        {/* Overview Bio */}
        <section className="py-12 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-sans text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Background & Overview</h2>
          <p className="text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200 font-sans">
            {bio}
          </p>
        </section>

        {/* Selected Work & Case Studies */}
        <section className="py-12 border-b border-slate-200 dark:border-slate-800 space-y-8">
          <h2 className="font-sans text-xs font-black uppercase tracking-widest text-slate-400">Selected Work & Case Studies</h2>
          <div className="space-y-8">
            {projects.map((proj, idx) => (
              <div key={idx} className="space-y-2 font-sans">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                    {proj.title}
                  </h3>
                  {proj.liveUrl && (
                    <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                      <span>Live Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {proj.description}
                </p>
                {proj.tags && (
                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] text-slate-500">
                    {proj.tags.map((t, tIdx) => (
                      <span key={tIdx}>#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Skills & Experience */}
        <section className="py-12 grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Core Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span key={idx} className="px-3 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-xs font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {experiences.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Career History</h2>
              <div className="space-y-3">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="text-xs space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-white">{exp.role}</div>
                    <div className="text-slate-500">{exp.company} • {exp.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

// ============================================================================
// TEMPLATE 4: CYBERPUNK TERMINAL (Hacker & DevOps Dark Glassmorphism)
// ============================================================================
export const CyberpunkTerminalPortfolio: React.FC<{ data: PortfolioData }> = ({ data }) => {
  const name = data.fullName || data.name || 'root@developer';
  const headline = data.headline || 'Cloud Architect & Systems Hacker';
  const bio = data.bio || data.aboutBio || 'Executing kernel-level integrations, AI model inference, and distributed cloud deployments.';
  const avatarUrl = data.avatarUrl || data.photoURL || data.avatar;
  const skills = data.skills || [];
  const projects = data.projects || [];
  const experiences = data.experiences || [];
  const educations = data.educations || [];
  const email = data.email || data.contactEmail || '';
  const githubUrl = data.githubUrl || data.githubLink;
  const linkedinUrl = data.linkedinUrl || data.linkedinLink;

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-200 font-mono selection:bg-cyan-500 selection:text-black pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        {/* Terminal Header Bar */}
        <div className="rounded-2xl bg-slate-950/90 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-xs text-slate-400 font-bold">bash ~ {name.toLowerCase().replace(/\s+/g, '-')}.sh</span>
            <span className="text-[10px] text-cyan-400 font-bold">STATUS: 200 OK</span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-24 h-24 rounded-2xl object-cover border border-cyan-400/50 shadow-lg shadow-cyan-400/20"
                />
              )}
              <div className="space-y-1">
                <div className="text-xs text-cyan-400">~/profile/identity</div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {name}
                </h1>
                <p className="text-xs sm:text-sm text-cyan-300 font-semibold">{headline}</p>
                <div className="text-xs text-slate-400 pt-1 flex items-center gap-2">
                  <span className="text-emerald-400">● ACTIVE</span>
                  <span>SSH KEY CERTIFIED</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="text-cyan-400 font-bold">$ cat bio.txt</span>
              <p className="mt-2 text-slate-300">{bio}</p>
            </div>
          </div>
        </div>

        {/* Tech Stack Command */}
        <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
          <div className="text-xs text-cyan-400">$ ls -la /usr/bin/skills</div>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 text-xs font-bold">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Projects Engine */}
        <div className="space-y-4">
          <div className="text-xs text-cyan-400">$ ./deploy_projects.sh --all</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-cyan-500/60 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">0{idx + 1}.bin</span>
                  {proj.liveUrl && (
                    <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-xs text-white hover:text-cyan-400 flex items-center gap-1">
                      <span>RUN</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <h3 className="text-base font-bold text-white">{proj.title}</h3>
                <p className="text-xs text-slate-400">{proj.description}</p>
                {proj.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-slate-500">
                    {proj.tags.map((t, tIdx) => (
                      <span key={tIdx} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PORTFOLIO TEMPLATE RENDERER
// ============================================================================
export const PortfolioTemplateRenderer: React.FC<{
  templateId?: PortfolioTemplateId;
  data: PortfolioData;
}> = ({ templateId = 'modern_tech', data }) => {
  switch (templateId) {
    case 'modern_tech':
      return <ModernTechPortfolio data={data} />;
    case 'canva_creative':
      return <CanvaCreativePortfolio data={data} />;
    case 'executive_minimal':
      return <ExecutiveMinimalPortfolio data={data} />;
    case 'cyberpunk_terminal':
      return <CyberpunkTerminalPortfolio data={data} />;
    default:
      return <ModernTechPortfolio data={data} />;
  }
};
