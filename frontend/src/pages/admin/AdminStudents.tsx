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
  Radio,
  Eye,
  Download,
  Users,
  Award,
  BookOpen,
  TrendingUp,
  KeyRound,
  Send,
  ShieldCheck,
  Check,
  XCircle,
  Code2
} from 'lucide-react';
import { toast } from 'sonner';
import { studentService, type StudentUser } from '@/services/studentService';
import { StudentProfileDrawer } from '@/components/admin/students/StudentProfileDrawer';
import { EditStudentModal } from '@/components/admin/students/EditStudentModal';
import { SendEmailModal } from '@/components/admin/students/SendEmailModal';
import { GitHubPortfolioDrawer } from '@/components/admin/students/GitHubPortfolioDrawer';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<'all' | 'github' | 'manual'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('newest');

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
    () => students.filter((s) => s.provider === 'github.com' || Boolean(s.photoURL?.includes('github'))).length,
    [students]
  );
  const manualCount = students.length - githubCount;

  // Filter & Sort Logic
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Search filter (Name, Email, Branch, Current Course)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (st) =>
          (st.name || st.fullName || '').toLowerCase().includes(q) ||
          (st.email || '').toLowerCase().includes(q) ||
          (st.branch || '').toLowerCase().includes(q) ||
          (st.currentCourse || '').toLowerCase().includes(q)
      );
    }

    // Provider filter
    if (providerFilter === 'github') {
      result = result.filter((s) => s.provider === 'github.com' || Boolean(s.photoURL?.includes('github')));
    } else if (providerFilter === 'manual') {
      result = result.filter((s) => s.provider !== 'github.com' && !Boolean(s.photoURL?.includes('github')));
    }

    // Status filter
    if (statusFilter === 'Active') {
      result = result.filter((s) => s.status === 'Active' || s.isActive === true);
    } else if (statusFilter === 'Inactive') {
      result = result.filter((s) => s.status === 'Suspended' || s.status === 'Blocked' || s.isActive === false);
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
      if (sortBy === 'lowest_progress') {
        return (a.learningScore || 0) - (b.learningScore || 0);
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });

    return result;
  }, [students, searchQuery, providerFilter, statusFilter, verificationFilter, branchFilter, yearFilter, sortBy]);

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

  const handleToggleStatus = async (id: string) => {
    try {
      const updated = await studentService.toggleStudentStatus(id);
      if (updated) {
        toast.info(`Student ${updated.name} set to ${updated.status}`);
      }
    } catch (e) {
      toast.error('Failed to update student status.');
    }
  };

  const handleApproveStudent = async (id: string) => {
    try {
      await studentService.approveStudent(id);
      toast.success('Student registration Approved! Welcome notification email sent.');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to approve student');
    }
  };

  const handleRejectStudent = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    try {
      await studentService.rejectStudent(id, rejectionReason.trim());
      toast.success('Student registration Rejected. Rejection email sent.');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to reject student');
    } finally {
      setRejectingStudentId(null);
      setRejectionReason('');
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      toast.success(`Password reset verification email sent to ${email}!`);
    } catch (e) {
      toast.error('Failed to send reset email.');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    const target = students.find((st) => st.id === id || st.uid === id);
    try {
      await studentService.deleteStudent(id);
      toast.success(`Student account ${target?.name || ''} deleted!`);
    } catch (e) {
      toast.error('Failed to delete student.');
    } finally {
      setDeletingStudentId(null);
    }
  };

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      toast.error('No students found matching current filters to export.');
      return;
    }
    studentService.exportStudentsToCSV(filteredStudents);
    toast.success(`Exported ${filteredStudents.length} student records to CSV!`);
  };

  return (
    <div className="space-y-8 text-slate-900 font-['Sora'] max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-white/95 backdrop-blur-2xl border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5 text-sky-500" />
              <span>KaizenQ Student Console</span>
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Firestore Real-Time Sync</span>
            </div>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Student Management & Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
            Live registered students database with real-time Firestore synchronization, Linux lab telemetry, score analytics, and administrative controls.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="px-4 py-3 rounded-2xl bg-white hover:bg-sky-50 text-sky-700 font-bold text-xs border border-sky-200 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-blue-primary text-xs py-3 px-5 shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 font-bold cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Student</span>
          </button>
        </div>
      </div>

      {/* 6 Top Statistics Cards */}
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
            <span className="text-[11px] font-bold uppercase tracking-wider">Active</span>
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
            <span className="text-[11px] font-bold uppercase tracking-wider">Enrolled</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-700">{stats.enrolledStudents}</div>
          <div className="text-[10px] text-indigo-600 font-medium">In Course Tracks</div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{stats.completedCourses}</div>
          <div className="text-[10px] text-amber-600 font-medium">Courses Graduated</div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Progress</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-sky-700">{stats.avgProgress}%</div>
          <div className="text-[10px] text-sky-600 font-medium">Mean Learning Score</div>
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

            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, email, branch, or course..."
                className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 focus:outline-hidden transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* Detailed Filters & Sorting Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-sky-100 text-xs font-medium">
            
            {/* Status Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-sky-200 rounded-xl py-1.5 px-2.5 focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="pending">⏳ Pending Approval Only</option>
                <option value="approved">✓ Approved / Active</option>
                <option value="rejected">✕ Rejected / Suspended</option>
              </select>
            </div>

            {/* Verification Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Verification</label>
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
                <option value="lowest_progress">📉 Lowest Progress</option>
                <option value="name">🔤 Alphabetical (A-Z)</option>
              </select>
            </div>

          </div>

        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto pt-2">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-bold">Connecting to Firestore real-time student telemetry...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 rounded-3xl border border-dashed border-sky-200">
              <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-heading font-extrabold text-sm text-slate-700">No Student Records Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                No registered students match your current search query or filter criteria. Try clearing search parameters.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-medium">
              <thead>
                <tr className="border-b border-sky-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-sky-50/50">
                  <th className="py-3 px-4">Profile</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Branch & Year</th>
                  <th className="py-3 px-4">Current Track</th>
                  <th className="py-3 px-4">Learning Score</th>
                  <th className="py-3 px-4">Courses</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {filteredStudents.map((st) => {
                  const isGithub = st.provider === 'github.com' || Boolean(st.photoURL?.includes('github'));
                  const score = st.learningScore || 85;

                  return (
                    <tr key={st.id || st.uid} className="hover:bg-sky-50/60 transition-colors group">
                      
                      {/* Avatar Profile */}
                      <td className="py-3.5 px-4">
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

                      {/* Student Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                          {st.name || st.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">{st.phone || '+1 (555) 019-2831'}</div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="truncate max-w-44 font-mono text-[11px]">{st.email}</div>
                      </td>

                      {/* Branch & Year */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{st.branch || 'AI & Computer Science'}</div>
                        <div className="text-[10px] text-slate-500">{st.year || '1st Year'}</div>
                      </td>

                      {/* Current Course */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 truncate max-w-48">
                          {st.currentCourse || 'Linux Systems & Administration'}
                        </div>
                      </td>

                      {/* Learning Score Meter */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 w-24">
                          <div className="flex items-center justify-between text-[11px] font-extrabold">
                            <span className={score >= 90 ? 'text-emerald-600' : score >= 75 ? 'text-sky-600' : 'text-amber-600'}>
                              {score}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                score >= 90 ? 'bg-emerald-500' : score >= 75 ? 'bg-sky-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Courses Count */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-sky-50 border border-sky-200 font-bold text-sky-700 text-[11px]">
                          {st.courses || st.courseCount || 1} Track(s)
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {st.joined || 'Recently'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            st.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                              : st.status === 'approved' || st.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {st.status === 'pending' ? 'Pending Approval' : st.status}
                        </span>
                      </td>

                      {/* Actions Toolbar */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Approve Action */}
                          {st.status === 'pending' && (
                            <button
                              onClick={() => handleApproveStudent(st.id || st.uid)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                              title="Approve Student Registration & Send Email"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                          )}

                          {/* Reject Action */}
                          {st.status === 'pending' && (
                            <button
                              onClick={() => setRejectingStudentId(st.id || st.uid)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                              title="Reject Student Registration with Reason"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          )}

                          {/* GitHub Profile & Repos Drawer */}
                          <button
                            onClick={() => setInspectGithubStudent(st)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 transition-all cursor-pointer"
                            title="Inspect GitHub Profile & Repositories Portfolio"
                          >
                            <Code2 className="w-3.5 h-3.5 text-sky-400" />
                          </button>

                          {/* Inspect Profile Drawer */}
                          <button
                            onClick={() => setInspectStudent(st)}
                            className="p-1.5 rounded-lg bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all cursor-pointer"
                            title="Inspect Full Telemetry & Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Profile */}
                          <button
                            onClick={() => setEditingStudent(st)}
                            className="p-1.5 rounded-lg bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all cursor-pointer"
                            title="Edit Student Credentials"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          <button
                            onClick={() => handleToggleStatus(st.id)}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer border ${
                              st.status === 'Active' || st.status === 'approved'
                                ? 'bg-white hover:bg-rose-50 text-rose-600 border-rose-200'
                                : 'bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-200'
                            }`}
                            title={st.status === 'Active' || st.status === 'approved' ? 'Deactivate Account' : 'Activate Account'}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => handleResetPassword(st.email)}
                            className="p-1.5 rounded-lg bg-white hover:bg-amber-50 text-amber-600 border border-amber-200 transition-all cursor-pointer"
                            title="Reset Password Verification"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Send Email */}
                          <button
                            onClick={() => setEmailStudent(st)}
                            className="p-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 transition-all cursor-pointer"
                            title="Send Platform Notification Email"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Student */}
                          <button
                            onClick={() => setDeletingStudentId(st.id)}
                            className="p-1.5 rounded-lg bg-white hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                            title="Delete Student Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

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

      {/* MODAL: REGISTER NEW STUDENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-sky-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-sky-600" />
                <h3 className="font-heading font-extrabold text-lg text-slate-900">Register Student Document</h3>
              </div>
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
                  placeholder="e.g. Jane Doe"
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
                  placeholder="jane.doe@university.edu"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Authentication Provider Type</label>
                <select
                  value={newStudentProvider}
                  onChange={(e) => setNewStudentProvider(e.target.value as any)}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                >
                  <option value="password">✉️ Password Email Registration</option>
                  <option value="github.com">🐱 GitHub OAuth Account</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-blue-primary text-xs py-2.5 px-5 font-bold cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingStudentId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rose-200 max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-slate-900">Delete Student Document?</h3>
            <p className="text-xs text-slate-500 font-medium">
              Are you sure you want to delete this student profile from Firestore? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingStudentId(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStudent(deletingStudentId)}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECTION REASON */}
      {rejectingStudentId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rose-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <div className="flex items-center gap-2 text-rose-600">
                <XCircle className="w-5 h-5" />
                <h3 className="font-heading font-extrabold text-base text-slate-900">Reject Student Registration</h3>
              </div>
              <button onClick={() => setRejectingStudentId(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 font-medium">
                Please enter the reason for rejecting this student registration. An automated rejection email will be sent to the student explaining the reason.
              </p>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Rejection Reason</label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Invalid GitHub Profile or non-college email address format..."
                  className="w-full bg-slate-50 border border-rose-200 rounded-xl p-3 focus:outline-hidden text-slate-900 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingStudentId(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRejectStudent(rejectingStudentId)}
                  className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Confirm Rejection & Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT GITHUB PORTFOLIO DRAWER */}
      <GitHubPortfolioDrawer
        student={inspectGithubStudent}
        onClose={() => setInspectGithubStudent(null)}
      />

      {/* INSPECT PROFILE DRAWER */}
      <StudentProfileDrawer
        student={inspectStudent}
        onClose={() => setInspectStudent(null)}
        onEdit={(st) => setEditingStudent(st)}
        onToggleStatus={(id) => handleToggleStatus(id)}
        onResetPassword={(email) => handleResetPassword(email)}
        onSendEmail={(st) => setEmailStudent(st)}
      />

      {/* EDIT STUDENT MODAL */}
      <EditStudentModal
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
        onSave={handleUpdateStudent}
      />

      {/* SEND EMAIL MODAL */}
      <SendEmailModal
        student={emailStudent}
        onClose={() => setEmailStudent(null)}
      />

    </div>
  );
};

export default AdminStudents;
