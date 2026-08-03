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
  PlayCircle,
  Brain,
  Trophy,
  BarChart3,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { BrandLogo } from '@/components/common/BrandLogo';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, type NotificationItem } from '@/services/notificationService';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
  };

  const isAdminRoute = location.pathname.startsWith('/admin') || userProfile?.role === 'admin';

  const adminNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Students', href: '/admin/students', icon: UserCheck },
    { name: 'Instructors', href: '/admin/instructors', icon: GraduationCap },
    { name: 'Content', href: '/admin/content-management', icon: FileText },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const studentNavSections = [
    {
      title: 'LEARNING',
      accent: 'text-indigo-500 dark:text-indigo-400',
      divider: 'bg-indigo-100 dark:bg-indigo-900/40',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Courses', href: '/dashboard/courses', icon: BookOpen },
        { name: 'Continue Learning', href: '/dashboard?tab=continue-learning', icon: PlayCircle },
        { name: 'AI Tutor', href: '/dashboard?tab=ai-tutor', icon: Brain },
      ],
    },
    {
      title: 'PROGRESS',
      accent: 'text-emerald-600 dark:text-emerald-400',
      divider: 'bg-emerald-100 dark:bg-emerald-900/40',
      items: [
        { name: 'Quiz Results', href: '/dashboard?tab=assignments', icon: FileText },
        { name: 'Certificates', href: '/dashboard?tab=certificates', icon: Award },
        { name: 'Achievements', href: '/dashboard?tab=achievements', icon: Trophy },
      ],
    },
    {
      title: 'ACCOUNT',
      accent: 'text-slate-400 dark:text-zinc-500',
      divider: 'bg-slate-100 dark:bg-zinc-800',
      items: [
        { name: 'Profile', href: '/profile', icon: UserCheck },
        { name: 'Settings', href: '/dashboard?tab=settings', icon: Settings },
      ],
    },
  ];

  const isNavItemActive = (href: string) => {
    if (href === '/dashboard') {
      return (
        location.pathname === '/dashboard' &&
        (location.search === '' || location.search === '?tab=overview')
      );
    }
    if (href.includes('?')) {
      return location.search === href.substring(href.indexOf('?'));
    }
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-300">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-60 bg-white dark:bg-zinc-900 z-50 flex flex-col transition-transform duration-300 border-r border-slate-100 dark:border-zinc-800 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full min-h-0">
          <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 shrink-0">
            <BrandLogo size="sm" showSubtitle={false} className="shrink-0" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest truncate">
                {(userProfile?.role || 'student').toUpperCase()} PORTAL
              </span>
              <span className="ml-auto text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/50 shrink-0">
                Active
              </span>
            </div>
          </div>

          <nav className="px-2.5 py-3 overflow-y-auto flex-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-100 dark:scrollbar-thumb-zinc-800">
            {isAdminRoute ? (
              <div className="space-y-0.5">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-zinc-500'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              studentNavSections.map((section, sIdx) => (
                <div key={sIdx}>
                  <div className="flex items-center gap-2 px-1 mb-1">
                    <span className={`text-[9px] font-extrabold uppercase tracking-widest leading-none ${section.accent}`}>
                      {section.title}
                    </span>
                    <div className={`flex-1 h-px ${section.divider}`} />
                  </div>

                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = isNavItemActive(item.href);
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/70 hover:text-slate-900 dark:hover:text-zinc-100'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive
                                ? 'text-indigo-200'
                                : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300'
                            }`}
                          />
                          <span className="truncate flex-1">{item.name}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </nav>
        </div>

        <div className="px-2.5 py-3 border-t border-slate-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors group">
            {userProfile?.photoURL || user?.photoURL ? (
              <img
                src={userProfile?.photoURL || user?.photoURL || ''}
                alt={userProfile?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-zinc-700 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {(userProfile?.name || user?.displayName || 'S').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 block truncate leading-tight">
                {userProfile?.name || user?.displayName || 'Student User'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 capitalize block truncate">
                {userProfile?.role || 'student'}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-slate-300 dark:text-zinc-600 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-60 flex-1 flex flex-col">
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
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-zinc-100">
                        Notifications ({notifications.length})
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                          {unreadCount} New
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCheck className="w-3 h-3" /> Mark read
                        </button>
                      )}
                      <button
                        onClick={handleClearAll}
                        className="text-[11px] text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer"
                        title="Clear all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs font-medium">
                        No notifications.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl text-xs space-y-1 border transition-all ${
                            n.read
                              ? 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200/60 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 opacity-80'
                              : 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-800/40 text-slate-900 dark:text-zinc-100 font-medium'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold gap-2">
                            <span
                              onClick={() => handleMarkSingleRead(n.id, n.link)}
                              className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 min-w-0"
                            >
                              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 animate-pulse" />}
                              <span className="truncate max-w-44 sm:max-w-56">{n.title}</span>
                            </span>

                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] text-slate-400 font-mono font-normal mr-1">{n.time}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleToggleRead(n.id); }}
                                className={`p-1 rounded-lg transition-colors cursor-pointer ${n.read ? 'text-slate-400 hover:text-blue-600' : 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'}`}
                                title={n.read ? 'Mark as Unread' : 'Mark as Read'}
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteSingle(n.id); }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p
                            onClick={() => handleMarkSingleRead(n.id, n.link)}
                            className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed cursor-pointer"
                          >
                            {n.desc}
                          </p>

                          {n.link && (
                            <div
                              onClick={() => handleMarkSingleRead(n.id, n.link)}
                              className="text-[10px] text-blue-600 font-bold flex items-center gap-1 pt-0.5 cursor-pointer hover:underline"
                            >
                              <span>Open</span>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      ))
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
                    onClick={handleSignOut}
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
    </div>
  );
};
