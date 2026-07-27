import React, { useState, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  RotateCcw,
  Maximize2,
  Minimize2,
  Activity,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LinuxLabHeaderProps {
  isNightMode: boolean;
  onToggleNightMode: () => void;
  onResetLab: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  studentName?: string;
  studentAvatar?: string;
}

export const LinuxLabHeader: React.FC<LinuxLabHeaderProps> = ({
  isNightMode,
  onToggleNightMode,
  onResetLab,
  isFullscreen,
  onToggleFullscreen,
  studentName: propStudentName,
  studentAvatar: propStudentAvatar,
}) => {
  const { user, userProfile } = useAuth();
  const [sessionSeconds, setSessionSeconds] = useState(932); // starts at 15:32

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const studentName = propStudentName || userProfile?.name || user?.displayName || 'Bhanu Prakash Achari';
  const studentAvatar = propStudentAvatar || userProfile?.photoURL || user?.photoURL;

  return (
    <header
      className={`w-full py-3 border-b flex items-center justify-between transition-colors shadow-xs ${
        isFullscreen ? 'px-3 sm:px-4' : 'px-4 sm:px-6'
      } ${
        isNightMode
          ? 'bg-slate-950 border-slate-800 text-slate-100'
          : 'bg-white border-sky-100 text-slate-900'
      }`}
    >
      {/* Left: Branding & Status */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-600 text-white shadow-sm flex items-center justify-center font-bold">
            <TerminalIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight">
                Ubuntu 24.04 LTS
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Connected
              </span>
            </div>
            <span className={`text-[11px] font-mono block ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Container Docker Engine • x86_64
            </span>
          </div>
        </div>
      </div>

      {/* Center: Session Timer */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-slate-900/60 border-slate-800 text-cyan-300 font-mono text-xs shadow-inner">
        <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span>Session Time:</span>
        <span className="font-bold text-white">{formatTime(sessionSeconds)}</span>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Reset Lab Button */}
        <button
          onClick={onResetLab}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
            isNightMode
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
              : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-slate-700 hover:text-slate-900'
          }`}
          title="Reset Lab Container to Initial State"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Reset Lab</span>
        </button>

        {/* Fullscreen Toggle Button */}
        <button
          onClick={onToggleFullscreen}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
            isFullscreen
              ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/40 shadow-md animate-pulse'
              : isNightMode
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
              : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-slate-700'
          }`}
          title={isFullscreen ? 'Exit Fullscreen Workstation (Press ESC)' : 'Fullscreen Workstation'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Exit Fullscreen (Esc)</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">Fullscreen</span>
            </>
          )}
        </button>

        {/* Theme Segment Toggle */}
        <button
          onClick={onToggleNightMode}
          className={`p-2 rounded-xl border transition-all text-xs font-bold cursor-pointer shadow-xs ${
            isNightMode
              ? 'bg-slate-900 border-slate-800 text-cyan-400'
              : 'bg-sky-50 border-sky-200 text-amber-500'
          }`}
          title={isNightMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isNightMode ? <Moon className="w-4 h-4 fill-cyan-400/30" /> : <Sun className="w-4 h-4 fill-amber-400" />}
        </button>

        {/* Dynamic Logged-In Student Profile Badge */}
        <div
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border shadow-xs transition-all ${
            isNightMode
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-sky-200 text-slate-800'
          }`}
          title={`Active Linux Workstation Student: ${studentName}`}
        >
          {studentAvatar ? (
            <img src={studentAvatar} alt={studentName} className="w-6 h-6 rounded-full object-cover border border-sky-400 shrink-0" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-linear-to-r from-sky-500 to-blue-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm">
              {studentName.charAt(0)}
            </div>
          )}
          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-extrabold font-mono truncate max-w-36 sm:max-w-56 text-emerald-400">
              {studentName}
            </span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider hidden sm:block">
              Student Workstation
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
