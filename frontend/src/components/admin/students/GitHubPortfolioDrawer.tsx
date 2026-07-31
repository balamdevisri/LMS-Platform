import React from 'react';
import {
  X,
  ExternalLink,
  MapPin,
  Building,
  Globe,
  GitFork,
  Star,
  BookOpen,
  Calendar,
  Sparkles,
  Code2,
} from 'lucide-react';
import type { StudentUser } from '@/services/studentService';

interface Props {
  student: StudentUser | null;
  onClose: () => void;
}

export const GitHubPortfolioDrawer: React.FC<Props> = ({ student, onClose }) => {
  if (!student) return null;

  const ghObj = typeof student.github === 'object' && student.github !== null ? student.github : {};

  const gh = {
    username: ghObj.username || student.githubUsername || 'N/A',
    profileUrl: ghObj.profileUrl || student.githubUrl || `https://github.com/${student.githubUsername || ''}`,
    avatar: ghObj.avatar || (student as any).avatar || student.profilePhoto || student.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: ghObj.bio || student.bio || 'KaizenQ LMS Student & Developer',
    company: ghObj.company || '',
    location: ghObj.location || student.college || 'India',
    website: ghObj.website || student.portfolio || '',
    followers: typeof ghObj.followers === 'number' ? ghObj.followers : 0,
    following: typeof ghObj.following === 'number' ? ghObj.following : 0,
    repositories: typeof ghObj.repositories === 'number' ? ghObj.repositories : 0,
    joinedDate: ghObj.joinedDate || student.createdAt || new Date().toISOString(),
    repos: Array.isArray(ghObj.repos) ? ghObj.repos : [],
  };

  const repos = gh.repos || [];
  const skills = student.skills || ['Linux CLI', 'Git & GitHub', 'Python', 'DevOps'];
  const languages = student.languages || (repos.map((r: any) => r.language).filter((l: string) => l && l !== 'Plain Text')) || ['TypeScript', 'Python'];
  const repoScore = student.repoScore || Math.min(100, (gh.repositories || 0) * 5 + (gh.followers || 0) * 2);
  const activityScore = student.activityScore || 85;
  const overallAIScore = student.overallAIScore || Math.min(100, 50 + (gh.repositories || 0) * 2);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-end animate-in fade-in duration-200 font-['Sora']">
      <div className="bg-white border-l border-sky-200 w-full max-w-2xl h-full flex flex-col justify-between shadow-2xl overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="p-6 border-b border-sky-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg text-white leading-tight">
                GitHub Developer Profile
              </h2>
              <p className="text-xs text-slate-400">
                Verified GitHub Profile & Repository Telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main GitHub Hero Card */}
          <div className="p-6 rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-sky-950 text-white space-y-5 shadow-xl border border-slate-700/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
              <img
                src={gh.avatar || student.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={gh.username}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-400 shadow-lg shrink-0"
              />
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading font-extrabold text-xl text-white">
                    {student.fullName || student.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-extrabold font-mono">
                    @{gh.username}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {gh.bio || 'KaizenQ LMS Student & Code Developer'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  {gh.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" /> {gh.location}
                    </span>
                  )}
                  {gh.company && (
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-sky-400" /> {gh.company}
                    </span>
                  )}
                  {gh.joinedDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" /> Joined {new Date(gh.joinedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700/80 font-mono text-center">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="block text-xl font-extrabold text-sky-400">{gh.repositories}</span>
                <span className="text-[10px] text-slate-400 uppercase font-sans">Repositories</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="block text-xl font-extrabold text-emerald-400">{gh.followers}</span>
                <span className="text-[10px] text-slate-400 uppercase font-sans">Followers</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="block text-xl font-extrabold text-purple-400">{gh.following}</span>
                <span className="text-[10px] text-slate-400 uppercase font-sans">Following</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={gh.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Code2 className="w-4 h-4" /> Open GitHub Profile <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {gh.website && (
                <a
                  href={gh.website.startsWith('http') ? gh.website : `https://${gh.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-sky-300" /> Website / Blog <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* AI Ready Analysis Metrics */}
          <div className="p-5 rounded-3xl bg-sky-50 border border-sky-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" /> AI Competency Score & Telemetry
              </h4>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded-full">
                AI Ready
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div className="p-3 bg-white rounded-2xl border border-sky-100 shadow-2xs">
                <span className="block text-lg font-extrabold text-sky-700">{repoScore}/100</span>
                <span className="text-[10px] text-slate-500 uppercase font-sans">Repo Score</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-sky-100 shadow-2xs">
                <span className="block text-lg font-extrabold text-emerald-700">{activityScore}%</span>
                <span className="text-[10px] text-slate-500 uppercase font-sans">Activity Score</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-sky-100 shadow-2xs">
                <span className="block text-lg font-extrabold text-purple-700">{overallAIScore}/100</span>
                <span className="text-[10px] text-slate-500 uppercase font-sans">Overall AI Index</span>
              </div>
            </div>

            {/* Languages & Frameworks Badges */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Detected Languages & Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {languages.map((lang: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-sky-200 text-sky-900 text-xs font-bold font-mono">
                    ⚡ {lang}
                  </span>
                ))}
                {skills.map((skill: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* GitHub Repositories Showcase Section */}
          <div className="space-y-3">
            <h4 className="font-heading font-extrabold text-sm text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-600" /> Public Repositories ({repos.length})
              </span>
              <span className="text-xs text-slate-500 font-normal">Sorted by recent activity</span>
            </h4>

            {repos.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-sky-100 text-center space-y-1">
                <p className="text-xs text-slate-500 font-medium">No public repositories fetched or profile has zero public repos.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {repos.map((repo: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-sky-100 hover:border-sky-300 shadow-2xs hover:shadow-md transition-all space-y-2 group">
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-heading font-extrabold text-xs text-sky-900 group-hover:text-sky-600 transition-colors flex items-center gap-1.5 truncate"
                      >
                        <Code2 className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="truncate">{repo.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-bold uppercase shrink-0">
                        {repo.visibility || 'public'}
                      </span>
                    </div>

                    {repo.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 font-sans">
                        {repo.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-500 pt-1">
                      {repo.language && (
                        <span className="font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-current" /> {repo.stars}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 font-bold">
                        <GitFork className="w-3 h-3" /> {repo.forks}
                      </span>
                      {repo.updatedDate && (
                        <span className="text-slate-400 font-sans">
                          Updated: {new Date(repo.updatedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sky-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Student Status: <strong className="uppercase text-sky-700">{student.status || 'pending'}</strong>
          </span>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Close Profile Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
