import React, { useState } from 'react';
import {
  FolderTree,
  CheckSquare,
  History,
  HelpCircle,
  File,
  Folder,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Terminal as TerminalIcon
} from 'lucide-react';
import type { LabTask, VFSFile } from './useLinuxShellEngine';

interface LinuxLabLeftSidebarProps {
  isNightMode: boolean;
  tasks: LabTask[];
  vfs: VFSFile;
  currentPath: string;
  commandHistory: string[];
  onSelectCommand: (cmd: string) => void;
}

export const LinuxLabLeftSidebar: React.FC<LinuxLabLeftSidebarProps> = ({
  isNightMode,
  tasks,
  vfs,
  commandHistory,
  onSelectCommand,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'files' | 'history' | 'hints'>('tasks');
  const [expandedDirs, setExpandedDirs] = useState<{ [key: string]: boolean }>({
    home: true,
    student: true,
    scripts: true,
  });

  const toggleExpand = (dirName: string) => {
    setExpandedDirs((prev) => ({ ...prev, [dirName]: !prev[dirName] }));
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  const renderVfsNode = (node: VFSFile, depth = 0) => {
    const isExpanded = !!expandedDirs[node.name];

    if (node.type === 'dir') {
      return (
        <div key={node.name} style={{ paddingLeft: `${depth * 12}px` }}>
          <button
            onClick={() => toggleExpand(node.name)}
            className={`w-full flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-mono transition-colors text-left ${
              isNightMode
                ? 'hover:bg-slate-900 text-slate-300'
                : 'hover:bg-sky-50 text-slate-700'
            }`}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <Folder className="w-3.5 h-3.5 text-sky-500 shrink-0 fill-sky-500/20" />
            <span className="font-semibold truncate">{node.name}/</span>
          </button>

          {isExpanded && node.children && (
            <div className="space-y-0.5 mt-0.5">
              {node.children.map((child: VFSFile) => renderVfsNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={node.name}
        style={{ paddingLeft: `${depth * 12 + 16}px` }}
        className={`flex items-center gap-1.5 py-1 px-2 rounded-md text-xs font-mono ${
          isNightMode ? 'text-slate-400' : 'text-slate-600'
        }`}
      >
        <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="truncate">{node.name}</span>
        {node.size && <span className="text-[10px] text-slate-500 ml-auto">{node.size}B</span>}
      </div>
    );
  };

  return (
    <aside
      className={`w-full md:w-64 lg:w-72 shrink-0 border-r flex flex-col transition-colors ${
        isNightMode
          ? 'bg-slate-950 border-slate-800 text-slate-200'
          : 'bg-slate-50/90 border-sky-100 text-slate-800'
      }`}
    >
      {/* Top Tab Switcher */}
      <div className={`grid grid-cols-4 border-b text-xs font-bold ${isNightMode ? 'border-slate-800 bg-slate-900/60' : 'border-sky-100 bg-white'}`}>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`py-2.5 flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? isNightMode
                ? 'border-b-2 border-cyan-400 text-cyan-300 bg-slate-900'
                : 'border-b-2 border-sky-600 text-sky-700 bg-sky-50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Lab Tasks & Objectives"
        >
          <CheckSquare className="w-4 h-4" />
          <span className="text-[10px]">Tasks</span>
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`py-2.5 flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'files'
              ? isNightMode
                ? 'border-b-2 border-cyan-400 text-cyan-300 bg-slate-900'
                : 'border-b-2 border-sky-600 text-sky-700 bg-sky-50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Virtual File Explorer"
        >
          <FolderTree className="w-4 h-4" />
          <span className="text-[10px]">Files</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-2.5 flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'history'
              ? isNightMode
                ? 'border-b-2 border-cyan-400 text-cyan-300 bg-slate-900'
                : 'border-b-2 border-sky-600 text-sky-700 bg-sky-50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Command History Log"
        >
          <History className="w-4 h-4" />
          <span className="text-[10px]">History</span>
        </button>

        <button
          onClick={() => setActiveTab('hints')}
          className={`py-2.5 flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'hints'
              ? isNightMode
                ? 'border-b-2 border-cyan-400 text-cyan-300 bg-slate-900'
                : 'border-b-2 border-sky-600 text-sky-700 bg-sky-50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Lab Hints & Reference"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="text-[10px]">Hints</span>
        </button>
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 p-3 overflow-y-auto space-y-4 font-sans text-xs">
        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className={`p-3 rounded-2xl border ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-sky-100'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Lab Progress</span>
                <span className="font-mono font-bold text-cyan-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-slate-800">
                <div
                  className="h-full bg-linear-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-slate-400 text-right mt-1">
                {completedCount} of {tasks.length} tasks completed
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className={`p-4 rounded-2xl border text-center space-y-1 ${isNightMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-sky-100 text-slate-500'}`}>
                <TerminalIcon className="w-5 h-5 mx-auto text-cyan-400 mb-1" />
                <p className="font-bold text-xs">Interactive Linux Shell Sandbox</p>
                <p className="text-[11px] leading-relaxed">Enter any bash commands in the terminal window to practice system administration freely!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      task.completed
                        ? isNightMode
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                          : 'bg-emerald-50 border-emerald-200 text-slate-800'
                        : isNightMode
                        ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                        : 'bg-white border-sky-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold">
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-500 shrink-0" />
                        )}
                        <span>Task {task.id}: {task.title}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        +{task.xp} XP
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed pl-6">
                      {task.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FILES TAB */}
        {activeTab === 'files' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
              <span>EXPLORER: /home/student</span>
            </div>
            <div className={`p-2 rounded-2xl border ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-sky-100'}`}>
              {renderVfsNode(vfs)}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 px-1">Recent Commands</span>
            {commandHistory.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs font-mono">No command history yet.</div>
            ) : (
              commandHistory.map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectCommand(cmd)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left font-mono text-xs transition-colors cursor-pointer ${
                    isNightMode
                      ? 'bg-slate-900 border-slate-800 text-cyan-300 hover:bg-slate-800'
                      : 'bg-white border-sky-100 text-sky-700 hover:bg-sky-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <TerminalIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cmd}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 uppercase font-sans">Run</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* HINTS TAB */}
        {activeTab === 'hints' && (
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 px-1">Command Cheatsheet</span>
            <div className={`p-3 rounded-2xl border space-y-2.5 text-xs ${isNightMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-sky-100 text-slate-700'}`}>
              <div>
                <span className="font-mono font-bold text-cyan-400 block">mkdir &lt;name&gt;</span>
                <span className="text-[11px] text-slate-400">Creates a new directory in your active path.</span>
              </div>
              <div className="border-t border-slate-800/80 pt-2">
                <span className="font-mono font-bold text-cyan-400 block">cd &lt;path&gt;</span>
                <span className="text-[11px] text-slate-400">Changes active working directory. Use `cd ..` to go back.</span>
              </div>
              <div className="border-t border-slate-800/80 pt-2">
                <span className="font-mono font-bold text-cyan-400 block">touch &lt;file&gt;</span>
                <span className="text-[11px] text-slate-400">Creates an empty file document.</span>
              </div>
              <div className="border-t border-slate-800/80 pt-2">
                <span className="font-mono font-bold text-cyan-400 block">pwd</span>
                <span className="text-[11px] text-slate-400">Displays full current working directory path.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
