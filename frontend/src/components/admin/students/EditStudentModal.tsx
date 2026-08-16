import React, { useState, useEffect } from 'react';
import { X, Edit, Loader2, Save } from 'lucide-react';
import type { StudentUser } from '@/services/studentService';

interface EditStudentModalProps {
  student: StudentUser | null;
  onClose: () => void;
  onSave: (updated: StudentUser) => Promise<void>;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(student?.name || student?.fullName || '');
  const [email, setEmail] = useState(student?.email || '');
  const [branch, setBranch] = useState(student?.branch || 'AI & Computer Science');
  const [year, setYear] = useState(student?.year || '1st Year');
  const [college, setCollege] = useState(student?.college || 'Shaivika AI Foundation');
  const [phone, setPhone] = useState(student?.phone || '');
  const [status, setStatus] = useState<'Active' | 'Suspended'>(student?.status === 'Suspended' ? 'Suspended' : 'Active');
  const [bio, setBio] = useState(student?.bio || '');
  const [skillsStr, setSkillsStr] = useState((student?.skills || []).join(', '));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setName(student.name || student.fullName || '');
      setEmail(student.email || '');
      setBranch(student.branch || 'AI & Computer Science');
      setYear(student.year || '1st Year');
      setCollege(student.college || 'Shaivika AI Foundation');
      setPhone(student.phone || '');
      setStatus(student.status === 'Suspended' ? 'Suspended' : 'Active');
      setBio(student.bio || '');
      setSkillsStr((student.skills || []).join(', '));
    }
  }, [student]);

  if (!student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const skills = skillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updatedStudent: StudentUser = {
        ...student,
        name,
        fullName: name,
        email,
        branch,
        year,
        college,
        phone,
        status,
        isActive: status === 'Active',
        bio,
        skills,
        updatedAt: new Date().toISOString(),
      };

      await onSave(updatedStudent);
      onClose();
    } catch (err) {
      console.error('Failed to save student profile edits:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-sky-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4 font-['Sora'] text-slate-900 dark:text-white animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-cyan-400 border border-sky-200 dark:border-sky-800">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Edit Student Record</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Update academic credentials & permissions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Student Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-hidden font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Branch / Department</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Academic Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-hidden font-medium"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Institution / College</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2831"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-hidden font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Account Status</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200">
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={status === 'Active'}
                  onChange={() => setStatus('Active')}
                  className="text-sky-600"
                />
                <span>Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200">
                <input
                  type="radio"
                  name="status"
                  value="Suspended"
                  checked={status === 'Suspended'}
                  onChange={() => setStatus('Suspended')}
                  className="text-rose-600"
                />
                <span>Suspended / Deactivated</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Bio Summary</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-hidden font-medium resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Skills (comma-separated)</label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              placeholder="Linux, Git, Python, Docker"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-hidden font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-sky-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-blue-primary text-xs py-2.5 px-5 font-bold cursor-pointer inline-flex items-center gap-1.5"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
