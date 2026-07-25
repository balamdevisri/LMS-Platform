import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  BookOpen,
  Award,
  FileCheck,
  Globe,
  Loader2,
  Shield,
  Edit,
  Ban,
} from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '@/services/userService';
import type { UserProfile, UserRole } from '@/types/user';
import { RoleBadge } from '@/components/admin/users/RoleBadge';
import { StatusBadge } from '@/components/admin/users/StatusBadge';
import { ProviderBadge } from '@/components/admin/users/ProviderBadge';
import { EditUserModal } from '@/components/admin/users/EditUserModal';
import { ChangeRoleModal } from '@/components/admin/users/ChangeRoleModal';

export const AdminUserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    userService.getUser(id).then((profile) => {
      setUser(profile);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3 font-['Sora']">
        <Loader2 className="w-10 h-10 text-sky-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-bold">Loading user profile from Firestore...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-12 text-center space-y-4 bg-white rounded-3xl border border-sky-200 font-['Sora']">
        <h2 className="font-heading font-extrabold text-xl text-slate-900">User Profile Not Found</h2>
        <p className="text-xs text-slate-500">The user record with UID "{id}" could not be located.</p>
        <Link to="/admin/users" className="btn-blue-primary text-xs py-2 px-5 font-bold inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users Directory</span>
        </Link>
      </div>
    );
  }

  const handleSaveUser = async (updated: UserProfile) => {
    try {
      await userService.updateUser(updated.uid, updated);
      setUser(updated);
      toast.success('User profile updated!');
    } catch (e) {
      toast.error('Failed to update profile.');
    }
  };

  const handleRoleChange = async (newRole: UserRole) => {
    try {
      await userService.changeRole(user.uid, newRole);
      setUser((prev) => (prev ? { ...prev, role: newRole } : null));
      toast.success(`Role updated to ${newRole.toUpperCase()}!`);
    } catch (e) {
      toast.error('Failed to change role.');
    }
  };

  const handleToggleBlock = async () => {
    try {
      if (user.status === 'Blocked') {
        await userService.unblockUser(user.uid);
        setUser((prev) => (prev ? { ...prev, status: 'Active' } : null));
        toast.success('User unblocked!');
      } else {
        await userService.blockUser(user.uid);
        setUser((prev) => (prev ? { ...prev, status: 'Blocked' } : null));
        toast.warning('User blocked!');
      }
    } catch (e) {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div className="space-y-6 font-['Sora'] pb-12">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/users')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors cursor-pointer bg-white px-4 py-2 rounded-xl border border-sky-200 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin User Directory</span>
        </button>

        {/* Quick Admin Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white text-slate-800 border border-sky-200 rounded-xl hover:bg-sky-50 transition-all cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-sky-600" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setIsChangingRole(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white text-purple-700 border border-purple-200 rounded-xl hover:bg-purple-50 transition-all cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>Change Role</span>
          </button>

          <button
            onClick={handleToggleBlock}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border rounded-xl transition-all cursor-pointer ${
              user.status === 'Blocked'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>{user.status === 'Blocked' ? 'Unblock User' : 'Block User'}</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Banner */}
      <div className="bg-white/95 backdrop-blur-2xl border border-sky-200 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.fullName}
              className="w-20 h-20 rounded-full object-cover border-4 border-sky-400 shadow-md shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-linear-to-tr from-sky-600 via-sky-500 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center border-4 border-sky-300 shadow-md shrink-0">
              {user.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
                {user.fullName || user.name}
              </h1>
              <RoleBadge role={user.role} size="md" />
              <StatusBadge status={user.status} size="md" />
            </div>

            <p className="text-xs text-slate-500 font-mono font-medium flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-sky-500" />
              <span>{user.email}</span>
              <span>•</span>
              <ProviderBadge provider={user.provider} />
            </p>

            <p className="text-xs text-slate-600 font-medium pt-1 max-w-xl">
              {user.bio || 'AI Learner pursuing intelligent agents, deep learning & fullstack system architectures.'}
            </p>
          </div>
        </div>

        {/* Overall Progress Meter */}
        <div className="bg-sky-50/80 border border-sky-200/80 p-4 rounded-2xl shrink-0 text-center w-full md:w-56 space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Learning Progress
          </span>
          <div className="text-3xl font-heading font-extrabold text-sky-600">
            {user.learningProgressPercent || 65}%
          </div>
          <div className="w-full bg-sky-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-linear-to-r from-sky-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${user.learningProgressPercent || 65}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Basic Info & Skills */}
        <div className="space-y-6">
          
          {/* Basic Information Box */}
          <div className="bg-white/90 border border-sky-200/80 p-6 rounded-3xl shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900 border-b border-sky-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-sky-600" /> Account Metadata
            </h3>

            <div className="space-y-3 text-xs font-medium">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">UID</span>
                <span className="font-mono text-sky-700 font-bold truncate max-w-40">{user.uid}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Verification</span>
                <span className="font-bold text-emerald-600">{user.isVerified ? '✓ Verified' : 'Pending'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Academic Branch</span>
                <span className="font-bold text-slate-900">{user.branch || 'AI & Computer Science'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Academic Year</span>
                <span className="font-bold text-slate-900">{user.year || '4th Year'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Registration Date</span>
                <span className="text-slate-700">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Recently'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Login Activity</span>
                <span className="text-slate-700">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Active Now'}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="bg-white/90 border border-sky-200/80 p-6 rounded-3xl shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900 border-b border-sky-100 pb-3">
              Technical Skills & Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {(user.skills || ['Python', 'Machine Learning', 'PyTorch', 'React', 'TypeScript']).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Social Profiles */}
          <div className="bg-white/90 border border-sky-200/80 p-6 rounded-3xl shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900 border-b border-sky-100 pb-3">
              Social Links
            </h3>
            <div className="space-y-2.5 text-xs font-bold">
              {user.github && (
                <a
                  href={user.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 text-slate-800 hover:text-sky-600 transition-colors p-2 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <svg className="w-4 h-4 text-slate-900 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span className="truncate">{user.github}</span>
                </a>
              )}

              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 text-slate-800 hover:text-sky-600 transition-colors p-2 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <svg className="w-4 h-4 text-sky-600 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span className="truncate">{user.linkedin}</span>
                </a>
              )}

              {user.portfolio && (
                <a
                  href={user.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 text-slate-800 hover:text-sky-600 transition-colors p-2 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <Globe className="w-4 h-4 text-purple-600" />
                  <span className="truncate">{user.portfolio}</span>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Academic Progress, Quizzes & Assignments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Enrolled Courses & Completed Tracks */}
          <div className="bg-white/90 border border-sky-200/80 p-6 rounded-3xl shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900 border-b border-sky-100 pb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-600" /> Enrolled Course Tracks ({user.enrolledCoursesCount || 2})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">AI Foundation & Deep Learning</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">In Progress</span>
                </div>
                <p className="text-[11px] text-slate-500">Neural Networks, Vector Search & LLM Fine-Tuning</p>
                <div className="w-full bg-sky-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-sky-600 h-1.5 rounded-full w-[75%]" />
                </div>
              </div>

              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">Fullstack Systems Engineering</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">In Progress</span>
                </div>
                <p className="text-[11px] text-slate-500">React, TypeScript, GraphQL & Distributed Caching</p>
                <div className="w-full bg-purple-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-purple-600 h-1.5 rounded-full w-[50%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Scores & Evaluations */}
          <div className="bg-white/90 border border-sky-200/80 p-6 rounded-3xl shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900 border-b border-sky-100 pb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-sky-600" /> Quiz & Assessment Scores
            </h3>

            <div className="divide-y divide-sky-100 text-xs">
              {(user.quizScores || [
                { id: 'q1', title: 'Neural Networks 101', score: 95, maxScore: 100, date: '2026-03-01' },
                { id: 'q2', title: 'Transformer Architectures', score: 88, maxScore: 100, date: '2026-03-15' },
              ]).map((q) => (
                <div key={q.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">{q.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{q.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-heading font-extrabold text-sky-600 text-sm">{q.score} / {q.maxScore}</span>
                    <span className="block text-[10px] font-bold text-emerald-600">PASSED</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates & Rewards */}
          <div className="bg-white/90 border border-sky-200/80 p-6 rounded-3xl shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900 border-b border-sky-100 pb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-600" /> Earned Certificates
            </h3>

            {user.certificates && user.certificates.length > 0 ? (
              <div className="space-y-3">
                {user.certificates.map((cert) => (
                  <div key={cert.id} className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-amber-900 text-xs">{cert.title}</h4>
                      <span className="text-[10px] text-amber-700 font-medium">Issued on {cert.issuedAt}</span>
                    </div>
                    <span className="px-3 py-1 bg-amber-600 text-white font-bold text-[10px] rounded-xl shadow-xs">
                      Verified Certificate
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-medium">
                No course certificates unlocked yet. Certificates will unlock automatically upon 100% course track completion.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* MODALS */}
      {isEditing && (
        <EditUserModal
          user={user}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveUser}
        />
      )}

      {isChangingRole && (
        <ChangeRoleModal
          user={user}
          onClose={() => setIsChangingRole(false)}
          onRoleChange={handleRoleChange}
        />
      )}

    </div>
  );
};

export default AdminUserProfile;
