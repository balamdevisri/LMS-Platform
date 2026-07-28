import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { SecurityValidator } from './SecurityValidator';

const execAsync = promisify(exec);

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

export interface SandboxSession {
  sessionId: string;
  studentId: string;
  workspacePath: string;
  createdAt: string;
  lastActiveAt: string;
}

export class GitLabSandboxService {
  private static instance: GitLabSandboxService;
  private sessions: Map<string, SandboxSession> = new Map();
  private baseSandboxDir: string;

  private constructor() {
    this.baseSandboxDir = path.join(os.tmpdir(), 'shaivika_git_sandboxes');
    if (!fs.existsSync(this.baseSandboxDir)) {
      fs.mkdirSync(this.baseSandboxDir, { recursive: true });
    }
  }

  public static getInstance(): GitLabSandboxService {
    if (!GitLabSandboxService.instance) {
      GitLabSandboxService.instance = new GitLabSandboxService();
    }
    return GitLabSandboxService.instance;
  }

  /**
   * Initializes or retrieves an isolated student workspace session.
   */
  public getOrCreateSession(studentId: string, customSessionId?: string): SandboxSession {
    const sessionId = customSessionId || `session_${studentId}`;
    let session = this.sessions.get(sessionId);

    if (!session || !fs.existsSync(session.workspacePath)) {
      const workspacePath = path.join(this.baseSandboxDir, `${studentId}_${Date.now()}`);
      fs.mkdirSync(workspacePath, { recursive: true });

      const READMEPath = path.join(workspacePath, 'README.md');
      fs.writeFileSync(
        READMEPath,
        `# KaizenQ AI Git Lab Workspace\n\nStudent ID: ${studentId}\nSession: ${sessionId}\n\nExecute Git commands in the terminal sandbox to build your repository.`
      );

      session = {
        sessionId,
        studentId,
        workspacePath,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };

      this.sessions.set(sessionId, session);
    } else {
      session.lastActiveAt = new Date().toISOString();
    }

    return session;
  }

  /**
   * Executes a Git command inside the student isolated sandbox workspace.
   */
  public async executeCommand(
    studentId: string,
    commandStr: string,
    sessionId?: string,
    clientIp?: string
  ): Promise<{ stdout: string; stderr: string; exitCode: number; state: GitRepositoryState }> {
    const session = this.getOrCreateSession(studentId, sessionId);
    const workspace = session.workspacePath;

    // 1. Security Validation
    const validation = SecurityValidator.validateCommand(commandStr, studentId, workspace, clientIp);
    if (!validation.allowed) {
      const state = await this.getRepoState(workspace);
      return {
        stdout: '',
        stderr: validation.reason || 'Permission Denied: Command is restricted.',
        exitCode: 1,
        state,
      };
    }

    // 2. Execute Command in Isolated Workspace
    let stdout = '';
    let stderr = '';
    let exitCode = 0;

    try {
      const result = await execAsync(commandStr, {
        cwd: workspace,
        env: {
          ...process.env,
          HOME: workspace,
          GIT_AUTHOR_NAME: 'KaizenQ Student',
          GIT_AUTHOR_EMAIL: 'student@shaivika.ai',
          GIT_COMMITTER_NAME: 'KaizenQ Student',
          GIT_COMMITTER_EMAIL: 'student@shaivika.ai',
        },
        timeout: 10000,
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (err: any) {
      stdout = err.stdout || '';
      stderr = err.stderr || err.message || 'Execution error';
      exitCode = typeof err.code === 'number' ? err.code : 1;
    }

    const state = await this.getRepoState(workspace);
    return { stdout, stderr, exitCode, state };
  }

  /**
   * Fetches full structured JSON state of the Git repository inside the workspace sandbox.
   */
  public async getRepoState(workspacePath: string): Promise<GitRepositoryState> {
    const isGitRepo = fs.existsSync(path.join(workspacePath, '.git'));
    if (!isGitRepo) {
      return {
        currentBranch: 'main',
        branches: [],
        remoteBranches: [],
        files: [],
        commits: [],
        stashes: [],
        remotes: [],
        tags: [],
        isGitRepo: false,
      };
    }

    let currentBranch = 'main';
    let branches: string[] = [];
    let files: GitFileStatus[] = [];
    let commits: GitCommitNode[] = [];
    let stashes: GitStashItem[] = [];

    // Current Branch
    try {
      const { stdout } = await execAsync('git branch --show-current', { cwd: workspacePath });
      currentBranch = stdout.trim() || 'main';
    } catch (e) {}

    // All Local Branches
    try {
      const { stdout } = await execAsync('git branch --format="%(refname:short)"', { cwd: workspacePath });
      branches = stdout.split('\n').map((b: string) => b.trim()).filter(Boolean);
    } catch (e) {}

    // Files & Status
    try {
      const { stdout } = await execAsync('git status --porcelain', { cwd: workspacePath });
      files = stdout.split('\n').filter(Boolean).map((line: string) => {
        const code = line.substring(0, 2);
        const filePath = line.substring(3).trim();
        const staged = code[0] !== ' ' && code[0] !== '?';
        return {
          path: filePath,
          status: code.includes('?') ? 'untracked' : staged ? 'staged' : 'unstaged',
          staged,
        };
      });
    } catch (e) {}

    // Commits & Log Graph
    try {
      const { stdout } = await execAsync(
        'git log --pretty=format:"%H|%h|%an|%ae|%aI|%s|%P|%D" -n 20',
        { cwd: workspacePath }
      );
      commits = stdout.split('\n').filter(Boolean).map((line: string) => {
        const [hash, shortHash, author, email, date, message, parentsStr, refsStr] = line.split('|');
        return {
          hash: hash || '',
          shortHash: shortHash || '',
          author: author || 'Student',
          email: email || 'student@shaivika.ai',
          date: date || new Date().toISOString(),
          message: message || 'Commit',
          parents: parentsStr ? parentsStr.split(' ') : [],
          refs: refsStr ? refsStr.split(', ').map((r: string) => r.trim()) : [],
        };
      });
    } catch (e) {}

    // Stashes
    try {
      const { stdout } = await execAsync('git stash list --pretty=format:"%gd|%gs|%aI"', { cwd: workspacePath });
      stashes = stdout.split('\n').filter(Boolean).map((line: string, idx: number) => {
        const parts = line.split('|');
        const message = parts[1] || 'Stashed changes';
        const date = parts[2] || new Date().toISOString();
        return {
          index: idx,
          message,
          date,
        };
      });
    } catch (e) {}

    return {
      currentBranch,
      branches: branches.length > 0 ? branches : [currentBranch],
      remoteBranches: [],
      files,
      commits,
      stashes,
      remotes: [{ name: 'origin', url: 'https://github.com/shaivika-lms/git-practice.git' }],
      tags: ['v1.0.0'],
      isGitRepo: true,
    };
  }

  /**
   * Destroys workspace directory upon session exit or disconnect.
   */
  public destroySession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      try {
        if (fs.existsSync(session.workspacePath)) {
          fs.rmSync(session.workspacePath, { recursive: true, force: true });
        }
      } catch (e) {
        console.warn('Failed to cleanup sandbox workspace:', e);
      }
      this.sessions.delete(sessionId);
    }
  }
}
