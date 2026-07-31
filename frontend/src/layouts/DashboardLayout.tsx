import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  FileText,
  Calendar,
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
  Activity,
  MessageSquare,
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

  // Subscribe to Real-Time Notifications
  useEffect(() => {
    const unsubscribe = notificationService.subscribeToNotifications(user?.uid, (items) => {
      setNotifications(items);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    toast.success('All notifications marked as read.');
  };

  const handleToggleRead = async (id: string) => {
    await notificationService.toggleRead(id);
  };

  const handleDeleteSingle = async (id: string) => {
    await notificationService.deleteNotification(id);
    toast.info('Notification deleted.');
  };

  const handleMarkSingleRead = async (id: string, link?: string) => {
    await notificationService.markAsRead(id);
    if (link) {
      navigate(link);
      setNotificationsOpen(false);
    }
  };

  const handleClearAll = async () => {
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
    { name: 'Content Management', href: '/admin/content-management', icon: FileText },
  ];

  const studentNavSections = [
    {
      title: 'LEARNING HUB',
      items: [
        { name: 'Overview Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Courses Catalog', href: '/dashboard/courses', icon: BookOpen },
        { name: 'Continue Learning Hub', href: '/dashboard?tab=continue-learning', icon: PlayCircle },
        { name: 'Practice Sandbox', href: '/dashboard/practice-lab', icon: Code2 },
        { name: 'AI Assessment Center', href: '/dashboard?tab=ai-quizzes', icon: Brain },
      ]
    },
    {
      title: 'PROGRESS & GRADES',
      items: [
        { name: 'Quiz Scores', href: '/dashboard?tab=assignments', icon: FileText },
        { name: 'Deadlines Calendar', href: '/dashboard?tab=calendar', icon: Calendar },
        { name: 'Unlocked Credentials', href: '/dashboard?tab=certificates', icon: Award },
        { name: 'Achievements & Badges', href: '/dashboard?tab=achievements', icon: Trophy },
        { name: 'Cohort Leaderboard', href: '/dashboard?tab=leaderboard', icon: BarChart3 },
        { name: 'Learning Analytics', href: '/dashboard?tab=analytics', icon: Activity },
        { name: 'Discussion Center', href: '/dashboard?tab=discussions', icon: MessageSquare },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 z-50 flex flex-col justify-between transition-all duration-300 border-r border-slate-200 dark:border-zinc-800 shadow-xs lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
            <BrandLogo size="sm" showSubtitle={true} className="shrink-0" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dynamic Account Badge */}
          <div className="px-4 py-2.5 border-b border-slate-100 shrink-0">
            <div className="bg-sky-50/80 px-3 py-1.5 rounded-xl flex items-center justify-between text-xs border border-sky-200/80">
              <span className="text-[10px] font-extrabold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <span>{(userProfile?.role || 'student').toUpperCase()} PORTAL</span>
              </span>
              <span className="text-[9px] text-sky-600 font-extrabold bg-white px-2 py-0.5 rounded-md border border-sky-200">
                Active
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 overflow-y-auto flex-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
            {isAdminRoute ? (
              <div className="space-y-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20'
                          : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              studentNavSections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </div>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      (item.href === '/dashboard' && (location.pathname === '/dashboard' && (location.search === '' || location.search === '?tab=overview'))) ||
                      (item.href.includes('?') && location.search === item.href.substring(item.href.indexOf('?'))) ||
                      (location.pathname === item.href && !item.href.includes('?'));

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                            : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))
            )}
          </nav>
        </div>

        {/* User Footer Profile Pill */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {userProfile?.photoURL || user?.photoURL ? (
                <img
                  src={userProfile?.photoURL || user?.photoURL || ''}
                  alt={userProfile?.name || 'User'}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-linear-to-r from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {(userProfile?.name || user?.displayName || 'S').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-slate-900 block truncate">
                  {userProfile?.name || user?.displayName || 'Student User'}
                </span>
                <span className="text-sky-700 block text-[10px] font-semibold capitalize truncate">
                  {userProfile?.role || 'student'} Account
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-zinc-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors duration-300">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Top-Left Brand Logo */}
            <div className="lg:hidden shrink-0 flex items-center">
              <BrandLogo size="sm" showSubtitle={false} />
            </div>

            {/* Global Search Bar */}
            <div className="relative w-48 sm:w-72 lg:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search AI modules, quizzes, assignments..."
                className="w-full bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl py-1.5 pl-9 pr-4 text-xs dark:text-zinc-100 focus:outline-hidden font-medium"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {/* Real-Time Notifications Dropdown Popover */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-600 hover:text-blue-600 rounded-xl hover:bg-slate-100 relative transition-colors cursor-pointer"
                title="Real-Time Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-extrabold font-mono ring-2 ring-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-xs text-slate-900">
                        Notifications ({notifications.length})
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
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
                        title="Clear all notifications"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs font-medium">
                        No notifications at this time.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-2xl text-xs space-y-1 border transition-all relative group ${
                            n.read
                              ? 'bg-slate-50 border-slate-200/60 text-slate-600 opacity-80'
                              : 'bg-blue-50/60 border-blue-200/80 text-slate-900 font-medium shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold gap-2">
                            <span
                              onClick={() => handleMarkSingleRead(n.id, n.link)}
                              className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 min-w-0"
                            >
                              {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 animate-pulse" />}
                              <span className="truncate max-w-44 sm:max-w-56">{n.title}</span>
                            </span>

                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] text-slate-400 font-mono font-normal mr-1">{n.time}</span>
                              
                              {/* Mark as Read / Toggle Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleRead(n.id);
                                }}
                                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                  n.read
                                    ? 'text-slate-400 hover:text-blue-600 hover:bg-white'
                                    : 'text-blue-600 hover:bg-blue-100'
                                }`}
                                title={n.read ? 'Mark as Unread' : 'Mark as Read'}
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Notification Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSingle(n.id);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Notification"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p
                            onClick={() => handleMarkSingleRead(n.id, n.link)}
                            className="text-slate-600 text-[11px] leading-relaxed cursor-pointer"
                          >
                            {n.desc}
                          </p>

                          {n.link && (
                            <div
                              onClick={() => handleMarkSingleRead(n.id, n.link)}
                              className="text-[10px] text-blue-600 font-bold flex items-center gap-1 pt-0.5 cursor-pointer hover:underline"
                            >
                              <span>Open Target</span>
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

            {/* Profile Dropdown Badge */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 border border-slate-200/60 transition-all cursor-pointer"
              >
                {userProfile?.photoURL || user?.photoURL ? (
                  <img
                    src={userProfile?.photoURL || user?.photoURL || ''}
                    alt={userProfile?.name || 'User'}
                    className="w-7 h-7 rounded-full object-cover border border-sky-300"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-linear-to-r from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {(userProfile?.name || user?.displayName || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline font-bold text-xs text-slate-800 truncate max-w-28">
                  {userProfile?.name || user?.displayName || 'Student User'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <span className="block font-bold text-xs text-slate-900 truncate">
                      {userProfile?.name || user?.displayName || 'Student User'}
                    </span>
                    <span className="block text-[10px] text-slate-500 truncate">
                      {userProfile?.email || user?.email}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
