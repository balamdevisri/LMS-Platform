import React, { useState } from 'react';
import { CheckCircle2, Terminal, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { GitRepositoryState } from '@/services/sandboxService';

export interface GitLabTask {
  id: string;
  title: string;
  description: string;
  hint: string;
  expectedCommand: string;
  isCompleted: boolean;
  xpReward: number;
}

interface GitTaskPanelProps {
  repoState: GitRepositoryState;
  onExecuteSuggestedCommand: (cmd: string) => void;
  onClaimXP: (xp: number, taskTitle: string) => void;
  isNightMode?: boolean;
}

export const GitTaskPanel: React.FC<GitTaskPanelProps> = ({
  repoState,
  onExecuteSuggestedCommand,
  onClaimXP,
  isNightMode = true,
}) => {
  const [tasks, setTasks] = useState<GitLabTask[]>([
    {
      id: 'task_1',
      title: 'Task 1: Initialize Git Repository',
      description: 'Initialize a new empty Git repository inside your isolated sandbox workspace.',
      hint: 'Type: git init',
      expectedCommand: 'git init',
      isCompleted: repoState.isGitRepo,
      xpReward: 50,
    },
    {
      id: 'task_2',
      title: 'Task 2: Stage & Commit Source File',
      description: 'Stage all modified files and commit them with a descriptive commit message.',
      hint: 'Type: git add . && git commit -m "feat: initial commit"',
      expectedCommand: 'git commit -m "feat: initial commit"',
      isCompleted: repoState.commits.length > 0,
      xpReward: 100,
    },
    {
      id: 'task_3',
      title: 'Task 3: Create & Switch Feature Branch',
      description: 'Create a new feature branch named "feature/login-module" and switch to it.',
      hint: 'Type: git checkout -b feature/login-module',
      expectedCommand: 'git checkout -b feature/login-module',
      isCompleted: repoState.branches.some((b: string) => b.includes('feature/login-module')),
      xpReward: 100,
    },
    {
      id: 'task_4',
      title: 'Task 4: Stash Worktree Changes',
      description: 'Save your current working directory uncommitted changes into the Git stash stack.',
      hint: 'Type: git stash',
      expectedCommand: 'git stash',
      isCompleted: repoState.stashes.length > 0,
      xpReward: 100,
    },
    {
      id: 'task_5',
      title: 'Task 5: Merge Feature Branch to Main',
      description: 'Switch back to main branch and merge feature/login-module into main.',
      hint: 'Type: git checkout main && git merge feature/login-module',
      expectedCommand: 'git merge feature/login-module',
      isCompleted: repoState.commits.length >= 2,
      xpReward: 150,
    },
  ]);

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalXP = tasks.reduce((sum, t) => sum + (t.isCompleted ? t.xpReward : 0), 0);

  const handleVerifyTask = (task: GitLabTask) => {
    let verified = false;

    if (task.id === 'task_1' && repoState.isGitRepo) verified = true;
    if (task.id === 'task_2' && repoState.commits.length > 0) verified = true;
    if (task.id === 'task_3' && repoState.branches.some((b: string) => b.includes('feature/login-module'))) verified = true;
    if (task.id === 'task_4' && repoState.stashes.length > 0) verified = true;
    if (task.id === 'task_5' && repoState.commits.length >= 2) verified = true;

    if (verified || !task.isCompleted) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, isCompleted: true } : t))
      );
      toast.success(`🎉 Task Verified! +${task.xpReward} XP awarded!`);
      onClaimXP(task.xpReward, task.title);
    } else {
      toast.error(`❌ Requirements not met. Try hint: ${task.hint}`);
    }
  };

  return (
    <div className={`p-4 rounded-2xl border flex flex-col h-full font-mono text-xs space-y-4 ${
      isNightMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-sky-100 text-slate-800'
    }`}>
      {/* Task Header */}
      <div className="pb-3 border-b border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="font-heading font-extrabold text-sm text-cyan-300">Git Lab Telemetry & Tasks</h3>
          </div>
          <span className="font-bold text-amber-400 flex items-center gap-1 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>+{totalXP} XP</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
          <span>Lab Completion</span>
          <span>{completedCount}/{tasks.length} Tasks ({Math.round((completedCount / tasks.length) * 100)}%)</span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div
            className="h-full rounded-full bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${(completedCount / tasks.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-3 rounded-xl border space-y-2.5 transition-all ${
              task.isCompleted
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                : isNightMode
                ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {task.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-600 shrink-0" />
                )}
                <span className={`font-bold ${task.isCompleted ? 'line-through text-emerald-300' : 'text-slate-100'}`}>
                  {task.title}
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-800 shrink-0">
                +{task.xpReward} XP
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
              {task.description}
            </p>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => onExecuteSuggestedCommand(task.expectedCommand)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 text-[10px] font-mono border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                title="Run in terminal"
              >
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span>Auto-Fill Command</span>
              </button>

              <button
                onClick={() => handleVerifyTask(task)}
                disabled={task.isCompleted}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  task.isCompleted
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700 cursor-default'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs'
                }`}
              >
                <span>{task.isCompleted ? 'Verified' : 'Verify Task'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
