import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface VFSNode {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  permissions?: string;
  owner?: string;
  group?: string;
  size?: number;
  updatedAt?: string;
  children?: VFSNode[];
}

export type VFSFile = VFSNode;

export interface HistoryEntry {
  id: string;
  prompt: string;
  command: string;
  output: string;
  isError?: boolean;
  timestamp: string;
}

export interface LabTask {
  id: number;
  title: string;
  description: string;
  commandPattern: RegExp;
  completed: boolean;
  xp: number;
}

export interface TerminalTab {
  id: string;
  title: string;
  active: boolean;
  history: HistoryEntry[];
}

// Generate tasks dynamically from lesson commands
function createDynamicTasks(cmds?: Array<{ command: string; description: string }>): LabTask[] {
  if (!cmds || cmds.length === 0) return [];
  return cmds.map((item, idx) => {
    const escaped = item.command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return {
      id: idx + 1,
      title: `Run \`${item.command}\``,
      description: item.description,
      commandPattern: new RegExp(escaped, 'i'),
      completed: false,
      xp: 10,
    };
  });
}

// Default initial Virtual Filesystem Root (`/`)
const INITIAL_ROOT_VFS: VFSNode = {
  name: '',
  type: 'dir',
  children: [
    {
      name: 'home',
      type: 'dir',
      children: [
        {
          name: 'student',
          type: 'dir',
          permissions: 'drwxr-xr-x',
          owner: 'student',
          group: 'student',
          children: [
            {
              name: 'README.md',
              type: 'file',
              content: '# SHAIVIKA Linux Enterprise Training Lab\nWelcome to Ubuntu 24.04 LTS System Administration Lab!\nUse this environment to practice bash commands, file manipulation, and git workflows.',
              permissions: '-rw-r--r--',
              owner: 'student',
              group: 'student',
              size: 215,
              updatedAt: 'Jul 25 22:00',
            },
            {
              name: 'scripts',
              type: 'dir',
              permissions: 'drwxr-xr-x',
              owner: 'student',
              group: 'student',
              children: [
                {
                  name: 'deploy.sh',
                  type: 'file',
                  content: '#!/bin/bash\necho "Deploying Shaivika LMS Container microservices..."\nsleep 1\necho "Build completed successfully!"',
                  permissions: '-rwxr-xr-x',
                  owner: 'student',
                  group: 'student',
                  size: 110,
                  updatedAt: 'Jul 25 22:00',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

function getDirectoryNode(root: VFSNode, absPath: string): VFSNode | null {
  const parts = absPath.split('/').filter(Boolean);
  let curr: VFSNode = root;

  for (const part of parts) {
    if (!curr.children) return null;
    const found = curr.children.find((c) => c.name === part && c.type === 'dir');
    if (!found) return null;
    curr = found;
  }
  return curr;
}

function getNodeAtPath(root: VFSNode, absPath: string): VFSNode | null {
  const parts = absPath.split('/').filter(Boolean);
  let curr: VFSNode = root;

  for (let i = 0; i < parts.length; i++) {
    if (!curr.children) return null;
    const found = curr.children.find((c) => c.name === parts[i]);
    if (!found) return null;
    curr = found;
  }
  return curr;
}

export const useLinuxShellEngine = (
  _isGitCourse = false,
  initialCommands?: Array<{ command: string; description: string }>
) => {
  const [currentPath, setCurrentPath] = useState<string>('/home/student');
  const [vfsRoot, setVfsRoot] = useState<VFSNode>(INITIAL_ROOT_VFS);
  const [gitBranch, setGitBranch] = useState<string>('main');
  const [tasks, setTasks] = useState<LabTask[]>(() => createDynamicTasks(initialCommands));
  const [commandHistoryList, setCommandHistoryList] = useState<string[]>(['uname -a', 'whoami', 'pwd']);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: 'tab-1',
      title: 'bash (ubuntu-24.04)',
      active: true,
      history: [
        {
          id: 'h-1',
          prompt: 'student@ubuntu:~$',
          command: 'uname -a',
          output: 'Linux ubuntu-2404-lms 6.8.0-31-generic #31-Ubuntu SMP PREEMPT_DYNAMIC Thu Apr 4 00:00:00 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux',
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          id: 'h-2',
          prompt: 'student@ubuntu:~$',
          command: 'whoami',
          output: 'student',
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    },
  ]);

  const activeTab = tabs.find((t) => t.active) || tabs[0];

  const getDisplayPath = useCallback((fullPath: string) => {
    if (fullPath === '/home/student') return '~';
    if (fullPath.startsWith('/home/student/')) return `~/${fullPath.replace('/home/student/', '')}`;
    return fullPath;
  }, []);

  const getPromptString = useCallback(() => {
    return `student@ubuntu:${getDisplayPath(currentPath)}$`;
  }, [currentPath, getDisplayPath]);

  // Tab management
  const addTab = useCallback(() => {
    if (tabs.length >= 4) {
      toast.warning('Maximum 4 terminal sessions allowed');
      return;
    }
    const newId = `tab-${Date.now()}`;
    const newTab: TerminalTab = {
      id: newId,
      title: `bash (${tabs.length + 1})`,
      active: true,
      history: [
        {
          id: `h-${Date.now()}`,
          prompt: getPromptString(),
          command: 'clear',
          output: '',
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    };

    setTabs((prev) => prev.map((t) => ({ ...t, active: false })).concat(newTab));
    toast.success(`Opened terminal session: ${newTab.title}`);
  }, [tabs, getPromptString]);

  const closeTab = useCallback((id: string) => {
    if (tabs.length <= 1) {
      toast.info('Cannot close primary terminal session');
      return;
    }
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (!filtered.some((t) => t.active)) {
        filtered[0].active = true;
      }
      return filtered;
    });
  }, [tabs]);

  const selectTab = useCallback((id: string) => {
    setTabs((prev) => prev.map((t) => ({ ...t, active: t.id === id })));
  }, []);

  // TAB Autocompletion helper
  const getTabSuggestions = useCallback((input: string): string | null => {
    const trimmed = input.trimStart();
    const parts = trimmed.split(/\s+/);
    const knownCmds = ['ls', 'cd', 'mkdir', 'touch', 'cat', 'pwd', 'whoami', 'uname', 'clear', 'help', 'git', 'chmod', 'cp', 'mv', 'echo', 'rm'];

    if (parts.length === 1) {
      const match = knownCmds.find((c) => c.startsWith(parts[0]));
      if (match && match !== parts[0]) return match;
    } else if (parts.length >= 2) {
      const parentDir = getDirectoryNode(vfsRoot, currentPath);
      const existingNames = parentDir?.children?.map((c) => c.name) || [];
      const lastPart = parts[parts.length - 1];
      const match = existingNames.find((n) => n.startsWith(lastPart));
      if (match && match !== lastPart) {
        parts[parts.length - 1] = match;
        return parts.join(' ');
      }
    }
    return null;
  }, [vfsRoot, currentPath]);

  // Execute authentic Linux Bash commands
  const executeCommand = useCallback((rawCmd: string) => {
    const cleanCmd = rawCmd.trim();
    if (!cleanCmd) return;

    const currentPrompt = getPromptString();
    setCommandHistoryList((prev) => [cleanCmd, ...prev.filter((c) => c !== cleanCmd)]);
    setHistoryIndex(-1);

    let output = '';
    let isError = false;

    // Handle `clear` and `cls`
    if (cleanCmd === 'clear' || cleanCmd === 'cls') {
      setTabs((prev) =>
        prev.map((t) => (t.active ? { ...t, history: [] } : t))
      );
      return;
    }

    const tokens = cleanCmd.split(/\s+/);
    const cmd = tokens[0];

    if (cmd === 'pwd') {
      output = currentPath;
    } else if (cmd === 'whoami') {
      output = 'student';
    } else if (cmd === 'uname') {
      if (tokens[1] === '-a') {
        output = 'Linux ubuntu-2404-lms 6.8.0-31-generic #31-Ubuntu SMP PREEMPT_DYNAMIC Thu Apr 4 00:00:00 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux';
      } else {
        output = 'Linux';
      }
    } else if (cmd === 'date') {
      output = new Date().toUTCString();
    } else if (cmd === 'help') {
      output = `Ubuntu 24.04 LTS System Administration Shell (v6.8.0-generic)\nAvailable commands:\n  ls -la           List directory contents with details\n  cd <dir>         Change working directory\n  pwd              Print working directory\n  mkdir <dir>      Create target directory\n  touch <file>     Create empty file\n  cat <file>       Read file content\n  rm <file>        Remove file\n  git <cmd>        Git source control commands\n  uname -a         Print kernel & architecture info\n  whoami           Show current active user\n  clear            Clear terminal buffer screen`;
    } else if (cmd === 'mkdir') {
      const args = tokens.slice(1).filter((t) => !t.startsWith('-'));
      const isVerbose = tokens.includes('-v');

      if (args.length === 0) {
        output = 'mkdir: missing operand\nTry \'mkdir --help\' for more information.';
        isError = true;
      } else {
        const folderName = args[0];
        const parentDir = getDirectoryNode(vfsRoot, currentPath);

        if (parentDir && parentDir.children) {
          const exists = parentDir.children.some((c) => c.name === folderName);
          if (exists) {
            output = `mkdir: cannot create directory ‘${folderName}’: File exists`;
            isError = true;
          } else {
            const newDir: VFSNode = {
              name: folderName,
              type: 'dir',
              permissions: 'drwxr-xr-x',
              owner: 'student',
              group: 'student',
              children: [],
            };
            parentDir.children.push(newDir);
            setVfsRoot({ ...vfsRoot });
            output = isVerbose ? `mkdir: created directory '${folderName}'` : '';
          }
        }
      }
    } else if (cmd === 'touch') {
      const args = tokens.slice(1);
      if (args.length === 0) {
        output = 'touch: missing file operand\nTry \'touch --help\' for more information.';
        isError = true;
      } else {
        const fileName = args[0];
        const parentDir = getDirectoryNode(vfsRoot, currentPath);

        if (parentDir && parentDir.children) {
          const existing = parentDir.children.find((c) => c.name === fileName);
          if (!existing) {
            const newFile: VFSNode = {
              name: fileName,
              type: 'file',
              content: '',
              permissions: '-rw-r--r--',
              owner: 'student',
              group: 'student',
              size: 0,
              updatedAt: 'Jul 25 22:00',
            };
            parentDir.children.push(newFile);
            setVfsRoot({ ...vfsRoot });
          }
          output = '';
        }
      }
    } else if (cmd === 'cd') {
      const target = tokens[1] || '~';

      if (target === '~' || target === '/home/student') {
        setCurrentPath('/home/student');
        output = '';
      } else if (target === '..') {
        if (currentPath !== '/home/student') {
          const parts = currentPath.split('/');
          parts.pop();
          setCurrentPath(parts.join('/') || '/home/student');
        }
        output = '';
      } else {
        const relPath = target.replace(/^\.\//, '');
        const targetAbsPath = currentPath.endsWith('/') ? `${currentPath}${relPath}` : `${currentPath}/${relPath}`;
        const targetNode = getNodeAtPath(vfsRoot, targetAbsPath);

        if (targetNode && targetNode.type === 'dir') {
          setCurrentPath(targetAbsPath);
          output = '';
        } else {
          output = `bash: cd: ${target}: No such file or directory`;
          isError = true;
        }
      }
    } else if (cmd === 'ls') {
      const isDetailed = tokens.includes('-l') || tokens.includes('-la') || tokens.includes('-al') || tokens.includes('-a');
      const parentDir = getDirectoryNode(vfsRoot, currentPath);

      if (parentDir && parentDir.children) {
        if (isDetailed) {
          const rows = parentDir.children.map((c) => {
            const perm = c.permissions || (c.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--');
            const owner = c.owner || 'student';
            const group = c.group || 'student';
            const size = c.size || (c.type === 'dir' ? 4096 : 1024);
            const date = c.updatedAt || 'Jul 25 22:00';
            const displayName = c.type === 'dir' ? `${c.name}/` : c.name;
            return `${perm} 1 ${owner} ${group} ${size.toString().padStart(6, ' ')} ${date} ${displayName}`;
          });

          output = `total ${parentDir.children.length * 4}\n${rows.join('\n')}`;
        } else {
          output = parentDir.children.map((c) => (c.type === 'dir' ? `${c.name}/` : c.name)).join('  ');
        }
      } else {
        output = '';
      }
    } else if (cmd === 'cat') {
      const targetFile = tokens[1];
      if (!targetFile) {
        output = 'cat: missing filename operand';
        isError = true;
      } else {
        const parentDir = getDirectoryNode(vfsRoot, currentPath);
        const fileNode = parentDir?.children?.find((c) => c.name === targetFile && c.type === 'file');

        if (fileNode) {
          output = fileNode.content || '';
        } else {
          output = `cat: ${targetFile}: No such file or directory`;
          isError = true;
        }
      }
    } else if (cmd === 'rm') {
      const target = tokens.filter((t) => !t.startsWith('-'))[1];
      if (!target) {
        output = 'rm: missing operand';
        isError = true;
      } else {
        const parentDir = getDirectoryNode(vfsRoot, currentPath);
        if (parentDir && parentDir.children) {
          const idx = parentDir.children.findIndex((c) => c.name === target);
          if (idx !== -1) {
            parentDir.children.splice(idx, 1);
            setVfsRoot({ ...vfsRoot });
            output = '';
          } else {
            output = `rm: cannot remove '${target}': No such file or directory`;
            isError = true;
          }
        }
      }
    } else if (cmd === 'echo') {
      const redirectIdx = tokens.indexOf('>');
      if (redirectIdx !== -1 && redirectIdx < tokens.length - 1) {
        const text = tokens.slice(1, redirectIdx).join(' ').replace(/^["']|["']$/g, '');
        const targetFile = tokens[redirectIdx + 1];

        const parentDir = getDirectoryNode(vfsRoot, currentPath);
        if (parentDir && parentDir.children) {
          let fileNode = parentDir.children.find((c) => c.name === targetFile && c.type === 'file');
          if (fileNode) {
            fileNode.content = text;
            fileNode.size = text.length;
          } else {
            fileNode = {
              name: targetFile,
              type: 'file',
              content: text,
              permissions: '-rw-r--r--',
              owner: 'student',
              group: 'student',
              size: text.length,
              updatedAt: 'Jul 25 22:00',
            };
            parentDir.children.push(fileNode);
          }
          setVfsRoot({ ...vfsRoot });
        }
        output = '';
      } else {
        output = cleanCmd.replace(/^echo\s*/, '').replace(/^["']|["']$/g, '');
      }
    } else if (cmd === 'git') {
      const gitSub = tokens[1];
      if (gitSub === 'status') {
        output = `On branch ${gitBranch}\nYour branch is up to date with 'origin/${gitBranch}'.\n\nnothing to commit, working tree clean`;
      } else if (gitSub === 'checkout' || gitSub === 'switch') {
        const branchName = tokens[tokens.length - 1] || 'main';
        setGitBranch(branchName);
        output = `Switched to branch '${branchName}'`;
      } else if (gitSub === 'init') {
        output = `Initialized empty Git repository in ${currentPath}/.git/`;
      } else if (gitSub === 'add') {
        output = '';
      } else if (gitSub === 'commit') {
        output = `[${gitBranch} 8f3a9b1] feat: lab progress update\n 1 file changed, 1 insertion(+)`;
      } else {
        output = `git: '${gitSub}' is not a git command. See 'git --help'.`;
        isError = true;
      }
    } else {
      output = `bash: ${cmd}: command not found`;
      isError = true;
    }

    // Auto-check lab tasks matching patterns
    setTasks((prev) =>
      prev.map((t) => {
        if (!t.completed && t.commandPattern.test(cleanCmd)) {
          toast.success(`🎉 Objective Completed: ${t.title} (+${t.xp} XP)`);
          return { ...t, completed: true };
        }
        return t;
      })
    );

    const newHistoryEntry: HistoryEntry = {
      id: `h-${Date.now()}`,
      prompt: currentPrompt,
      command: cleanCmd,
      output,
      isError,
      timestamp: new Date().toLocaleTimeString(),
    };

    setTabs((prev) =>
      prev.map((t) => (t.active ? { ...t, history: [...t.history, newHistoryEntry] } : t))
    );
  }, [currentPath, getPromptString, gitBranch, vfsRoot]);

  const resetLab = useCallback(() => {
    setCurrentPath('/home/student');
    setGitBranch('main');
    setVfsRoot(INITIAL_ROOT_VFS);
    setTasks(createDynamicTasks(initialCommands));
    setTabs([
      {
        id: 'tab-1',
        title: 'bash (ubuntu-24.04)',
        active: true,
        history: [
          {
            id: 'h-init',
            prompt: 'student@ubuntu:~$',
            command: 'uname -a',
            output: 'Linux ubuntu-2404-lms 6.8.0-31-generic #31-Ubuntu SMP PREEMPT_DYNAMIC Thu Apr 4 00:00:00 UTC 2024 x86_64 GNU/Linux',
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
      },
    ]);
    toast.info('🔄 Linux Lab environment reset to initial state.');
  }, [initialCommands]);

  const studentHomeDir = getDirectoryNode(vfsRoot, '/home/student');

  return {
    currentPath,
    getDisplayPath,
    getPromptString,
    vfs: studentHomeDir || { name: 'student', type: 'dir', children: [] },
    gitBranch,
    tasks,
    tabs,
    activeTab,
    addTab,
    closeTab,
    selectTab,
    executeCommand,
    getTabSuggestions,
    commandHistoryList,
    historyIndex,
    setHistoryIndex,
    resetLab,
  };
};
