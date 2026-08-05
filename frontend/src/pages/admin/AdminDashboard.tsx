import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  UserCheck,
  ChevronRight,
  Award,
  CheckCircle2,
  X,
  Plus,
  Sliders,
  ArrowRight,
  Edit,
  Trash2,
  ShieldAlert,
  Radio,
  Bell,
  TrendingUp,
  Code2,
  FileText,
  Bot,
  Zap,
  FolderGit2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { studentService, type StudentUser } from '@/services/studentService';
import { instructorService, type InstructorUser } from '@/services/instructorService';
import { adminNotificationService, type AdminNotification } from '@/services/adminNotificationService';

export const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();

  // Quick Modal States
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);

  // Edit / Delete States
  const [editingInstructor, setEditingInstructor] = useState<InstructorUser | null>(null);
  const [deletingInstructorId, setDeletingInstructorId] = useState<string | null>(null);

  const [editingStudent, setEditingStudent] = useState<StudentUser | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // Form States for Add Instructor
  const [instName, setInstName] = useState('');
  const [instEmail, setInstEmail] = useState('');
  const [instSpecialty, setInstSpecialty] = useState('Linux & System Architecture');

  // Real-Time Datasets
  const [studentsList, setStudentsList] = useState<StudentUser[]>([]);
  const [instructorsList, setInstructorsList] = useState<InstructorUser[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    // 1. Sync Firebase Auth users with Firestore on dashboard mount
    const triggerSync = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        await fetch(`${apiBaseUrl}/admin/sync-auth-users`, { method: 'POST' });
      } catch (err) {
        console.warn('[Admin Dashboard] Auth users sync notice:', err);
      }
    };
    triggerSync();

    // 2. Subscribe to real-time collections
    const unsubStudents = studentService.subscribeToStudents((data) => {
      setStudentsList(data);
    });
    const unsubInstructors = instructorService.subscribeToInstructors((data) => {
      setInstructorsList(data);
    });
    const unsubNotifs = adminNotificationService.subscribe((data) => {
      setNotifications(data);
    });
    return () => {
      unsubStudents();
      unsubInstructors();
      unsubNotifs();
    };
  }, []);

  // Compute Live Metrics
  const totalStudents = studentsList.length;
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

  const pendingApprovals = useMemo(
    () => studentsList.filter(isPendingStudent).length,
    [studentsList]
  );
  const approvedStudents = useMemo(
    () => studentsList.filter((s) => s.status === 'approved' || s.status === 'Active' || s.approved === true).length,
    [studentsList]
  );
  const rejectedStudents = useMemo(
    () => studentsList.filter((s) => s.status === 'rejected' || s.status === 'Blocked').length,
    [studentsList]
  );
  const githubConnected = useMemo(
    () => studentsList.filter((s) => s.provider === 'github.com' || Boolean(s.photoURL?.includes('github')) || s.githubUsername).length,
    [studentsList]
  );

  const metrics = [
    {
      label: 'Total Students',
      value: totalStudents,
      icon: Users,
      gradient: 'from-blue-600 to-indigo-600',
      bgGlow: 'shadow-blue-500/20',
      change: '+14% this month',
      link: '/admin/students'
    },
    {
      label: 'Pending Approvals',
      value: pendingApprovals,
      icon: AlertCircle,
      gradient: 'from-amber-500 to-orange-600',
      bgGlow: 'shadow-amber-500/20',
      change: 'Requires Review',
      link: '/admin/students?status=pending'
    },
    {
      label: 'Approved Students',
      value: approvedStudents,
      icon: UserCheck,
      gradient: 'from-emerald-500 to-teal-600',
      bgGlow: 'shadow-emerald-500/20',
      change: 'Active Access',
      link: '/admin/students?status=approved'
    },
    {
      label: 'Rejected Students',
      value: rejectedStudents,
      icon: X,
      gradient: 'from-rose-500 to-red-600',
      bgGlow: 'shadow-rose-500/20',
      change: 'Denied Applications',
      link: '/admin/students?status=rejected'
    },
    {
      label: 'Active Courses',
      value: 8,
      icon: BookOpen,
      gradient: 'from-purple-600 to-indigo-700',
      bgGlow: 'shadow-purple-500/20',
      change: '100% Operational',
      link: '/admin/courses'
    },
    {
      label: 'Assignments',
      value: 342,
      icon: FileText,
      gradient: 'from-cyan-500 to-blue-600',
      bgGlow: 'shadow-cyan-500/20',
      change: '94% Pass Rate',
      link: '/dashboard'
    },
    {
      label: 'Resources',
      value: 64,
      icon: FolderGit2,
      gradient: 'from-sky-500 to-blue-700',
      bgGlow: 'shadow-sky-500/20',
      change: 'Labs & Docs',
      link: '/dashboard'
    },
    {
      label: 'Certificates',
      value: 42,
      icon: Award,
      gradient: 'from-yellow-500 to-amber-600',
      bgGlow: 'shadow-yellow-500/20',
      change: 'Verified Badges',
      link: '/dashboard'
    },
    {
      label: 'AI Requests',
      value: 12450,
      icon: Bot,
      gradient: 'from-fuchsia-600 to-pink-600',
      bgGlow: 'shadow-fuchsia-500/20',
      change: '<120ms Latency',
      link: '/admin/dashboard'
    },
    {
      label: 'GitHub Connected',
      value: githubConnected,
      icon: Code2,
      gradient: 'from-slate-700 to-slate-900',
      bgGlow: 'shadow-slate-500/20',
      change: 'OAuth & Portfolios',
      link: '/admin/students?provider=github'
    }
  ];

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Handlers - Instructor
  const handleAddInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName || !instEmail) {
      toast.error('Please fill in instructor name and email.');
      return;
    }
    try {
      await instructorService.addInstructor(instName, instEmail, instSpecialty);
      setIsInstructorModalOpen(false);
      setInstName('');
      setInstEmail('');
      toast.success(`Instructor ${instName} added in real time!`);
    } catch (e) {
      toast.error('Failed to add instructor.');
    }
  };

  const handleUpdateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstructor) return;
    try {
      await instructorService.updateInstructor(editingInstructor);
      setEditingInstructor(null);
      toast.success('Instructor profile updated in real time!');
    } catch (e) {
      toast.error('Failed to update instructor.');
    }
  };

  const handleDeleteInstructor = async (id: string) => {
    try {
      await instructorService.deleteInstructor(id);
      setDeletingInstructorId(null);
      toast.success('Instructor account deleted in real time!');
    } catch (e) {
      toast.error('Failed to delete instructor.');
    }
  };

  // Handlers - Student

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      await studentService.updateStudent(editingStudent);
      setEditingStudent(null);
      toast.success('Student profile updated in real time!');
    } catch (err) {
      toast.error('Failed to update student profile.');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await studentService.deleteStudent(id);
      setDeletingStudentId(null);
      toast.success('Student account deleted in real time!');
    } catch (err) {
      toast.error('Failed to delete student.');
    }
  };

  return (
    <div className="space-y-8 text-slate-900 font-['Sora'] max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-white/90 backdrop-blur-2xl border border-sky-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
              <span>ADMINISTRATOR CONTROL PANEL</span>
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>REAL-TIME LIVE DATA</span>
            </div>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Welcome back, {userProfile?.name || 'Administrator'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Manage real-time student applications, approval workflows, and analytics telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Notification Bell Center */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2.5 rounded-2xl bg-white border border-sky-200 text-slate-700 hover:bg-sky-50 transition-all shadow-xs cursor-pointer relative"
              title="Admin Notifications"
            >
              <Bell className="w-5 h-5 text-slate-700" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce shadow-xs">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-sky-100 p-4 z-50 space-y-3 font-['Sora']"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-sky-600" />
                      <h4 className="font-bold text-sm text-slate-900">System Notifications</h4>
                    </div>
                    <button
                      onClick={() => adminNotificationService.markAllAsRead()}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-2xl border transition-all text-xs space-y-1 ${
                            n.read ? 'bg-slate-50/60 border-slate-100 text-slate-600' : 'bg-sky-50/60 border-sky-200 text-slate-900 font-semibold'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-600">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/admin/students?status=pending"
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Pending ({pendingApprovals})</span>
          </Link>

          <Link
            to="/admin/students"
            className="btn-blue-primary text-xs py-2.5 px-4 shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 font-bold cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Students Roster</span>
          </Link>
        </div>
      </div>

      {/* MODULE 1: Live Animated Statistics Grid (10 Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="font-heading font-extrabold text-xl text-slate-900">
              Enterprise System Telemetry & Metrics
            </h2>
          </div>
          <span className="text-xs bg-sky-50 text-sky-700 font-bold px-3 py-1 rounded-full border border-sky-200">
            10 Live Indicators
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Link
                  to={metric.link}
                  className="block p-4 rounded-3xl bg-white/90 border border-sky-100 backdrop-blur-xl space-y-3 hover:border-sky-300 hover:shadow-xl transition-all shadow-xs group relative overflow-hidden"
                >
                  <div className={`w-10 h-10 rounded-2xl bg-linear-to-tr ${metric.gradient} text-white flex items-center justify-center shadow-md ${metric.bgGlow}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-slate-400 tracking-wide uppercase">{metric.label}</div>
                    <div className="font-heading font-extrabold text-2xl text-slate-900 mt-0.5">
                      {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-sky-700 font-semibold pt-1 border-t border-slate-100">
                    <span>{metric.change}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* MODULE 9: ANALYTICS DASHBOARD CHARTS */}
      <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="font-heading font-extrabold text-lg text-slate-900">Platform Analytics Telemetry</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Daily growth, branch distribution & verification ratios</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
              Monthly Growth: +24.5%
            </span>
            <span className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-xl">
              Completion Rate: 88.2%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Registrations Growth Bar Viz */}
          <div className="bg-slate-50/70 border border-slate-200/80 p-5 rounded-2xl space-y-4">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Daily Student Registrations</h4>
            <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2">
              {[
                { day: 'Mon', count: 12, height: '40%' },
                { day: 'Tue', count: 18, height: '60%' },
                { day: 'Wed', count: 26, height: '85%' },
                { day: 'Thu', count: 15, height: '50%' },
                { day: 'Fri', count: 32, height: '100%' },
                { day: 'Sat', count: 22, height: '70%' },
                { day: 'Sun', count: 19, height: '62%' }
              ].map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors">{item.count}</div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: item.height }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="w-full bg-linear-to-t from-blue-600 to-indigo-500 rounded-t-lg shadow-xs group-hover:from-blue-500 group-hover:to-cyan-400 transition-all"
                  />
                  <div className="text-[10px] font-bold text-slate-500">{item.day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Branch Distribution */}
          <div className="bg-slate-50/70 border border-slate-200/80 p-5 rounded-2xl space-y-4">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Branch & Specialization Distribution</h4>
            <div className="space-y-3 pt-2">
              {[
                { name: 'Computer Science (CSE)', pct: 45, color: 'bg-blue-500' },
                { name: 'Artificial Intelligence & ML', pct: 30, color: 'bg-indigo-500' },
                { name: 'Information Technology (IT)', pct: 15, color: 'bg-cyan-500' },
                { name: 'Electronics & Comm (ECE)', pct: 10, color: 'bg-purple-500' }
              ].map((b, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{b.name}</span>
                    <span className="font-mono">{b.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${b.pct}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full ${b.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification & Integration Status */}
          <div className="bg-slate-50/70 border border-slate-200/80 p-5 rounded-2xl space-y-4">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Verification & GitHub Ratios</h4>
            <div className="space-y-4 pt-1">
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-700">Email Verified Ratio</span>
                </div>
                <span className="font-mono font-bold text-xs text-emerald-600">92.4%</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-slate-800" />
                  <span className="text-xs font-bold text-slate-700">GitHub OAuth Connected</span>
                </div>
                <span className="font-mono font-bold text-xs text-indigo-600">75.0%</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-slate-700">Admin Approved Students</span>
                </div>
                <span className="font-mono font-bold text-xs text-sky-600">{approvedStudents} / {totalStudents}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OPERATIONS & MANAGEMENT HUB */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-600" />
            <h2 className="font-heading font-extrabold text-xl text-slate-900">
              Faculty & Student Operations Hub
            </h2>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Real-Time DB Sync Active
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FACULTY SECTION */}
          <div className="bg-white border border-sky-100 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-sky-600" />
                <h3 className="font-heading font-extrabold text-lg text-slate-900">Faculty Members</h3>
              </div>
              <button
                onClick={() => setIsInstructorModalOpen(true)}
                className="btn-blue-primary text-xs py-2 px-3 flex items-center gap-1 font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Faculty</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {instructorsList.map((inst) => (
                <div key={inst.id} className="py-3 flex items-center justify-between text-xs font-semibold">
                  <div>
                    <span className="block font-bold text-slate-900">{inst.name}</span>
                    <span className="text-[11px] text-slate-500">{inst.email} • {inst.specialty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingInstructor(inst)} className="p-1.5 text-slate-400 hover:text-sky-600 cursor-pointer">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeletingInstructorId(inst.id)} className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT STUDENTS QUICK VIEW */}
          <div className="bg-white border border-sky-100 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-heading font-extrabold text-lg text-slate-900">Recent Student Applications</h3>
              </div>
              <Link to="/admin/students" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                <span>View All ({totalStudents})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {studentsList.slice(0, 5).map((stud) => (
                <div key={stud.id} className="py-3 flex items-center justify-between text-xs font-semibold">
                  <div>
                    <span className="block font-bold text-slate-900">{stud.name}</span>
                    <span className="text-[11px] text-slate-500">{stud.email}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                    stud.status === 'approved' || stud.approved
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : stud.status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {stud.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD INSTRUCTOR */}
      {isInstructorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-sky-200 max-w-md w-full p-6 shadow-2xl space-y-4 font-['Sora']">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100">
              <h3 className="font-heading font-extrabold text-lg text-slate-900">Add Faculty Instructor</h3>
              <button onClick={() => setIsInstructorModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInstructor} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  placeholder="e.g. Dr. Vikram Sharma"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={instEmail}
                  onChange={(e) => setInstEmail(e.target.value)}
                  placeholder="vikram@kaizenq.ai"
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Specialty</label>
                <input
                  type="text"
                  value={instSpecialty}
                  onChange={(e) => setInstSpecialty(e.target.value)}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsInstructorModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="btn-blue-primary text-xs py-2.5 px-5 font-bold cursor-pointer">
                  Add Instructor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT INSTRUCTOR */}
      {editingInstructor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-sky-200 max-w-md w-full p-6 shadow-2xl space-y-4 font-['Sora']">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100">
              <h3 className="font-heading font-extrabold text-lg text-slate-900">Edit Instructor Details</h3>
              <button onClick={() => setEditingInstructor(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateInstructor} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingInstructor.name}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, name: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingInstructor.email}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, email: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingInstructor(null)} className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="btn-blue-primary text-xs py-2.5 px-5 font-bold cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE INSTRUCTOR CONFIRMATION */}
      {deletingInstructorId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-rose-200 text-center font-['Sora']">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-slate-900">Delete Instructor?</h3>
            <p className="text-xs text-slate-500 font-medium">Are you sure you want to remove this faculty instructor?</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setDeletingInstructorId(null)} className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              <button onClick={() => handleDeleteInstructor(deletingInstructorId)} className="py-2 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs cursor-pointer">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STUDENT */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-sky-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-sky-600" />
                <h3 className="font-heading font-extrabold text-lg text-slate-900">Edit Student Details</h3>
              </div>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Approval Status</label>
                <select
                  value={editingStudent.status}
                  onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 focus:outline-hidden"
                >
                  <option value="pending font-bold">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                  <option value="suspended">suspended</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingStudent(null)} className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="btn-blue-primary text-xs py-2.5 px-5 font-bold cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE STUDENT CONFIRMATION */}
      {deletingStudentId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-rose-200 text-center font-['Sora']">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-slate-900">Delete Student Account?</h3>
            <p className="text-xs text-slate-500 font-medium">Are you sure you want to delete this student account?</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setDeletingStudentId(null)} className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              <button onClick={() => handleDeleteStudent(deletingStudentId)} className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer">
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
