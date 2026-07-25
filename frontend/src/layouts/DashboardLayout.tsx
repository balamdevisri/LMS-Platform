import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Calendar,
  Award,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  UserCheck,
  GraduationCap,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';


export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, userProfile, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
  };

  const isAdminRoute = location.pathname.startsWith('/admin') || userProfile?.role === 'admin';

  const navItems = isAdminRoute
    ? [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'User Management', href: '/admin/users', icon: UserCheck },
        { name: 'Courses', href: '/admin/courses', icon: BookOpen },
        { name: 'Students', href: '/admin/students', icon: UserCheck },
        { name: 'Instructors', href: '/admin/instructors', icon: GraduationCap },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Courses Catalog', href: '/dashboard/courses', icon: BookOpen },
        { name: 'Assignments & Quizzes', href: '/dashboard?tab=assignments', icon: FileText },
        { name: 'Schedule & Calendar', href: '/dashboard?tab=calendar', icon: Calendar },
        { name: 'Certificates', href: '/dashboard?tab=certificates', icon: Award },
      ];

  const sampleNotifications = [
    { id: 1, title: 'AI Quiz Released', desc: 'Module 4: Vector Embeddings score is 98/100', time: '10m ago' },
    { id: 2, title: 'Upcoming Deadline', desc: 'GraphQL Architecture Assignment due in 24h', time: '1h ago' },
    { id: 3, title: 'Certificate Issued', desc: 'Fullstack Systems Engineering Certificate ready', time: '1d ago' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar - White Light Theme */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white text-slate-600 z-50 flex flex-col justify-between transition-transform duration-300 border-r border-slate-200 shadow-xs lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
            <BrandLogo size="sm" showSubtitle={true} />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-500 hover:text-slate-900 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dynamic Account Badge */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="bg-sky-50/80 px-3 py-2 rounded-xl flex items-center justify-between text-xs border border-sky-200/80">
              <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <span>{(userProfile?.role || 'student').toUpperCase()} PORTAL</span>
              </span>
              <span className="text-[10px] text-sky-600 font-semibold bg-white px-2 py-0.5 rounded-md border border-sky-200">
                Active
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.href ||
                (item.href.includes('?') && location.search === item.href.substring(item.href.indexOf('?')));

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Info */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {userProfile?.photoURL || user?.photoURL ? (
                <img
                  src={userProfile?.photoURL || user?.photoURL || ''}
                  alt={userProfile?.name || 'User Avatar'}
                  className="w-8 h-8 rounded-full object-cover border border-sky-400 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 border border-sky-300">
                  {(userProfile?.name || user?.displayName || 'S').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-xs overflow-hidden min-w-0">
                <span className="font-bold text-slate-900 block truncate">
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
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar */}
            <div className="relative w-48 sm:w-72 lg:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search AI modules, quizzes, assignments..."
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-600 hover:text-blue-600 rounded-xl hover:bg-slate-100 relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white animate-pulse" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="font-heading font-semibold text-xs text-slate-900">Notifications (3)</span>
                    <button className="text-[11px] text-blue-600 hover:underline font-medium">Mark all read</button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {sampleNotifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 text-xs space-y-0.5 border border-slate-200/60">
                        <div className="flex items-center justify-between font-semibold text-slate-900">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{n.time}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {userProfile?.photoURL || user?.photoURL ? (
                  <img
                    src={userProfile?.photoURL || user?.photoURL || ''}
                    alt={userProfile?.name || 'User Avatar'}
                    className="w-8 h-8 rounded-full object-cover border-2 border-sky-500 shadow-xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-sky-500 to-blue-600 text-white font-extrabold text-xs flex items-center justify-center border-2 border-sky-400 shadow-xs">
                    {(userProfile?.name || user?.displayName || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline-block font-heading font-semibold text-xs text-slate-900 max-w-30 truncate">
                  {userProfile?.name || user?.displayName || (isAdminRoute ? 'Administrator' : 'Student User')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-heading font-semibold text-xs text-slate-900 truncate">
                      {userProfile?.name || user?.displayName || 'Student User'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {userProfile?.email || user?.email || 'student@shaivika.ai'}
                    </p>
                    {userProfile?.githubUsername && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-medium">
                        @{userProfile.githubUsername}
                      </span>
                    )}
                  </div>
                  {!isAdminRoute ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" /> Student Profile
                      </Link>
                      <Link
                        to="/dashboard?tab=certificates"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors"
                      >
                        <Award className="w-4 h-4 text-slate-400" /> My Certificates
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-sky-700 font-bold hover:bg-sky-50 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4 text-sky-600" /> Admin Control Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleSignOut();
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
