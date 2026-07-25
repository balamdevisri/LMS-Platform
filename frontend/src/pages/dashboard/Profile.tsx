import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, ShieldCheck, Calendar, Clock, Award, CheckCircle2, ExternalLink } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, userProfile } = useAuth();

  const isGithubUser =
    userProfile?.providerId === 'github.com' ||
    userProfile?.photoURL?.includes('githubusercontent') ||
    user?.providerData?.some((p) => p.providerId === 'github.com');

  const githubUsername =
    userProfile?.githubUsername ||
    user?.email?.split('@')[0] ||
    'github-user';

  const avatarUrl = userProfile?.photoURL || user?.photoURL;

  return (
    <div className="space-y-8 text-slate-900 font-['Sora'] max-w-5xl mx-auto pb-12">
      
      {/* Page Title */}
      <div className="border-b border-sky-100 pb-4">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
          Student Learner Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Manage your account credentials, GitHub integration, and verified certifications.
        </p>
      </div>

      {/* Profile Header Card - White & Sky Blue Theme */}
      <div className="bg-white/95 backdrop-blur-2xl border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 flex flex-col md:flex-row items-center gap-6">
        
        {/* Dynamic Avatar / GitHub Image */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userProfile?.name || 'GitHub Profile Avatar'}
            className="w-24 h-24 rounded-2xl object-cover border-4 border-sky-300 shadow-md shrink-0"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-linear-to-tr from-sky-500 to-blue-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0 border-4 border-sky-200">
            {(userProfile?.name || user?.displayName || 'S').charAt(0).toUpperCase()}
          </div>
        )}

        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              {userProfile?.name || user?.displayName || 'Student Profile'}
            </h2>
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider border border-sky-200">
              {userProfile?.role?.toUpperCase() || 'STUDENT'}
            </span>
            {isGithubUser && (
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub Connected</span>
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 flex items-center justify-center md:justify-start gap-2 font-medium">
            <Mail className="w-3.5 h-3.5 text-sky-600" />
            <span>{userProfile?.email || user?.email || 'student@shaivika.ai'}</span>
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              Member Since: {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Today'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              Last Active: {userProfile?.lastLogin ? new Date(userProfile.lastLogin).toLocaleTimeString() : 'Just now'}
            </span>
          </div>
        </div>
      </div>

      {/* Student Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Account Info */}
        <div className="bg-white/90 border border-sky-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
          <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-sky-600" />
            <span>Account Details</span>
          </h3>

          <div className="space-y-3 text-xs font-medium">
            <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl flex items-center justify-between">
              <span className="text-slate-500">Verification Status</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {user?.emailVerified || userProfile?.isVerified || isGithubUser ? 'Verified Student' : 'Pending Verification'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl flex items-center justify-between">
              <span className="text-slate-500">System Access Level</span>
              <span className="font-mono text-sky-700 font-bold uppercase">{userProfile?.role || 'student'}</span>
            </div>
          </div>
        </div>

        {/* GitHub Integration Info */}
        <div className="bg-white/90 border border-sky-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
          <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-900 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub Developer Profile</span>
          </h3>

          <div className="space-y-3">
            {isGithubUser ? (
              <>
                <div className="p-3.5 bg-slate-50 border border-sky-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block">GitHub Handle</span>
                    <span className="font-mono text-xs font-bold text-slate-900">@{githubUsername}</span>
                  </div>
                  <a
                    href={`https://github.com/${githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-white hover:bg-sky-50 text-sky-700 font-bold text-xs border border-sky-200 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <span>View GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                  </a>
                </div>

                <div className="p-3.5 bg-sky-50/70 border border-sky-200/80 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Single Sign-On Active</span>
                    <span className="text-[11px] text-slate-600">Your profile, avatar, and email are automatically synchronized with GitHub.</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-slate-50 border border-sky-100 rounded-2xl text-center space-y-2">
                <p className="text-xs text-slate-600 font-medium">No GitHub account linked yet.</p>
                <span className="text-[11px] text-slate-500 block">Log in using GitHub to automatically sync your developer avatar and profile.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Earned Achievements Card */}
      <div className="bg-white/90 border border-sky-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
        <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-sky-600" />
          <span>Earned Achievements & Credentials</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-sky-100 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block">Linux System Administration</span>
              <span className="text-[11px] text-slate-500 font-medium">Issued Jan 2026 • Verified Certificate</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-sky-100 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block">Git & GitHub Enterprise Version Control</span>
              <span className="text-[11px] text-slate-500 font-medium">Issued Feb 2026 • Verified Certificate</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;
