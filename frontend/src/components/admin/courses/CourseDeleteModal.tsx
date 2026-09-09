import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import type { CourseItem } from '@/contexts/CourseContext';

interface CourseDeleteModalProps {
  isOpen: boolean;
  course: CourseItem | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const CourseDeleteModal: React.FC<CourseDeleteModalProps> = ({
  isOpen,
  course,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  const [confirmationText, setConfirmationText] = React.useState('');

  // Reset confirmation input when modal opens or course changes
  React.useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
    }
  }, [isOpen, course]);

  if (!isOpen || !course) return null;

  const isConfirmed = confirmationText.trim().toUpperCase() === 'DELETE' || confirmationText.trim() === course.title.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-900 dark:text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
            Delete Course Track?
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-slate-100">"{course.title}"</span>?
          </p>
          <p className="text-[11px] text-rose-500/90 dark:text-rose-400/90 font-semibold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 p-2.5 rounded-xl">
            ⚠️ This will soft-delete the course document from Firestore. Type <span className="font-mono font-bold text-rose-600 dark:text-rose-300">DELETE</span> below to confirm.
          </p>
        </div>

        {/* Typing Confirmation Safeguard */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Confirmation Safeguard
          </label>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            disabled={isDeleting}
            placeholder="Type DELETE to confirm"
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting || !isConfirmed}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Course</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CourseDeleteModal;
