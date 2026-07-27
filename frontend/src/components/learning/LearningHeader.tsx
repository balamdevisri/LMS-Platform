import React from 'react';
import { Menu, ChevronLeft, ChevronRight, ArrowLeft, User, Sparkles, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

interface LearningHeaderProps {
  courseTitle: string;
  lessonTitle: string;
  progressPercent: number;
  onToggleSidebar: () => void;
  onPrevLesson: () => void;
  onNextLesson: () => void;
  hasPrevLesson: boolean;
  hasNextLesson: boolean;
  onBackToCourseDetails: () => void;
  userAvatar?: string;
  userName?: string;
  isNightMode?: boolean;
  onToggleNightMode?: () => void;
}

export const LearningHeader: React.FC<LearningHeaderProps> = ({
  courseTitle,
  lessonTitle,
  progressPercent,
  onToggleSidebar,
  onPrevLesson,
  onNextLesson,
  hasPrevLesson,
  hasNextLesson,
  onBackToCourseDetails,
  userAvatar,
  userName = 'Student',
  isNightMode = false,
  onToggleNightMode,
}) => {
  return (
    <header
      className={`sticky top-0 z-40 w-full min-h-24 sm:min-h-28 py-4 sm:py-5 px-4 sm:px-8 lg:px-10 backdrop-blur-xl border-b flex items-center justify-between transition-all shadow-md ${
        isNightMode
          ? 'bg-slate-950/95 border-slate-800/90 text-white shadow-slate-950/40'
          : 'bg-white/95 border-sky-100 text-slate-900 shadow-sky-500/5'
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-5 min-w-0 pr-3 sm:pr-6">
        <button
          onClick={onToggleSidebar}
          className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center shrink-0 ${
            isNightMode
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-cyan-400'
              : 'bg-sky-50/80 hover:bg-sky-100/80 border-sky-100 text-sky-700'
          }`}
          title="Toggle Course Navigation Menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={onBackToCourseDetails}
          className={`hidden md:flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border transition-all text-xs sm:text-sm font-bold cursor-pointer shrink-0 ${
            isNightMode
              ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
              : 'bg-sky-50/80 hover:bg-sky-100/80 border-sky-100 text-sky-700 hover:text-sky-900'
          }`}
          title="Back to Course Overview"
        >
          <ArrowLeft className={`w-4 h-4 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`} />
          <span>Overview</span>
        </button>

        <div className="min-w-0 flex flex-col justify-center space-y-0.5 sm:space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs sm:text-sm font-mono font-bold uppercase tracking-wider truncate max-w-36 sm:max-w-64 md:max-w-80 lg:max-w-96 flex items-center gap-1.5 ${
                isNightMode ? 'text-cyan-400' : 'text-sky-600'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isNightMode ? 'text-cyan-400' : 'text-sky-500'}`} />
              {courseTitle}
            </span>
          </div>
          <h1
            className={`text-sm sm:text-base lg:text-lg font-heading font-black truncate max-w-36 sm:max-w-64 md:max-w-80 lg:max-w-96 leading-tight ${
              isNightMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            {lessonTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5 lg:gap-6 shrink-0 pl-2">
        {onToggleNightMode && (
          <div
            onClick={onToggleNightMode}
            className={`flex items-center gap-1 p-1 rounded-2xl border transition-all duration-300 cursor-pointer shadow-xs hover:scale-102 active:scale-95 ${
              isNightMode
                ? 'bg-slate-900 border-slate-800'
                : 'bg-sky-50/80 border-sky-100'
            }`}
            title={isNightMode ? 'Active: Night Reading Mode (Click to switch to Day Mode)' : 'Active: Day Reading Mode (Click to switch to Night Mode)'}
          >
            {/* Sun Icon (Day Mode) */}
            <div
              className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${
                !isNightMode
                  ? 'bg-white text-amber-500 shadow-md shadow-amber-500/20 border border-amber-200/60 scale-105'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Sun className={`w-4 h-4 ${!isNightMode ? 'fill-amber-400' : ''}`} />
            </div>

            {/* Moon Icon (Night Mode) */}
            <div
              className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${
                isNightMode
                  ? 'bg-slate-950 text-cyan-400 shadow-md shadow-cyan-500/30 border border-cyan-500/40 scale-105'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Moon className={`w-4 h-4 ${isNightMode ? 'fill-cyan-400/30 animate-pulse' : ''}`} />
            </div>
          </div>
        )}

        <div className="hidden lg:flex flex-col items-end gap-2 min-w-40">
          <div className="flex items-center justify-between w-full text-xs">
            <span className={isNightMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}>
              Course Progress
            </span>
            <span className={`font-mono font-extrabold text-xs ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`}>
              {progressPercent}%
            </span>
          </div>
          <div
            className={`w-full h-3 rounded-full overflow-hidden border ${
              isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-sky-100/80 border-sky-200/50'
            }`}
          >
            <motion.div
              className={`h-full rounded-full ${
                isNightMode
                  ? 'bg-linear-to-r from-cyan-500 via-sky-400 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                  : 'bg-linear-to-r from-sky-500 via-sky-400 to-blue-600 shadow-[0_0_12px_rgba(14,165,233,0.5)]'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div
          className={`flex items-center gap-2 p-2 rounded-2xl border shadow-inner ${
            isNightMode ? 'bg-slate-900/90 border-slate-800' : 'bg-sky-50/80 border-sky-100'
          }`}
        >
          <button
            onClick={onPrevLesson}
            disabled={!hasPrevLesson}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all text-xs sm:text-sm font-extrabold cursor-pointer border ${
              isNightMode
                ? 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-transparent hover:border-slate-700 disabled:opacity-30'
                : 'bg-white hover:bg-sky-100/60 text-slate-700 border-sky-100 disabled:opacity-40'
            }`}
            title="Previous Lesson"
          >
            <ChevronLeft className={`w-4 h-4 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`} />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <button
            onClick={onNextLesson}
            disabled={!hasNextLesson}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl disabled:opacity-40 text-white font-black transition-all text-xs sm:text-sm shadow-md cursor-pointer active:scale-95 ${
              isNightMode
                ? 'bg-linear-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 shadow-cyan-500/20'
                : 'bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/25'
            }`}
            title="Next Lesson"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4 stroke-3" />
          </button>
        </div>

        <div className={`flex items-center gap-3 border-l pl-4 sm:pl-6 ${isNightMode ? 'border-slate-800' : 'border-sky-100'}`}>
          <div
            className={`flex items-center gap-3 p-1.5 pr-4 rounded-2xl border shadow-xs ${
              isNightMode ? 'bg-slate-900/90 border-slate-800' : 'bg-sky-50/80 border-sky-100'
            }`}
          >
            <div className="relative">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 object-cover shadow-xs ${
                    isNightMode ? 'border-cyan-400' : 'border-sky-400'
                  }`}
                />
              ) : (
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center shadow-xs ${
                    isNightMode ? 'bg-slate-950 border-slate-700 text-cyan-400' : 'bg-white border-sky-200 text-sky-600'
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className={`text-xs font-bold truncate max-w-35 leading-tight ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
                {userName || 'Bhanu Prakash Achari'}
              </span>
              <span
                className={`text-[10px] font-mono font-semibold flex items-center gap-1 ${
                  isNightMode ? 'text-cyan-400' : 'text-sky-600'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse ${isNightMode ? 'bg-cyan-400' : 'bg-sky-500'}`} />
                Student Pro
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
