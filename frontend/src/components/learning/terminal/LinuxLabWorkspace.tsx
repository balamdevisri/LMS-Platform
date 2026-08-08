import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useLinuxShellEngine } from './useLinuxShellEngine';
import { LinuxLabHeader } from './LinuxLabHeader';
import { LinuxLabTerminal } from './LinuxLabTerminal';
import { LinuxLabStatusBar } from './LinuxLabStatusBar';
import { LinuxLabAIAssistant } from './LinuxLabAIAssistant';

interface LinuxLabWorkspaceProps {
  isGitCourse?: boolean;
  initialCommands?: Array<{ command: string; description: string }>;
  onExecuteCommand?: (cmd: string) => void;
  isNightMode?: boolean;
  isKubernetesCourse?: boolean;
}

export const LinuxLabWorkspace: React.FC<LinuxLabWorkspaceProps> = ({
  isGitCourse = false,
  initialCommands,
  onExecuteCommand,
  isNightMode: externalNightMode = true,
  isKubernetesCourse = false,
}) => {
  const [isNightMode, setIsNightMode] = useState(externalNightMode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const engine = useLinuxShellEngine(isGitCourse, initialCommands, isKubernetesCourse);

  // Fullscreen toggle helper with native element-level fullscreen request
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      setTimeout(() => {
        if (workspaceRef.current && workspaceRef.current.requestFullscreen) {
          workspaceRef.current.requestFullscreen().catch(() => {});
        }
      }, 50);
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Lock body scroll in fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Press ESC or native fullscreen change listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        if (document.exitFullscreen && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    const handleFSChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFSChange);
    };
  }, [isFullscreen]);

  const handleCommandExecution = (cmd: string) => {
    engine.executeCommand(cmd);
    if (onExecuteCommand) {
      onExecuteCommand(cmd);
    }
  };

  const workspaceContent = (
    <div
      ref={workspaceRef}
      onWheel={(e) => {
        if (isFullscreen) e.stopPropagation();
      }}
      onTouchMove={(e) => {
        if (isFullscreen) e.stopPropagation();
      }}
      className={`overflow-hidden flex flex-col transition-all duration-300 font-sans relative ${
        isFullscreen
          ? 'fixed top-0 left-0 right-0 bottom-0 z-999999 w-screen h-screen m-0 p-0 rounded-none border-none bg-[#0D1117]'
          : 'my-6 min-h-140 h-175 lg:h-190 w-full rounded-3xl border shadow-2xl'
      } ${
        isNightMode
          ? 'bg-slate-950 border-slate-800 text-slate-100 shadow-slate-950/80'
          : 'bg-white border-sky-100 text-slate-900 shadow-sky-500/10'
      }`}
    >
      {/* Floating Exit Fullscreen Button in Fullscreen Mode */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed top-3 right-5 z-1000000 px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-2xl flex items-center gap-2 cursor-pointer transition-all border border-rose-400/40 opacity-80 hover:opacity-100"
          title="Exit Fullscreen Mode (Press ESC)"
        >
          <X className="w-4 h-4" />
          <span>Exit Fullscreen (Esc)</span>
        </button>
      )}

      {/* Top Header Bar (Only in Normal Mode) */}
      {!isFullscreen && (
        <LinuxLabHeader
          isNightMode={isNightMode}
          onToggleNightMode={() => setIsNightMode(!isNightMode)}
          onResetLab={engine.resetLab}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      {/* Main Full-Width Terminal Shell Workstation */}
      <main className={`flex-1 flex flex-col min-w-0 bg-[#0D1117] min-h-0 ${isFullscreen ? 'p-0 h-full w-full' : 'p-2'}`}>
        <LinuxLabTerminal
          isNightMode={isNightMode}
          isFullscreen={isFullscreen}
          tabs={engine.tabs}
          activeTab={engine.activeTab}
          onSelectTab={engine.selectTab}
          onAddTab={engine.addTab}
          onCloseTab={engine.closeTab}
          promptString={engine.getPromptString()}
          onExecuteCommand={handleCommandExecution}
          getTabSuggestions={engine.getTabSuggestions}
          commandHistoryList={engine.commandHistoryList}
        />
      </main>

      {/* Bottom Telemetry Status Bar (Only in Normal Mode) */}
      {!isFullscreen && (
        <LinuxLabStatusBar
          isNightMode={isNightMode}
          currentPathDisplay={engine.getDisplayPath(engine.currentPath)}
          gitBranch={engine.gitBranch}
          isKubernetesCourse={isKubernetesCourse}
        />
      )}

      {/* Floating AI Assistant Drawer */}
      <LinuxLabAIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        isNightMode={isNightMode}
      />
    </div>
  );

  if (isFullscreen) {
    return createPortal(workspaceContent, document.body);
  }

  return workspaceContent;
};
