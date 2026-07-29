// PowerShell Engine & FS Emulator for Windows Git Practice Lab

export interface DirectoryItem {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  lastWriteTime: string;
  content?: string;
  mode?: string;
}

export interface PowerShellState {
  currentPath: string; // e.g. "C:\\Users\\Student\\GitLab"
  items: Map<string, DirectoryItem>;
  gitBranch: string;
  stagedFiles: string[];
  modifiedFiles: string[];
  untrackedFiles: string[];
  commitCount: number;
}

export class PowerShellEngine {
  private state!: PowerShellState;

  constructor() {
    this.resetWorkspace();
  }

  public resetWorkspace() {
    this.state = {
      currentPath: 'C:\\Users\\Student\\GitLab',
      items: new Map<string, DirectoryItem>([
        ['README.md', { name: 'README.md', type: 'file', size: 1420, lastWriteTime: '2026-07-28 10:30', mode: '-a---', content: '# GitLab Enterprise Project\nWelcome to KaizenQ Git Practice Lab!' }],
        ['package.json', { name: 'package.json', type: 'file', size: 680, lastWriteTime: '2026-07-28 11:15', mode: '-a---', content: '{\n  "name": "kaizenq-lab",\n  "version": "1.0.0"\n}' }],
        ['App.tsx', { name: 'App.tsx', type: 'file', size: 950, lastWriteTime: '2026-07-28 11:40', mode: '-a---', content: 'import React from "react";\nexport default function App() {\n  return <h1>KaizenQ LMS Workspace</h1>;\n}' }],
        ['Header.tsx', { name: 'Header.tsx', type: 'file', size: 480, lastWriteTime: '2026-07-28 12:00', mode: '-a---', content: 'export const Header = () => <header>Navigation</header>;' }],
        ['architecture.md', { name: 'architecture.md', type: 'file', size: 1200, lastWriteTime: '2026-07-28 12:15', mode: '-a---', content: '# System Architecture\n- Vite + React + TypeScript\n- PowerShell Engine' }],
        ['.gitignore', { name: '.gitignore', type: 'file', size: 180, lastWriteTime: '2026-07-28 09:00', mode: '-a---', content: 'node_modules/\ndist/\n.env\n' }],
        ['src', { name: 'src', type: 'directory', lastWriteTime: '2026-07-28 09:00', mode: 'd----' }],
        ['docs', { name: 'docs', type: 'directory', lastWriteTime: '2026-07-28 09:12', mode: 'd----' }],
      ]),
      gitBranch: 'main',
      stagedFiles: ['README.md'],
      modifiedFiles: ['App.tsx', 'package.json'],
      untrackedFiles: ['Header.tsx', 'architecture.md'],
      commitCount: 3,
    };
  }

  public getPrompt(): string {
    return `PS ${this.state.currentPath}>`;
  }

  public execute(cmdLine: string): { output: string; type: 'success' | 'error' | 'info'; newPromptPath?: string } {
    const trimmed = cmdLine.trim();
    if (!trimmed) return { output: '', type: 'info' };

    const parts = trimmed.split(/\s+/);
    const mainCmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // 1. POWERSHELL NATIVE COMMANDS
    if (mainCmd === 'pwd') {
      return { output: `\nPath\n----\n${this.state.currentPath}\n`, type: 'success' };
    }

    if (mainCmd === 'cls' || mainCmd === 'clear') {
      return { output: '__CLEAR__', type: 'info' };
    }

    if (mainCmd === 'ls' || mainCmd === 'dir' || mainCmd === 'get-childitem') {
      let output = `\n    Directory: ${this.state.currentPath}\n\nMode          LastWriteTime         Length Name\n----          -------------         ------ ----\n`;
      this.state.items.forEach((item) => {
        const mode = item.type === 'directory' ? 'd-----' : '-a----';
        const length = item.type === 'file' ? String(item.size || 512).padStart(6, ' ') : '      ';
        output += `${mode}         ${item.lastWriteTime}         ${length} ${item.name}\n`;
      });
      return { output, type: 'success' };
    }

    if (mainCmd === 'cd') {
      const target = args[0] || '';
      if (!target || target === '~' || target === '\\') {
        this.state.currentPath = 'C:\\Users\\Student\\GitLab';
        return { output: '', type: 'success', newPromptPath: this.state.currentPath };
      }
      if (target === '..') {
        if (this.state.currentPath !== 'C:\\Users\\Student\\GitLab') {
          const parts = this.state.currentPath.split('\\');
          parts.pop();
          this.state.currentPath = parts.join('\\');
        }
        return { output: '', type: 'success', newPromptPath: this.state.currentPath };
      }
      if (target === 'src' || target === 'docs') {
        this.state.currentPath = `C:\\Users\\Student\\GitLab\\${target}`;
        return { output: '', type: 'success', newPromptPath: this.state.currentPath };
      }
      return {
        output: `Set-Location : Cannot find path '${target}' because it does not exist.\nAt line:1 char:1\n+ cd ${target}\n+ ~~~~~~~~~~~\n    + CategoryInfo          : ObjectNotFound: (${target}:String) [Set-Location], ItemNotFoundException\n    + FullyQualifiedErrorId : PathNotFound,Microsoft.PowerShell.Commands.SetLocationCommand`,
        type: 'error',
      };
    }

    if (mainCmd === 'mkdir') {
      const dirName = args[0] || 'NewDirectory';
      this.state.items.set(dirName, {
        name: dirName,
        type: 'directory',
        lastWriteTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });
      return {
        output: `\n    Directory: ${this.state.currentPath}\n\nMode          LastWriteTime         Length Name\n----          -------------         ------ ----\nd-----        ${new Date().toISOString().replace('T', ' ').substring(0, 16)}                ${dirName}\n`,
        type: 'success',
      };
    }

    if (mainCmd === 'ni' || mainCmd === 'new-item') {
      const fileName = args[0] || 'Untitled.txt';
      this.state.items.set(fileName, {
        name: fileName,
        type: 'file',
        size: 0,
        lastWriteTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
        content: '',
      });
      return {
        output: `\n    Directory: ${this.state.currentPath}\n\nMode          LastWriteTime         Length Name\n----          -------------         ------ ----\n-a----        ${new Date().toISOString().replace('T', ' ').substring(0, 16)}             0 ${fileName}\n`,
        type: 'success',
      };
    }

    if (mainCmd === 'cat' || mainCmd === 'get-content') {
      const fileName = args[0] || '';
      const item = this.state.items.get(fileName);
      if (item && item.type === 'file') {
        return { output: item.content || '(empty file)', type: 'success' };
      }
      return {
        output: `Get-Content : Cannot find path '${this.state.currentPath}\\${fileName}' because it does not exist.\nAt line:1 char:1\n+ cat ${fileName}\n    + CategoryInfo          : ObjectNotFound: (${fileName}:String) [Get-Content], ItemNotFoundException`,
        type: 'error',
      };
    }

    if (mainCmd === 'tree') {
      return {
        output: `Folder PATH listing for volume Windows-SSD\nVolume serial number is 4A89-E912\n${this.state.currentPath}\n├── docs\n│   └── architecture.md\n└── src\n    ├── App.tsx\n    └── index.css`,
        type: 'success',
      };
    }

    if (mainCmd === 'echo') {
      return { output: args.join(' '), type: 'success' };
    }

    // 2. GIT COMMANDS ENGINE
    if (mainCmd === 'git') {
      const gitSubCmd = args[0] ? args[0].toLowerCase() : '';
      const subArgs = args.slice(1);

      if (!gitSubCmd || gitSubCmd === '--help' || gitSubCmd === '-h') {
        return {
          output: `usage: git [--version] [--help] [-C <path>] <command> [<args>]\n\nThese are common Git commands used in various situations:\n   init       Create an empty Git repository or reinitialize an existing one\n   clone      Clone a repository into a new directory\n   status     Show the working tree status\n   add        Add file contents to the index\n   commit     Record changes to the repository\n   branch     List, create, or delete branches\n   checkout   Switch branches or restore working tree files\n   switch     Switch branches\n   merge      Join two or more development histories together\n   stash      Stash the changes in a dirty working directory away`,
          type: 'info',
        };
      }

      if (gitSubCmd === '--version') {
        return { output: 'git version 2.45.2.windows.1', type: 'success' };
      }

      if (gitSubCmd === 'init') {
        return {
          output: `Initialized empty Git repository in ${this.state.currentPath}/.git/\nSwitched to default branch 'main'`,
          type: 'success',
        };
      }

      if (gitSubCmd === 'status') {
        return {
          output: `On branch ${this.state.gitBranch}\nYour branch is up to date with 'origin/${this.state.gitBranch}'.\n\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n\t${this.state.stagedFiles.map((f) => `new file:   ${f}`).join('\n\t')}\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n\t${this.state.modifiedFiles.map((f) => `modified:   ${f}`).join('\n\t')}\n\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n\t${this.state.untrackedFiles.join('\n\t')}`,
          type: 'success',
        };
      }

      if (gitSubCmd === 'add') {
        const target = subArgs[0] || '.';
        if (target === '.' || target === '-A') {
          this.state.stagedFiles.push(...this.state.modifiedFiles, ...this.state.untrackedFiles);
          this.state.modifiedFiles = [];
          this.state.untrackedFiles = [];
        }
        return { output: '', type: 'success' };
      }

      if (gitSubCmd === 'commit') {
        const msgIndex = subArgs.indexOf('-m');
        const msg = msgIndex !== -1 ? subArgs[msgIndex + 1] || 'update workspace' : 'commit changes';
        this.state.stagedFiles = [];
        this.state.commitCount += 1;
        return {
          output: `[${this.state.gitBranch} a49f80b] ${msg}\n ${this.state.stagedFiles.length || 2} files changed, 45 insertions(+), 3 deletions(-)`,
          type: 'success',
        };
      }

      if (gitSubCmd === 'branch') {
        const newBranch = subArgs[0];
        if (newBranch && !newBranch.startsWith('-')) {
          return { output: `Created branch '${newBranch}'`, type: 'success' };
        }
        return {
          output: `* ${this.state.gitBranch}\n  feature/login\n  feature/navbar\n  hotfix`,
          type: 'success',
        };
      }

      if (gitSubCmd === 'switch' || gitSubCmd === 'checkout') {
        let branchName = subArgs[0];
        if (branchName === '-b') branchName = subArgs[1];
        if (branchName) {
          this.state.gitBranch = branchName;
          return { output: `Switched to branch '${branchName}'`, type: 'success' };
        }
        return { output: `Already on '${this.state.gitBranch}'`, type: 'info' };
      }

      if (gitSubCmd === 'log') {
        return {
          output: `commit c643b92f183d2a718a92b (HEAD -> ${this.state.gitBranch}, origin/${this.state.gitBranch})\nAuthor: Student Developer <student@shaivika.ai>\nDate:   ${new Date().toDateString()} 12:00:00\n\n    feat: add interactive powershell git terminal\n\ncommit a32ff9b1287e04f9812a3\nAuthor: KaizenQ Team <team@kaizenq.ai>\nDate:   ${new Date().toDateString()} 09:30:00\n\n    initial repository setup`,
          type: 'success',
        };
      }

      // Check for git command typos & generate PowerShell-style suggestion error
      const validGitCmds = ['init', 'clone', 'status', 'add', 'commit', 'log', 'diff', 'branch', 'switch', 'checkout', 'merge', 'rebase', 'stash', 'restore', 'reset', 'revert', 'remote', 'fetch', 'pull', 'push', 'tag', 'config'];
      if (!validGitCmds.includes(gitSubCmd)) {
        return {
          output: `git : '${gitSubCmd}' is not a git command. See 'git --help'.\n\nDid you mean one of these?\n\tcommit\n\tcheckout\n\tstatus\n\tconfig`,
          type: 'error',
        };
      }

      return { output: `git: '${gitSubCmd}' command executed successfully.`, type: 'success' };
    }

    // Unrecognized general command PowerShell Error format
    return {
      output: `${mainCmd} : The term '${mainCmd}' is not recognized as the name of a cmdlet, function, script file, or operable program.\nCheck the spelling of the name, or if a path was included, verify that the path is correct and try again.\nAt line:1 char:1\n+ ${trimmed}\n+ ~${'~'.repeat(mainCmd.length - 1)}\n    + CategoryInfo          : ObjectNotFound: (${mainCmd}:String) [], CommandNotFoundException\n    + FullyQualifiedErrorId : CommandNotFoundException`,
      type: 'error',
    };
  }
}
