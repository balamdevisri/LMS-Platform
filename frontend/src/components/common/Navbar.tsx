import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, User, LogOut, Settings, ChevronDown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState(window.location.hash);
  const [activePath, setActivePath] = useState(window.location.pathname);

  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let scrollTimeout: any = null;
    const handleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        setIsScrolled(window.scrollY > 20);

        // Scroll spy logic to highlight section names dynamically
        const sections = ['courses', 'features', 'pricing', 'about', 'contact'];
        let currentSection = '';
        
        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 180 && rect.bottom >= 180) {
              currentSection = `#${section}`;
              break;
            }
          }
        }
        
        if (currentSection) {
          setActiveHash(currentSection);
        } else if (window.scrollY < 200) {
          setActiveHash('');
        }
        scrollTimeout = null;
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  // Sync hash change
  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
      setActivePath(window.location.pathname);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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

  interface NavItem {
    name: string;
    href: string;
    badge?: boolean;
  }

  // Role-based Navigation Links
  const getNavLinks = (): NavItem[] => {
    if (!user || !userProfile) {
      return [
        { name: 'Home', href: '/' },
        { name: 'Courses', href: '/#courses' },
        { name: 'Features', href: '/#features' },
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

    return [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Courses', href: '/#courses' },
      { name: 'Profile', href: '/dashboard' },
    ];
  };

  const navLinks = getNavLinks();

  const isLinkActive = (href: string) => {
    if (href.startsWith('/#')) {
      const linkHash = href.substring(1);
      return activeHash === linkHash || (activeHash === '' && linkHash === '#home');
    }
    if (href === '/' && activePath === '/' && activeHash === '') return true;
    return activePath === href;
  };

  const avatarUrl = userProfile?.photoURL || user?.photoURL || undefined;
  const userInitial = userProfile?.name?.charAt(0).toUpperCase() || user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'S';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4 pointer-events-none font-['Sora']">
      <div
        className={`mx-auto max-w-7xl h-16 sm:h-18 flex items-center justify-between px-3.5 sm:px-6 rounded-[18px] backdrop-blur-xl transition-all duration-300 pointer-events-auto border ${
          isScrolled
            ? 'bg-white/78 border-[#E6EEF9]/80 shadow-[0_8px_30px_rgba(59,130,246,0.06)] dark:bg-[#0E1325]/78 dark:border-slate-800/80 dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
            : 'bg-white/60 border-slate-100/60 shadow-xs dark:bg-[#0E1325]/60 dark:border-zinc-800/60'
        }`}
      >
        {/* Brand Logo */}
        <BrandLogo size="md" showSubtitle={true} />

        {/* Center Navigation Links */}
        <nav className="hidden xl:flex items-center space-x-1 bg-slate-100/50 dark:bg-zinc-900/40 p-1 rounded-full border border-slate-100 dark:border-zinc-800/80 backdrop-blur-md">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <a
                key={link.name}
                href={link.href}
                className={`relative px-4 py-1.5 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 rounded-full ${
                  active
                    ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-zinc-900/40'
                }`}
              >
                {link.badge && <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />}
                <span>{link.name}</span>
                {active && (
                  <motion.span
                    layoutId="navActiveDot"
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right Action / User Menu Area */}
        <div className="hidden lg:flex items-center space-x-3">
          <ThemeToggle />
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3.5 bg-white/90 dark:bg-zinc-900/90 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full transition-all cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={userProfile?.name || 'Student'}
                      className="w-8 h-8 rounded-full object-cover border-2 border-blue-400 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-xs border border-blue-300 shadow-xs shrink-0">
                      {userInitial}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
                </div>

                <div className="text-left hidden xl:block">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                    {userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'Student User'}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                    {userProfile?.role || 'Student'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2.5 w-60 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-[#E6EEF9] dark:border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1"
                  >
                    <div className="p-3 border-b border-slate-100 dark:border-zinc-800 mb-1 flex items-center gap-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={userProfile?.name || 'Student'}
                          className="w-10 h-10 rounded-full object-cover border-2 border-blue-400 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-sm border border-blue-300 shrink-0">
                          {userInitial}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          {userProfile?.name || user?.displayName || 'Student User'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate font-medium">
                          {user.email}
                        </span>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase border border-blue-100 dark:border-blue-900">
                          {userProfile?.role || 'STUDENT'}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={userProfile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4 text-blue-500" />
                      <span>My Student Dashboard</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4 text-blue-500" />
                      <span>Account Settings</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-955/40 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-2xs transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-103 flex items-center gap-1.5"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex xl:hidden items-center pointer-events-auto">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 dark:text-zinc-300 hover:text-blue-600 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-white/95 dark:bg-[#0E1325]/95 backdrop-blur-2xl border border-slate-100 dark:border-zinc-800 rounded-2xl mx-auto mt-2 max-w-7xl p-4 space-y-3 shadow-2xl pointer-events-auto font-['Sora'] overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 pb-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 text-xs font-bold transition-all rounded-xl flex items-center gap-1.5 border ${
                    isLinkActive(link.href)
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-900/50'
                      : 'text-slate-700 dark:text-zinc-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-zinc-900 border-slate-100 dark:border-zinc-800'
                  }`}
                >
                  {link.badge && <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />}
                  <span>{link.name}</span>
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-col space-y-2">
              <div className="flex items-center justify-between px-1 py-1">
                <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">Theme</span>
                <ThemeToggle />
              </div>
              {!user ? (
                <>
                  <Link
                    to="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-zinc-700 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-xs font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md flex items-center justify-center gap-2"
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
                  className="w-full text-center py-2.5 text-xs font-bold text-rose-600 border border-rose-200 dark:border-rose-950 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
