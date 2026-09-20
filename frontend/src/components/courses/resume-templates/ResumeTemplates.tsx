import React from 'react';
import { 
  Award, 
  Briefcase, 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Code2, 
  ExternalLink, 
  CheckCircle2, 
  FolderGit2 
} from 'lucide-react';

export interface ExperienceItem {
  role: string;
  company: string;
  duration: string;
  desc: string;
}

export interface EducationItem {
  degree: string;
  school: string;
  duration: string;
}

export interface ProjectItem {
  name: string;
  tech: string;
  link?: string;
  desc: string;
}

export interface ResumeData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  github?: string;
  linkedin?: string;
  summary: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: string[];
  projects?: ProjectItem[];
  photoUrl?: string;
  showPhoto?: boolean;
}

export type TemplateId = 
  | 'canva_modern_photo'
  | 'executive_headshot'
  | 'overleaf_classic' 
  | 'modern_tech' 
  | 'executive_split' 
  | 'silicon_clean' 
  | 'nordic_minimal' 
  | 'creative_pro';

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  tagline: string;
  badge: string;
  accentColor: string;
  hasPhoto: boolean;
  atsCompliant: boolean;
}

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

export const RESUME_TEMPLATES_CONFIG: TemplateMeta[] = [
  {
    id: 'canva_modern_photo',
    name: 'Canva Modern Photo',
    tagline: 'Canva-inspired 2-column layout with candidate portrait headshot & sleek skill meters',
    badge: '📷 Photo Headshot',
    accentColor: '#4f46e5',
    hasPhoto: true,
    atsCompliant: true,
  },
  {
    id: 'executive_headshot',
    name: 'Executive Headshot Pro',
    tagline: 'Corporate executive design with rounded photo frame, clean navy typography & dual columns',
    badge: '📷 Photo Executive',
    accentColor: '#0f172a',
    hasPhoto: true,
    atsCompliant: true,
  },
  {
    id: 'overleaf_classic',
    name: 'Overleaf LaTeX ATS',
    tagline: 'Standard LaTeX CS format, 100% pure ATS text & clean horizontal dividers (No Photo)',
    badge: '⚡ Pure ATS',
    accentColor: '#1e293b',
    hasPhoto: false,
    atsCompliant: true,
  },
  {
    id: 'silicon_clean',
    name: 'Silicon Valley FAANG',
    tagline: 'FAANG-optimized standard engineering text format with project highlights (No Photo)',
    badge: '⚡ FAANG Standard',
    accentColor: '#0284c7',
    hasPhoto: false,
    atsCompliant: true,
  },
  {
    id: 'nordic_minimal',
    name: 'Nordic Monochrome',
    tagline: 'Ultra-refined editorial typography in high-contrast monochrome (No Photo)',
    badge: '⚡ Minimalist',
    accentColor: '#18181b',
    hasPhoto: false,
    atsCompliant: true,
  },
  {
    id: 'modern_tech',
    name: 'Modern Tech Pro',
    tagline: 'Sleek tech aesthetic with verified credentials, skill pills & clean typography',
    badge: 'Tech Standard',
    accentColor: '#6366f1',
    hasPhoto: false,
    atsCompliant: true,
  },
  {
    id: 'executive_split',
    name: 'Executive Dual-Column',
    tagline: 'Compact 2-column layout with a left info sidebar for high density text',
    badge: 'Two Column',
    accentColor: '#334155',
    hasPhoto: false,
    atsCompliant: true,
  },
  {
    id: 'creative_pro',
    name: 'Creative Tech Portfolio',
    tagline: 'Vibrant modern design with gradient accents & project cards',
    badge: 'Creative',
    accentColor: '#7c3aed',
    hasPhoto: false,
    atsCompliant: true,
  },
];

// ============================================================================
// 1. OVERLEAF LATEX ATS CLASSIC TEMPLATE (Jake's Resume / LaTeX Inspired)
// ============================================================================
export const OverleafClassicTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div className="font-serif text-slate-900 bg-white p-8 md:p-12 leading-normal select-text text-[13px]">
      {/* LaTeX Centered Header */}
      <div className="text-center pb-3 border-b-2 border-slate-900">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider uppercase font-serif text-slate-950">
          {data.fullName || 'YOUR NAME'}
        </h1>
        {data.jobTitle && (
          <div className="text-[12px] font-sans font-semibold tracking-wide text-slate-700 uppercase mt-0.5">
            {data.jobTitle}
          </div>
        )}
        <div className="flex flex-wrap justify-center items-center gap-x-2 text-[11px] font-sans text-slate-700 mt-1.5">
          {data.phone && <span>{data.phone}</span>}
          {data.phone && data.email && <span>•</span>}
          {data.email && (
            <a href={`mailto:${data.email}`} className="text-slate-900 hover:underline">
              {data.email}
            </a>
          )}
          {data.location && <span>•</span>}
          {data.location && <span>{data.location}</span>}
          {data.linkedin && <span>•</span>}
          {data.linkedin && (
            <a href={data.linkedin.startsWith('http') ? data.linkedin : `https://${data.linkedin}`} target="_blank" rel="noreferrer" className="text-blue-800 hover:underline">
              linkedin
            </a>
          )}
          {data.github && <span>•</span>}
          {data.github && (
            <a href={data.github.startsWith('http') ? data.github : `https://${data.github}`} target="_blank" rel="noreferrer" className="text-blue-800 hover:underline">
              github
            </a>
          )}
          {data.website && <span>•</span>}
          {data.website && (
            <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" rel="noreferrer" className="text-blue-800 hover:underline">
              portfolio
            </a>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-3">
        {/* Education (LaTeX standard is education first for students/graduates) */}
        {data.education && data.education.length > 0 && (
          <div>
            <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-900 border-b border-slate-800 pb-0.5 mb-2">
              Education
            </h2>
            <div className="space-y-2">
              {data.education.map((ed, idx) => (
                <div key={idx} className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-slate-950 font-serif">{ed.school}</span>
                    <span className="text-slate-700 italic block sm:inline sm:ml-2 font-serif">— {ed.degree}</span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-sans font-medium">{ed.duration}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Skills */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-900 border-b border-slate-800 pb-0.5 mb-1.5">
              Technical Skills
            </h2>
            <p className="text-xs font-serif leading-relaxed text-slate-800">
              <span className="font-bold font-sans text-[11px]">Core Proficiencies: </span>
              {data.skills.join(', ')}
            </p>
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div>
            <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-900 border-b border-slate-800 pb-0.5 mb-2">
              Experience
            </h2>
            <div className="space-y-3">
              {data.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline">
                    <div className="font-bold font-serif text-slate-950 text-xs">
                      {exp.role} <span className="font-normal italic text-slate-700">| {exp.company}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-sans font-medium">{exp.duration}</div>
                  </div>
                  {exp.desc && (
                    <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-xs text-slate-800 leading-relaxed">
                      {exp.desc.split('\n').filter(Boolean).map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet.replace(/^[•\-\*]\s*/, '')}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Projects */}
        {data.projects && data.projects.length > 0 && (
          <div>
            <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-900 border-b border-slate-800 pb-0.5 mb-2">
              Projects & Engineering Work
            </h2>
            <div className="space-y-2.5">
              {data.projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline">
                    <div className="font-serif text-xs">
                      <span className="font-bold text-slate-950">{proj.name}</span>
                      {proj.tech && <span className="italic text-slate-600 text-[11px] ml-1.5">| {proj.tech}</span>}
                    </div>
                    {proj.link && (
                      <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noreferrer" className="text-[11px] text-blue-700 hover:underline font-sans">
                        Link ↗
                      </a>
                    )}
                  </div>
                  {proj.desc && (
                    <p className="text-xs text-slate-800 mt-0.5 leading-relaxed font-serif">
                      {proj.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verified Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div>
            <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-900 border-b border-slate-800 pb-0.5 mb-1.5">
              Certifications & Accreditations
            </h2>
            <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-800 font-serif">
              {data.certifications.map((cert, idx) => (
                <li key={idx}>
                  <span className="font-semibold">{cert}</span>
                  <span className="font-sans text-[10px] text-emerald-800 ml-1.5 font-bold">[Verified]</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Professional Summary */}
        {data.summary && (
          <div>
            <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-900 border-b border-slate-800 pb-0.5 mb-1">
              Professional Summary
            </h2>
            <p className="text-xs font-serif leading-relaxed text-slate-800 text-justify">
              {data.summary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 2. MODERN TECH PRO TEMPLATE
// ============================================================================
export const ModernTechTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div className="font-sans text-slate-900 bg-white p-8 md:p-12 space-y-6 select-text text-xs">
      {/* Header with Title Badge */}
      <div className="border-b-2 border-indigo-600 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase">
            {data.fullName || 'YOUR NAME'}
          </h1>
          {data.jobTitle && (
            <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-150 px-2.5 py-0.5 rounded-md uppercase tracking-wider mt-1.5 inline-block">
              {data.jobTitle}
            </span>
          )}
        </div>
        <div className="text-left md:text-right text-[11px] font-medium text-slate-500 space-y-0.5">
          <div className="text-slate-900 font-bold">{data.email}</div>
          <div>{data.phone} • {data.location}</div>
          <div className="flex flex-wrap gap-2 md:justify-end text-indigo-600 font-semibold text-[10px] pt-0.5">
            {data.github && <span>github.com/{data.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>}
            {data.linkedin && <span>• linkedin</span>}
            {data.website && <span>• portfolio</span>}
          </div>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="space-y-1.5">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>Professional Summary</span>
          </h3>
          <p className="text-xs leading-relaxed text-slate-700 font-medium">
            {data.summary}
          </p>
        </div>
      )}

      {/* Technical Proficiencies */}
      {data.skills && data.skills.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>Technical Proficiencies</span>
          </h3>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 border border-slate-200 text-[10px] font-bold bg-slate-50 text-slate-800 rounded-md">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>Work Experience</span>
          </h3>
          <div className="space-y-3">
            {data.experience.map((exp, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span className="text-xs">{exp.role}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{exp.duration}</span>
                </div>
                <div className="text-[11px] font-extrabold text-indigo-600">{exp.company}</div>
                <p className="text-[11px] text-slate-650 leading-relaxed">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>Key Projects</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {data.projects.map((proj, i) => (
              <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-xs">{proj.name}</span>
                  {proj.link && (
                    <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5">
                      Demo <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                {proj.tech && <div className="text-[10px] font-semibold text-slate-500">{proj.tech}</div>}
                <p className="text-[10px] text-slate-600 leading-snug">{proj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>Verified Certifications</span>
          </h3>
          <div className="space-y-1.5">
            {data.certifications.map((cert, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
                <span className="font-bold text-slate-900">{cert}</span>
                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                  Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>Education</span>
          </h3>
          <div className="space-y-2">
            {data.education.map((ed, i) => (
              <div key={i} className="flex justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{ed.degree}</div>
                  <div className="text-[10px] text-slate-500">{ed.school}</div>
                </div>
                <div className="text-[10px] font-semibold text-slate-500">{ed.duration}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. EXECUTIVE DUAL-COLUMN TEMPLATE
// ============================================================================
export const ExecutiveSplitTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div className="font-sans text-slate-900 bg-white min-h-full select-text text-xs">
      <div className="grid grid-cols-12 min-h-full">
        {/* Left Sidebar (35%) */}
        <div className="col-span-12 sm:col-span-4 bg-slate-100/80 p-6 md:p-8 border-r border-slate-250 space-y-6">
          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              Contact
            </h3>
            <div className="space-y-2 text-[11px] text-slate-700 font-medium">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{data.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{data.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{data.location}</span>
              </div>
              {data.linkedin && (
                <div className="flex items-center gap-2">
                  <LinkedinIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{data.linkedin}</span>
                </div>
              )}
              {data.github && (
                <div className="flex items-center gap-2">
                  <GithubIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{data.github}</span>
                </div>
              )}
            </div>
          </div>

          {/* Core Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                Proficiencies
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-800 shadow-2xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education in Sidebar */}
          {data.education && data.education.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                Education
              </h3>
              <div className="space-y-2.5">
                {data.education.map((ed, i) => (
                  <div key={i} className="text-[11px]">
                    <div className="font-bold text-slate-950 leading-tight">{ed.degree}</div>
                    <div className="text-slate-600 text-[10px] mt-0.5">{ed.school}</div>
                    <div className="text-slate-500 text-[9px] font-semibold">{ed.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications in Sidebar */}
          {data.certifications && data.certifications.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                Certifications
              </h3>
              <div className="space-y-2">
                {data.certifications.map((cert, i) => (
                  <div key={i} className="text-[10px] font-bold text-slate-800 bg-white p-2 rounded border border-slate-250 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Content Area (65%) */}
        <div className="col-span-12 sm:col-span-8 p-6 md:p-8 space-y-6">
          {/* Header Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-950 uppercase tracking-tight">
              {data.fullName || 'YOUR NAME'}
            </h1>
            <div className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mt-1">
              {data.jobTitle}
            </div>
          </div>

          {/* Executive Summary */}
          {data.summary && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Executive Profile
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed text-justify">
                {data.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {data.experience && data.experience.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Work Experience
              </h3>
              <div className="space-y-4">
                {data.experience.map((exp, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-950 text-xs">{exp.role}</span>
                      <span className="text-[10px] font-semibold text-slate-500">{exp.duration}</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-700">{exp.company}</div>
                    <p className="text-[11px] text-slate-650 leading-relaxed mt-1">{exp.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured Projects */}
          {data.projects && data.projects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Featured Engineering Projects
              </h3>
              <div className="space-y-3">
                {data.projects.map((proj, i) => (
                  <div key={i} className="space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-950 text-xs">{proj.name}</span>
                      {proj.link && (
                        <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-700 font-bold hover:underline">
                          View Project ↗
                        </a>
                      )}
                    </div>
                    {proj.tech && <div className="text-[10px] font-semibold text-slate-500">{proj.tech}</div>}
                    <p className="text-[11px] text-slate-650 leading-relaxed">{proj.desc}</p>
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

// ============================================================================
// 4. SILICON VALLEY FAANG CLEAN TEMPLATE
// ============================================================================
export const SiliconCleanTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div className="font-sans text-slate-900 bg-white p-8 md:p-12 space-y-4 select-text text-xs leading-snug">
      {/* Centered Top Header */}
      <div className="text-center pb-2 border-b border-slate-300">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-950">
          {data.fullName || 'YOUR NAME'}
        </h1>
        <div className="text-xs font-semibold text-sky-700 tracking-wide mt-0.5">
          {data.jobTitle}
        </div>
        <div className="flex flex-wrap justify-center gap-x-3 text-[11px] text-slate-600 mt-1">
          {data.phone && <span>{data.phone}</span>}
          {data.email && <span>• <a href={`mailto:${data.email}`} className="text-slate-900 hover:underline">{data.email}</a></span>}
          {data.location && <span>• {data.location}</span>}
          {data.github && <span>• <a href={data.github.startsWith('http') ? data.github : `https://${data.github}`} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">GitHub</a></span>}
          {data.linkedin && <span>• <a href={data.linkedin.startsWith('http') ? data.linkedin : `https://${data.linkedin}`} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">LinkedIn</a></span>}
          {data.website && <span>• <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">Portfolio</a></span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1">
            Summary
          </h2>
          <p className="text-[11px] text-slate-750 leading-relaxed">
            {data.summary}
          </p>
        </div>
      )}

      {/* Technical Skills */}
      {data.skills && data.skills.length > 0 && (
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1">
            Technical Skills
          </h2>
          <p className="text-[11px] text-slate-800 leading-relaxed">
            <span className="font-semibold text-slate-950">Languages & Tools: </span>
            {data.skills.join(' • ')}
          </p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2">
            Experience
          </h2>
          <div className="space-y-2.5">
            {data.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <div className="text-xs">
                    <span className="font-bold text-slate-950">{exp.role}</span>
                    <span className="text-slate-600 font-medium"> — {exp.company}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">{exp.duration}</span>
                </div>
                <p className="text-[11px] text-slate-700 mt-0.5 leading-relaxed">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2">
            Projects
          </h2>
          <div className="space-y-2">
            {data.projects.map((proj, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-slate-950 text-xs">{proj.name}</span>
                    {proj.tech && <span className="text-slate-500 text-[10px] ml-2">[{proj.tech}]</span>}
                  </div>
                  {proj.link && (
                    <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noreferrer" className="text-[10px] text-sky-700 hover:underline">
                      code / live ↗
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-700 mt-0.5">{proj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
            Education
          </h2>
          <div className="space-y-1.5">
            {data.education.map((ed, i) => (
              <div key={i} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-950">{ed.school}</span>
                  <span className="text-slate-600 text-[11px] ml-2">{ed.degree}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">{ed.duration}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1">
            Certifications
          </h2>
          <div className="flex flex-wrap gap-x-4 text-[11px] text-slate-800">
            {data.certifications.map((cert, i) => (
              <span key={i}>✓ {cert}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. NORDIC MONOCHROME TEMPLATE
// ============================================================================
export const NordicMinimalTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div className="font-sans text-neutral-900 bg-white p-8 md:p-12 space-y-6 select-text text-xs">
      {/* Clean Monochromatic Header */}
      <div className="border-b border-neutral-900 pb-4">
        <h1 className="text-3xl font-light tracking-tight text-neutral-950 uppercase">
          {data.fullName || 'YOUR NAME'}
        </h1>
        <div className="text-[11px] font-bold tracking-widest text-neutral-500 uppercase mt-1">
          {data.jobTitle}
        </div>
        <div className="flex flex-wrap gap-x-4 text-[11px] text-neutral-600 mt-2">
          <span>{data.email}</span>
          <span>•</span>
          <span>{data.phone}</span>
          <span>•</span>
          <span>{data.location}</span>
          {data.github && (
            <>
              <span>•</span>
              <span>{data.github}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">01 / Profile</div>
          <p className="text-xs text-neutral-700 leading-relaxed font-normal">
            {data.summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">02 / Skills</div>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-2 py-0.5 border border-neutral-300 text-[10px] font-mono text-neutral-900 bg-neutral-50 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">03 / Experience</div>
          <div className="space-y-3">
            {data.experience.map((exp, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex justify-between font-bold text-neutral-950 text-xs">
                  <span>{exp.role}</span>
                  <span className="font-mono text-[10px] text-neutral-500">{exp.duration}</span>
                </div>
                <div className="text-[11px] text-neutral-600">{exp.company}</div>
                <p className="text-[11px] text-neutral-700 leading-relaxed pt-0.5">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">04 / Projects</div>
          <div className="space-y-2.5">
            {data.projects.map((proj, i) => (
              <div key={i}>
                <div className="flex justify-between font-bold text-neutral-950 text-xs">
                  <span>{proj.name}</span>
                  {proj.tech && <span className="font-mono text-[10px] text-neutral-500 font-normal">{proj.tech}</span>}
                </div>
                <p className="text-[11px] text-neutral-700 mt-0.5">{proj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education & Certs in Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {data.education && data.education.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">05 / Education</div>
            {data.education.map((ed, i) => (
              <div key={i} className="text-xs">
                <div className="font-bold text-neutral-950">{ed.degree}</div>
                <div className="text-[10px] text-neutral-600">{ed.school} ({ed.duration})</div>
              </div>
            ))}
          </div>
        )}
        {data.certifications && data.certifications.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">06 / Credentials</div>
            {data.certifications.map((cert, i) => (
              <div key={i} className="text-xs font-semibold text-neutral-800">
                • {cert}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 6. CREATIVE TECH PORTFOLIO PRO TEMPLATE
// ============================================================================
export const CreativeProTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div className="font-sans text-slate-900 bg-white rounded-2xl overflow-hidden select-text text-xs shadow-sm">
      {/* Gradient Top Banner */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 text-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-purple-200 uppercase px-2 py-0.5 bg-white/10 rounded-full border border-white/20 inline-block mb-1.5">
              Verified Candidate
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
              {data.fullName || 'YOUR NAME'}
            </h1>
            <div className="text-xs font-semibold text-purple-200 mt-0.5">
              {data.jobTitle}
            </div>
          </div>
          <div className="text-left md:text-right text-[11px] text-purple-100 font-medium space-y-0.5">
            <div className="font-bold text-white">{data.email}</div>
            <div>{data.phone} • {data.location}</div>
            {data.github && <div className="text-[10px] text-purple-200">{data.github}</div>}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-5">
        {/* Summary Card */}
        {data.summary && (
          <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 text-slate-700 leading-relaxed">
            <span className="font-bold text-purple-900 uppercase text-[10px] block mb-0.5">Profile Focus</span>
            {data.summary}
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-purple-600" />
              <span>Core Stack & Expertise</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((skill, i) => (
                <span key={i} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-[10px] font-bold">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <span>Experience</span>
            </h3>
            <div className="space-y-3">
              {data.experience.map((exp, i) => (
                <div key={i} className="border-l-2 border-purple-400 pl-3 space-y-0.5">
                  <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                    <span>{exp.role}</span>
                    <span className="text-[10px] text-purple-700 font-semibold">{exp.duration}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600">{exp.company}</div>
                  <p className="text-[11px] text-slate-650 mt-1 leading-relaxed">{exp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-purple-600" />
              <span>Engineering Projects</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.projects.map((proj, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between items-center font-bold text-slate-900 text-xs">
                    <span>{proj.name}</span>
                    {proj.link && (
                      <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noreferrer" className="text-[10px] text-purple-700 hover:underline">
                        Launch ↗
                      </a>
                    )}
                  </div>
                  {proj.tech && <div className="text-[10px] font-semibold text-purple-600">{proj.tech}</div>}
                  <p className="text-[10px] text-slate-600 leading-snug">{proj.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Credentials & Education */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {data.certifications && data.certifications.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                <span>Certifications</span>
              </h3>
              <div className="space-y-1.5">
                {data.certifications.map((cert, i) => (
                  <div key={i} className="p-2 bg-purple-50/60 border border-purple-100 rounded-lg text-xs font-bold text-purple-950">
                    {cert}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.education && data.education.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span>Education</span>
              </h3>
              <div className="space-y-1.5">
                {data.education.map((ed, i) => (
                  <div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div className="font-bold text-slate-900">{ed.degree}</div>
                    <div className="text-[10px] text-slate-500">{ed.school} • {ed.duration}</div>
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

// ============================================================================
// 7. CANVA MODERN PHOTO TEMPLATE (Canva-Inspired 2-Column with Headshot)
// ============================================================================
export const CanvaModernPhotoTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const showHeadshot = data.showPhoto !== false && Boolean(data.photoUrl);
  return (
    <div className="font-sans text-slate-800 bg-white min-h-[900px] flex flex-col md:flex-row select-text text-[12px] leading-relaxed">
      {/* Left Accent Sidebar (Canva Style) */}
      <div className="w-full md:w-[36%] bg-slate-900 text-slate-200 p-6 md:p-8 flex flex-col justify-between space-y-6 print:bg-slate-900 print:text-slate-200">
        <div className="space-y-6">
          {/* Headshot Photo */}
          {showHeadshot ? (
            <div className="text-center">
              <div className="w-32 h-32 mx-auto rounded-3xl p-1 bg-gradient-to-tr from-indigo-500 via-sky-400 to-indigo-300 shadow-xl overflow-hidden">
                <img
                  src={data.photoUrl}
                  alt={data.fullName}
                  className="w-full h-full object-cover rounded-[20px]"
                />
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-3xl font-black shadow-lg">
                {(data.fullName || 'H').charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-2.5 pt-1">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-400 pb-1 border-b border-slate-800">
              Contact & Links
            </h3>
            <div className="space-y-2 text-[11px] text-slate-300">
              {data.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <a href={`mailto:${data.email}`} className="truncate hover:text-white">
                    {data.email}
                  </a>
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{data.phone}</span>
                </div>
              )}
              {data.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{data.location}</span>
                </div>
              )}
              {data.github && (
                <div className="flex items-center gap-2">
                  <GithubIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <a
                    href={data.github.startsWith('http') ? data.github : `https://${data.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:text-white"
                  >
                    {data.github.replace('https://', '')}
                  </a>
                </div>
              )}
              {data.linkedin && (
                <div className="flex items-center gap-2">
                  <LinkedinIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <a
                    href={data.linkedin.startsWith('http') ? data.linkedin : `https://${data.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:text-white"
                  >
                    LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Core Technical Skills with Visual Bars */}
          {data.skills && data.skills.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-400 pb-1 border-b border-slate-800">
                Skills & Tech Stack
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {data.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-200 text-[10px] font-bold border border-slate-700/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-400 pb-1 border-b border-slate-800">
                Education
              </h3>
              <div className="space-y-2 text-[11px]">
                {data.education.map((ed, i) => (
                  <div key={i} className="space-y-0.5">
                    <div className="font-bold text-white leading-tight">{ed.degree}</div>
                    <div className="text-indigo-300 text-[10px]">{ed.school}</div>
                    <div className="text-slate-400 text-[9px] font-mono">{ed.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {data.certifications && data.certifications.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-400 pb-1 border-b border-slate-800">
                Certifications
              </h3>
              <div className="space-y-1.5 text-[10px]">
                {data.certifications.map((cert, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="w-full md:w-[64%] p-6 md:p-10 space-y-6">
        {/* Header Name & Title */}
        <div className="border-b-2 border-slate-100 pb-4 space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight uppercase">
            {data.fullName || 'YOUR NAME'}
          </h1>
          <div className="text-sm font-bold text-indigo-600 tracking-wide">
            {data.jobTitle || 'FULL-STACK & CLOUD ENGINEER'}
          </div>
        </div>

        {/* Executive Summary */}
        {data.summary && (
          <div className="space-y-2">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>Professional Summary</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed pl-3 border-l-2 border-indigo-500">
              {data.summary}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {data.experience && data.experience.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>Work Experience</span>
            </h3>
            <div className="space-y-4">
              {data.experience.map((exp, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex flex-wrap justify-between items-baseline gap-1">
                    <span className="font-bold text-slate-900 text-xs">{exp.role}</span>
                    <span className="text-[10px] font-mono text-slate-500">{exp.duration}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-indigo-600">{exp.company}</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{exp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Featured Engineering Projects</span>
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {data.projects.map((proj, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between items-baseline gap-1">
                    <span className="font-bold text-slate-900 text-xs">{proj.name}</span>
                    {proj.link && (
                      <a
                        href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5"
                      >
                        <span>Demo</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  {proj.tech && (
                    <div className="text-[10px] font-mono font-semibold text-indigo-500">
                      {proj.tech}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-600 leading-relaxed">{proj.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 8. EXECUTIVE HEADSHOT TEMPLATE (Executive Portrait with Deep Slate Header)
// ============================================================================
export const ExecutiveHeadshotTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const showHeadshot = data.showPhoto !== false && Boolean(data.photoUrl);
  return (
    <div className="font-sans text-slate-900 bg-white p-8 md:p-12 leading-normal select-text text-[12px]">
      {/* Top Corporate Executive Header Band with Headshot */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b-2 border-slate-900">
        {showHeadshot ? (
          <div className="w-28 h-28 rounded-2xl p-1 bg-slate-900 shadow-md shrink-0 overflow-hidden">
            <img
              src={data.photoUrl}
              alt={data.fullName}
              className="w-full h-full object-cover rounded-[12px]"
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl font-black shrink-0 shadow-md">
            {(data.fullName || 'H').charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-slate-950 uppercase">
            {data.fullName || 'YOUR NAME'}
          </h1>
          <div className="text-xs font-bold text-slate-600 tracking-wider uppercase">
            {data.jobTitle || 'SENIOR SOFTWARE ENGINEER'}
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-[11px] text-slate-600 pt-1">
            {data.email && (
              <a href={`mailto:${data.email}`} className="text-slate-900 hover:underline">
                {data.email}
              </a>
            )}
            {data.phone && <span>• {data.phone}</span>}
            {data.location && <span>• {data.location}</span>}
            {data.github && (
              <span>• <a href={data.github.startsWith('http') ? data.github : `https://${data.github}`} target="_blank" rel="noreferrer" className="text-slate-900 hover:underline">GitHub</a></span>
            )}
            {data.linkedin && (
              <span>• <a href={data.linkedin.startsWith('http') ? data.linkedin : `https://${data.linkedin}`} target="_blank" rel="noreferrer" className="text-slate-900 hover:underline">LinkedIn</a></span>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="py-4 border-b border-slate-200">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-950 mb-1.5">
            Executive Summary
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            {data.summary}
          </p>
        </div>
      )}

      {/* Core Technical Competencies */}
      {data.skills && data.skills.length > 0 && (
        <div className="py-4 border-b border-slate-200">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-950 mb-2">
            Technical Proficiencies
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-900 rounded text-[11px] font-semibold border border-slate-200">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="py-4 border-b border-slate-200 space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-950">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                  <span>{exp.role}</span>
                  <span className="text-[11px] font-mono text-slate-500">{exp.duration}</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-700">{exp.company}</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects & Education in Dual Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {data.projects && data.projects.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-950">
              Key Projects
            </h2>
            <div className="space-y-3">
              {data.projects.map((proj, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-xs text-slate-900">{proj.name}</div>
                  {proj.tech && <div className="text-[10px] font-mono text-slate-500">{proj.tech}</div>}
                  <p className="text-[10px] text-slate-600 leading-snug">{proj.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {data.education && data.education.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-950">
                Education
              </h2>
              <div className="space-y-2">
                {data.education.map((ed, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-xs text-slate-900">{ed.degree}</div>
                    <div className="text-[11px] text-slate-600">{ed.school} • {ed.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.certifications && data.certifications.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-950">
                Certifications
              </h2>
              <div className="space-y-1.5">
                {data.certifications.map((cert, i) => (
                  <div key={i} className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-slate-900 shrink-0" />
                    <span>{cert}</span>
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

// ============================================================================
// MAIN TEMPLATE RENDERER
// ============================================================================
export const ResumeTemplateRenderer: React.FC<{
  templateId: TemplateId;
  data: ResumeData;
}> = ({ templateId, data }) => {
  switch (templateId) {
    case 'canva_modern_photo':
      return <CanvaModernPhotoTemplate data={data} />;
    case 'executive_headshot':
      return <ExecutiveHeadshotTemplate data={data} />;
    case 'overleaf_classic':
      return <OverleafClassicTemplate data={data} />;
    case 'modern_tech':
      return <ModernTechTemplate data={data} />;
    case 'executive_split':
      return <ExecutiveSplitTemplate data={data} />;
    case 'silicon_clean':
      return <SiliconCleanTemplate data={data} />;
    case 'nordic_minimal':
      return <NordicMinimalTemplate data={data} />;
    case 'creative_pro':
      return <CreativeProTemplate data={data} />;
    default:
      return <OverleafClassicTemplate data={data} />;
  }
};
