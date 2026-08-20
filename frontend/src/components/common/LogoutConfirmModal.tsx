import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ShieldAlert, X, ArrowRight } from 'lucide-react';

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
  if (!isOpen) return null;

  const roleFormatted = userRole === 'admin' ? 'Administrator' : userRole === 'instructor' ? 'Instructor / Mentor' : 'Student Scholar';
  const roleBadgeColor = userRole === 'admin'
    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    : userRole === 'instructor'
    ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 overflow-hidden space-y-6"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-rose-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-lg">
                <LogOut className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider mb-1 bg-rose-500/20 text-rose-400 border-rose-500/30">
                  <ShieldAlert className="w-3 h-3" />
                  Account Security
                </span>
                <h3 className="text-lg sm:text-xl font-heading font-black text-white tracking-tight">
                  Confirm Sign Out?
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

          {/* User Profile Card */}
          <div className="relative z-10 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3.5">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-11 h-11 rounded-full object-cover border-2 border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-linear-to-r from-sky-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center border-2 border-slate-700 shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white truncate">{userName}</h4>
                <span className={`px-2 py-0.5 rounded-md border text-[9px] font-extrabold uppercase ${roleBadgeColor}`}>
                  {roleFormatted}
                </span>
              </div>
              {userEmail && (
                <p className="text-xs text-slate-400 truncate mt-0.5">{userEmail}</p>
              )}
            </div>
          </div>

          {/* Warning text */}
          <p className="relative z-10 text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Are you sure you want to log out from <strong className="text-white">Kaizen Q LMS</strong>? Your learning progress, active sandboxes, and quiz history are securely saved in the cloud.
          </p>

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="w-full sm:w-auto flex-1 py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer text-center"
            >
              Stay Logged In
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="w-full sm:w-auto flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-900/40 active:scale-98"
            >
              <span>{isProcessing ? 'Signing Out...' : 'Sign Out'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LogoutConfirmModal;
