import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, User, LogOut, Settings, ChevronDown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { BrandLogo } from './BrandLogo';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
      setUserMenuOpen(false);
      navigate('/');
    } catch (err) {
      toast.error('Failed to log out.');
    }
  };

  // Role-based Navigation Links
  const getNavLinks = () => {
    if (!user || !userProfile) {
      return [
        { name: 'Home', href: '/' },
        { name: 'Courses', href: '/#courses' },
        { name: 'Features', href: '/#features' },
        { name: 'AI Tutor', href: '/#ai-overview', badge: true },
        { name: 'Pricing', href: '/#pricing' },
        { name: 'About', href: '/#about' },
        { name: 'Contact', href: '/#contact' },
      ];
    }

    if (userProfile.role === 'admin') {
      return [
        { name: 'Dashboard', href: '/admin/dashboard' },
        { name: 'Users', href: '/admin/users' },
        { name: 'Courses', href: '/#courses' },
        { name: 'Students', href: '/admin/students' },
        { name: 'Instructors', href: '/admin/instructors' },
      ];
    }

    // Default Student Links
    return [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Courses', href: '/#courses' },
      { name: 'AI Tutor', href: '/#ai-overview', badge: true },
      { name: 'Profile', href: '/dashboard' },
    ];
  };

  const navLinks = getNavLinks();

  const avatarUrl = userProfile?.photoURL || user?.photoURL || undefined;
  const userInitial = userProfile?.name?.charAt(0).toUpperCase() || user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'S';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-['Sora'] ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-sky-100 py-3 shadow-md shadow-sky-500/5'
          : 'bg-white/70 backdrop-blur-md py-4 border-b border-sky-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <BrandLogo size="md" showSubtitle={true} />

          {/* Center Navigation Links (White & Sky Blue Glass Container) */}
          <nav className="hidden xl:flex items-center space-x-1 bg-sky-50/80 p-1.5 rounded-full border border-sky-100/80 backdrop-blur-md">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-sky-600 hover:bg-white rounded-full transition-all flex items-center gap-1.5 shadow-none hover:shadow-xs"
              >
                {link.badge && <Sparkles className="w-3 h-3 text-sky-500 animate-pulse" />}
                <span>{link.name}</span>
              </a>
            ))}
          </nav>

          {/* Right Action / User Menu Area */}
          <div className="hidden lg:flex items-center space-x-2.5">
            {user ? (
              <div className="relative" ref={menuRef}>
                {/* User Avatar Dropdown Trigger Button */}
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3.5 bg-white/90 hover:bg-sky-50/90 border border-sky-200/80 hover:border-sky-300 rounded-full transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div className="relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={userProfile?.name || 'Student'}
                        className="w-8 h-8 rounded-full object-cover border-2 border-sky-400 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-linear-to-tr from-sky-600 via-sky-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs border border-sky-300 shadow-xs shrink-0">
                        {userInitial}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
                  </div>

                  <div className="text-left hidden xl:block">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'Student User'}
                    </span>
                    <span className="text-[10px] font-semibold text-sky-600 uppercase tracking-wider block">
                      {userProfile?.role || 'Student'}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-2xl border border-sky-100 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in slide-in-from-top-2 font-['Sora']">
                    <div className="p-3 border-b border-sky-100 mb-1 flex items-center gap-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={userProfile?.name || 'Student'}
                          className="w-10 h-10 rounded-full object-cover border-2 border-sky-400 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm border border-sky-300 shrink-0">
                          {userInitial}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {userProfile?.name || user?.displayName || 'Student User'}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate font-medium">
                          {user.email}
                        </span>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[9px] font-bold uppercase border border-sky-200">
                          {userProfile?.role || 'STUDENT'}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={userProfile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4 text-sky-500" />
                      <span>My Student Dashboard</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4 text-sky-500" />
                      <span>Account Settings</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-xs font-bold text-slate-800 hover:text-sky-600 border border-sky-200/80 rounded-xl bg-white hover:bg-sky-50 shadow-xs transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 rounded-xl bg-linear-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all hover:scale-103 flex items-center gap-1.5"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex xl:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-sky-600 rounded-xl hover:bg-sky-50 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/95 backdrop-blur-2xl border-b border-sky-100 px-4 pt-3 pb-6 space-y-2 shadow-2xl font-['Sora']">
          <div className="grid grid-cols-2 gap-1.5 pb-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:text-sky-600 hover:bg-sky-50 rounded-xl flex items-center gap-1.5 border border-sky-100"
              >
                {link.badge && <Sparkles className="w-3 h-3 text-sky-500 animate-pulse" />}
                <span>{link.name}</span>
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-sky-100 flex flex-col space-y-2">
            {!user ? (
              <>
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold text-slate-800 border border-sky-200 rounded-xl hover:bg-sky-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold text-white bg-linear-to-r from-sky-600 to-sky-500 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-center py-2.5 text-xs font-bold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
