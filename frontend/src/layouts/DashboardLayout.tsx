import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Award,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  Menu,
  X,
  UserCheck,
  GraduationCap,
  CheckCheck,
  Trash2,
  ExternalLink,
  Trophy,
  BarChart3,
  Settings,
  Map,
  Terminal,
  HelpCircle,
  Video,
  Sparkles,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { BrandLogo } from '@/components/common/BrandLogo';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LogoutConfirmModal } from '@/components/common/LogoutConfirmModal';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, type NotificationItem } from '@/services/notificationService';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread' | 'learning' | 'system'>('all');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, userProfile, logout } = useAuth();

  useEffect(() => {
    const unsubscribe = notificationService.subscribeToNotifications(user?.uid, (items) => {
      setNotifications([...items]);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (notificationFilter === 'unread') return !n.read;
    if (notificationFilter === 'learning') {
      return n.type === 'course' || n.type === 'assignment' || n.type === 'live_class' || n.type === 'certificate';
    }
    if (notificationFilter === 'system') {
      return n.type === 'system' || n.type === 'achievement' || n.type === 'info' || n.type === 'warning' || n.type === 'success';
    }
    return true;
  });

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await notificationService.markAllAsRead();
    toast.success('All notifications marked as read.');
  };

  const handleToggleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
    await notificationService.toggleRead(id);
  };

  const handleDeleteSingle = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await notificationService.deleteNotification(id);
    toast.info('Notification deleted.');
  };

  const handleMarkSingleRead = async (id: string, link?: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await notificationService.markAsRead(id);
    if (link) {
      navigate(link);
      setNotificationsOpen(false);
    }
  };

  const handleClearAll = async () => {
    setNotifications([]);
    await notificationService.clearAll();
    toast.info('All notifications cleared.');
  };

  const handleSignOutClick = () => {
    setProfileOpen(false);
    setLogoutModalOpen(true);
  };

  const handleConfirmSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/auth/login');
    } catch (e) {
      console.warn('Sign out notice:', e);
    } finally {
      setIsLoggingOut(false);
      setLogoutModalOpen(false);
    }
  };

  const role = userProfile?.role || 'student';
  const isAdmin = role === 'admin';
  const isInstructor = role === 'instructor';

  const adminNavSections = [
    {
      title: 'CORE PLATFORM',
      accent: 'text-indigo-600 dark:text-indigo-400',
      items: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Course Catalog', href: '/admin/courses', icon: BookOpen },
        {
          name: 'Live Classes',
          href: '/admin/live-classes',
          icon: Video,
          subItems: [
            { name: 'All Live Classes', href: '/admin/live-classes' },
            { name: 'Scheduled', href: '/admin/live-classes?tab=scheduled' },
            { name: 'Live Now', href: '/admin/live-classes?tab=live' },
            { name: 'Completed', href: '/admin/live-classes?tab=completed' },
            { name: 'Create Class', href: '/admin/live-classes/create' },
          ],
        },
        { name: 'Platform Analytics', href: '/admin/analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'PEOPLE & USERS',
      accent: 'text-cyan-600 dark:text-cyan-400',
      items: [
        { name: 'Students Roster', href: '/admin/students', icon: UserCheck },
        { name: 'Instructors Directory', href: '/admin/instructors', icon: GraduationCap },
      ],
    },
    {
      title: 'SYSTEM & SETTINGS',
      accent: 'text-slate-500 dark:text-slate-400',
      items: [
        { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const instructorNavSections = [
    {
      title: 'TEACHING & CLASSES',
      accent: 'text-indigo-600 dark:text-indigo-400',
      items: [
        { name: 'Overview Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Course Management', href: '/admin/courses', icon: BookOpen },
        { name: 'Live Classrooms', href: '/admin/live-classes', icon: Video },
      ],
    },
    {
      title: 'STUDENTS & MENTORSHIP',
      accent: 'text-cyan-600 dark:text-cyan-400',
      items: [
        { name: 'Mentor Analytics', href: '/admin/live-classroom/mentor-analytics', icon: BarChart3 },
        { name: 'Student Roster', href: '/admin/students', icon: UserCheck },
      ],
    },
    {
      title: 'ACCOUNT',
      accent: 'text-slate-500 dark:text-slate-400',
      items: [
        { name: 'My Profile', href: '/profile', icon: UserCheck },
        { name: 'Settings', href: '/dashboard?tab=settings', icon: Settings },
      ],
    },
  ];

  const studentNavSections = [
    {
      title: 'LEARNING',
      accent: 'text-indigo-600 dark:text-indigo-400',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Courses', href: '/dashboard/courses', icon: BookOpen },
        { name: 'Live Class', href: '/dashboard/live-classroom', icon: Video },
      ],
    },
    {
      title: 'INTELLIGENCE & PRACTICE',
      accent: 'text-cyan-600 dark:text-cyan-400',
      items: [
        { name: 'Learning Analytics', href: '/dashboard?tab=analytics', icon: BarChart3 },
        { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
        { name: 'Practice Hub', href: '/dashboard?tab=practice-hub', icon: Terminal },
        { name: 'Interview Prep', href: '/dashboard?tab=interview-prep', icon: HelpCircle },
      ],
    },
    {
      title: 'CAREER DEVELOPMENT',
      accent: 'text-emerald-600 dark:text-emerald-400',
      items: [
        { name: 'Portfolio Builder', href: '/dashboard?tab=portfolio-builder', icon: Globe, isPremium: true },
        { name: 'Resume Builder', href: '/dashboard?tab=resume-builder', icon: FileText, isPremium: true },
        { name: 'Career Roadmap', href: '/dashboard?tab=career-roadmap', icon: Map },
        { name: 'Certificates', href: '/dashboard?tab=certificates', icon: Award },
        { name: 'Achievements', href: '/dashboard?tab=achievements', icon: Trophy },
      ],
    },
    {
      title: 'ACCOUNT',
      accent: 'text-slate-500 dark:text-slate-400',
      items: [
        { name: 'Settings', href: '/dashboard?tab=settings', icon: Settings },
      ],
    },
  ];

  const isNavItemActive = (href: string) => {
    if (href === '/dashboard' || href === '/admin/dashboard') {
      return (
        location.pathname === href &&
        (location.search === '' || location.search === '?tab=overview')
      );
    }
    if (href.includes('?')) {
      return location.pathname + location.search === href;
    }
    return location.pathname === href;
  };

  const activeNavSections = isAdmin ? adminNavSections : (isInstructor ? instructorNavSections : studentNavSections);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-300">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl z-50 flex flex-col transition-transform duration-300 border-r border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-blue-500/5 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full min-h-0 relative overflow-hidden">
          {/* Ambient Glow in Sidebar Background */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -left-12 w-36 h-36 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Bar */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0 relative z-10">
            <BrandLogo size="sm" showSubtitle={true} className="shrink-0" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Portal Status Badge */}
          <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800/60 shrink-0 relative z-10">
            <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border shadow-xs ${
              isAdmin
                ? 'bg-linear-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-purple-500/20 dark:border-purple-500/30'
                : isInstructor
                ? 'bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border-cyan-500/20 dark:border-cyan-500/30'
                : 'bg-linear-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border-blue-500/20 dark:border-blue-500/30'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isAdmin ? 'bg-purple-400' : isInstructor ? 'bg-cyan-400' : 'bg-emerald-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isAdmin ? 'bg-purple-500' : isInstructor ? 'bg-cyan-500' : 'bg-emerald-500'
                }`} />
              </span>
              <span className={`text-[10px] font-extrabold uppercase tracking-widest truncate ${
                isAdmin ? 'text-purple-700 dark:text-purple-300' : isInstructor ? 'text-cyan-700 dark:text-cyan-300' : 'text-blue-700 dark:text-blue-300'
              }`}>
                {role.toUpperCase()} PORTAL
              </span>
              <span className={`ml-auto text-[9px] font-black px-2 py-0.5 rounded-md border shrink-0 shadow-xs ${
                isAdmin
                  ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-300/60 dark:border-purple-700/60'
                  : isInstructor
                  ? 'text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300/60 dark:border-cyan-700/60'
                  : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300/60 dark:border-emerald-700/60'
              }`}>
                {isAdmin ? 'ROOT ADMIN' : 'ACTIVE'}
              </span>
            </div>
          </div>

          {/* Main Navigation List */}
          <nav className="px-3 py-3.5 overflow-y-auto flex-1 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 relative z-10">
            {activeNavSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1.5">
                {/* Category Header */}
                <div className="flex items-center gap-2 px-1.5 pt-1">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isAdmin ? 'bg-purple-500 dark:bg-purple-400' : 'bg-blue-500 dark:bg-cyan-400'
                  }`} />
                  <span className={`text-[10px] font-heading font-black uppercase tracking-[0.14em] ${section.accent}`}>
                    {section.title}
                  </span>
                  <div className="flex-1 h-px bg-linear-to-r from-slate-200 via-slate-100 to-transparent dark:from-slate-800 dark:via-slate-800/40 dark:to-transparent" />
                </div>

                {/* Nav Links */}
                <div className="space-y-1 pt-0.5">
                  {section.items.map((item: any) => {
                    const Icon = item.icon;
                    const isParentActive = item.subItems ? location.pathname.startsWith(item.href) : false;
                    const isActive = isNavItemActive(item.href) || isParentActive;

                    return (
                      <div key={item.name} className="space-y-1">
                        <Link
                          to={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative ${
                            isActive
                              ? 'bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-white/20 translate-x-0.5'
                              : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-300 hover:bg-linear-to-r hover:from-blue-500/10 hover:via-indigo-500/5 hover:to-transparent border border-transparent hover:border-blue-500/15 hover:translate-x-1'
                          }`}
                        >
                          {Icon ? (
                            <div className={`p-1.5 rounded-lg shrink-0 transition-all ${
                              isActive
                                ? 'bg-white/20 text-white shadow-inner'
                                : 'bg-slate-100 dark:bg-slate-900 group-hover:bg-blue-500/15 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400'
                            }`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                          ) : null}

                          <span className="truncate flex-1 font-semibold">{item.name}</span>

                          {/* SubItems Count Badge */}
                          {item.subItems && (
                            <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded-md font-bold ${
                              isActive ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                            }`}>
                              {item.subItems.length}
                            </span>
                          )}
                          
                          {/* Premium PRO Badge */}
                          {item.isPremium && (
                            <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full border tracking-wider shrink-0 shadow-xs flex items-center gap-1 ${
                              isActive 
                                ? 'bg-amber-300 text-amber-950 border-amber-200 shadow-amber-900/30' 
                                : 'bg-linear-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 border-amber-300 shadow-amber-500/25 font-black'
                            }`}>
                              <Sparkles className="w-2.5 h-2.5 fill-current" />
                              <span>PRO</span>
                            </span>
                          )}

                          {/* Active Indicator Dot */}
                          {isActive && !item.isPremium && !item.subItems && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] shrink-0" />
                          )}
                        </Link>

                        {/* Sub Navigation Items for Dropdowns */}
                        {item.subItems && isParentActive && (
                          <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-blue-500/30 dark:border-cyan-500/30 ml-4 animate-in fade-in duration-200">
                            {item.subItems.map((sub: any) => {
                              const isSubActive =
                                location.pathname + location.search === sub.href ||
                                (sub.href === '/admin/live-classes' && location.pathname === '/admin/live-classes' && !location.search);
                              return (
                                <Link
                                  key={sub.name}
                                  to={sub.href}
                                  onClick={() => setSidebarOpen(false)}
                                  className={`block px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                                    isSubActive
                                      ? 'bg-linear-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-xs'
                                      : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-300 hover:bg-blue-500/10'
                                  }`}
                                >
                                  {sub.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom User Card */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 shrink-0 bg-slate-50/50 dark:bg-slate-950/50 relative z-10">
          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all group">
            {userProfile?.photoURL || user?.photoURL ? (
              <img
                src={userProfile?.photoURL || user?.photoURL || ''}
                alt={userProfile?.name || 'User'}
                className="w-9 h-9 rounded-xl object-cover border border-blue-200 dark:border-blue-900/60 shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                {(userProfile?.name || user?.displayName || 'S').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="font-heading font-bold text-xs text-slate-900 dark:text-white block truncate leading-tight">
                {userProfile?.name || user?.displayName || 'Student User'}
              </span>
              <span className="text-[10px] font-medium text-blue-600 dark:text-cyan-400 capitalize block truncate">
                {userProfile?.role || 'student'} • KaizenQ
              </span>
            </div>
            <button
              onClick={handleSignOutClick}
              className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64 flex-1 flex flex-col">
        <header className="h-14 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-zinc-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm transition-colors duration-300">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="lg:hidden shrink-0 flex items-center">
              <BrandLogo size="sm" showSubtitle={false} />
            </div>

            <div className="relative w-48 sm:w-72 lg:w-88">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search courses, modules, quizzes..."
                className="w-full bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-600 font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-600 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 relative transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-rose-500 text-white text-[8px] font-extrabold ring-2 ring-white dark:ring-zinc-900 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-88 sm:w-104 max-w-[calc(100vw-24px)] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden flex flex-col max-h-[520px]">
                  {/* Top Header */}
                  <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="font-heading font-bold text-xs text-slate-900 dark:text-white">
                        Live Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20 text-[10px] font-black">
                          {unreadCount} New
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-blue-600 dark:text-cyan-400 hover:underline font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={handleClearAll}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Clear all notifications"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="px-3 pt-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5 shrink-0 bg-white dark:bg-slate-950">
                    {[
                      { id: 'all', label: 'All', count: notifications.length },
                      { id: 'unread', label: 'Unread', count: unreadCount },
                      { id: 'learning', label: 'Learning' },
                      { id: 'system', label: 'System' },
                    ].map((tab) => {
                      const isTabActive = notificationFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setNotificationFilter(tab.id as any)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isTabActive
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                          }`}
                        >
                          <span>{tab.label}</span>
                          {tab.count !== undefined && tab.count > 0 && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                              isTabActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {tab.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Notifications List */}
                  <div className="p-3 space-y-2 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                    {filteredNotifications.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                          <Bell className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {notificationFilter === 'unread' ? "You're all caught up!" : "No notifications in this view"}
                        </span>
                        <p className="text-[10px] text-slate-400 max-w-56">
                          Live system alerts, course completions, and live sessions will appear here.
                        </p>
                      </div>
                    ) : (
                      filteredNotifications.map((n) => {
                        const isLearning = n.type === 'course' || n.type === 'assignment' || n.type === 'live_class' || n.type === 'certificate';
                        const isLiveClass = n.type === 'live_class';
                        const isAchievement = n.type === 'achievement';
                        const isAssignment = n.type === 'assignment';

                        return (
                          <div
                            key={n.id}
                            className={`p-3 rounded-xl text-xs space-y-2 border transition-all duration-200 relative group ${
                              n.read
                                ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-400'
                                : 'bg-linear-to-r from-blue-50/80 via-indigo-50/40 to-cyan-50/60 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-cyan-950/30 border-blue-200/90 dark:border-blue-800/60 text-slate-900 dark:text-zinc-100 shadow-xs'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Icon Box */}
                              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-xs ${
                                isLiveClass
                                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                  : isAchievement
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                  : isAssignment
                                  ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                                  : isLearning
                                  ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                  : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                              }`}>
                                {isLiveClass ? (
                                  <Video className="w-4 h-4" />
                                ) : isAchievement ? (
                                  <Trophy className="w-4 h-4" />
                                ) : isAssignment ? (
                                  <Terminal className="w-4 h-4" />
                                ) : isLearning ? (
                                  <BookOpen className="w-4 h-4" />
                                ) : (
                                  <Sparkles className="w-4 h-4" />
                                )}
                              </div>

                              {/* Title & Desc */}
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    onClick={() => handleMarkSingleRead(n.id, n.link)}
                                    className="font-bold text-xs text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-cyan-400 truncate flex items-center gap-1.5"
                                  >
                                    {!n.read && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 shrink-0 animate-pulse" />
                                    )}
                                    <span>{n.title}</span>
                                  </span>

                                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                    {n.time}
                                  </span>
                                </div>

                                <p
                                  onClick={() => handleMarkSingleRead(n.id, n.link)}
                                  className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed cursor-pointer"
                                >
                                  {n.desc}
                                </p>

                                {/* Bottom Action Strip */}
                                <div className="flex items-center justify-between pt-1">
                                  {n.link ? (
                                    <button
                                      onClick={() => handleMarkSingleRead(n.id, n.link)}
                                      className="text-[10.5px] font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>View details</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                  ) : (
                                    <div />
                                  )}

                                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleRead(n.id);
                                      }}
                                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                        n.read
                                          ? 'text-slate-400 hover:text-blue-600 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                                          : 'text-blue-600 dark:text-cyan-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                                      }`}
                                      title={n.read ? 'Mark as unread' : 'Mark as read'}
                                    >
                                      <CheckCheck className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSingle(n.id);
                                      }}
                                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                      title="Delete notification"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 py-1 px-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/70 dark:border-zinc-700 transition-all cursor-pointer"
              >
                {userProfile?.photoURL || user?.photoURL ? (
                  <img
                    src={userProfile?.photoURL || user?.photoURL || ''}
                    alt={userProfile?.name || 'User'}
                    className="w-6 h-6 rounded-full object-cover border border-indigo-200 dark:border-indigo-800"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    {(userProfile?.name || user?.displayName || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline font-semibold text-xs text-slate-800 dark:text-zinc-200 truncate max-w-24">
                  {userProfile?.name || user?.displayName || 'Student'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800">
                    <span className="block font-bold text-xs text-slate-900 dark:text-zinc-100 truncate">
                      {userProfile?.name || user?.displayName || 'Student User'}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-zinc-500 truncate">
                      {userProfile?.email || user?.email}
                    </span>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </Link>
                  <button
                    onClick={handleSignOutClick}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-6 sm:pt-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Sign Out Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        userName={userProfile?.name || user?.displayName || userProfile?.fullName || 'User'}
        userEmail={userProfile?.email || user?.email || undefined}
        userRole={userProfile?.role || 'student'}
        userAvatar={userProfile?.photoURL || user?.photoURL || undefined}
        onConfirm={handleConfirmSignOut}
        onCancel={() => setLogoutModalOpen(false)}
        isProcessing={isLoggingOut}
      />
    </div>
  );
};
