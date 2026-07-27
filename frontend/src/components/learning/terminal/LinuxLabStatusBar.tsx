import React from 'react';
import { Folder, GitBranch, Cpu, HardDrive, Server } from 'lucide-react';

interface LinuxLabStatusBarProps {
  isNightMode: boolean;
  currentPathDisplay: string;
  gitBranch: string;
}

export const LinuxLabStatusBar: React.FC<LinuxLabStatusBarProps> = ({
  isNightMode,
  currentPathDisplay,
  gitBranch,
}) => {
  return (
    <div
      className={`w-full py-1.5 px-4 border-t text-[11px] font-mono flex flex-wrap items-center justify-between gap-4 transition-colors shrink-0 ${
        isNightMode
          ? 'bg-slate-950 border-slate-800 text-slate-400'
          : 'bg-slate-100 border-sky-200 text-slate-600'
      }`}
    >
      {/* Left: Directory & Git */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <Folder className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentPathDisplay}</span>
        </div>

        <div className="flex items-center gap-1.5 text-purple-400 font-bold">
          <GitBranch className="w-3.5 h-3.5 text-purple-400" />
          <span>{gitBranch}</span>
        </div>
      </div>

      {/* Right: Server Telemetry */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-emerald-400 font-semibold">
          <Server className="w-3.5 h-3.5" />
          <span>Ubuntu Docker 24.04</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <HardDrive className="w-3.5 h-3.5 text-sky-400" />
          <span>RAM: 1.2 / 8.0 GB</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-amber-400" />
          <span>CPU: 4%</span>
        </div>
      </div>
    </div>
  );
};
