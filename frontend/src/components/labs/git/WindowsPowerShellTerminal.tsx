import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, Minimize2, RefreshCw, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { PowerShellEngine } from '../../../services/powerShellEngine';

interface WindowsPowerShellTerminalProps {
  onCommandRun?: (cmd: string) => void;
  isNightMode?: boolean;
}

interface LogEntry {
  id: string;
  prompt: string;
  command: string;
  output: string;
  type: 'success' | 'error' | 'info';
}

export const WindowsPowerShellTerminal: React.FC<WindowsPowerShellTerminalProps> = ({
  onCommandRun,
}) => {
  const [engine] = useState(() => new PowerShellEngine());
  const [promptPath, setPromptPath] = useState('PS C:\\Users\\Student\\GitLab>');
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'welcome_banner',
      prompt: '',
      command: '',
      output: `Windows PowerShell\nCopyright (C) Microsoft Corporation. All rights reserved.\n\nInstall the latest PowerShell for new features and improvements! https://aka.ms/PSWindows\n\nKaizenQ AI Practice Workspace: C:\\Users\\Student\\GitLab [Git Version 2.45.2.windows.1]\nWorkspace files: App.tsx, Header.tsx, architecture.md, package.json, README.md, .gitignore\nType 'Get-ChildItem' or 'git status' to inspect workspace.\n`,
      type: 'info',
    },
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const toggleFullScreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!isFullScreen) {
      setIsFullScreen(true);
      const elem = terminalWrapperRef.current || document.documentElement;
      if (elem && (elem as any).requestFullscreen) {
        (elem as any).requestFullscreen().catch(() => {});
      }
    } else {
      setIsFullScreen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        toggleFullScreen();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isFullScreen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputVal.trim();
      if (!trimmed) return;

      // Update command history
      const newHistory = [...history, trimmed];
      setHistory(newHistory);
      setHistoryIndex(-1);

      // Execute command
      const res = engine.execute(trimmed);

      if (res.output === '__CLEAR__') {
        setLogs([]);
      } else {
        setLogs((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            prompt: promptPath,
            command: trimmed,
            output: res.output,
            type: res.type,
          },
        ]);
      }

      if (res.newPromptPath) {
        setPromptPath(`PS ${res.newPromptPath}>`);
      }

      if (onCommandRun) {
        onCommandRun(trimmed);
      }

      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(history[nextIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex] || '');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Tab completion fallback
      if (inputVal.startsWith('git c')) setInputVal('git commit -m "');
      else if (inputVal.startsWith('git s')) setInputVal('git status');
      else if (inputVal.startsWith('git b')) setInputVal('git branch');
      else if (inputVal.startsWith('g')) setInputVal('git ');
      else if (inputVal.startsWith('dir')) setInputVal('dir src');
    }
  };

  const handleCopyLogs = () => {
    const text = logs.map((l) => `${l.prompt} ${l.command}\n${l.output}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetWorkspace = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    engine.resetWorkspace();
    setPromptPath('PS C:\\Users\\Student\\GitLab>');
    setLogs([
      {
        id: String(Date.now()),
        prompt: '',
        command: '',
        output: `Windows PowerShell Workspace & Git Repository Reset\nRestored Files & Directories: frontend/, backend/, .gitignore, README.md, package.json\n`,
        type: 'info',
      },
    ]);
    toast.success('🔄 PowerShell workspace & simulated Git repository reset!');
  };

  const renderTerminalInner = () => (
    <>
      {/* WINDOWS TERMINAL TITLEBAR */}
      <div className="bg-[#161b22] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
            PS
          </div>
          <span className="text-xs font-semibold text-slate-300 font-sans tracking-wide">
            Windows PowerShell - C:\Users\Student\GitLab
          </span>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-bold ml-2">
            Git 2.45.2 (main)
          </span>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Copy Terminal Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleResetWorkspace}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Refresh PowerShell Workspace & Reset Files"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <div className="h-3 w-px bg-slate-800 mx-1" />
          <button
            onClick={toggleFullScreen}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title={isFullScreen ? 'Exit Full Screen (ESC)' : 'Full Screen Terminal (F11 Mode)'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4 text-amber-400 animate-pulse" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* TERMINAL CONTENT SCREEN */}
      <div ref={containerRef} className="p-4 flex-1 overflow-y-auto space-y-3 text-xs leading-relaxed font-mono custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className="space-y-1">
            {log.command && (
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold select-none">{log.prompt}</span>
                <span className="text-white font-semibold">{log.command}</span>
              </div>
            )}
            {log.output && (
              <pre
                className={`whitespace-pre-wrap font-mono ${
                  log.type === 'error'
                    ? 'text-red-400 bg-red-950/20 p-2 rounded border border-red-900/40'
                    : log.type === 'info'
                    ? 'text-slate-400'
                    : 'text-slate-200'
                }`}
              >
                {log.output}
              </pre>
            )}
          </div>
        ))}

        {/* ACTIVE PROMPT INPUT */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-cyan-400 font-bold select-none shrink-0">{promptPath}</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white focus:outline-none font-mono text-xs caret-cyan-400"
            spellCheck={false}
          />
        </div>
      </div>
    </>
  );

  if (isFullScreen) {
    return (
      <div
        ref={terminalWrapperRef}
        className="fixed inset-0 z-9999 w-screen h-screen bg-[#0c1017] text-slate-100 font-mono flex flex-col overflow-hidden select-text border-none rounded-none m-0 p-0 animate-in fade-in duration-150"
        onClick={() => inputRef.current?.focus()}
      >
        {renderTerminalInner()}
      </div>
    );
  }

  return (
    <div
      ref={terminalWrapperRef}
      className="rounded-2xl border border-slate-800 bg-[#0c1017] text-slate-100 font-mono shadow-2xl overflow-hidden flex flex-col h-full select-text transition-all"
      onClick={() => inputRef.current?.focus()}
    >
      {renderTerminalInner()}
    </div>
  );
};
