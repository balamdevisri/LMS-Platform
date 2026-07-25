import React, { useState } from 'react';
import { X, UserCheck, Save, Loader2 } from 'lucide-react';
import type { UserProfile, UserRole, UserStatus } from '@/types/user';

interface EditUserModalProps {
  user: UserProfile;
  onClose: () => void;
  onSave: (updated: UserProfile) => Promise<void>;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave }) => {
  const [fullName, setFullName] = useState(user.fullName || user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [role, setRole] = useState<UserRole>(user.role || 'student');
  const [status, setStatus] = useState<UserStatus>(user.status || 'Active');
  const [branch, setBranch] = useState(user.branch || 'AI & Computer Science');
  const [year, setYear] = useState(user.year || '4th Year');
  const [skills, setSkills] = useState((user.skills || []).join(', '));
  const [bio, setBio] = useState(user.bio || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const parsedSkills = skills.split(',').map((s) => s.trim()).filter(Boolean);
      await onSave({
        ...user,
        fullName,
        name: fullName,
        email,
        role,
        status,
        branch,
        year,
        skills: parsedSkills,
        bio,
      });
      onClose();
    } catch (e) {
      console.error('Failed to update user profile:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 border border-sky-200 animate-in zoom-in-95 text-slate-900 font-['Sora']">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">Edit User Account</h3>
              <p className="text-xs text-slate-500 font-medium">Update account information and permissions</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none cursor-pointer"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Blocked">Blocked</option>
                <option value="Pending">Pending Verification</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Branch / Specialization</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Academic Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Skills (Comma Separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Python, PyTorch, React, Machine Learning"
              className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-slate-900 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-blue-primary text-xs py-2.5 px-6 font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
