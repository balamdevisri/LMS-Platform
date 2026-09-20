import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Globe,
  Copy,
  Check,
  Palette,
  Sparkles
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';
import { LottieLoader } from '@/components/common/LottieLoader';
import {
  PortfolioTemplateRenderer,
  PORTFOLIO_TEMPLATES_CONFIG,
  type PortfolioTemplateId,
  type PortfolioData
} from '@/components/portfolio/templates/PortfolioTemplates';

export const PublicPortfolio: React.FC = () => {
  const { handleOrId } = useParams<{ handleOrId: string }>();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<PortfolioTemplateId>('modern_tech');
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
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
          const mergedData: PortfolioData = {
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
            template: data.template || (localStorage.getItem('shaivika_portfolio_template') as PortfolioTemplateId) || 'modern_tech',
          };
          setPortfolio(mergedData);
          if (mergedData.template) {
            setCurrentTemplate(mergedData.template as PortfolioTemplateId);
          }
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
        const savedTemplate = (localStorage.getItem('shaivika_portfolio_template') as PortfolioTemplateId) || 'modern_tech';

        const localFullName = localStorage.getItem('shaivika_portfolio_fullname') || localUser?.fullName || localUser?.name;
        const localHeadline = localStorage.getItem('shaivika_portfolio_headline') || 'Full-Stack Developer & AI Systems Specialist';
        const localLocation = localStorage.getItem('shaivika_portfolio_location') || 'India';

        if (
          !localHandle ||
          localHandle === handleOrId ||
          handleOrId === 'preview' ||
          (localUser && (localUser.uid === handleOrId || localUser.email?.split('@')[0] === handleOrId))
        ) {
          const fallbackData: PortfolioData = {
            fullName: localFullName || 'Developer Scholar',
            headline: localHeadline,
            bio: localStorage.getItem('shaivika_portfolio_bio') || 'Passionate technologist mastering cloud systems, distributed platforms, and full-stack software architecture.',
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
            template: savedTemplate,
            isPublished: true,
          };
          setPortfolio(fallbackData);
          setCurrentTemplate(savedTemplate);
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
        <LottieLoader size="lg" message="Loading verified portfolio profile..." />
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

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Template Renderer */}
      <PortfolioTemplateRenderer templateId={currentTemplate} data={portfolio} />

      {/* Interactive Floating Template Switcher (Allows live switching between portfolio styles) */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 print:hidden">
        {showTemplateMenu && (
          <div className="p-3 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl space-y-2 mb-1 w-64 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                <span>Switch Template</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Live Preview</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {PORTFOLIO_TEMPLATES_CONFIG.map((t) => {
                const isActive = currentTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setCurrentTemplate(t.id);
                      setShowTemplateMenu(false);
                      toast.success(`Template changed to ${t.name}`);
                    }}
                    className={`p-2 rounded-xl text-left transition-all flex items-center justify-between text-xs cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'text-slate-300 hover:bg-slate-900 border border-transparent font-medium'
                    }`}
                  >
                    <div>
                      <div className="text-[11px]">{t.name}</div>
                      <div className="text-[9px] text-slate-500 line-clamp-1">{t.tagline}</div>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg hover:border-slate-500 backdrop-blur-md"
            title="Copy Portfolio URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
          </button>

          <button
            onClick={() => setShowTemplateMenu(!showTemplateMenu)}
            className="px-3.5 py-2 rounded-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-xl shadow-cyan-950/40 cursor-pointer transition-all active:scale-95"
            title="Change Portfolio Style"
          >
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Change Style</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicPortfolio;
