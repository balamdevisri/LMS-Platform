import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ShieldAlert, X, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export interface LogoutConfirmModalProps {
  isOpen: boolean;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  userAvatar?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  userName = 'User',
  userEmail,
  userRole = 'student',
  userAvatar,
  onConfirm,
  onCancel,
  isProcessing = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle keyboard shortcuts (Escape to cancel, Enter to confirm)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter' && !isProcessing) {
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, onConfirm, isProcessing]);

  const roleFormatted =
    userRole === 'admin'
      ? 'Administrator'
      : userRole === 'instructor'
      ? 'Instructor / Mentor'
      : 'Student Scholar';

  const roleBadgeColor =
    userRole === 'admin'
      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
      : userRole === 'instructor'
      ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
      : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans pointer-events-auto select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isProcessing) {
              onCancel();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-slate-900/95 dark:bg-slate-900/95 border border-slate-750/70 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/80 text-slate-100 overflow-hidden space-y-5 backdrop-blur-xl pointer-events-auto"
          >
            {/* Ambient Glow Effects */}
            <div className="absolute -top-16 -right-16 w-52 h-52 bg-rose-500/15 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-950/50 shrink-0">
                  <LogOut className="w-6 h-6 text-rose-400 animate-pulse" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider mb-1 bg-rose-500/15 text-rose-400 border-rose-500/30">
                    <ShieldAlert className="w-3 h-3" />
                    Account Security
                  </span>
                  <h3
                    id="logout-modal-title"
                    className="text-lg sm:text-xl font-heading font-black text-white tracking-tight"
                  >
                    Confirm Sign Out?
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isProcessing) onCancel();
                }}
                aria-label="Close modal"
                disabled={isProcessing}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-700/40 hover:border-slate-600 disabled:opacity-50 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Card */}
            <div className="relative z-10 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex items-center gap-3.5 shadow-inner">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-11 h-11 rounded-full object-cover border-2 border-slate-700 shadow-sm shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center border-2 border-slate-700 shadow-sm shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-white truncate max-w-[160px] sm:max-w-[200px]">
                    {userName}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-md border text-[9px] font-extrabold uppercase ${roleBadgeColor}`}
                  >
                    {roleFormatted}
                  </span>
                </div>
                {userEmail && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">{userEmail}</p>
                )}
              </div>
            </div>

            {/* Information Notice */}
            <div className="relative z-10 rounded-2xl p-3.5 bg-slate-800/40 border border-slate-800 text-xs sm:text-sm text-slate-300 font-normal leading-relaxed space-y-1.5">
              <p>
                Are you sure you want to log out from{' '}
                <strong className="text-white font-semibold">Kaizen Q LMS</strong>?
              </p>
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-emerald-400 font-medium pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>Your learning progress & sandbox data are auto-saved in cloud.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="relative z-10 flex flex-col-reverse sm:flex-row items-center gap-3 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isProcessing) onCancel();
                }}
                disabled={isProcessing}
                className="w-full sm:w-1/2 py-3 px-5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer text-center active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                Stay Logged In
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isProcessing) onConfirm();
                }}
                disabled={isProcessing}
                className="w-full sm:w-1/2 py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/30 hover:shadow-red-600/45 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none group"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <>
                    <span>Sign Out</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalContent, document.body);
};

export default LogoutConfirmModal;
