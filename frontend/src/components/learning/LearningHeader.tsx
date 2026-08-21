import React, { useState } from 'react';
import { Menu, ChevronLeft, ChevronRight, ArrowLeft, User, Award, Eye, Download, ExternalLink, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../common/ThemeToggle';


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
  isCourseFullyCompleted?: boolean;
  onViewCertificate?: () => void;
  currentCert?: any;
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
  isCourseFullyCompleted = false,
  onViewCertificate,
  currentCert,
}) => {
  const [showCertDropdown, setShowCertDropdown] = useState(false);
  return (
    <header
      className={`sticky top-0 z-40 w-full py-3 px-3 sm:py-4 sm:px-6 lg:px-8 backdrop-blur-xl border-b flex items-center justify-between transition-all shadow-sm ${
        isNightMode
          ? 'bg-slate-950/95 border-slate-800/90 text-white shadow-slate-950/40'
          : 'bg-white/95 border-sky-100 text-slate-900 shadow-sky-500/5'
      }`}
    >
      {/* Left Section: Menu Toggle + Back + Title */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 mr-2">
        {/* Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center shrink-0 ${
            isNightMode
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-cyan-400'
              : 'bg-sky-50 hover:bg-sky-100 border-sky-100 text-sky-700'
          }`}
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Back to Overview Button */}
        <button
          onClick={onBackToCourseDetails}
          className={`flex items-center gap-1 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border transition-all text-xs font-bold cursor-pointer shrink-0 active:scale-95 ${
            isNightMode
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
              : 'bg-sky-50 hover:bg-sky-100 border-sky-100 text-sky-700 hover:text-sky-900'
          }`}
          title="Back to Course Overview"
        >
          <ArrowLeft className="w-4 h-4 shrink-0 text-primary" />
          <span className="hidden sm:inline">Overview</span>
        </button>

        {/* Course & Lesson Title (Truncated cleanly on tablet/desktop, hidden on tiny mobile if crowded) */}
        <div className="hidden md:flex flex-col justify-center min-w-0 space-y-0.5">
          <span
            className={`px-2 py-0.75 rounded-lg border text-[9px] font-mono font-black tracking-widest flex items-center gap-1.5 shrink-0 ${
              isNightMode
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-primary/5 text-primary border-primary/20'
            }`}
          >
            <BookOpen className="w-3 h-3 shrink-0 text-primary" />
            <span className="truncate">{courseTitle}</span>
          </span>
          <h1
            className="text-xs lg:text-sm font-heading font-black truncate max-w-48 lg:max-w-72 leading-tight tracking-tight text-primary"
            style={{ textShadow: '0 0 4px var(--kq-glow)' }}
          >
            {(lessonTitle || '').replace(/^git-unit-\d+-\d+\s*:?\s*/i, '').replace(/^unit-[\d-]+\s*:?\s*/i, '')}
          </h1>
        </div>
      </div>

      {/* Right Section: Theme Toggle + Progress + Prev/Next + User Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Course Certificate Dropdown (Only visible when 100% completed) */}
        {isCourseFullyCompleted && currentCert && (
          <div className="relative shrink-0 select-none">
            <button
              onClick={() => setShowCertDropdown(!showCertDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-emerald-450 bg-linear-to-r from-emerald-500 via-emerald-650 to-teal-600 text-white shadow-md shadow-emerald-500/10 hover:brightness-105 transition-all text-xs font-black cursor-pointer active:scale-95 shrink-0"
              title="Certificate Available"
            >
              <Award className="w-4 h-4 shrink-0 fill-white animate-pulse" />
              <span className="hidden sm:inline">Certificate Available</span>
              <span className="sm:hidden text-[10px]">Credential</span>
              {showCertDropdown ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
            </button>

            <AnimatePresence>
              {showCertDropdown && (
                <>
                  {/* Backdrop overlay for closing dropdown */}
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setShowCertDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-2.5 w-72 rounded-2xl border p-4 shadow-xl z-50 space-y-3.5 animate-in fade-in zoom-in-95 duration-100 ${
                      isNightMode
                        ? 'bg-slate-900 border-slate-800 text-slate-100'
                        : 'bg-white border-sky-100 text-slate-800'
                    }`}
                  >
                    <div className="space-y-1 pb-2 border-b border-slate-700/20">
                      <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-wide block">
                        Official Graduate Credential
                      </span>
                      <h4 className="text-xs font-bold truncate">
                        {currentCert.courseTitle || courseTitle}
                      </h4>
                    </div>

                    <div className="space-y-2 text-[11px] font-medium">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">Certificate ID:</span>
                        <span className="font-mono text-xs font-black select-all bg-slate-800/10 px-1.5 py-0.5 rounded">
                          {currentCert.verificationId || currentCert.id}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">Issue Date:</span>
                        <span>{currentCert.completionDate}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-2">
                      <button
                        onClick={() => {
                          setShowCertDropdown(false);
                          if (onViewCertificate) onViewCertificate();
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span>View Certificate</span>
                      </button>

                      <a
                        href={`/api/certificates/download?certificateId=${currentCert.verificationId || currentCert.id}&studentId=${currentCert.studentId}&studentName=${encodeURIComponent(currentCert.studentName)}&courseTitle=${encodeURIComponent(currentCert.courseTitle)}&completionDate=${encodeURIComponent(currentCert.completionDate)}`}
                        href={`${API_BASE_URL}/certificates/download?certificateId=${currentCert.verificationId || currentCert.id}&studentId=${currentCert.studentId}&studentName=${encodeURIComponent(currentCert.studentName)}&courseTitle=${encodeURIComponent(currentCert.courseTitle)}&completionDate=${encodeURIComponent(currentCert.completionDate)}`}
                        className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Download Certificate</span>
                      </a>

                      <a
                        href={`/api/certificates/verify/${currentCert.verificationId || currentCert.id}?studentId=${currentCert.studentId}`}
                        href={`${API_BASE_URL}/certificates/verify/${currentCert.verificationId || currentCert.id}?studentId=${currentCert.studentId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-slate-200"
                      >
                        <ExternalLink className="w-4 h-4 text-sky-600" />
                        <span>Verify Authenticity</span>
                      </a>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Theme Selector */}
        <ThemeToggle />

        {/* Progress Bar (Desktop only) */}
        <div className="hidden lg:flex flex-col items-end gap-1.5 w-36">
          <div className="flex items-center justify-between w-full text-xs">
            <span className={isNightMode ? 'text-slate-400' : 'text-slate-500 font-semibold'}>
              Progress
            </span>
            <span className="font-mono font-black text-xs text-primary">
              {progressPercent}%
            </span>
          </div>
          <div
            className={`w-full h-2 rounded-full overflow-hidden border ${
              isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-sky-100/80 border-sky-200/50'
            }`}
          >
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-primary to-secondary shadow-[0_0_8px_var(--kq-glow)]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Prev / Next Navigation Controls */}
        <div
          className={`flex items-center gap-1 p-1 rounded-xl border ${
            isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-sky-50/80 border-sky-100'
          }`}
        >
          <button
            onClick={onPrevLesson}
            disabled={!hasPrevLesson}
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg transition-all text-xs font-extrabold cursor-pointer border flex items-center justify-center ${
              isNightMode
                ? 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-transparent disabled:opacity-30'
                : 'bg-white hover:bg-sky-100 text-slate-700 border-sky-100 disabled:opacity-40'
            }`}
            title="Previous Lesson"
          >
            <ChevronLeft className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline ml-1">Prev</span>
          </button>

          <button
            onClick={onNextLesson}
            disabled={!hasNextLesson}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg disabled:opacity-40 text-slate-955 font-black transition-all text-xs shadow-xs cursor-pointer active:scale-95 flex items-center justify-center bg-linear-to-r from-primary to-secondary"
            title="Next Lesson"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="w-4 h-4 stroke-3 text-slate-955" />
          </button>
        </div>

        {/* User Avatar */}
        <div className="flex items-center shrink-0">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 object-cover shadow-xs border-primary"
            />
          ) : (
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center shadow-xs ${
                isNightMode ? 'bg-slate-950 border-slate-800 text-primary' : 'bg-white border-sky-200 text-primary'
              }`}
            >
              <User className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
