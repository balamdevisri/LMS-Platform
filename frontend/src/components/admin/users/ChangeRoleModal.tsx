import React, { useState } from 'react';
import { X, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import type { UserProfile, UserRole } from '@/types/user';
import { RoleBadge } from './RoleBadge';

interface ChangeRoleModalProps {
  user: UserProfile;
  onClose: () => void;
  onRoleChange: (newRole: UserRole) => Promise<void>;
}

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({ user, onClose, onRoleChange }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role || 'student');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (selectedRole === user.role) return;
    setIsSubmitting(true);
    try {
      await onRoleChange(selectedRole);
      onClose();
    } catch (err) {
      console.error('Role change failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Sora']">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 border border-sky-200 animate-in zoom-in-95 text-slate-900">
        <div className="flex items-center justify-between border-b border-sky-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-600" />
            <h3 className="font-heading font-bold text-lg text-slate-900">Change Account Role</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs font-medium">
          <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 flex items-center gap-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.fullName} className="w-10 h-10 rounded-full object-cover border-2 border-sky-400" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-sky-600 to-indigo-600 text-white font-extrabold flex items-center justify-center border border-sky-300">
                {user.fullName.charAt(0)}
              </div>
            )}
            <div>
              <h4 className="font-heading font-bold text-sm text-slate-900">{user.fullName}</h4>
              <p className="text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Current Role</span>
              <RoleBadge role={user.role} />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Target Role</span>
              <RoleBadge role={selectedRole} />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-2">Select New Access Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['student', 'instructor', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                    selectedRole === r
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 font-medium">
            ⚠️ Changing a user's role grants or restricts platform permissions in real-time. Only authorized Admins can modify user access.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || selectedRole === user.role}
            className="btn-blue-primary text-xs py-2 px-5 font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Confirm Role Change</span>
          </button>
        </div>
      </div>
    </div>
  );
};
