import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  LogOut,
  Radio,
  Users,
  Clock,
  ShieldCheck,
  X,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export type LiveClassActionType = 'enter' | 'exit';

export interface LiveClassConfirmModalProps {
  isOpen: boolean;
  actionType: LiveClassActionType;
  classTitle?: string;
  courseName?: string;
  instructorName?: string;
  onlineCount?: number;
  durationFormatted?: string;
  isInstructor?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const LiveClassConfirmModal: React.FC<LiveClassConfirmModalProps> = ({
  isOpen,
  actionType,
  classTitle = 'Live Technical Session',
  courseName = 'AI & Systems Track',
  instructorName = 'Faculty Lead',
  onlineCount = 1,
  durationFormatted = '00:00:00',
  isInstructor = false,
  onConfirm,
  onCancel,
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  const isEnter = actionType === 'enter';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl font-sans select-none animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[#090d1c]/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 overflow-hidden space-y-5 backdrop-blur-3xl"
        >
          {/* Ambient Glow */}
          <div className={`absolute top-0 right-0 w-64 h-64 ${isEnter ? 'bg-sky-500/10' : 'bg-rose-500/10'} blur-3xl rounded-full pointer-events-none`} />
          <div className={`absolute bottom-0 left-0 w-64 h-64 ${isEnter ? 'bg-indigo-500/10' : 'bg-amber-500/10'} blur-3xl rounded-full pointer-events-none`} />

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-lg ${
                  isEnter
                    ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300'
                    : 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                }`}
              >
                {isEnter ? <Video className="w-6 h-6" /> : <LogOut className="w-6 h-6" />}
              </div>
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider mb-1 ${
                    isEnter
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  <Radio className="w-3 h-3 animate-pulse" />
                  {isEnter ? 'Live Interactive Stream' : 'Live Session Exit'}
                </span>
                <h3 className="text-lg sm:text-xl font-heading font-black text-white tracking-tight">
                  {isEnter
                    ? 'Join Live Classroom?'
                    : isInstructor
                    ? 'End Live Classroom Session?'
                    : 'Leave Live Classroom?'}
                </h3>
              </div>
            </div>

            <button
              onClick={onCancel}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/10"
              aria-label="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p className="relative z-10 text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            {isEnter
              ? `You are joining the live interactive session for "${classTitle}". Real-time live chat, interactive quizzes, attendance telemetry, and sandbox whiteboard are active.`
              : isInstructor
              ? `Ending the live session will disconnect all attendees and finalize the attendance and quiz participation records for "${classTitle}".`
              : `Are you sure you want to exit the live classroom for "${classTitle}"? Your live attendance and quiz points have been recorded.`}
          </p>

          {/* Session Overview Card */}
          <div className="relative z-10 p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3 backdrop-blur-md shadow-inner">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400">Class Topic:</span>
              <span className="font-bold text-sky-300 truncate max-w-64">{classTitle}</span>
            </div>
            {courseName && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400">Course Track:</span>
                <span className="font-semibold text-slate-200 truncate max-w-64">{courseName}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400">Mentor / Lead:</span>
              <span className="font-semibold text-white">{instructorName}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-center">
              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white">{onlineCount} Active</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold text-white">{durationFormatted}</span>
              </div>
            </div>
          </div>

          {/* Enter Perks / Exit Safeguards */}
          {isEnter ? (
            <div className="relative z-10 grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Live Audio & HD Video</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Real-Time Live Chat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Live Quizzes & Polls</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant Attendance Credit</span>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Attendance duration and quiz answers are automatically saved to your student profile.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="w-full sm:w-auto flex-1 py-3 px-5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-slate-200 text-xs font-bold transition-all cursor-pointer text-center"
            >
              {isEnter ? 'Cancel' : 'Stay in Session'}
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className={`w-full sm:w-auto flex-1 py-3 px-6 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl active:scale-98 ${
                isEnter
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-indigo-600/30'
                  : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30'
              }`}
            >
              <span>{isEnter ? 'Join Live Class' : isInstructor ? 'End Live Class' : 'Leave Class'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LiveClassConfirmModal;
