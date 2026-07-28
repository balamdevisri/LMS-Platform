import React, { useState } from 'react';
import { FileCode, Plus, Minus } from 'lucide-react';
import type { GitFileStatus } from '@/services/sandboxService';

interface GitDiffViewerProps {
  selectedFile?: GitFileStatus;
  isNightMode?: boolean;
  onStageFile?: (filePath: string) => void;
  onUnstageFile?: (filePath: string) => void;
}

export const GitDiffViewer: React.FC<GitDiffViewerProps> = ({
  selectedFile,
  isNightMode = true,
  onStageFile,
  onUnstageFile,
}) => {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');

  const sampleDiffLines = [
    { type: 'header', text: `diff --git a/${selectedFile?.path || 'src/App.tsx'} b/${selectedFile?.path || 'src/App.tsx'}` },
    { type: 'header', text: '--- a/src/App.tsx' },
    { type: 'header', text: '+++ b/src/App.tsx' },
    { type: 'context', text: '@@ -12,6 +12,12 @@ export function App() {' },
    { type: 'context', text: '   const [user, setUser] = useState<User | null>(null);' },
    { type: 'deletion', text: '-  const [loading, setLoading] = useState(false);' },
    { type: 'addition', text: '+  const [loading, setLoading] = useState(true);' },
    { type: 'addition', text: '+  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);' },
    { type: 'addition', text: '+  // Enable isolated Docker sandbox session telemetry' },
    { type: 'context', text: '   useEffect(() => {' },
    { type: 'context', text: '     fetchUserProfile();' },
    { type: 'context', text: '   }, []);' },
  ];

  return (
    <div className={`rounded-2xl border overflow-hidden flex flex-col h-full font-mono text-xs ${
      isNightMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-sky-100 text-slate-800'
    }`}>
      {/* Diff Header Bar */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-100">{selectedFile?.path || 'src/App.tsx'}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              selectedFile?.staged
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}
          >
            {selectedFile?.staged ? 'Staged' : 'Unstaged Worktree'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('unified')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                viewMode === 'unified' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unified
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                viewMode === 'split' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Side-by-Side
            </button>
          </div>

          {selectedFile?.staged ? (
            <button
              onClick={() => onUnstageFile && onUnstageFile(selectedFile.path)}
              className="px-3 py-1 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-300 font-bold border border-amber-800 transition-colors cursor-pointer"
            >
              Unstage File
            </button>
          ) : (
            <button
              onClick={() => onStageFile && onStageFile(selectedFile?.path || 'src/App.tsx')}
              className="px-3 py-1 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold border border-emerald-800 transition-colors cursor-pointer"
            >
              Stage Changes
            </button>
          )}
        </div>
      </div>

      {/* Code Diff Display */}
      <div className="flex-1 p-4 overflow-x-auto space-y-1 font-mono text-[11px] leading-relaxed">
        {sampleDiffLines.map((line, idx) => {
          if (line.type === 'header') {
            return (
              <div key={idx} className="text-slate-500 font-bold py-0.5">
                {line.text}
              </div>
            );
          }
          if (line.type === 'addition') {
            return (
              <div key={idx} className="bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded-sm border-l-2 border-emerald-500 flex items-center gap-2">
                <Plus className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{line.text}</span>
              </div>
            );
          }
          if (line.type === 'deletion') {
            return (
              <div key={idx} className="bg-rose-950/60 text-rose-300 px-2 py-0.5 rounded-sm border-l-2 border-rose-500 flex items-center gap-2">
                <Minus className="w-3 h-3 text-rose-400 shrink-0" />
                <span>{line.text}</span>
              </div>
            );
          }
          return (
            <div key={idx} className="text-slate-400 px-2 py-0.5 flex items-center gap-2">
              <span className="w-3 text-center text-slate-600"> </span>
              <span>{line.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
