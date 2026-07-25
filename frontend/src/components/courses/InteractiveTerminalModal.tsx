import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Play, RefreshCw, Copy, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface VirtualNode {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  size?: number;
  permissions?: string;
  owner?: string;
  group?: string;
  updatedAt?: string;
  children?: Record<string, VirtualNode>;
}

// Initial Stateful Enterprise Virtual File System Tree
const INITIAL_FS: VirtualNode = {
  name: '/',
  type: 'dir',
  children: {
    home: {
      name: 'home',
      type: 'dir',
      children: {
        student: {
          name: 'student',
          type: 'dir',
          children: {
            production: {
              name: 'production',
              type: 'dir',
              children: {
                config: {
                  name: 'config',
                  type: 'dir',
                  children: {
                    'app.json': {
                      name: 'app.json',
                      type: 'file',
                      content: `{\n  "appName": "Shaivika LMS",\n  "env": "production",\n  "port": 8080\n}`,
                      size: 64,
                      permissions: '-rw-r--r--',
                      owner: 'student',
                      group: 'student',
                      updatedAt: 'Jul 23 20:30',
                    },
                  },
                },
                src: {
                  name: 'src',
                  type: 'dir',
                  children: {
                    'server.js': {
                      name: 'server.js',
                      type: 'file',
                      content: `const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => res.send('Shaivika LMS API Active'));\napp.listen(8080);`,
                      size: 156,
                      permissions: '-rw-r--r--',
                      owner: 'student',
                      group: 'student',
                      updatedAt: 'Jul 23 20:20',
                    },
                  },
                },
                'app.log': {
                  name: 'app.log',
                  type: 'file',
                  content: `[2026-07-23 20:25:01] [INFO] Authentication token generated.\n[2026-07-23 20:28:44] [INFO] Kernel module loaded successfully.`,
                  size: 1024,
                  permissions: '-rw-r--r--',
                  owner: 'student',
                  group: 'student',
                  updatedAt: 'Jul 23 20:15',
                },
                'script.sh': {
                  name: 'script.sh',
                  type: 'file',
                  content: `#!/bin/bash\necho "Initializing Shaivika Production Build..."\nsystemctl status nginx`,
                  size: 512,
                  permissions: '-rwxr-xr-x',
                  owner: 'student',
                  group: 'student',
                  updatedAt: 'Jul 23 20:28',
                },
                'index.html': {
                  name: 'index.html',
                  type: 'file',
                  content: `<!DOCTYPE html>\n<html>\n<head><title>Shaivika LMS</title></head>\n<body><h1>Shaivika AI Foundation Platform</h1></body>\n</html>`,
                  size: 2048,
                  permissions: '-rw-r--r--',
                  owner: 'student',
                  group: 'student',
                  updatedAt: 'Jul 23 20:29',
                },
              },
            },
          },
        },
      },
    },
    etc: {
      name: 'etc',
      type: 'dir',
      children: {
        passwd: {
          name: 'passwd',
          type: 'file',
          content: `root:x:0:0:root:/root:/bin/bash\nalice:x:1000:1000:Alice User:/home/alice:/bin/bash\nbob:x:1001:1001:Bob User:/home/bob:/bin/bash\nstudent:x:1002:1002:Student User:/home/student:/bin/bash`,
          size: 240,
          permissions: '-rw-r--r--',
          owner: 'root',
          group: 'root',
          updatedAt: 'Jul 23 18:00',
        },
        group: {
          name: 'group',
          type: 'file',
          content: `root:x:0:\ndevelopers:x:1000:alice,bob,student`,
          size: 56,
          permissions: '-rw-r--r--',
          owner: 'root',
          group: 'root',
          updatedAt: 'Jul 23 18:00',
        },
        'os-release': {
          name: 'os-release',
          type: 'file',
          content: `NAME="SHAIVIKA Enterprise AI Linux"\nVERSION="2026.1 LTS"\nID=shaivika\nPRETTY_NAME="SHAIVIKA Linux Platform"`,
          size: 110,
          permissions: '-rw-r--r--',
          owner: 'root',
          group: 'root',
          updatedAt: 'Jul 23 18:00',
        },
      },
    },
  },
};

interface InteractiveTerminalModalProps {
  initialCommand?: string;
  onClose: () => void;
}

export const InteractiveTerminalModal: React.FC<InteractiveTerminalModalProps> = ({
  initialCommand = 'pwd',
  onClose,
}) => {
  const [fs, setFs] = useState<VirtualNode>(INITIAL_FS);
  const [cwdParts, setCwdParts] = useState<string[]>(['home', 'student', 'production']);
  const [inputVal, setInputVal] = useState(initialCommand);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<
    { command: string; promptPath: string; output: string; type: 'success' | 'error' | 'info' }[]
  >([
    {
      command: 'System-Init',
      promptPath: '~/production',
      output: `SHAIVIKA Enterprise Dynamic Real-Time Linux Shell v4.2 LTS\nAll files & commands persist dynamically in memory during this session.\nType 'cls' or 'clear' to reset terminal history. Type 'help' for commands.`,
      type: 'info',
    },
  ]);

  const getCwdNode = (currentParts: string[], tree: VirtualNode): VirtualNode | null => {
    let curr = tree;
    for (const part of currentParts) {
      if (curr.children && curr.children[part]) {
        curr = curr.children[part];
      } else {
        return null;
      }
    }
    return curr;
  };

  const getPromptPath = () => {
    const pathStr = '/' + cwdParts.join('/');
    if (pathStr === '/home/student/production') return '~/production';
    if (pathStr.startsWith('/home/student')) return '~' + pathStr.replace('/home/student', '');
    return pathStr;
  };

  const executeCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const cmdLower = trimmed.toLowerCase();
    const promptPath = getPromptPath();

    if (cmdLower === 'clear' || cmdLower === 'cls') {
      setHistory([]);
      setInputVal('');
      return;
    }

    let outputText = '';
    let type: 'success' | 'error' | 'info' = 'success';
    const cwdNode = getCwdNode(cwdParts, fs);

    // 1. PWD
    if (cmdLower === 'pwd' || cmdLower === 'get-location') {
      outputText = '/' + cwdParts.join('/');
    }
    // 2. CD
    else if (cmdLower.startsWith('cd')) {
      const parts = trimmed.split(/\s+/);
      const target = parts[1] || '~';

      if (target === '~' || target === '/home/student') {
        setCwdParts(['home', 'student']);
        outputText = `Changed directory to /home/student`;
      } else if (target === '..' || target === '../') {
        if (cwdParts.length > 0) {
          const newParts = [...cwdParts];
          newParts.pop();
          setCwdParts(newParts);
          outputText = `Changed directory to /${newParts.join('/')}`;
        }
      } else if (target === '/' || target === 'root') {
        setCwdParts([]);
        outputText = `Changed directory to /`;
      } else if (cwdNode && cwdNode.children && cwdNode.children[target] && cwdNode.children[target].type === 'dir') {
        setCwdParts([...cwdParts, target]);
        outputText = `Changed directory to /${[...cwdParts, target].join('/')}`;
      } else {
        outputText = `cd: no such file or directory: ${target}`;
        type = 'error';
      }
    }
    // 3. LS
    else if (cmdLower.startsWith('ls') || cmdLower.startsWith('dir')) {
      if (!cwdNode || !cwdNode.children) {
        outputText = `ls: cannot access directory`;
      } else {
        const isLong = trimmed.includes('-l') || cmdLower.startsWith('dir');
        const items = Object.values(cwdNode.children);

        if (isLong) {
          const totalSize = items.reduce((acc, item) => acc + (item.size || 4096), 0);
          const lines = items.map((item) => {
            const perm = item.permissions || (item.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--');
            const owner = item.owner || 'student';
            const group = item.group || 'student';
            const size = (item.size || 4096).toString().padStart(6, ' ');
            const date = item.updatedAt || 'Jul 23 20:30';
            return `${perm} 1 ${owner} ${group} ${size} ${date} ${item.name}`;
          });
          outputText = `total ${Math.round(totalSize / 1024)}\n` + lines.join('\n');
        } else {
          outputText = items.map((i) => i.name).join('   ');
        }
      }
    }
    // 4. MKDIR (Dynamic state update)
    else if (cmdLower.startsWith('mkdir')) {
      const folderName = trimmed.replace(/^mkdir\s+(-p\s+)?/, '').trim();
      if (!folderName) {
        outputText = `mkdir: missing operand`;
        type = 'error';
      } else if (cwdNode && cwdNode.children) {
        cwdNode.children[folderName] = {
          name: folderName,
          type: 'dir',
          children: {},
          permissions: 'drwxr-xr-x',
          owner: 'student',
          group: 'student',
          updatedAt: 'Jul 23 22:10',
        };
        setFs({ ...fs });
        outputText = `[DYNAMIC FS] Directory '${folderName}' created successfully in /${cwdParts.join('/')}.`;
      }
    }
    // 5. TOUCH (Dynamic state update)
    else if (cmdLower.startsWith('touch')) {
      const fileName = trimmed.split(/\s+/)[1];
      if (!fileName) {
        outputText = `touch: missing file operand`;
        type = 'error';
      } else if (cwdNode && cwdNode.children) {
        if (!cwdNode.children[fileName]) {
          cwdNode.children[fileName] = {
            name: fileName,
            type: 'file',
            content: '',
            size: 0,
            permissions: '-rw-r--r--',
            owner: 'student',
            group: 'student',
            updatedAt: 'Jul 23 22:10',
          };
        } else {
          cwdNode.children[fileName].updatedAt = 'Jul 23 22:10';
        }
        setFs({ ...fs });
        outputText = `[DYNAMIC FS] File '${fileName}' created.`;
      }
    }
    // 6. CAT (Dynamic read)
    else if (cmdLower.startsWith('cat') || cmdLower.startsWith('type')) {
      const fileName = trimmed.split(/\s+/)[1];
      if (!fileName) {
        outputText = `cat: missing file operand`;
        type = 'error';
      } else if (cwdNode && cwdNode.children && cwdNode.children[fileName]) {
        const fileNode = cwdNode.children[fileName];
        if (fileNode.type === 'dir') {
          outputText = `cat: ${fileName}: Is a directory`;
          type = 'error';
        } else {
          outputText = fileNode.content || `(empty file)`;
        }
      } else {
        outputText = `cat: ${fileName}: No such file or directory`;
        type = 'error';
      }
    }
    // 7. ECHO & REDIRECTION (e.g. echo "data" > file.txt)
    else if (cmdLower.startsWith('echo')) {
      const redirectIdx = trimmed.indexOf('>');
      if (redirectIdx !== -1) {
        const contentRaw = trimmed.substring(4, redirectIdx).trim().replace(/^["']|["']$/g, '');
        const targetFile = trimmed.substring(redirectIdx + 1).trim().replace(/^>\s*/, '');

        if (cwdNode && cwdNode.children) {
          cwdNode.children[targetFile] = {
            name: targetFile,
            type: 'file',
            content: contentRaw,
            size: contentRaw.length,
            permissions: '-rw-r--r--',
            owner: 'student',
            group: 'student',
            updatedAt: 'Jul 23 22:10',
          };
          setFs({ ...fs });
          outputText = `[DYNAMIC FS] Written ${contentRaw.length} bytes to '${targetFile}'.`;
        }
      } else {
        outputText = trimmed.substring(5).replace(/^["']|["']$/g, '');
      }
    }
    // 8. RM (Dynamic delete)
    else if (cmdLower.startsWith('rm')) {
      const targetName = trimmed.replace(/^rm\s+(-rf\s+|-r\s+|-f\s+)?/, '').trim();
      if (cwdNode && cwdNode.children && cwdNode.children[targetName]) {
        delete cwdNode.children[targetName];
        setFs({ ...fs });
        outputText = `[DYNAMIC FS] Removed '${targetName}' from /${cwdParts.join('/')}.`;
      } else {
        outputText = `rm: cannot remove '${targetName}': No such file or directory`;
        type = 'error';
      }
    }
    // 9. CHMOD
    else if (cmdLower.startsWith('chmod')) {
      const parts = trimmed.split(/\s+/);
      const octal = parts[1];
      const target = parts[2];
      if (cwdNode && cwdNode.children && cwdNode.children[target]) {
        cwdNode.children[target].permissions = `[octal ${octal}]`;
        setFs({ ...fs });
        outputText = `[SUCCESS] Changed permissions of '${target}' to ${octal}.`;
      } else {
        outputText = `[SUCCESS] Permissions updated to ${octal || '755'}.`;
      }
    }
    // 10. CHOWN
    else if (cmdLower.startsWith('chown')) {
      const parts = trimmed.replace(/-R\s+/, '').split(/\s+/);
      const ownerGroup = parts[1] || 'alice:developers';
      const target = parts[2] || 'app';
      outputText = `[SUCCESS] Changed ownership of '${target}' to ${ownerGroup}.`;
    }
    // 11. GREP
    else if (cmdLower.startsWith('grep')) {
      outputText = `[2026-07-23 20:25:01] [INFO] Authentication token generated.\n[2026-07-23 20:28:44] [INFO] Kernel module loaded successfully.`;
    }
    // 12. SYSTEMCTL
    else if (cmdLower.startsWith('systemctl')) {
      outputText = `● nginx.service - Nginx HTTP And Reverse Proxy Server\n   Loaded: loaded (/lib/systemd/system/nginx.service; enabled)\n   Active: active (running) since Thu 2026-07-23 20:00:00 UTC\n Main PID: 1234 (nginx)`;
    }
    // 13. PS / HTOP
    else if (cmdLower.startsWith('ps') || cmdLower.startsWith('htop')) {
      outputText = `PID TTY          TIME CMD\n 1234 pts/0    00:00:01 bash\n 5678 pts/0    00:00:02 node\n 9101 pts/0    00:00:00 ps`;
    }
    // 14. IP / PING / SSH / GETFACL / CRONTAB
    else if (cmdLower.startsWith('ip')) {
      outputText = `1: lo: <LOOPBACK,UP> inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP> inet 192.168.1.100/24 scope global eth0`;
    } else if (cmdLower.startsWith('ping')) {
      outputText = `PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.\n64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=14.2 ms\n64 bytes from 8.8.8.8: icmp_seq=2 ttl=117 time=13.8 ms\n--- 8.8.8.8 ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss`;
    } else if (cmdLower.startsWith('ssh')) {
      outputText = `Authenticated to remote server via SSH Ed25519 key pair.\nWelcome to SHAIVIKA Production Environment!`;
    } else if (cmdLower.startsWith('getfacl') || cmdLower.startsWith('setfacl')) {
      outputText = `# file: project.pdf\n# owner: alice\n# group: developers\nuser::rw-\nuser:bob:rw-\ngroup::r--\nmask::rw-\nother::r--`;
    } else if (cmdLower.startsWith('crontab')) {
      outputText = `0 2 * * * /usr/local/bin/backup.sh\n*/15 * * * * /usr/local/bin/healthcheck.sh`;
    } else if (cmdLower === 'help') {
      outputText = `Available Dynamic Commands: pwd, cd, ls, mkdir, touch, cat, echo, rm, chmod, chown, grep, systemctl, ps, htop, ip, ping, ssh, getfacl, setfacl, crontab, cls, clear, help`;
    } else {
      outputText = `commandExecuted: ${trimmed}\nOutput: Exit code 0.`;
    }

    setHistory((prev) => [...prev, { command: trimmed, promptPath, output: outputText, type }]);
    setInputVal('');
  };

  useEffect(() => {
    if (initialCommand) {
      executeCommand(initialCommand);
      setInputVal(initialCommand);
    }
  }, [initialCommand]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCopy = () => {
    navigator.clipboard.writeText(initialCommand);
    setCopied(true);
    toast.success('Command copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 font-mono text-white animate-in fade-in duration-200">
      {/* Pure Black Pitch Terminal Window */}
      <div className="bg-black border border-slate-800 rounded-2xl w-full max-w-4xl h-[82vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Pitch Black Header */}
        <div className="p-3.5 px-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-emerald-400">
            <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <TerminalIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block">SHAIVIKA Dynamic Real-Time Linux Terminal</span>
              <span className="text-[10px] text-slate-400 font-sans">Stateful In-Memory Filesystem Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => setHistory([])}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="Clear Terminal (cls)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-900/60 hover:text-rose-300 text-slate-300 transition-colors cursor-pointer border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selected Command Context Strip */}
        <div className="p-2.5 px-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 font-sans">Active Command:</span>
            <span className="px-2.5 py-0.5 rounded bg-black border border-emerald-500/40 text-emerald-400 font-bold">
              {initialCommand}
            </span>
          </div>

          <button
            onClick={() => executeCommand(initialCommand)}
            className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] font-sans flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Play className="w-3 h-3 fill-current" /> Run
          </button>
        </div>

        {/* Pure Pitch Black Terminal Content */}
        <div className="flex-1 p-5 text-xs text-slate-200 overflow-y-auto space-y-4 bg-black leading-relaxed">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="text-emerald-400">student@shaivika-lms:{item.promptPath}$</span>
                <span className="text-amber-300">{item.command}</span>
              </div>
              <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                {item.output}
              </pre>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Dynamic Terminal Input Prompt */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeCommand(inputVal);
          }}
          className="p-3.5 px-5 bg-slate-950 border-t border-slate-800 flex items-center gap-3 text-xs"
        >
          <span className="text-emerald-400 font-bold shrink-0">student@shaivika-lms:{getPromptPath()}$</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type any Linux CLI command (mkdir, touch, cd, ls, echo, rm, cls)..."
            className="flex-1 bg-transparent text-white focus:outline-none font-bold"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-sans cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Play className="w-3 h-3 fill-current" /> Run
          </button>
        </form>
      </div>
    </div>
  );
};
