import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  Plus,
  X,
  Copy,
  Check,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { toast } from 'sonner';
import type { TerminalTab } from './useLinuxShellEngine';

interface LinuxLabTerminalProps {
  isNightMode?: boolean;
  isFullscreen?: boolean;
  tabs: TerminalTab[];
  activeTab: TerminalTab;
  onSelectTab: (id: string) => void;
  onAddTab: () => void;
  onCloseTab: (id: string) => void;
  promptString: string;
  onExecuteCommand: (cmd: string) => void;
  getTabSuggestions: (input: string) => string | null;
  commandHistoryList: string[];
}

export const LinuxLabTerminal: React.FC<LinuxLabTerminalProps> = ({
  isFullscreen = false,
  tabs,
  activeTab,
  onSelectTab,
  onAddTab,
  onCloseTab,
  promptString,
  onExecuteCommand,
  getTabSuggestions,
  commandHistoryList,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [fontSize, setFontSize] = useState<number>(13); // in px
  const [copied, setCopied] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const terminalOutputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll output container on resize or new history
  useEffect(() => {
    const scrollToBottom = () => {
      if (terminalOutputRef.current) {
        terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
      }
    };
    scrollToBottom();
    window.addEventListener('resize', scrollToBottom);
    return () => window.removeEventListener('resize', scrollToBottom);
  }, [activeTab.history, isFullscreen]);

  // Focus input when clicking anywhere in terminal area
  const handleTerminalClick = () => {
    inputRef.current?.focus();
    if (contextMenu) setContextMenu(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // TAB Completion
    if (e.key === 'Tab') {
      e.preventDefault();
      const suggestion = getTabSuggestions(inputVal);
      if (suggestion) {
        setInputVal(suggestion);
      }
      return;
    }

    // Up Arrow (Previous History)
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistoryList.length > 0) {
        const nextIdx = Math.min(historyIndex + 1, commandHistoryList.length - 1);
        setHistoryIndex(nextIdx);
        setInputVal(commandHistoryList[nextIdx] || '');
      }
      return;
    }

    // Down Arrow (Next History)
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistoryList[nextIdx] || '');
      } else {
        setHistoryIndex(-1);
        setInputVal('');
      }
      return;
    }

    // CTRL + C (Cancel current line)
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      setInputVal('');
      toast.info('^C (Command cancelled)');
      return;
    }

    // CTRL + L (Clear screen)
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      onExecuteCommand('clear');
      return;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inputVal.trim()) return;
    onExecuteCommand(inputVal);
    setInputVal('');
    setHistoryIndex(-1);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCopyTranscript = async () => {
    const text = activeTab.history.map((h) => `${h.prompt} ${h.command}\n${h.output}`).join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Terminal transcript copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
    setContextMenu(null);
  };

  return (
    <div
      onClick={handleTerminalClick}
      onContextMenu={handleContextMenu}
      className={`flex-1 flex flex-col min-w-0 bg-[#0D1117] text-[#C9D1D9] font-['JetBrains_Mono','Fira_Code','Ubuntu_Mono',monospace] overflow-hidden select-text relative ${
        isFullscreen ? 'rounded-none border-none shadow-none h-full w-full m-0 p-0' : 'border border-slate-800 rounded-2xl shadow-2xl'
      }`}
    >
      {/* Top Tab Bar */}
      <div className="flex items-center justify-between bg-[#161B22] border-b border-[#30363D] px-2 pt-1.5 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-0">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTab(tab.id);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t-xl text-xs font-mono transition-colors cursor-pointer border-t border-x ${
                tab.active
                  ? 'bg-[#0D1117] border-[#30363D] text-[#58A6FF] font-bold shadow-xs'
                  : 'bg-[#161B22] border-transparent text-[#8B949E] hover:text-[#C9D1D9]'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5 text-[#3FB950] shrink-0" />
              <span className="truncate max-w-36">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="hover:text-[#FF7B72] rounded p-0.5"
                  title="Close Terminal Session"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddTab();
            }}
            className="p-1.5 rounded-lg hover:bg-[#30363D] text-[#8B949E] hover:text-white transition-colors cursor-pointer"
            title="Open New Terminal Session"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Right Terminal Control Buttons */}
        <div className="flex items-center gap-1.5 pb-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFontSize((prev) => Math.min(prev + 1, 18));
            }}
            className="p-1 rounded hover:bg-[#30363D] text-[#8B949E] hover:text-white transition-colors"
            title="Zoom In Terminal Font"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setFontSize((prev) => Math.max(prev - 1, 10));
            }}
            className="p-1 rounded hover:bg-[#30363D] text-[#8B949E] hover:text-white transition-colors"
            title="Zoom Out Terminal Font"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopyTranscript();
            }}
            className="p-1 rounded hover:bg-[#30363D] text-[#8B949E] hover:text-white transition-colors"
            title="Copy Terminal Output"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#3FB950]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Output Screen */}
      <div
        ref={terminalOutputRef}
        className="flex-1 p-4 overflow-y-auto overscroll-contain space-y-3 scrollbar-thin scrollbar-thumb-slate-800"
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
      >
        {activeTab.history.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#3FB950] font-bold">{item.prompt}</span>
              <span className="text-white">{item.command}</span>
            </div>

            {item.output && (
              <pre
                className={`whitespace-pre-wrap font-mono leading-relaxed pl-2 border-l-2 ${
                  item.isError
                    ? 'border-[#FF7B72] text-[#FF7B72]'
                    : 'border-[#30363D] text-[#C9D1D9]'
                }`}
              >
                {item.output}
              </pre>
            )}
          </div>
        ))}

        {/* Input Prompt Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
          <span className="text-[#3FB950] font-bold shrink-0">{promptString}</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-white font-mono shadow-none focus:ring-0 p-0 m-0 cursor-text"
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>

      {/* Context Menu Popup */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl p-1.5 text-xs text-[#C9D1D9] font-sans space-y-1 min-w-40"
        >
          <button
            onClick={handleCopyTranscript}
            className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#30363D] flex items-center justify-between cursor-pointer"
          >
            <span>Copy Transcript</span>
            <Copy className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => {
              onExecuteCommand('clear');
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#30363D] flex items-center justify-between cursor-pointer text-[#FF7B72]"
          >
            <span>Clear Screen</span>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
