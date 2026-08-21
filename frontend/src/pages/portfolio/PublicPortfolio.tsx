import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Globe,
  ExternalLink,
  Code,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  GraduationCap,
  Briefcase
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
            fullName: (data.fullName === 'Scholar Student' || data.fullName === 'Student Developer' || !data.fullName) ? (localFullName || data.fullName || 'hemadri') : data.fullName,
            headline: (localHeadline && (!data.headline || data.headline.includes('Passionate technologist'))) ? localHeadline : (data.headline || localHeadline),
            bio: (localBio && (!data.bio || data.bio.includes('Passionate technologist'))) ? localBio : (data.bio || localBio),
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

        const localFullName = localStorage.getItem('shaivika_portfolio_fullname') || localUser?.fullName || localUser?.name;
        const localHeadline = localStorage.getItem('shaivika_portfolio_headline') || 'Full-Stack Developer & AI Systems Specialist | Building Scalable Cloud Apps';
        const localLocation = localStorage.getItem('shaivika_portfolio_location') || 'Hyderabad, India';

        if (
          !localHandle ||
          localHandle === handleOrId ||
          handleOrId === 'preview' ||
          (localUser && (localUser.uid === handleOrId || localUser.email?.split('@')[0] === handleOrId))
        ) {
          const fallbackData = {
            fullName: localFullName || 'hemadri',
            headline: localHeadline,
            bio: localStorage.getItem('shaivika_portfolio_bio') || 'Passionate technologist mastering Linux kernel systems, distributed cloud platforms, and generative AI foundations.',
            githubUrl: localStorage.getItem('shaivika_portfolio_github') || 'https://github.com',
            linkedinUrl: localStorage.getItem('shaivika_portfolio_linkedin') || 'https://linkedin.com',
            websiteUrl: localStorage.getItem('shaivika_portfolio_website') || 'https://www.kaizenq.in',
            location: localLocation,
            skills: skillsRaw ? JSON.parse(skillsRaw) : ['Linux Systems', 'TypeScript', 'React.js', 'Docker', 'AI Foundation'],
            projects: projectsRaw ? JSON.parse(projectsRaw) : [
              {
                id: 'p1',
                title: 'KaizenQ AI Classroom & Learning Engine',
                description: 'Real-time WebSocket interactive learning platform with telemetry and live socket sync.',
                tags: ['React', 'TypeScript', 'Socket.IO', 'TailwindCSS'],
                githubUrl: 'https://github.com',
                liveUrl: 'https://www.kaizenq.in',
                featured: true,
              }
            ],
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
      toast.success('Public Portfolio URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400">Loading verified portfolio profile...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-3xl bg-rose-950/50 border border-rose-800/80 text-rose-400 flex items-center justify-center text-2xl mb-4 shadow-xl">
          🔒
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white mb-2">Portfolio Unavailable</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6">{error || 'This portfolio does not exist or has been made private by the author.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Platform
        </Link>
      </div>
    );
  }

  const name = portfolio.fullName || portfolio.name || 'Student Scholar';
  const bio = portfolio.bio || '';
  const githubLink = portfolio.githubUrl || portfolio.githubLink || '';
  const linkedinLink = portfolio.linkedinUrl || portfolio.linkedinLink || '';
  const websiteLink = portfolio.websiteUrl || portfolio.websiteLink || '';
  const customHandle = portfolio.customHandle || handleOrId;
  const skills = portfolio.skills || [];
  const projects = portfolio.projects || [];
  const experience = portfolio.experiences || portfolio.experience || [];
  const education = portfolio.educations || portfolio.education || [];
  const avatarUrl = portfolio.avatarUrl || portfolio.photoURL || portfolio.avatar || localStorage.getItem('shaivika_portfolio_avatar') || '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white pb-20">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              S
            </div>
            <span className="font-heading font-black text-sm text-white tracking-tight hidden sm:inline">
              Shaivika <span className="text-indigo-400">AI LMS</span>
            </span>
          </Link>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-xs font-mono font-bold text-slate-400">@{customHandle}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share Link'}</span>
          </button>
          <Link
            to="/auth/signup"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            Join Shaivika
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-indigo-500 via-blue-600 to-cyan-400 p-1 shadow-2xl shrink-0 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover rounded-[22px]" />
            ) : (
              <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-4xl sm:text-5xl font-black text-white">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3.5 text-center md:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 -ml-3.5" />
                Verified Scholar
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800 text-indigo-300 text-[11px] font-bold">
                Shaivika AI Foundation
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-heading font-black text-white tracking-tight">
              {name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
              {bio || 'Aspiring technology practitioner mastering software engineering, cloud systems, and AI architecture.'}
            </p>

            {/* Social Coordinates */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              {githubLink && (
                <a
                  href={githubLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold flex items-center gap-2 transition-all hover:border-slate-600"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              )}

              {linkedinLink && (
                <a
                  href={linkedinLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold flex items-center gap-2 transition-all hover:border-slate-600"
                >
                  <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              )}

              {websiteLink && (
                <a
                  href={websiteLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold flex items-center gap-2 transition-all hover:border-slate-600"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Website</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-base sm:text-lg font-heading font-extrabold text-white flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Technical Core Competencies
            </h2>
            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs font-semibold hover:border-indigo-500 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
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
                  className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 space-y-3 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <h3 className="font-heading font-bold text-sm text-white">{proj.title || proj.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{proj.description || proj.desc}</p>
                  </div>
                  {(proj.githubUrl || proj.repo || proj.liveUrl) && (
                    <a
                      href={proj.githubUrl || proj.repo || proj.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors pt-2"
                    >
                      <span>View Repository / Live Demo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience & Education split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experience && experience.length > 0 && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-base font-heading font-extrabold text-white flex items-center gap-2">
                <Briefcase className="w-4.5 h-4.5 text-indigo-400" />
                Work Experience
              </h2>
              <div className="space-y-4">
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
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-base font-heading font-extrabold text-white flex items-center gap-2">
                <GraduationCap className="w-4.5 h-4.5 text-cyan-400" />
                Academic Background
              </h2>
              <div className="space-y-4">
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

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 font-medium">
        <p>Verified Portfolio Profile hosted on Shaivika AI Foundation Learning Management System.</p>
      </footer>
    </div>
  );
};

export default PublicPortfolio;
