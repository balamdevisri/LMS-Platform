import React from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Award,
  Terminal,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Globe,
  Clock,
  KeyRound,
  Send,
  Trophy
} from 'lucide-react';
import type { StudentUser } from '@/services/studentService';
import { LeaderboardService } from '@/services/achievementService';

interface StudentProfileDrawerProps {
  student: StudentUser | null;
  onClose: () => void;
  onEdit?: (student: StudentUser) => void;
  onToggleStatus?: (id: string) => void;
  onResetPassword?: (email: string) => void;
  onSendEmail?: (student: StudentUser) => void;
}

export const StudentProfileDrawer: React.FC<StudentProfileDrawerProps> = ({
  student,
  onClose,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onSendEmail,
}) => {
  if (!student) return null;

  const isGithub = student.provider === 'github.com' || Boolean(student.photoURL?.includes('github'));
  const leaderboardService = React.useMemo(() => new LeaderboardService(), []);
  const studentRank = React.useMemo(() => {
    const list = leaderboardService.getLeaderboard('global', student.id);
    const item = list.find((e) => e.id === student.id || e.name === student.name);
    return item ? item.rank : 1;
  }, [student.id, student.name, leaderboardService]);

  const scoreColor =
    (student.learningScore || 80) >= 90
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : (student.learningScore || 80) >= 75
      ? 'text-sky-600 bg-sky-50 border-sky-200'
      : 'text-amber-600 bg-amber-50 border-amber-200';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end transition-opacity">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto flex flex-col font-['Sora'] border-l border-sky-100 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-6 py-4 border-b border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base text-slate-900">Student Intelligence Profile</h2>
              <p className="text-[11px] text-slate-500 font-medium">Real-time telemetry & academic progress</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Main Body */}
        <div className="p-6 space-y-6 flex-1 text-slate-900">
          
          {/* Profile Overview Card */}
          <div className="bg-linear-to-br from-sky-50/80 to-blue-50/40 p-6 rounded-3xl border border-sky-100 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {student.photoURL ? (
                  <img
                    src={student.photoURL}
                    alt={student.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-400 shadow-md shadow-sky-500/10"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-r from-sky-500 to-blue-600 text-white flex items-center justify-center font-heading font-extrabold text-2xl shadow-md shadow-sky-500/20">
                    {student.name.charAt(0)}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-extrabold text-xl text-slate-900">{student.name}</h3>
                    {isGithub ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-cyan-300 text-[10px] font-mono font-bold border border-slate-700">
                        🐱 GitHub OAuth
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-mono font-bold border border-sky-200">
                        ✉️ Email Account
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-600" />
                    <span>{student.email}</span>
                  </p>
                </div>
              </div>

              {/* Status & Learning Score Badge */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-amber-50 text-amber-800 border-amber-300 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>Cohort Rank #{studentRank}</span>
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${scoreColor}`}>
                  ⭐ {student.learningScore || 85} Learning Score
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  student.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  ● {student.status}
                </span>
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="pt-3 border-t border-sky-200/60 flex items-center gap-2 flex-wrap text-xs">
              {onEdit && (
                <button
                  onClick={() => onEdit(student)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}

              {onToggleStatus && (
                <button
                  onClick={() => onToggleStatus(student.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
                    student.status === 'Active'
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{student.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}</span>
                </button>
              )}

              {onResetPassword && (
                <button
                  onClick={() => onResetPassword(student.email)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Reset Password</span>
                </button>
              )}

              {onSendEmail && (
                <button
                  onClick={() => onSendEmail(student)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </button>
              )}
            </div>
          </div>

          {/* Academic & Bio Details */}
          <div className="bg-white p-5 rounded-3xl border border-sky-100 space-y-4">
            <h4 className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-sky-600" />
              <span>Academic & Contact Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Branch / Major</span>
                <span className="font-bold text-slate-900">{student.branch || 'AI & Computer Science'}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Academic Year</span>
                <span className="font-bold text-slate-900">{student.year || '1st Year'}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Institution / College</span>
                <span className="font-bold text-slate-900">{student.college || 'Shaivika AI Foundation'}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Contact Phone</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-sky-500" />
                  <span>{student.phone || 'Not Provided'}</span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registration Date</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-sky-500" />
                  <span>{student.joined || 'Recently'}</span>
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Last Active</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-500" />
                  <span>{student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'Active Now'}</span>
                </span>
              </div>
            </div>

            {/* Bio & Skills */}
            {student.bio && (
              <div className="p-3 bg-slate-50 border border-sky-100 rounded-2xl space-y-1 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Bio</span>
                <p className="text-slate-700 font-medium italic">{student.bio}</p>
              </div>
            )}

            {student.skills && student.skills.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Verified Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {student.skills.map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-[11px] font-bold border border-sky-200">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Social Links Panel */}
          <div className="bg-white p-5 rounded-3xl border border-sky-100 space-y-3">
            <h4 className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-600" />
              <span>Developer Social Links</span>
            </h4>

            <div className="flex items-center gap-3 flex-wrap text-xs">
              {student.github && (
                <a
                  href={student.github}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-cyan-300 font-mono font-bold hover:bg-slate-800 transition-all inline-flex items-center gap-2 border border-slate-700 shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {student.linkedin && (
                <a
                  href={student.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all inline-flex items-center gap-2 shadow-xs"
                >
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {student.portfolio && (
                <a
                  href={student.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 font-bold hover:bg-sky-100 border border-sky-200 transition-all inline-flex items-center gap-2 shadow-xs"
                >
                  <span>Portfolio Site</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Linux Lab Progress Panel */}
          {student.linuxLabProgress && (
            <div className="bg-linear-to-br from-slate-900 to-slate-950 text-white p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-heading font-extrabold text-sm text-cyan-300">Linux CLI Lab Performance</h4>
                </div>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-bold">
                  {student.linuxLabProgress.score}% Score
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Completed Modules</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {student.linuxLabProgress.completedModules} / {student.linuxLabProgress.totalModules}
                  </span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Commands Executed</span>
                  <span className="text-sm font-bold text-cyan-400">{student.linuxLabProgress.terminalCommandsRun} CLI</span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block">Active Lab Title</span>
                  <span className="text-[11px] font-bold text-amber-300 truncate block">
                    {student.linuxLabProgress.activeLabTitle}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quiz & Assignment Performance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Quiz Scores */}
            <div className="bg-white p-5 rounded-3xl border border-sky-100 space-y-3">
              <h4 className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Quiz Scores</span>
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs font-medium">
                {student.quizScores && student.quizScores.length > 0 ? (
                  student.quizScores.map((q) => (
                    <div key={q.id} className="p-2.5 bg-slate-50 border border-sky-100 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{q.title}</div>
                        <div className="text-[10px] text-slate-400">{q.date}</div>
                      </div>
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {q.score} / {q.maxScore}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 font-medium">No quiz scores recorded yet.</p>
                )}
              </div>
            </div>

            {/* Assignments */}
            <div className="bg-white p-5 rounded-3xl border border-sky-100 space-y-3">
              <h4 className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-sky-600" />
                <span>Assignments</span>
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs font-medium">
                {student.assignmentScores && student.assignmentScores.length > 0 ? (
                  student.assignmentScores.map((a) => (
                    <div key={a.id} className="p-2.5 bg-slate-50 border border-sky-100 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{a.title}</div>
                        <div className="text-[10px] text-slate-400">{a.date}</div>
                      </div>
                      <span className="font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                        {a.score} / {a.maxScore}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 font-medium">No assignment submissions yet.</p>
                )}
              </div>
            </div>

          </div>

          {/* Certificates */}
          {student.certificates && student.certificates.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-sky-100 space-y-3">
              <h4 className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Verifiable Digital Credentials</span>
              </h4>

              <div className="space-y-2 text-xs">
                {student.certificates.map((cert) => (
                  <div key={cert.id} className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-2xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>{cert.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Issued: {cert.issuedAt}</div>
                    </div>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[10px] inline-flex items-center gap-1"
                      >
                        <span>Verify</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity Log */}
          {student.recentActivity && student.recentActivity.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-sky-100 space-y-3">
              <h4 className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>Recent Platform Telemetry</span>
              </h4>

              <div className="space-y-2 text-xs">
                {student.recentActivity.map((act) => (
                  <div key={act.id} className="p-2.5 bg-slate-50 border border-sky-100 rounded-xl flex items-center justify-between">
                    <span className="font-medium text-slate-800">{act.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
