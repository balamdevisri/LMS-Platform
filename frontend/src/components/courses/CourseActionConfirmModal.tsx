import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  PlayCircle,
  LogOut,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  ShieldCheck,
  X,
  ArrowRight
} from 'lucide-react';

export type CourseActionType = 'enroll' | 'enter' | 'exit';

export interface CourseActionConfirmModalProps {
  isOpen: boolean;
  actionType: CourseActionType;
  courseTitle: string;
  courseCategory?: string;
  modulesCount?: number;
  lessonsCount?: number;
  duration?: string;
  currentProgress?: number;
  currentLessonTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const CourseActionConfirmModal: React.FC<CourseActionConfirmModalProps> = ({
  isOpen,
  actionType,
  courseTitle,
  courseCategory = 'Engineering Track',
  modulesCount = 6,
  lessonsCount = 24,
  duration = '6-8 hours',
  currentProgress = 0,
  currentLessonTitle,
  onConfirm,
  onCancel,
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  const getActionConfig = () => {
    switch (actionType) {
      case 'enroll':
        return {
          badge: 'Official Course Enrollment',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          icon: <GraduationCap className="w-6 h-6 text-emerald-400" />,
          iconBg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400',
          title: 'Confirm Course Enrollment',
          subtitle: `You are about to enroll in "${courseTitle}". You will receive instant access to interactive labs, quizzes, and verified certification.`,
          confirmText: isProcessing ? 'Enrolling...' : 'Confirm & Start Learning',
          confirmBtnClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/40',
          cancelText: 'Cancel',
        };
      case 'enter':
        return {
          badge: 'Learning Session Launch',
          badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
          icon: <PlayCircle className="w-6 h-6 text-cyan-400" />,
          iconBg: 'bg-indigo-950/80 border-indigo-500/40 text-cyan-400',
          title: currentProgress > 0 ? 'Resume Course Learning' : 'Launch Course Workspace',
          subtitle: currentProgress > 0
            ? `Resume learning "${courseTitle}" from your last saved position with 24/7 AI tutor and live sandbox.`
            : `Enter the interactive classroom workspace for "${courseTitle}".`,
          confirmText: currentProgress > 0 ? 'Resume Session' : 'Enter Workspace',
          confirmBtnClass: 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-900/40',
          cancelText: 'Back to Overview',
        };
      case 'exit':
        return {
          badge: 'Session Exit Confirmation',
          badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          icon: <LogOut className="w-6 h-6 text-amber-400" />,
          iconBg: 'bg-amber-950/80 border-amber-500/40 text-amber-400',
          title: 'Exit Learning Session?',
          subtitle: `Are you sure you want to leave your active learning session for "${courseTitle}"? Your progress, quiz scores, and practice labs are automatically saved.`,
          confirmText: 'Save & Exit to Overview',
          confirmBtnClass: 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-amber-900/40',
          cancelText: 'Stay & Continue Learning',
        };
    }
  };

  const config = getActionConfig();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 overflow-hidden space-y-6"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-lg ${config.iconBg}`}>
                {config.icon}
              </div>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider mb-1 ${config.badgeColor}`}>
                  <Sparkles className="w-3 h-3" />
                  {config.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-heading font-black text-white tracking-tight">
                  {config.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onCancel}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p className="relative z-10 text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            {config.subtitle}
          </p>

          {/* Course Details Card / Progress Highlights */}
          <div className="relative z-10 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400">Course Track:</span>
              <span className="font-bold text-cyan-300">{courseCategory}</span>
            </div>

            {actionType === 'enroll' && (
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-center">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Modules</span>
                  <span className="text-xs font-black text-white font-mono">{modulesCount} Units</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Lessons</span>
                  <span className="text-xs font-black text-white font-mono">{lessonsCount} Topics</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Duration</span>
                  <span className="text-xs font-black text-white font-mono">{duration}</span>
                </div>
              </div>
            )}

            {(actionType === 'enter' || actionType === 'exit') && (
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Current Progress</span>
                  <span className="text-cyan-300 font-mono">{currentProgress}% Completed</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.max(4, currentProgress)}%` }}
                  />
                </div>
                {currentLessonTitle && (
                  <p className="text-[11px] text-slate-400 truncate">
                    Active Lesson: <span className="text-white font-semibold">{currentLessonTitle}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Benefits summary for enrollment */}
          {actionType === 'enroll' && (
            <div className="relative z-10 grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Verified Certificate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>24/7 AI Tutor Lab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Interactive Practice Sandbox</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Lifetime Access</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="w-full sm:w-auto flex-1 py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer text-center"
            >
              {config.cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className={`w-full sm:w-auto flex-1 py-3 px-6 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 ${config.confirmBtnClass}`}
            >
              <span>{config.confirmText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CourseActionConfirmModal;
