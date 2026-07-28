export interface GitCommitNode {
  hash: string;
  shortHash: string;
  author: string;
  email: string;
  date: string;
  message: string;
  parents: string[];
  refs: string[];
}

export interface GitFileStatus {
  path: string;
  status: 'staged' | 'unstaged' | 'untracked' | 'modified' | 'deleted' | 'renamed';
  staged: boolean;
}

export interface GitStashItem {
  index: number;
  message: string;
  date: string;
}

export interface GitRepositoryState {
  currentBranch: string;
  branches: string[];
  remoteBranches: string[];
  files: GitFileStatus[];
  commits: GitCommitNode[];
  stashes: GitStashItem[];
  remotes: { name: string; url: string }[];
  tags: string[];
  isGitRepo: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class SandboxService {
  private static instance: SandboxService;

  private constructor() {}

  public static getInstance(): SandboxService {
    if (!SandboxService.instance) {
      SandboxService.instance = new SandboxService();
    }
    return SandboxService.instance;
  }

  /**
   * Executes a Git command in the student sandbox.
   */
  public async executeGitCommand(
    studentId: string,
    command: string,
    sessionId?: string
  ): Promise<{ stdout: string; stderr: string; exitCode: number; state: GitRepositoryState }> {
    try {
      const res = await fetch(`${API_BASE}/sandbox/git/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, command, sessionId }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend sandbox API unavailable, executing in client memory engine:', e);
    }

    return this.executeClientFallbackCommand(command);
  }

  /**
   * Client-side in-memory Git command engine fallback.
   */
  private executeClientFallbackCommand(
    commandStr: string
  ): { stdout: string; stderr: string; exitCode: number; state: GitRepositoryState } {
    const trimmed = commandStr.trim();
    const lower = trimmed.toLowerCase();

    const restricted = ['sudo', 'su', 'rm -rf /', 'docker', 'kubectl', 'reboot', 'shutdown'];
    for (const r of restricted) {
      if (lower.includes(r)) {
        return {
          stdout: '',
          stderr: `Permission Denied: Command "${r}" is restricted by Security Protocol. Access outside /home/student/workspace is forbidden.`,
          exitCode: 1,
          state: this.getClientLocalState(),
        };
      }
    }

    let stdout = '';
    let stderr = '';
    let exitCode = 0;
    const currentState = this.getClientLocalState();

    if (lower === 'git status') {
      stdout = `On branch ${currentState.currentBranch}\nNothing to commit, working tree clean`;
    } else if (lower.startsWith('git init')) {
      stdout = `Initialized empty Git repository in /home/student/workspace/.git/`;
      currentState.isGitRepo = true;
    } else if (lower.startsWith('git add')) {
      stdout = `Staged files for commit.`;
    } else if (lower.startsWith('git commit')) {
      const msg = trimmed.match(/-m\s+["'](.*?)["']/)?.[1] || 'Commit changes';
      stdout = `[${currentState.currentBranch} ${Math.random().toString(36).substring(2, 9)}] ${msg}\n 1 file changed, 5 insertions(+)`;
      currentState.commits.unshift({
        hash: Math.random().toString(36).substring(2, 40),
        shortHash: Math.random().toString(36).substring(2, 9),
        author: 'Student User',
        email: 'student@shaivika.ai',
        date: new Date().toISOString(),
        message: msg,
        parents: currentState.commits.length > 0 ? [currentState.commits[0].hash] : [],
        refs: [`HEAD -> ${currentState.currentBranch}`],
      });
    } else if (lower.startsWith('git branch')) {
      const newBranch = trimmed.split(' ')[2];
      if (newBranch) {
        if (!currentState.branches.includes(newBranch)) {
          currentState.branches.push(newBranch);
        }
        stdout = `Created branch '${newBranch}'`;
      } else {
        stdout = currentState.branches.map((b: string) => (b === currentState.currentBranch ? `* ${b}` : `  ${b}`)).join('\n');
      }
    } else if (lower.startsWith('git checkout') || lower.startsWith('git switch')) {
      const target = trimmed.split(' ').pop()?.replace('-b', '').trim();
      if (target) {
        if (!currentState.branches.includes(target)) {
          currentState.branches.push(target);
        }
        currentState.currentBranch = target;
        stdout = `Switched to branch '${target}'`;
      }
    } else if (lower.startsWith('git merge')) {
      const target = trimmed.split(' ').pop()?.trim();
      stdout = `Updating ${currentState.currentBranch}... Merged branch '${target}'. Fast-forward.`;
    } else if (lower.startsWith('git log')) {
      stdout = currentState.commits
        .map((c: GitCommitNode) => `commit ${c.hash}\nAuthor: ${c.author} <${c.email}>\nDate:   ${c.date}\n\n    ${c.message}\n`)
        .join('\n');
    } else if (lower.startsWith('git stash')) {
      stdout = `Saved working directory and index state WIP on ${currentState.currentBranch}: ${Date.now()}`;
      currentState.stashes.push({
        index: currentState.stashes.length,
        message: `WIP on ${currentState.currentBranch}: ${Date.now()}`,
        date: new Date().toISOString(),
      });
    } else {
      stdout = `Executed: ${commandStr}\nCommand completed successfully.`;
    }

    this.saveClientLocalState(currentState);

    return {
      stdout,
      stderr,
      exitCode,
      state: currentState,
    };
  }

  private getClientLocalState(): GitRepositoryState {
    const saved = localStorage.getItem('shaivika_git_lab_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const defaultState: GitRepositoryState = {
      currentBranch: 'main',
      branches: ['main', 'feature/ai-assistant', 'bugfix/auth-leak'],
      remoteBranches: ['origin/main', 'origin/feature/ai-assistant'],
      files: [
        { path: 'src/App.tsx', status: 'modified', staged: true },
        { path: 'src/components/Header.tsx', status: 'unstaged', staged: false },
        { path: 'docs/architecture.md', status: 'untracked', staged: false },
      ],
      commits: [
        {
          hash: 'c643b92f183d2a718a92b',
          shortHash: 'c643b92',
          author: 'Bhanu Prakash Achari',
          email: 'bhanuprakash@shaivika.ai',
          date: '2026-07-28T12:00:00.000Z',
          message: 'feat: add real-time student telemetry drawer & stats cards',
          parents: ['a32ff9b1287e'],
          refs: ['HEAD -> main', 'origin/main'],
        },
        {
          hash: 'a32ff9b1287e0981b2812',
          shortHash: 'a32ff9b',
          author: 'KaizenQ Team',
          email: 'team@shaivika.ai',
          date: '2026-07-27T16:30:00.000Z',
          message: 'chore: initialize KaizenQ AI LMS core architecture',
          parents: [],
          refs: [],
        },
      ],
      stashes: [
        { index: 0, message: 'WIP on main: stash draft navbar changes', date: '2026-07-28T10:00:00.000Z' },
      ],
      remotes: [{ name: 'origin', url: 'https://github.com/bhanuprakashachari5092/LMS-Platform.git' }],
      tags: ['v1.0.0', 'v1.1.0-beta'],
      isGitRepo: true,
    };
    return defaultState;
  }

  private saveClientLocalState(state: GitRepositoryState): void {
    localStorage.setItem('shaivika_git_lab_state', JSON.stringify(state));
  }
}
