import React from 'react';
import { GitBranch, Calendar, User, Tag } from 'lucide-react';
import type { GitCommitNode } from '@/services/sandboxService';

interface GitBranchGraphProps {
  commits: GitCommitNode[];
  selectedCommitHash?: string;
  onSelectCommit: (commit: GitCommitNode) => void;
  isNightMode?: boolean;
}

export const GitBranchGraph: React.FC<GitBranchGraphProps> = ({
  commits,
  selectedCommitHash,
  onSelectCommit,
  isNightMode = true,
}) => {
  return (
    <div className={`p-4 rounded-2xl border space-y-4 font-mono text-xs ${
      isNightMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-sky-100 text-slate-800'
    }`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          <h3 className="font-heading font-extrabold text-sm text-cyan-300">Visual Git Commit Graph</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
          {commits.length} Commits
        </span>
      </div>

      <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-linear-to-b before:from-cyan-500 before:via-blue-500 before:to-indigo-500">
        {commits.map((commit, idx) => {
          const isSelected = selectedCommitHash === commit.hash || idx === 0;

          return (
            <div
              key={commit.hash}
              onClick={() => onSelectCommit(commit)}
              className={`relative pl-9 pr-3 py-3 rounded-xl border transition-all cursor-pointer group ${
                isSelected
                  ? isNightMode
                    ? 'bg-slate-900 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                    : 'bg-sky-50 border-sky-300 shadow-xs'
                  : isNightMode
                  ? 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900 hover:border-slate-700'
                  : 'bg-slate-50 border-slate-200 hover:bg-sky-50/50'
              }`}
            >
              {/* Commit Node Circle */}
              <div className={`absolute left-2.5 top-3.5 w-3.5 h-3.5 rounded-full border-2 transition-transform group-hover:scale-125 ${
                idx === 0
                  ? 'bg-cyan-400 border-cyan-200 shadow-xs shadow-cyan-400'
                  : 'bg-slate-800 border-slate-600'
              }`} />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-cyan-400 font-mono text-[11px] bg-slate-900/80 px-1.5 py-0.5 rounded-md border border-slate-800">
                      {commit.shortHash}
                    </span>
                    <span className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {commit.message}
                    </span>
                  </div>

                  {commit.refs && commit.refs.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {commit.refs.map((r: string, rIdx: number) => (
                        <span
                          key={rIdx}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                            r.includes('HEAD')
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : r.includes('origin')
                              ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                              : 'bg-sky-950 text-sky-300 border-sky-800'
                          }`}
                        >
                          <Tag className="w-3 h-3" />
                          <span>{r}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-normal">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-cyan-500" />
                    <span>{commit.author}</span>
                  </span>

                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{new Date(commit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
