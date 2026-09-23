import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, ShieldCheck } from 'lucide-react';

export interface ExitCourseConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  courseTitle?: string;
  isNightMode?: boolean;
  isProcessing?: boolean;
}

export const ExitCourseConfirmationDialog: React.FC<ExitCourseConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  courseTitle,
  isNightMode = false,
  isProcessing = false,
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Focus the Cancel button on open for safe default interaction
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm font-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-course-dialog-title"
        aria-describedby="exit-course-dialog-description"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onCancel();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={`relative w-full max-w-md rounded-2xl p-6 sm:p-7 shadow-2xl border transition-colors ${
            isNightMode
              ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/80'
              : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Icon button */}
          <button
            type="button"
            onClick={onCancel}
            className={`absolute top-4 right-4 p-2 rounded-xl border transition-colors cursor-pointer ${
              isNightMode
                ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Icon + Title */}
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isNightMode
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-amber-50 border-amber-200 text-amber-600'
              }`}
            >
              <LogOut className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <h2
                id="exit-course-dialog-title"
                className={`text-lg sm:text-xl font-bold tracking-tight leading-snug ${
                  isNightMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                Are you sure you want to exit?
              </h2>

              {courseTitle && (
                <p
                  className={`text-xs font-semibold truncate mt-1 ${
                    isNightMode ? 'text-sky-400' : 'text-sky-700'
                  }`}
                >
                  {courseTitle}
                </p>
              )}
            </div>
          </div>

          {/* Message Body */}
          <div className="mt-4 space-y-3">
            <p
              id="exit-course-dialog-description"
              className={`text-sm leading-relaxed ${
                isNightMode ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Your learning progress will be saved, but you will leave this course.
            </p>

            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${
                isNightMode
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>All completed lessons, XP, and notes are securely saved.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
            <button
              ref={cancelBtnRef}
              type="button"
              onClick={onCancel}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer border active:scale-95 ${
                isNightMode
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900'
              }`}
            >
              Cancel
            </button>

            <button
              ref={confirmBtnRef}
              type="button"
              disabled={isProcessing}
              onClick={onConfirm}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 transition-all cursor-pointer shadow-lg shadow-amber-900/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{isProcessing ? 'Exiting...' : 'Exit Course'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExitCourseConfirmationDialog;
