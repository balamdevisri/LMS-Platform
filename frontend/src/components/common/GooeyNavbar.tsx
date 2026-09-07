import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Video,
  Terminal,
  Trophy,
  Map,
  Award,
  HelpCircle,
  Settings,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  LayoutDashboard,
  UserCheck,
  GraduationCap,
  BarChart3,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BrandLogo } from './BrandLogo';

interface GooeyNavbarProps {
  onSignOutClick?: () => void;
  className?: string;
}

interface NavItemDef {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isPremium?: boolean;
}

export const GooeyNavbar: React.FC<GooeyNavbarProps> = ({
  onSignOutClick,
  className = '',
}) => {
  const location = useLocation();
  const { userProfile } = useAuth();
  const { kqAppearance, setKqAppearance } = useTheme();
  const isNight = kqAppearance === 'night';
  const role = userProfile?.role || 'student';

  // Navigation items based on role (preserving all LMS routes)
  const navItems: NavItemDef[] = useMemo(() => {
    if (role === 'admin') {
      return [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Courses', href: '/admin/courses', icon: BookOpen },
        { name: 'Content', href: '/admin/course-content', icon: FileText },
        { name: 'Live Classes', href: '/admin/live-classes', icon: Video },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { name: 'Students', href: '/admin/students', icon: UserCheck },
        { name: 'Instructors', href: '/admin/instructors', icon: GraduationCap },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ];
    }
    if (role === 'instructor') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Courses', href: '/admin/courses', icon: BookOpen },
        { name: 'Live Classes', href: '/admin/live-classes', icon: Video },
        { name: 'Students', href: '/admin/students', icon: UserCheck },
        { name: 'Analytics', href: '/admin/live-classroom/mentor-analytics', icon: BarChart3 },
        { name: 'Settings', href: '/dashboard?tab=settings', icon: Settings },
      ];
    }
    // Student default
    return [
      { name: 'Home', href: '/dashboard', icon: Home },
      { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
      { name: 'Live Class', href: '/dashboard/live-classroom', icon: Video },
      { name: 'Practice Hub', href: '/dashboard?tab=practice-hub', icon: Terminal },
      { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
      { name: 'Roadmap', href: '/dashboard?tab=career-roadmap', icon: Map },
      { name: 'Certificates', href: '/dashboard?tab=certificates', icon: Award },
      { name: 'Interview Prep', href: '/dashboard?tab=interview-prep', icon: HelpCircle },
      { name: 'Settings', href: '/dashboard?tab=settings', icon: Settings },
    ];
  }, [role]);

  // Check if item is active
  const isItemActive = (href: string) => {
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

  const activeIndex = useMemo(() => {
    const idx = navItems.findIndex((item) => isItemActive(item.href));
    return idx >= 0 ? idx : 0;
  }, [navItems, location.pathname, location.search]);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isSquashing, setIsSquashing] = useState(false);

  // Target index for the active pill: hover takes precedence, falls back to active route
  const targetIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

  const handleMouseEnterItem = (idx: number) => {
    setHoveredIndex(idx);
    setIsSquashing(true);
    setTimeout(() => setIsSquashing(false), 250);
  };

  const handleMouseLeaveMenu = () => {
    setHoveredIndex(null);
    setIsSquashing(true);
    setTimeout(() => setIsSquashing(false), 250);
  };

  return (
    <nav className={`navbar gooey-navbar ${className}`}>
      {/* ── Top Brand Icon ── */}
      <div className="pt-2 pb-3 flex flex-col items-center shrink-0">
        <Link
          to="/"
          className="relative group p-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-xs"
          title="KaizenQ LMS"
        >
          <Sparkles className="w-5 h-5 fill-current" />
        </Link>
      </div>

      {/* ── Menu List with Sliding Tooltips and Gooey Pill ── */}
      <div className="relative w-full flex-1 flex flex-col justify-center overflow-visible">
        <ul
          className="navbar__menu"
          onMouseLeave={handleMouseLeaveMenu}
        >
          {/* Moving Gooey Active Indicator Pill */}
          <div
            className={`navbar__active-pill ${isSquashing ? 'is-moving' : ''}`}
            style={{
              top: `calc(${targetIndex} * 3.5rem)`,
            }}
          />

          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isItemActive(item.href);

            return (
              <li
                key={item.name}
                className="navbar__item"
                onMouseEnter={() => handleMouseEnterItem(idx)}
              >
                <Link
                  to={item.href}
                  className={`navbar__link ${active ? 'active font-bold text-white' : ''}`}
                >
                  <Icon className="w-5 h-5 relative z-10 transition-transform duration-200 group-hover:scale-110" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Bottom Actions: Theme Toggle & Sign Out ── */}
      <div className="pb-3 pt-2 flex flex-col items-center gap-1 shrink-0 border-t border-slate-100 dark:border-slate-800/80 w-full">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => setKqAppearance(isNight ? 'day' : 'night')}
          className="navbar__link !h-11 !w-11 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title={isNight ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isNight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{isNight ? 'Light Theme' : 'Dark Theme'}</span>
        </button>

        {/* Sign Out */}
        {onSignOutClick && (
          <button
            type="button"
            onClick={onSignOutClick}
            className="navbar__link !h-11 !w-11 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default GooeyNavbar;
