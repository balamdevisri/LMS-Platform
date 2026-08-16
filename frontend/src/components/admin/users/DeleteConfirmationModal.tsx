import React, { useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import type { UserProfile } from '@/types/user';

interface DeleteConfirmationModalProps {
  user: UserProfile;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  user,
  onClose,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      console.error('Delete user error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 font-['Sora']">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-rose-200 dark:border-rose-900/60 text-center text-slate-900 dark:text-white">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-xs">
          <ShieldAlert className="w-6 h-6" />
        </div>
        
        <div>
          <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Delete User Account?</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{user.fullName}</span> ({user.email})? This action is permanent and will delete user records from Firestore.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
