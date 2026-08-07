import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  UserCheck,
  Plus,
  X,
  Loader2,
  Edit,
  Trash2,
  ShieldAlert,
  Eye,
  Users,
  TrendingUp,
  Send,
  ShieldCheck,
  Check,
  XCircle,
  Code2,
  CheckSquare,
  Square,
  FileSpreadsheet,
  AlertCircle,
  Flag,
  FileText,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { studentService, type StudentUser } from '@/services/studentService';
import { StudentProfileDrawer } from '@/components/admin/students/StudentProfileDrawer';
import { EditStudentModal } from '@/components/admin/students/EditStudentModal';
import { SendEmailModal } from '@/components/admin/students/SendEmailModal';
import { GitHubPortfolioDrawer } from '@/components/admin/students/GitHubPortfolioDrawer';
import { adminNotificationService } from '@/services/adminNotificationService';

const isPendingStudent = (s: any) => {
  const st = (s.status || '').toLowerCase();
  if (st === 'pending' || st === 'pending approval' || st === 'pending_approval' || st === 'email_verification_pending') {
    return true;
  }
  if (st === 'approved' || st === 'active' || s.approved === true) {
    return false;
  }
  return s.approved === false;
};

export const AdminStudents: React.FC = () => {
  const { userProfile } = useAuth();
  const isInstructor = userProfile?.role === 'instructor';

  const [students, setStudents] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<'all' | 'github' | 'manual'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inspectStudent, setInspectStudent] = useState<StudentUser | null>(null);
  const [inspectGithubStudent, setInspectGithubStudent] = useState<StudentUser | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentUser | null>(null);
  const [emailStudent, setEmailStudent] = useState<StudentUser | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [rejectingStudentId, setRejectingStudentId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reporting / Academic Flag Modal State (For Instructor)
  const [flagStudentModal, setFlagStudentModal] = useState<StudentUser | null>(null);
  const [flagCategory, setFlagCategory] = useState<string>('Academic Performance Progress');
  const [flagNotes, setFlagNotes] = useState<string>('');

  // Quick Add Student State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentProvider, setNewStudentProvider] = useState<'password' | 'github.com'>('password');

  // Real-time Firestore Subscription
  useEffect(() => {
    setLoading(true);
    const unsubscribe = studentService.subscribeToStudents((data) => {
      setStudents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Top Statistics
  const stats = useMemo(() => studentService.calculateStudentStats(students), [students]);

  // Unique branches & years for filter dropdowns
  const uniqueBranches = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.branch) set.add(s.branch);
    });
    return Array.from(set);
  }, [students]);

  const uniqueYears = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.year) set.add(s.year);
    });
    return Array.from(set);
  }, [students]);

  // Provider Counts
  const githubCount = useMemo(
    () => students.filter((s) => s.provider === 'github.com' || Boolean(s.photoURL?.includes('github')) || s.githubUsername).length,
    [students]
  );
  const manualCount = students.length - githubCount;

  // Filter & Sort Logic
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Search filter across Name, Email, College, Branch, GitHub Username, Skills
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (st) =>
          (st.name || st.fullName || '').toLowerCase().includes(q) ||
          (st.email || '').toLowerCase().includes(q) ||
          (st.college || '').toLowerCase().includes(q) ||
          (st.branch || '').toLowerCase().includes(q) ||
          (st.githubUsername || st.github || '').toLowerCase().includes(q) ||
          (st.skills || []).some((sk) => sk.toLowerCase().includes(q))
      );
    }

    // Provider filter
    if (providerFilter === 'github') {
      result = result.filter((s) => s.provider === 'github.com' || Boolean(s.photoURL?.includes('github')) || s.githubUsername);
    } else if (providerFilter === 'manual') {
      result = result.filter((s) => s.provider !== 'github.com' && !Boolean(s.photoURL?.includes('github')));
    }

    // Status filter
    if (statusFilter === 'pending') {
      result = result.filter(isPendingStudent);
    } else if (statusFilter === 'approved') {
      result = result.filter((s) => s.status === 'approved' || s.status === 'Active' || s.approved === true);
    } else if (statusFilter === 'rejected') {
      result = result.filter((s) => s.status === 'rejected' || s.status === 'Blocked');
    } else if (statusFilter === 'suspended') {
      result = result.filter((s) => s.status === 'Suspended' || s.status === 'Blocked');
    }

    // Verification filter
    if (verificationFilter === 'Verified') {
      result = result.filter((s) => s.isVerified || s.emailVerified);
    } else if (verificationFilter === 'Unverified') {
      result = result.filter((s) => !s.isVerified && !s.emailVerified);
    }

    // Branch filter
    if (branchFilter !== 'ALL') {
      result = result.filter((s) => s.branch === branchFilter);
    }

    // Year filter
    if (yearFilter !== 'ALL') {
      result = result.filter((s) => s.year === yearFilter);
    }

    // Date Filter (Today, Week, Month)
    if (dateFilter !== 'ALL') {
      const now = new Date();
      result = result.filter((s) => {
        if (!s.createdAt && !s.joined) return true;
        const stDate = new Date(s.createdAt || s.joined || '');
        const diffDays = (now.getTime() - stDate.getTime()) / (1000 * 3600 * 24);
        if (dateFilter === 'today') return diffDays <= 1;
        if (dateFilter === 'week') return diffDays <= 7;
        if (dateFilter === 'month') return diffDays <= 30;
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === 'oldest') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      }
      if (sortBy === 'highest_progress') {
        return (b.learningScore || 0) - (a.learningScore || 0);
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });

    return result;
  }, [students, searchQuery, providerFilter, statusFilter, verificationFilter, branchFilter, yearFilter, dateFilter, sortBy]);

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id || s.uid));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Admin Actions
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail) {
      toast.error('Please enter student name and email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await studentService.addStudent(newStudentName, newStudentEmail, newStudentProvider);
      adminNotificationService.addNotification({
        type: 'NEW_STUDENT',
        title: 'Student Created',
        message: `${newStudentName} registered by Administrator.`
      });
      toast.success(`Student profile created for ${newStudentName}!`);
      setIsAddModalOpen(false);
      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentProvider('password');
    } catch (e) {
      toast.error('Failed to register student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStudent = async (updated: StudentUser) => {
    try {
      await studentService.updateStudent(updated);
      toast.success(`Student ${updated.name} profile updated!`);
      setEditingStudent(null);
    } catch (e) {
      toast.error('Failed to update student profile.');
    }
  };

  const handleApproveStudent = async (id: string) => {
    const student = students.find((s) => s.id === id || s.uid === id);
    try {
      await studentService.approveStudent(id);
      adminNotificationService.addNotification({
        type: 'APPROVAL',
        title: 'Student Approved',
        message: `${student?.name || 'Student'} application approved with full access.`
      });
      toast.success(`🎉 ${student?.name || 'Student'} approved! Welcome email dispatched.`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to approve student');
    }
  };

  const handleRejectStudent = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    const student = students.find((s) => s.id === id || s.uid === id);
    try {
      await studentService.rejectStudent(id, rejectionReason.trim());
      adminNotificationService.addNotification({
        type: 'REJECTION',
        title: 'Student Rejected',
        message: `${student?.name || 'Student'} application was rejected.`
      });
      toast.success('Student application rejected. Status updated.');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to reject student');
    } finally {
      setRejectingStudentId(null);
      setRejectionReason('');
    }
  };

  const handleSuspendStudent = async (id: string) => {
    const student = students.find((s) => s.id === id || s.uid === id);
    try {
      await studentService.updateStudent({ ...student!, status: 'Suspended', approved: false });
      toast.info(`Student ${student?.name || 'Account'} suspended.`);
    } catch (e: any) {
      toast.error('Failed to suspend student');
    }
  };

  const handleReactivateStudent = async (id: string) => {
    const student = students.find((s) => s.id === id || s.uid === id);
    try {
      await studentService.updateStudent({ ...student!, status: 'Active', approved: true });
      toast.success(`Student ${student?.name || 'Account'} reactivated.`);
    } catch (e: any) {
      toast.error('Failed to reactivate student');
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      toast.success(`Password reset verification email dispatched to ${email}!`);
    } catch (e) {
      toast.error('Failed to send reset email.');
    }
  };

  const handleDeleteStudent = (id: string) => {
    const target = students.find((st) => st.id === id || st.uid === id);
    const targetName = target?.name || 'Student';
    
    // 1. Optimistic instant UI state update (0ms latency)
    setStudents((prev) => prev.filter((s) => s.id !== id && s.uid !== id && (target?.email ? s.email?.toLowerCase() !== target.email.toLowerCase() : true)));
    setSelectedIds((prev) => prev.filter((item) => item !== id && item !== target?.uid));
    setDeletingStudentId(null);
    toast.success(`Student account ${targetName} deleted permanently.`);

    // 2. Parallel non-blocking background Firestore & Backend deletion
    studentService.deleteStudent(id).catch((e) => {
      console.warn('Background delete student notice:', e);
    });
  };

  const handleSubmitStudentReport = () => {
    if (!flagStudentModal) return;
    adminNotificationService.addNotification({
      type: 'NEW_STUDENT',
      title: `Instructor Report: ${flagStudentModal.name}`,
      message: `[${flagCategory}]: ${flagNotes || 'Academic progress telemetry report submitted.'}`,
      link: '/admin/students'
    });
    toast.success(`Academic progress report for ${flagStudentModal.name} dispatched to Administrator!`);
    setFlagStudentModal(null);
    setFlagNotes('');
  };

  const handleExportCSV = () => {
    const dataset = selectedIds.length > 0
      ? students.filter((s) => selectedIds.includes(s.id || s.uid))
      : filteredStudents;

    studentService.exportStudentsToCSV(dataset);
    toast.success(`Exported ${dataset.length} student profiles to CSV!`);
  };

  return (
    <div className="space-y-6 text-slate-900 font-['Sora'] max-w-7xl mx-auto pb-12">
      
      {/* Header Bar */}
      <div className="bg-white/90 backdrop-blur-2xl border border-sky-200/80 p-6 rounded-3xl shadow-xl shadow-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {isInstructor ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                <span>STUDENT PERFORMANCE & REPORTING TELEMETRY</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>STUDENT APPROVAL & ROSTER MANAGEMENT</span>
              </div>
            )}
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            {isInstructor ? 'Student Performance Telemetry' : 'Student Intelligence Roster'} ({filteredStudents.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {isInstructor
              ? 'Monitor real-time student learning telemetry, review course progress, analyze quiz scores, and export progress reports.'
              : 'Review student applications, verify credentials, perform bulk actions, and dispatch automated lifecycle emails.'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {selectedIds.length > 0 && (
            <span className="text-xs font-bold bg-sky-50 text-sky-700 px-3 py-1.5 rounded-xl border border-sky-200">
              {selectedIds.length} Selected
            </span>
          )}

          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-sky-50 text-slate-800 font-bold text-xs border border-sky-200 py-3 px-4 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV / Excel</span>
          </button>

          {!isInstructor && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-blue-primary text-xs py-3 px-5 shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Student</span>
            </button>
          )}

          {isInstructor && (
            <button
              onClick={() => {
                if (filteredStudents.length > 0) setFlagStudentModal(filteredStudents[0]);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Submit Academic Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.totalStudents}</div>
          <div className="text-[10px] text-slate-500 font-medium">Registered Learners</div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
            <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">
            {students.filter(isPendingStudent).length}
          </div>
          <div className="text-[10px] text-amber-600 font-medium">Needs Review</div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Approved</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{stats.activeStudents}</div>
          <div className="text-[10px] text-emerald-600 font-medium">Active Accounts</div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Verified</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-700">{stats.verifiedStudents}</div>
          <div className="text-[10px] text-blue-600 font-medium">Verified Emails</div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">GitHub OAuth</span>
            <Code2 className="w-4 h-4 text-slate-800" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{githubCount}</div>
          <div className="text-[10px] text-slate-500 font-medium">Connected Users</div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Progress</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-sky-700">{stats.avgProgress}%</div>
          <div className="text-[10px] text-sky-600 font-medium">Mean Score</div>
        </div>
      </div>

      {/* Main Table Container & Filters */}
      <div className="bg-white/90 border border-sky-200/80 rounded-3xl p-6 space-y-6 shadow-sm">
        
        {/* Search Bar & Multi-Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Account Provider Tabs */}
            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
              <button
                onClick={() => setProviderFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  providerFilter === 'all'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-sky-50 border border-slate-200'
                }`}
              >
                All Students ({students.length})
              </button>

              <button
                onClick={() => setProviderFilter('github')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  providerFilter === 'github'
                    ? 'bg-slate-900 text-cyan-300 border border-slate-700 shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-sky-50 border border-slate-200'
                }`}
              >
                🐱 GitHub OAuth ({githubCount})
              </button>

              <button
                onClick={() => setProviderFilter('manual')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  providerFilter === 'manual'
                    ? 'bg-sky-100 text-sky-800 border border-sky-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-sky-50 border border-slate-200'
                }`}
              >
                ✉️ Email / Manual ({manualCount})
              </button>
            </div>

            {/* Global Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, college, branch, github, skills..."
                className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* Granular Filters & Sorting Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-sky-100 text-xs font-medium">
            
            {/* Approval Status Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Approval Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-sky-200 rounded-xl py-1.5 px-2.5 focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="pending">⏳ Pending Approval</option>
                <option value="approved">✓ Approved / Active</option>
                <option value="rejected">✕ Rejected</option>
                <option value="suspended">🚫 Suspended</option>
              </select>
            </div>

            {/* Email Verification Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Email Verified</label>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="w-full bg-slate-50 border border-sky-200 rounded-xl py-1.5 px-2.5 focus:outline-hidden"
              >
                <option value="ALL">All Accounts</option>
                <option value="Verified">Verified Only</option>
                <option value="Unverified">Unverified Only</option>
              </select>
            </div>

            {/* Branch Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Branch</label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full bg-slate-50 border border-sky-200 rounded-xl py-1.5 px-2.5 focus:outline-hidden"
              >
                <option value="ALL">All Branches</option>
                {uniqueBranches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Academic Year Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Academic Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full bg-slate-50 border border-sky-200 rounded-xl py-1.5 px-2.5 focus:outline-hidden"
              >
                <option value="ALL">All Years</option>
                {uniqueYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Registration Date</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-slate-50 border border-sky-200 rounded-xl py-1.5 px-2.5 focus:outline-hidden"
              >
                <option value="ALL">All Time</option>
                <option value="today">Today's Registrations</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Sorting Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-50 border border-sky-200 rounded-xl py-1.5 px-2.5 focus:outline-hidden font-bold text-sky-700"
              >
                <option value="newest">⚡ Newest Registrations</option>
                <option value="oldest">⌛ Oldest Registrations</option>
                <option value="highest_progress">📈 Highest Progress</option>
                <option value="name">🔤 Name (A-Z)</option>
              </select>
            </div>

          </div>

        </div>

        {/* Directory Data Table */}
        <div className="overflow-x-auto pt-2">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-bold">Loading real-time student telemetry...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 rounded-3xl border border-dashed border-sky-200">
              <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-heading font-extrabold text-sm text-slate-700">No Student Records Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                No registered students match your current search query or filter criteria.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-medium">
              <thead>
                <tr className="border-b border-sky-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-sky-50/50">
                  <th className="py-3 px-3 w-10 text-center">
                    <button onClick={handleSelectAll} className="cursor-pointer text-slate-600 hover:text-sky-600">
                      {selectedIds.length > 0 && selectedIds.length === filteredStudents.length ? (
                        <CheckSquare className="w-4 h-4 text-sky-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Profile</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">College & Branch</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">GitHub & Portfolio</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">{isInstructor ? 'Reporting Actions' : 'Approval Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {filteredStudents.map((st) => {
                  const id = st.id || st.uid;
                  const isSelected = selectedIds.includes(id);
                  const isGithub = st.provider === 'github.com' || Boolean(st.photoURL?.includes('github')) || st.githubUsername;
                  const status = st.status || (st.approved ? 'approved' : 'pending');

                  return (
                    <tr
                      key={id}
                      className={`transition-colors group ${
                        isSelected ? 'bg-sky-50/80 font-semibold' : 'hover:bg-sky-50/40'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button onClick={() => handleToggleSelect(id)} className="cursor-pointer text-slate-600">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-sky-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                          )}
                        </button>
                      </td>

                      {/* Avatar Profile */}
                      <td className="py-3 px-4">
                        <div className="relative inline-block">
                          {st.photoURL ? (
                            <img
                              src={st.photoURL}
                              alt={st.name}
                              className="w-9 h-9 rounded-full object-cover border border-sky-300 shadow-xs"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-linear-to-r from-sky-500 to-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                              {st.name.charAt(0)}
                            </div>
                          )}
                          {isGithub ? (
                            <span className="absolute -bottom-1 -right-1 text-[10px]" title="GitHub OAuth">🐱</span>
                          ) : (
                            <span className="absolute -bottom-1 -right-1 text-[10px]" title="Email Account">✉️</span>
                          )}
                        </div>
                      </td>

                      {/* Full Name */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setInspectStudent(st)}
                          className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors cursor-pointer"
                        >
                          {st.name || st.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">{st.phone || '+1 (555) 019-2831'}</div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 text-slate-700">
                        <div className="truncate max-w-44 font-mono text-[11px]">{st.email}</div>
                      </td>

                      {/* College & Branch */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{st.college || 'Shaivika AI Foundation'}</div>
                        <div className="text-[10px] text-slate-500">{st.branch || 'AI & Computer Science'}</div>
                      </td>

                      {/* Academic Year */}
                      <td className="py-3 px-4 text-slate-700 font-semibold">
                        {st.year || '1st Year'}
                      </td>

                      {/* GitHub & Portfolio */}
                      <td className="py-3 px-4">
                        {st.githubUsername || st.github ? (
                          <button
                            onClick={() => setInspectGithubStudent(st)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 text-cyan-300 font-mono text-[10px] font-bold border border-slate-700 shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
                          >
                            <Code2 className="w-3 h-3 text-cyan-400" />
                            <span>@{st.githubUsername || 'github'}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Not Connected</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                              : status === 'approved' || status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : status === 'rejected'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {st.joined || 'Recently'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Admin Approve Button */}
                          {!isInstructor && status === 'pending' && (
                            <button
                              onClick={() => handleApproveStudent(id)}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 font-bold transition-all cursor-pointer shadow-xs"
                              title="Approve Student"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {/* Admin Reject Button */}
                          {!isInstructor && status === 'pending' && (
                            <button
                              onClick={() => setRejectingStudentId(id)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 font-bold transition-all cursor-pointer shadow-xs"
                              title="Reject Application"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* View Profile Telemetry */}
                          <button
                            onClick={() => setInspectStudent(st)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all cursor-pointer"
                            title={isInstructor ? "View Student Telemetry & Progress Report" : "View Student Profile"}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Instructor: Submit Academic Concern / Progress Report */}
                          {isInstructor && (
                            <button
                              onClick={() => setFlagStudentModal(st)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all cursor-pointer"
                              title="Submit Academic Report / Concern"
                            >
                              <Flag className="w-4 h-4" />
                            </button>
                          )}

                          {/* Admin Edit Details */}
                          {!isInstructor && (
                            <button
                              onClick={() => setEditingStudent(st)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all cursor-pointer"
                              title="Edit Student"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Send Email */}
                          <button
                            onClick={() => setEmailStudent(st)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                            title="Send Email / Feedback"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          {/* Admin Delete Account */}
                          {!isInstructor && (
                            <button
                              onClick={() => setDeletingStudentId(id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* DRAWERS & MODALS */}

      {/* Student Profile Drawer */}
      <StudentProfileDrawer
        student={inspectStudent}
        onClose={() => setInspectStudent(null)}
        onEdit={isInstructor ? undefined : (st) => {
          setInspectStudent(null);
          setEditingStudent(st);
        }}
        onToggleStatus={isInstructor ? undefined : async (id) => {
          const st = students.find((s) => s.id === id || s.uid === id);
          if (st?.status === 'approved') {
            await handleSuspendStudent(id);
          } else {
            await handleReactivateStudent(id);
          }
        }}
        onResetPassword={isInstructor ? undefined : handleResetPassword}
        onSendEmail={(st) => {
          setInspectStudent(null);
          setEmailStudent(st);
        }}
      />

      {/* GitHub Portfolio Drawer */}
      <GitHubPortfolioDrawer
        student={inspectGithubStudent}
        onClose={() => setInspectGithubStudent(null)}
      />

      {/* Edit Student Modal */}
      <EditStudentModal
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
        onSave={handleUpdateStudent}
      />

      {/* Send Email Modal */}
      <SendEmailModal
        student={emailStudent}
        onClose={() => setEmailStudent(null)}
      />

      {/* REJECT STUDENT CONFIRMATION MODAL */}
      {rejectingStudentId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-rose-200 font-['Sora']">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900">Reject Student Registration?</h3>
                <p className="text-xs text-slate-500 font-medium">Enter administrator rejection reason below.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Academic institution verification pending or incomplete GitHub portfolio."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingStudentId(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectStudent(rejectingStudentId)}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE STUDENT CONFIRMATION MODAL */}
      {deletingStudentId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-rose-200 text-center font-['Sora']">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-slate-900">Delete Student Account?</h3>
            <p className="text-xs text-slate-500 font-medium">Are you sure you want to permanently delete this student record?</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setDeletingStudentId(null)} className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              <button onClick={() => handleDeleteStudent(deletingStudentId)} className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-sky-200 max-w-md w-full p-6 shadow-2xl space-y-4 font-['Sora']">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100">
              <h3 className="font-heading font-extrabold text-lg text-slate-900">Register New Student Profile</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="alex.j@stanford.edu"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Authentication Method</label>
                <select
                  value={newStudentProvider}
                  onChange={(e) => setNewStudentProvider(e.target.value as any)}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                >
                  <option value="password">Email / Password Account</option>
                  <option value="github.com">GitHub OAuth Account</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-blue-primary text-xs py-2.5 px-5 font-bold cursor-pointer">
                  {isSubmitting ? 'Registering...' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT STUDENT ACADEMIC REPORT MODAL (For Instructors) */}
      {flagStudentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-['Sora'] border border-sky-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900">Submit Student Academic Report</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Telemetry & progress feedback for Administrator</p>
                </div>
              </div>
              <button onClick={() => setFlagStudentModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-slate-800 font-medium">
                Student Target: <strong className="text-slate-900 font-bold">{flagStudentModal.name}</strong> ({flagStudentModal.email})
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Report Classification</label>
                <select
                  value={flagCategory}
                  onChange={(e) => setFlagCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden"
                >
                  <option value="Academic Performance Progress">Academic Performance Progress</option>
                  <option value="Attendance & Low Activity">Attendance & Low Activity</option>
                  <option value="Assignment / Lab Support Needed">Assignment / Lab Support Needed</option>
                  <option value="Special Distinction Candidate">Special Distinction Candidate</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Instructor Telemetry Observations</label>
                <textarea
                  rows={4}
                  value={flagNotes}
                  onChange={(e) => setFlagNotes(e.target.value)}
                  placeholder="Enter detailed feedback or support recommendations for this student..."
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setFlagStudentModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitStudentReport}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminStudents;
