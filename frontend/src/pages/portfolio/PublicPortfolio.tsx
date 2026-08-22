import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Globe,
  ExternalLink,
  Code,
  Copy,
  Check,
  Sparkles,
  GraduationCap,
  Briefcase,
  MapPin,
  Mail
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';

export const PublicPortfolio: React.FC = () => {
  const { handleOrId } = useParams<{ handleOrId: string }>();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!handleOrId) {
      setError('Invalid portfolio URL parameter.');
      setLoading(false);
      return;
    }

    const fetchPortfolio = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/portfolio/public/${encodeURIComponent(handleOrId)}`);
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          const localFullName = localStorage.getItem('shaivika_portfolio_fullname');
          const localHeadline = localStorage.getItem('shaivika_portfolio_headline');
          const localBio = localStorage.getItem('shaivika_portfolio_bio');
          const localGithub = localStorage.getItem('shaivika_portfolio_github');
          const localLinkedin = localStorage.getItem('shaivika_portfolio_linkedin');
          const localWebsite = localStorage.getItem('shaivika_portfolio_website');
          const localLocation = localStorage.getItem('shaivika_portfolio_location');

          const data = json.data;
          const mergedData = {
            ...data,
            fullName: (data.fullName === 'Scholar Student' || data.fullName === 'Student Developer' || !data.fullName) 
              ? (localFullName || data.fullName || 'Student Developer') 
              : data.fullName,
            headline: (localHeadline && (!data.headline || data.headline.includes('Passionate technologist'))) 
              ? localHeadline 
              : (data.headline || localHeadline),
            bio: (localBio && (!data.bio || data.bio.includes('Passionate technologist'))) 
              ? localBio 
              : (data.bio || localBio),
            githubUrl: localGithub || data.githubUrl || data.githubLink,
            linkedinUrl: localLinkedin || data.linkedinUrl || data.linkedinLink,
            websiteUrl: localWebsite || data.websiteUrl || data.websiteLink,
            location: localLocation || data.location,
          };
          setPortfolio(mergedData);
          setLoading(false);
          return;
        }
      } catch (err: any) {
        console.warn('Backend portfolio fetch notice:', err);
      }

      // Local fallback for author preview
      try {
        const localHandle = localStorage.getItem('shaivika_portfolio_handle');
        const localUserRaw = localStorage.getItem('shaivika_user');
        const localUser = localUserRaw ? JSON.parse(localUserRaw) : null;
        const skillsRaw = localStorage.getItem('shaivika_portfolio_skills');
        const projectsRaw = localStorage.getItem('shaivika_portfolio_projects');
        const experienceRaw = localStorage.getItem('shaivika_portfolio_experience');
        const educationRaw = localStorage.getItem('shaivika_portfolio_education');

        const localFullName = localStorage.getItem('shaivika_portfolio_fullname') || localUser?.fullName || localUser?.name;
        const localHeadline = localStorage.getItem('shaivika_portfolio_headline') || 'Full-Stack Developer & AI Systems Specialist';
        const localLocation = localStorage.getItem('shaivika_portfolio_location') || 'Hyderabad, India';

        if (
          !localHandle ||
          localHandle === handleOrId ||
          handleOrId === 'preview' ||
          (localUser && (localUser.uid === handleOrId || localUser.email?.split('@')[0] === handleOrId))
        ) {
          const fallbackData = {
            fullName: localFullName || 'Bhanu prakash achari',
            headline: localHeadline,
            bio: localStorage.getItem('shaivika_portfolio_bio') || 'Passionate technologist mastering Linux kernel systems, distributed cloud platforms, and generative AI foundations. Proven project implementations with scalable architecture.',
            githubUrl: localStorage.getItem('shaivika_portfolio_github') || 'https://github.com',
            linkedinUrl: localStorage.getItem('shaivika_portfolio_linkedin') || 'https://linkedin.com',
            websiteUrl: localStorage.getItem('shaivika_portfolio_website') || '',
            location: localLocation,
            email: localUser?.email || '',
            skills: skillsRaw ? JSON.parse(skillsRaw) : ['Linux Systems', 'TypeScript', 'React.js', 'Docker', 'AI Foundation', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
            projects: projectsRaw ? JSON.parse(projectsRaw) : [
              {
                id: 'p1',
                title: 'KaizenQ AI Classroom & Learning Engine',
                description: 'Real-time WebSocket interactive learning platform with telemetry and live socket synchronization.',
                tags: ['React', 'TypeScript', 'Socket.IO', 'TailwindCSS'],
                githubUrl: 'https://github.com',
                liveUrl: 'https://www.kaizenq.in',
                featured: true,
              }
            ],
            experiences: experienceRaw ? JSON.parse(experienceRaw) : [],
            educations: educationRaw ? JSON.parse(educationRaw) : [],
            certificatesCount: 2,
            xp: 1850,
            level: 3,
            accentColor: 'cyan',
            isPublished: true,
          };
          setPortfolio(fallbackData);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Local portfolio fallback notice:', e);
      }

      setError('Portfolio not found or set to private.');
      setLoading(false);
    };

    fetchPortfolio();
  }, [handleOrId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Public Portfolio link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading verified portfolio profile...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-3xl bg-rose-950/40 border border-rose-800/60 text-rose-400 flex items-center justify-center text-2xl mb-4 shadow-xl">
          🔒
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white mb-2">Portfolio Unavailable</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6">{error || 'This portfolio does not exist or has been made private by the author.'}</p>
      </div>
    );
  }

  const name = portfolio.fullName || portfolio.name || 'Developer';
  const headline = portfolio.headline || 'Software Engineer & Technologist';
  const bio = portfolio.bio || '';
  const location = portfolio.location || 'India';
  const email = portfolio.email || portfolio.contactEmail || '';
  const githubLink = portfolio.githubUrl || portfolio.githubLink || '';
  const linkedinLink = portfolio.linkedinUrl || portfolio.linkedinLink || '';
  const websiteLink = portfolio.websiteUrl || portfolio.websiteLink || '';
  const skills = portfolio.skills || [];
  const projects = portfolio.projects || [];
  const experience = portfolio.experiences || portfolio.experience || [];
  const education = portfolio.educations || portfolio.education || [];
  const avatarUrl = portfolio.avatarUrl || portfolio.photoURL || portfolio.avatar || localStorage.getItem('shaivika_portfolio_avatar') || '';

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-24 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-[600px] right-[-100px] w-[500px] h-[500px] bg-cyan-600/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[200px] left-[-100px] w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Floating Top Action Bar (Clean, Student-Only) */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1.5px] shadow-md">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-xs font-black text-white">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>
          <span className="text-xs font-bold text-slate-300 tracking-wide uppercase font-mono">
            {name}
          </span>
        </div>

        <button
          onClick={handleCopyLink}
          className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-slate-500 backdrop-blur-md"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? 'Link Copied' : 'Share Portfolio'}</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-6 z-10">
        <div className="relative bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-950/80 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-cyan-400 p-[2.5px] shadow-2xl shadow-indigo-500/10 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover rounded-[22px]" />
              ) : (
                <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-5xl font-black text-white">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 text-center md:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Verified Developer
              </span>

              {location && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs font-medium">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {location}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-white tracking-tight">
                {name}
              </h1>
              {headline && (
                <p className="text-sm sm:text-base font-semibold text-indigo-300 mt-1">
                  {headline}
                </p>
              )}
            </div>

            {bio && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
                {bio}
              </p>
            )}

            {/* Social & Contact Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              {githubLink && (
                <a
                  href={githubLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all hover:border-slate-500 shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

              {linkedinLink && (
                <a
                  href={linkedinLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all hover:border-slate-500 shadow-sm"
                >
                  <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

              {websiteLink && (
                <a
                  href={websiteLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all hover:border-slate-500 shadow-sm"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Website</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

              {email && (
                <a
                  href={`mailto:${email}`}
                  className="px-4 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white border border-indigo-500/50 text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
                >
                  <Mail className="w-4 h-4 text-white" />
                  <span>Get in Touch</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10 relative z-10">
        
        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-4 backdrop-blur-md shadow-xl">
            <h2 className="text-base sm:text-lg font-heading font-extrabold text-white flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Technical Core Competencies
            </h2>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {skills.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs font-semibold hover:border-indigo-500/60 hover:text-white transition-all shadow-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Featured Projects Section */}
        {projects && projects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-heading font-extrabold text-white flex items-center gap-2.5 px-1">
              <Code className="w-5 h-5 text-cyan-400" />
              Featured Engineering Projects
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-slate-800/80 hover:border-slate-700 rounded-3xl p-6 space-y-4 transition-all flex flex-col justify-between backdrop-blur-md shadow-xl hover:shadow-indigo-500/5 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-heading font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                        {proj.title || proj.name}
                      </h3>
                      {proj.featured && (
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold shrink-0">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {proj.description || proj.desc}
                    </p>
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.tags.map((tag: string, tIdx: number) => (
                          <span key={tIdx} className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                      >
                        <Code className="w-3.5 h-3.5" />
                        <span>Source Code</span>
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors ml-auto"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience & Education */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experience && experience.length > 0 && (
            <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-7 space-y-4 backdrop-blur-md shadow-xl">
              <h2 className="text-base font-heading font-extrabold text-white flex items-center gap-2">
                <Briefcase className="w-4.5 h-4.5 text-indigo-400" />
                Work Experience
              </h2>
              <div className="space-y-4 pt-1">
                {experience.map((exp: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-indigo-500/40 pl-4 space-y-1">
                    <h3 className="text-xs font-bold text-white">{exp.role}</h3>
                    <p className="text-[11px] font-semibold text-indigo-300">{exp.company} • {exp.duration}</p>
                    <p className="text-[11px] text-slate-400">{exp.description || exp.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {education && education.length > 0 && (
            <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-7 space-y-4 backdrop-blur-md shadow-xl">
              <h2 className="text-base font-heading font-extrabold text-white flex items-center gap-2">
                <GraduationCap className="w-4.5 h-4.5 text-cyan-400" />
                Academic Background
              </h2>
              <div className="space-y-4 pt-1">
                {education.map((ed: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-cyan-500/40 pl-4 space-y-1">
                    <h3 className="text-xs font-bold text-white">{ed.degree}</h3>
                    <p className="text-[11px] font-semibold text-cyan-300">{ed.institution || ed.school}</p>
                    <p className="text-[11px] text-slate-400">{ed.year || ed.duration}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Minimal Student Portfolio Footer */}
      <footer className="mt-20 py-8 text-center text-xs text-slate-500 font-medium relative z-10 border-t border-slate-800/40">
        <p>© {new Date().getFullYear()} {name} • Verified Developer Portfolio</p>
      </footer>
    </div>
  );
};

export default PublicPortfolio;
