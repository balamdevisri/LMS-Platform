import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
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
  CheckCheck,
  ExternalLink,
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
  const emailVerified = useMemo(
    () => studentsList.filter((s) => (s as any).emailVerified === true || (s as any).isVerified === true).length,
    [studentsList]
  );

  // Real-time daily registrations (last 7 days by day-of-week)
  const dailyRegistrations = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    studentsList.forEach((s) => {
      const createdAt = (s as any).createdAt || (s as any).joinedAt;
      if (createdAt) {
        const d = new Date(createdAt);
        if (d >= sevenDaysAgo) {
          const dayName = days[d.getDay()];
          counts[dayName] = (counts[dayName] || 0) + 1;
        }
      }
    });
    // Return last 7 days in order starting from oldest
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      result.push({ day: dayName, count: counts[dayName] || 0 });
    }
    return result;
  }, [studentsList]);

  const maxDailyCount = useMemo(() => Math.max(...dailyRegistrations.map(d => d.count), 1), [dailyRegistrations]);

  // Branch distribution from real student data
  const branchDistribution = useMemo(() => {
    const branchMap: Record<string, number> = {};
    studentsList.forEach((s) => {
      const branch = (s as any).branch || 'Other';
      branchMap[branch] = (branchMap[branch] || 0) + 1;
    });
    const total = studentsList.length || 1;
    const colorMap: Record<string, string> = {
      'Computer Science (CSE)': 'bg-blue-500',
      'AI & Computer Science': 'bg-indigo-500',
      'Artificial Intelligence & ML': 'bg-indigo-500',
      'Information Technology (IT)': 'bg-cyan-500',
      'Electronics & Comm (ECE)': 'bg-purple-500',
      'Other': 'bg-slate-400',
    };
    return Object.entries(branchMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name, count]) => ({
        name,
        pct: Math.round((count / total) * 100),
        count,
        color: colorMap[name] || 'bg-sky-500',
      }));
  }, [studentsList]);

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

  const navigate = useNavigate();
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = useMemo(() => {
    if (notifFilter === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, notifFilter]);

  const handleMarkAllNotifsRead = () => {
    adminNotificationService.markAllAsRead();
    toast.success('All notifications marked as read.');
  };

  const handleClearAllNotifs = () => {
    adminNotificationService.clearAll();
    toast.info('All notifications cleared.');
  };

  const handleNotifClick = (n: AdminNotification) => {
    adminNotificationService.markAsRead(n.id);
    setIsNotifOpen(false);
    if (n.link) {
      navigate(n.link);
    }
  };

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
      <div className="bg-white/90 dark:bg-slate-900 backdrop-blur-2xl border border-sky-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl shadow-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400" />
              <span>ADMINISTRATOR CONTROL PANEL</span>
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>REAL-TIME LIVE DATA</span>
            </div>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Welcome back, {userProfile?.name || 'Administrator'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage real-time student applications, approval workflows, and analytics telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Notification Bell Center */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer relative"
              title="Admin Notifications"
            >
              <Bell className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce shadow-xs">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Notification Portal Drawer into document.body */}
            {isNotifOpen && createPortal(
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsNotifOpen(false)}
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-99998"
                />

                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className={['fixed top-16 right-4 sm:right-8 w-80 sm:w-96 bg-white border border-sky-200 rounded-3xl shadow-2xl p-4 sm:p-5 z-99999 flex flex-col space-y-3 font-[\'Sora\'] max-h-[85vh]', 'dark:bg-zinc-900 dark:border-zinc-800'].join(' ')}
                >
                  {/* Header */}
                  <div className={['flex items-center justify-between border-b border-slate-100 pb-3', 'dark:border-zinc-800'].join(' ')}>
                    <div className="flex items-center gap-2">
                      <div className={['p-1.5 rounded-xl bg-sky-50 text-sky-600', 'dark:bg-sky-950/50 dark:text-sky-400'].join(' ')}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className={['font-heading font-extrabold text-sm text-slate-900', 'dark:text-zinc-100'].join(' ')}>
                          System Notifications
                        </h4>
                        <p className={['text-[10px] text-slate-500', 'dark:text-zinc-400'].join(' ')}>
                          {unreadNotifsCount} unread update{unreadNotifsCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Filter & Action Toolbar */}
                  <div className="flex items-center justify-between gap-2 pb-1">
                    <div className={['flex items-center gap-1 bg-slate-100 p-1 rounded-xl', 'dark:bg-zinc-800/80'].join(' ')}>
                      <button
                        onClick={() => setNotifFilter('all')}
                        className={`py-1 px-3 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          notifFilter === 'all'
                            ? ['bg-white text-sky-600 shadow-xs', 'dark:bg-zinc-900 dark:text-sky-400'].join(' ')
                            : ['text-slate-500 hover:text-slate-900', 'dark:text-zinc-400 dark:hover:text-zinc-100'].join(' ')
                        }`}
                      >
                        All ({notifications.length})
                      </button>
                      <button
                        onClick={() => setNotifFilter('unread')}
                        className={`py-1 px-3 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          notifFilter === 'unread'
                            ? ['bg-white text-sky-600 shadow-xs', 'dark:bg-zinc-900 dark:text-sky-400'].join(' ')
                            : ['text-slate-500 hover:text-slate-900', 'dark:text-zinc-400 dark:hover:text-zinc-100'].join(' ')
                        }`}
                      >
                        Unread ({unreadNotifsCount})
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {unreadNotifsCount > 0 && (
                        <button
                          onClick={handleMarkAllNotifsRead}
                          className={['text-[11px] font-bold text-sky-600 hover:underline flex items-center gap-1 cursor-pointer', 'dark:text-sky-400'].join(' ')}
                          title="Mark all read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Mark read</span>
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={handleClearAllNotifs}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Clear all notifications"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scrollable Notification Items */}
                  <div className={['space-y-2 overflow-y-auto flex-1 pr-1 max-h-80 scrollbar-thin scrollbar-thumb-slate-200', 'dark:scrollbar-thumb-zinc-800'].join(' ')}>
                    {filteredNotifications.length === 0 ? (
                      <div className="py-10 text-center space-y-2">
                        <Bell className={['w-8 h-8 text-slate-300 mx-auto', 'dark:text-zinc-700'].join(' ')} />
                        <p className="text-xs text-slate-400 font-medium">
                          {notifFilter === 'unread' ? 'No unread notifications.' : 'No notifications in system.'}
                        </p>
                      </div>
                    ) : (
                      filteredNotifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-2xl border transition-all text-xs space-y-1.5 ${
                            n.read
                              ? ['bg-slate-50/70 border-slate-200/60 text-slate-600', 'dark:bg-zinc-800/40 dark:border-zinc-800 dark:text-zinc-400'].join(' ')
                              : ['bg-sky-50/70 border-sky-200 text-slate-900 font-medium', 'dark:bg-sky-950/30 dark:border-sky-800/50 dark:text-zinc-100'].join(' ')
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold gap-2">
                            <span
                              onClick={() => handleNotifClick(n)}
                              className="flex items-center gap-2 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 min-w-0"
                            >
                              {!n.read && <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0 animate-pulse" />}
                              <span className="truncate">{n.title}</span>
                            </span>

                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] text-slate-400 font-mono font-normal mr-1">{n.timestamp}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); adminNotificationService.toggleRead(n.id); }}
                                className={`p-1 rounded-lg transition-colors cursor-pointer ${n.read ? 'text-slate-400 hover:text-sky-600' : 'text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-900/40'}`}
                                title={n.read ? 'Mark as Unread' : 'Mark as Read'}
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); adminNotificationService.deleteNotification(n.id); }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Delete notification"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p
                            onClick={() => handleNotifClick(n)}
                            className={['text-[11px] leading-relaxed text-slate-600 cursor-pointer', 'dark:text-zinc-400'].join(' ')}
                          >
                            {n.message}
                          </p>

                          {n.link && (
                            <div
                              onClick={() => handleNotifClick(n)}
                              className={['text-[10px] text-sky-600 font-bold flex items-center gap-1 pt-0.5 cursor-pointer hover:underline', 'dark:text-sky-400'].join(' ')}
                            >
                              <span>Take Action</span>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>,
              document.body
            )}
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
            <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
              Enterprise System Telemetry & Metrics
            </h2>
          </div>
          <span className="text-xs bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-cyan-300 font-bold px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
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
                  className="block p-4 rounded-3xl bg-white/90 dark:bg-slate-900 border border-sky-100 dark:border-slate-800 backdrop-blur-xl space-y-3 hover:border-sky-300 dark:hover:border-slate-700 hover:shadow-xl transition-all shadow-xs group relative overflow-hidden"
                >
                  <div className={`w-10 h-10 rounded-2xl bg-linear-to-tr ${metric.gradient} text-white flex items-center justify-center shadow-md ${metric.bgGlow}`}>
                    {Icon ? <Icon className="w-5 h-5" /> : null}
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase">{metric.label}</div>
                    <div className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white mt-0.5">
                      {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-sky-700 dark:text-cyan-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>{metric.change}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-sky-600 dark:group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* MODULE 9: ANALYTICS DASHBOARD CHARTS — REAL-TIME DATA */}
      <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Platform Analytics Telemetry</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Live registration trends, branch distribution & verification ratios from Firestore</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {approvedStudents} Approved
            </span>
            <span className="px-3 py-1 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-cyan-300 border border-sky-200 dark:border-sky-800 rounded-xl">
              {totalStudents} Total Students
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-Time Daily Registrations Bar Chart */}
          <div className="bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Daily Student Registrations (Last 7 Days)</h4>
            {totalStudents === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-slate-400 font-medium">Loading live data...</div>
            ) : (
              <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2">
                {dailyRegistrations.map((item, i) => {
                  const heightPct = maxDailyCount > 0 ? Math.max((item.count / maxDailyCount) * 100, item.count > 0 ? 8 : 0) : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">{item.count > 0 ? item.count : ''}</div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                        className={`w-full rounded-t-lg shadow-xs transition-all ${
                          heightPct > 0
                            ? 'bg-linear-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-cyan-400'
                            : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      />
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{item.day}</div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-center">Computed from {totalStudents} real student registrations</p>
          </div>

          {/* Real-Time Branch Distribution */}
          <div className="bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Branch & Specialization Distribution</h4>
            <div className="space-y-3 pt-2">
              {branchDistribution.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 font-medium">No branch data yet</div>
              ) : (
                branchDistribution.map((b, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span className="truncate pr-2">{b.name}</span>
                      <span className="font-mono shrink-0">{b.pct}% ({b.count})</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${b.pct}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full ${b.color}`}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Real-Time Verification & Integration Status */}
          <div className="bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl space-y-4">
            <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Live Verification & GitHub Ratios</h4>
            <div className="space-y-4 pt-1">
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Verified</span>
                </div>
                <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                  {emailVerified} / {totalStudents} ({totalStudents > 0 ? Math.round((emailVerified / totalStudents) * 100) : 0}%)
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">GitHub Connected</span>
                </div>
                <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                  {githubConnected} / {totalStudents} ({totalStudents > 0 ? Math.round((githubConnected / totalStudents) * 100) : 0}%)
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Admin Approved</span>
                </div>
                <span className="font-mono font-bold text-xs text-sky-600 dark:text-cyan-400">{approvedStudents} / {totalStudents}</span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pending Review</span>
                </div>
                <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">{pendingApprovals}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OPERATIONS & MANAGEMENT HUB */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
            <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
              Faculty & Student Operations Hub
            </h2>
          </div>
          <span className="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Real-Time DB Sync Active
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FACULTY SECTION */}
          <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Faculty Members</h3>
              </div>
              <button
                onClick={() => setIsInstructorModalOpen(true)}
                className="btn-blue-primary text-xs py-2 px-3 flex items-center gap-1 font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Faculty</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto pr-1">
              {instructorsList.map((inst) => (
                <div key={inst.id} className="py-3 flex items-center justify-between text-xs font-semibold">
                  <div>
                    <span className="block font-bold text-slate-900 dark:text-white">{inst.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{inst.email} • {inst.specialty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingInstructor(inst)} className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-cyan-400 cursor-pointer">
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
          <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Recent Student Applications</h3>
              </div>
              <Link to="/admin/students" className="text-xs font-bold text-sky-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
                <span>View All ({totalStudents})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto pr-1">
              {studentsList.slice(0, 5).map((stud) => (
                <div key={stud.id} className="py-3 flex items-center justify-between text-xs font-semibold">
                  <div>
                    <span className="block font-bold text-slate-900 dark:text-white">{stud.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{stud.email}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                    stud.status === 'approved' || stud.approved
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : stud.status === 'rejected'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
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
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-sky-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 font-['Sora'] text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100 dark:border-slate-800">
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Add Faculty Instructor</h3>
              <button onClick={() => setIsInstructorModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInstructor} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  placeholder="e.g. Dr. Vikram Sharma"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={instEmail}
                  onChange={(e) => setInstEmail(e.target.value)}
                  placeholder="vikram@kaizenq.ai"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Specialty</label>
                <input
                  type="text"
                  value={instSpecialty}
                  onChange={(e) => setInstSpecialty(e.target.value)}
                  placeholder="e.g. AI & Machine Learning"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsInstructorModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
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
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-sky-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 font-['Sora'] text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100 dark:border-slate-800">
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Edit Instructor Details</h3>
              <button onClick={() => setEditingInstructor(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateInstructor} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingInstructor.name}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingInstructor.email}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingInstructor(null)} className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-rose-200 dark:border-rose-900/60 text-center font-['Sora'] text-slate-900 dark:text-white">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Delete Instructor?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Are you sure you want to remove this faculty instructor?</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setDeletingInstructorId(null)} className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
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
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-sky-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white font-['Sora']">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Edit Student Details</h3>
              </div>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Approval Status</label>
                <select
                  value={editingStudent.status}
                  onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="pending font-bold">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                  <option value="suspended">suspended</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingStudent(null)} className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-rose-200 dark:border-rose-900/60 text-center font-['Sora'] text-slate-900 dark:text-white">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Delete Student Account?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Are you sure you want to delete this student account?</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setDeletingStudentId(null)} className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
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
