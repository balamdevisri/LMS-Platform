import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit,
  Folder,
  FileCode,
  RefreshCw,
  Plus,
  UploadCloud,
  DownloadCloud,
  Layers,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { SandboxService } from '@/services/sandboxService';
import type { GitRepositoryState, GitFileStatus, GitStashItem } from '@/services/sandboxService';
import { GitBranchGraph } from './GitBranchGraph';
import { WindowsPowerShellTerminal } from './WindowsPowerShellTerminal';

interface EnterpriseGitLabProps {
  studentId: string;
  studentName?: string;
  onClaimXP?: (xp: number, title: string) => void;
  isNightMode?: boolean;
}

export const EnterpriseGitLab: React.FC<EnterpriseGitLabProps> = ({
  studentId,
  studentName = 'Student User',
  onClaimXP: _onClaimXP,
  isNightMode = true,
}) => {
  const sandboxService = SandboxService.getInstance();

  const [repoState, setRepoState] = useState<GitRepositoryState>({
    currentBranch: 'main',
    branches: ['main', 'feature/login-module'],
    remoteBranches: ['origin/main'],
    files: [
      { path: 'src/App.tsx', status: 'modified', staged: true },
      { path: 'src/components/Header.tsx', status: 'unstaged', staged: false },
      { path: 'docs/architecture.md', status: 'untracked', staged: false },
    ],
    commits: [
      {
        hash: 'c643b92f183d2a718a92b',
        shortHash: 'c643b92',
        author: studentName,
        email: 'student@shaivika.ai',
        date: new Date().toISOString(),
        message: 'feat: initialize real-time git lab telemetry & docker container',
        parents: [],
        refs: ['HEAD -> main', 'origin/main'],
      },
    ],
    stashes: [{ index: 0, message: 'WIP on main: saved draft worktree', date: new Date().toISOString() }],
    remotes: [{ name: 'origin', url: 'https://github.com/bhanuprakashachari5092/LMS-Platform.git' }],
    tags: ['v1.0.0'],
    isGitRepo: true,
  });

  const [activeTab, setActiveTab] = useState<'explorer' | 'status' | 'graph' | 'stash' | 'remote'>('status');
  const [selectedFile, setSelectedFile] = useState<GitFileStatus | undefined>(repoState.files[0]);
  const [commitMessage, setCommitMessage] = useState('');
  const [newBranchName, setNewBranchName] = useState('');

  const handleRunCommand = async (cmdToRun?: string) => {
    const commandStr = (cmdToRun || '').trim();
    if (!commandStr) return;

    try {
      const response = await sandboxService.executeGitCommand(studentId, commandStr);
      if (response.stderr && response.stderr.includes('Permission Denied')) {
        toast.error('🔒 Security Alert: Intercepted forbidden command or path traversal attempt!');
      }
      setRepoState(response.state);
      if (response.state.files.length > 0 && !selectedFile) {
        setSelectedFile(response.state.files[0]);
      }
    } catch (e: any) {
      console.error('Git Sandbox Execution Error:', e);
    }
  };

  const handleStageAll = () => handleRunCommand('git add .');
  const handleCommitGUI = () => {
    if (!commitMessage.trim()) {
      toast.error('Please enter a commit message!');
      return;
    }
    handleRunCommand(`git commit -m "${commitMessage}"`);
    setCommitMessage('');
  };
  const handleCreateBranchGUI = () => {
    if (!newBranchName.trim()) return;
    handleRunCommand(`git checkout -b ${newBranchName.trim()}`);
    setNewBranchName('');
  };
  const handleSyncPush = () => handleRunCommand('git push origin main');
  const handleSyncPull = () => handleRunCommand('git pull origin main');

  return (
    <div className={`rounded-3xl border overflow-hidden shadow-2xl font-mono flex flex-col h-187.5 transition-colors ${
      isNightMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-900 border-sky-200 text-slate-100'
    }`}>
      
      {/* 1. IDE TOP TOOLBAR */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <select
              value={repoState.currentBranch}
              onChange={(e) => handleRunCommand(`git checkout ${e.target.value}`)}
              className="bg-transparent text-cyan-300 font-bold focus:outline-hidden cursor-pointer"
            >
              {repoState.branches.map((b: string) => (
                <option key={b} value={b} className="bg-slate-900 text-slate-200">{b}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSyncPull}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
              title="Git Pull (Sync from Remote)"
            >
              <DownloadCloud className="w-4 h-4 text-sky-400" />
            </button>
            <button
              onClick={handleSyncPush}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
              title="Git Push (Sync to Remote)"
            >
              <UploadCloud className="w-4 h-4 text-indigo-400" />
            </button>
            <button
              onClick={() => handleRunCommand('git status')}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
              title="Refresh Repository Telemetry"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Security Sandbox Badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-bold flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Isolated Docker Sandbox (/home/student/workspace)</span>
          </span>
        </div>
      </div>

      {/* 2. MAIN IDE SPLIT WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT NAVIGATION SIDEBAR */}
        <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
          
          <div className="flex items-center justify-around p-2 bg-slate-900/60 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('status')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'status' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Git Status & Source Control"
            >
              <GitCommit className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'explorer' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Repository File Explorer"
            >
              <Folder className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('graph')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'graph' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Visual Commit History Graph"
            >
              <GitBranch className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('stash')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'stash' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Stash Manager"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          {activeTab === 'status' && (
            <div className="p-3 space-y-4 flex-1 overflow-y-auto">
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Commit Message</label>
                <textarea
                  rows={2}
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="feat: add new feature"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100 focus:outline-hidden resize-none font-mono"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCommitGUI}
                    className="flex-1 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <GitCommit className="w-3.5 h-3.5" />
                    <span>Commit</span>
                  </button>
                  <button
                    onClick={handleStageAll}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
                    title="Stage All Changes"
                  >
                    + Stage All
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Changed Files ({repoState.files.length})
                </span>

                {repoState.files.map((file: GitFileStatus) => (
                  <div
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      selectedFile?.path === file.path
                        ? 'bg-slate-900 border-cyan-500/80 text-cyan-300'
                        : 'bg-slate-950 border-slate-900 text-slate-300 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate text-xs">{file.path}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunCommand(file.staged ? `git restore --staged ${file.path}` : `git add ${file.path}`);
                      }}
                      className={`p-1 rounded-md text-[10px] font-bold border cursor-pointer ${
                        file.staged
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {file.staged ? 'Staged' : '+ Stage'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Branch Manager</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="feature/branch-name"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-1.5 text-xs text-slate-100 focus:outline-hidden font-mono"
                  />
                  <button
                    onClick={handleCreateBranchGUI}
                    className="p-1.5 rounded-xl bg-cyan-600 text-white cursor-pointer shrink-0"
                    title="Create Branch"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'explorer' && (
            <div className="p-3 space-y-2 font-mono text-xs flex-1 overflow-y-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Workspace Files</span>
              {['src/App.tsx', 'src/index.css', 'docs/architecture.md', 'README.md', '.gitignore'].map((filePath) => (
                <div key={filePath} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{filePath}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'graph' && (
            <div className="p-2 flex-1 overflow-y-auto">
              <GitBranchGraph
                commits={repoState.commits}
                selectedCommitHash={repoState.commits[0]?.hash}
                onSelectCommit={(c) => toast.info(`Commit: ${c.shortHash} - ${c.message}`)}
                isNightMode={isNightMode}
              />
            </div>
          )}

          {activeTab === 'stash' && (
            <div className="p-3 space-y-3 font-mono text-xs flex-1 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stash Stack</span>
                <button
                  onClick={() => handleRunCommand('git stash')}
                  className="px-2 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold cursor-pointer"
                >
                  + Stash Save
                </button>
              </div>

              {repoState.stashes.map((s: GitStashItem) => (
                <div key={s.index} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-cyan-300">stash@&#123;{s.index}&#125;</div>
                  <div className="text-[10px] text-slate-400 truncate">{s.message}</div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleRunCommand('git stash pop')}
                      className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800 cursor-pointer"
                    >
                      Pop
                    </button>
                    <button
                      onClick={() => handleRunCommand('git stash apply')}
                      className="px-2 py-0.5 rounded-md bg-sky-950 text-sky-300 text-[10px] font-bold border border-sky-800 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* MAIN PANEL: FULL-HEIGHT POWERSHELL TERMINAL */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950 p-2 overflow-hidden">
          <WindowsPowerShellTerminal onCommandRun={(cmd) => handleRunCommand(cmd)} />
        </div>

      </div>

    </div>
  );
};
