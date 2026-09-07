import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Menu,
  X,
  ArrowRight,
  User,
  Users,
  LogOut,
  Settings,
  ChevronDown,
  Sun,
  Moon,
  Terminal,
  BookOpen,
  Video,
  ShieldCheck,
  Award,
  Sparkles,
  Map,
  FileText,
  Layers,
  Globe,
  Code2,
  CheckCircle2,
  ChevronRight,
  Database,
  Cpu,
  Trophy,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BrandLogo } from './BrandLogo';
import { LogoutConfirmModal } from './LogoutConfirmModal';

/* ─── Inline ThemeToggle ─────────────────────────────────────────────────── */
const ThemeButton: React.FC = () => {
  const { kqAppearance, setKqAppearance } = useTheme();
  const isNight = kqAppearance === 'night';
  return (
    <button
      type="button"
      onClick={() => setKqAppearance(isNight ? 'day' : 'night')}
      title={isNight ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isNight ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="
        w-9 h-9 flex items-center justify-center rounded-full
        text-slate-500 dark:text-slate-400
        hover:text-slate-900 dark:hover:text-white
        bg-black/[0.04] dark:bg-white/[0.05]
        hover:bg-black/[0.08] dark:hover:bg-white/[0.08]
        border border-black/[0.06] dark:border-white/[0.06]
        transition-all duration-200 cursor-pointer shadow-2xs
        shrink-0
      "
    >
      <AnimatePresence mode="wait" initial={false}>
        {isNight ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -75, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 75, scale: 0.7 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            <Sun className="w-4 h-4" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 75, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -75, scale: 0.7 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            <Moon className="w-4 h-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

/* ─── Exported GradientButton for hero/navbar CTA reuse ────────────────────── */
export const GradientButton: React.FC<{
  to: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}> = ({ to, onClick, className = '', children }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`
      inline-flex items-center justify-center gap-2
      px-5 py-2.5 rounded-xl
      text-white font-bold text-xs
      hover:scale-[1.02] active:scale-[0.98]
      transition-all duration-200
      whitespace-nowrap shrink-0
      group shadow-md shadow-blue-500/20
      ${className}
    `}
    style={{
      background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
    }}
  >
    <span>{children}</span>
    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
  </Link>
);

/* ─── Squarespace-style Mega Menu Data Structure ─────────────────────────── */
interface MegaMenuItem {
  title: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  accentColor?: string;
}

interface MegaMenuCategory {
  category: string;
  items: MegaMenuItem[];
}

interface MegaMenuSection {
  id: string;
  name: string;
  href: string;
  hasDropdown: boolean;
  categories?: MegaMenuCategory[];
  featured?: {
    tag: string;
    title: string;
    desc: string;
    price?: string;
    ctaText: string;
    href: string;
    badge?: string;
  };
}

const SQUARESPACE_MENU_SECTIONS: MegaMenuSection[] = [
  {
    id: 'courses',
    name: 'Courses',
    href: '/#courses',
    hasDropdown: true,
    categories: [
      {
        category: 'CORE TECHNICAL TRACKS',
        items: [
          {
            title: 'Linux Systems & Administration',
            desc: 'Kernel mechanics, systemd services, permissions, and bash automation.',
            href: '/courses/linux-systems-administration-mastery',
            icon: Terminal,
            accentColor: 'text-sky-500',
          },
          {
            title: 'Git & GitHub Mastery',
            desc: 'Branching models, PR workflows, codespaces, and CI/CD pipelines.',
            href: '/courses/git-github-mastery',
            icon: Code2,
            accentColor: 'text-orange-500',
          },
          {
            title: 'Full Stack Web Engineering',
            desc: 'Modern React, Node.js, Express, REST APIs, and responsive architectures.',
            href: '/courses/web-development-mastery',
            icon: Globe,
            accentColor: 'text-blue-500',
          },
          {
            title: 'C Language & Data Structures',
            desc: 'Memory management, pointers, and foundational computer science.',
            href: '/courses/c-programming-mastery',
            icon: Cpu,
            accentColor: 'text-emerald-500',
          },
        ],
      },
      {
        category: 'CLOUD, SYSTEMS & AI',
        items: [
          {
            title: 'Python & AI Foundations',
            desc: 'Object-oriented Python, algorithmic logic, and LLM integrations.',
            href: '/courses/python-mastery',
            icon: Sparkles,
            accentColor: 'text-purple-500',
          },
          {
            title: 'Kubernetes & Cloud Native',
            desc: 'Pod orchestration, ingress controllers, microservices, and deployments.',
            href: '/courses/kubernetes-mastery',
            icon: Layers,
            accentColor: 'text-cyan-500',
          },
          {
            title: 'DBMS & Relational Architecture',
            desc: 'SQL mastery, index tuning, ACID transactions, and schema normalization.',
            href: '/courses/dbms-mastery',
            icon: Database,
            accentColor: 'text-amber-500',
          },
          {
            title: 'Java Enterprise Architecture',
            desc: 'Robust enterprise patterns, JVM tuning, and multi-threading.',
            href: '/courses/java-mastery',
            icon: BookOpen,
            accentColor: 'text-rose-500',
          },
        ],
      },
    ],
    featured: {
      tag: 'POPULAR BUNDLE',
      title: 'Ultra Value 8-Course Pack',
      desc: 'Get full lifetime access to all 8 expert courses, interactive terminal playgrounds, and verified credentials.',
      price: '₹499 (was ₹1,999)',
      ctaText: 'View All Courses',
      href: '/courses',
      badge: 'Save 75%',
    },
  },
  {
    id: 'platform',
    name: 'Platform',
    href: '/#features',
    hasDropdown: true,
    categories: [
      {
        category: 'INTERACTIVE PRACTICE',
        items: [
          {
            title: 'Browser Terminal Playgrounds',
            desc: 'Zero-setup interactive Linux and Git shells executing directly in browser.',
            href: '/dashboard?tab=practice-hub',
            icon: Terminal,
            accentColor: 'text-blue-500',
          },
          {
            title: '24/7 AI Code Companion',
            desc: 'Line-by-line intelligent code explanation, diagnostics, and debugging.',
            href: '/dashboard?tab=ai-tutor',
            icon: Sparkles,
            accentColor: 'text-purple-500',
          },
          {
            title: 'Live Classroom Studios',
            desc: 'Mentor-led interactive classrooms with real-time feedback and collaboration.',
            href: '/dashboard/live-classroom',
            icon: Video,
            accentColor: 'text-cyan-500',
          },
        ],
      },
      {
        category: 'CAREER CREDENTIALS',
        items: [
          {
            title: 'Developer Portfolio Builder',
            desc: 'Custom vanity tech portfolio with auto-imported verified projects.',
            href: '/dashboard?tab=portfolio-builder',
            icon: Globe,
            badge: 'VIP',
            accentColor: 'text-amber-500',
          },
          {
            title: 'Tech Resume Builder',
            desc: 'ATS-optimized software engineering resume creator with PDF export.',
            href: '/dashboard?tab=resume-builder',
            icon: FileText,
            badge: 'VIP',
            accentColor: 'text-amber-500',
          },
          {
            title: 'Cryptographic QR Certificates',
            desc: 'Tamper-proof verifiable digital credentials ready for LinkedIn.',
            href: '/verify-certificate',
            icon: Award,
            accentColor: 'text-emerald-500',
          },
        ],
      },
    ],
    featured: {
      tag: 'HANDS-ON LEARNING',
      title: 'Real-World Terminal Labs',
      desc: 'No local setup required. Code, compile, test, and debug in fully isolated sandboxes directly in your browser.',
      ctaText: 'Explore Practice Hub',
      href: '/dashboard?tab=practice-hub',
    },
  },
  {
    id: 'roadmaps',
    name: 'Roadmaps',
    href: '/#about',
    hasDropdown: true,
    categories: [
      {
        category: 'SPECIALIZATION TRACKS',
        items: [
          {
            title: 'DevOps & Cloud Engineer',
            desc: 'Linux foundations -> Git workflows -> Docker -> Kubernetes -> CI/CD.',
            href: '/dashboard?tab=career-roadmap',
            icon: Map,
            accentColor: 'text-sky-500',
          },
          {
            title: 'Full-Stack Web Architect',
            desc: 'JavaScript & HTML5 -> Modern React -> Node.js APIs -> Databases.',
            href: '/dashboard?tab=career-roadmap',
            icon: Layers,
            accentColor: 'text-indigo-500',
          },
          {
            title: 'Systems & Low-Level Engineer',
            desc: 'C Programming -> OS Architecture -> Memory Management -> Networks.',
            href: '/dashboard?tab=career-roadmap',
            icon: Cpu,
            accentColor: 'text-emerald-500',
          },
        ],
      },
      {
        category: 'SKILL VALIDATION',
        items: [
          {
            title: 'Technical Interview Prep',
            desc: 'Curated algorithmic questions, system design walkthroughs, and mock tests.',
            href: '/dashboard?tab=interview-prep',
            icon: HelpCircle,
            accentColor: 'text-purple-500',
          },
          {
            title: 'Global Skill Leaderboard',
            desc: 'Climb competency tiers, earn XP, and showcase rank among peers.',
            href: '/dashboard/leaderboard',
            icon: Trophy,
            accentColor: 'text-amber-500',
          },
          {
            title: 'Competency Milestone Graphs',
            desc: 'Clear visual tracking of module completions and skills mastered.',
            href: '/dashboard?tab=analytics',
            icon: CheckCircle2,
            accentColor: 'text-teal-500',
          },
        ],
      },
    ],
    featured: {
      tag: 'CAREER BLUEPRINT',
      title: 'Structured Engineering Paths',
      desc: 'Follow practical step-by-step roadmaps curated by senior tech mentors to build job-ready competency.',
      ctaText: 'View Career Roadmaps',
      href: '/dashboard?tab=career-roadmap',
    },
  },
  {
    id: 'pricing',
    name: 'Pricing',
    href: '/#pricing',
    hasDropdown: false,
  },
  {
    id: 'resources',
    name: 'Resources',
    href: '/verify-certificate',
    hasDropdown: true,
    categories: [
      {
        category: 'DEVELOPER RESOURCES',
        items: [
          {
            title: 'SQL Interactive Sandbox',
            desc: 'Experiment with queries and database relations in a live SQL engine.',
            href: '/dashboard?tab=practice-hub',
            icon: Database,
            accentColor: 'text-amber-500',
          },
          {
            title: 'Certificate Verification Portal',
            desc: 'Public cryptographic lookup for all KaizenQ issued certificates.',
            href: '/verify-certificate',
            icon: ShieldCheck,
            accentColor: 'text-emerald-500',
          },
          {
            title: 'Course Syllabi & Curriculum',
            desc: 'Browse lesson structures, quizzes, and learning objectives.',
            href: '/courses',
            icon: BookOpen,
            accentColor: 'text-blue-500',
          },
        ],
      },
      {
        category: 'SUPPORT & POLICIES',
        items: [
          {
            title: 'Student Community & FAQs',
            desc: 'Common questions on course access, billing, and certificates.',
            href: '/#contact',
            icon: HelpCircle,
            accentColor: 'text-indigo-500',
          },
          {
            title: 'Instructor & Mentor Support',
            desc: 'Direct channels to resolve technical and conceptual roadblocks.',
            href: '/#contact',
            icon: Users,
            accentColor: 'text-rose-500',
          },
        ],
      },
    ],
    featured: {
      tag: 'TRUST & CREDENTIALS',
      title: 'Cryptographic QR Verification',
      desc: 'Every certificate comes with a tamper-proof verification ID and cryptographic QR code recognized by hiring managers.',
      ctaText: 'Verify a Certificate',
      href: '/verify-certificate',
    },
  },
];

/* ══════════════════════════════════════════════════════════════════════════════
   SQUARESPACE-STYLE TOP MENU BAR WITH RICH HOVER MEGA DROPDOWN
   ══════════════════════════════════════════════════════════════════════════════ */
export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>('courses');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeHash, setActiveHash] = useState(window.location.hash);
  const [activePath, setActivePath] = useState(window.location.pathname);

  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Scroll listener ───────────────────────────────────────────────────── */
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 40);
          if (window.location.pathname === '/') {
            const sections = ['courses', 'features', 'pricing', 'about', 'contact'];
            let current = '';
            const viewportCenter = window.innerHeight / 3;
            for (const s of sections) {
              const el = document.getElementById(s);
              if (el) {
                const r = el.getBoundingClientRect();
                if (r.top <= viewportCenter && r.bottom >= viewportCenter) {
                  current = `#${s}`;
                  break;
                }
              }
            }
            if (current) setActiveHash(current);
            else if (window.scrollY < 40) setActiveHash('');
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Hash / path sync ──────────────────────────────────────────────────── */
  useEffect(() => {
    const sync = () => {
      setActiveHash(window.location.hash);
      setActivePath(window.location.pathname);
    };
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  /* ── Click outside to close user dropdown ──────────────────────────────── */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* ── Close mobile menu on resize ───────────────────────────────────────── */
  useEffect(() => {
    const h = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  /* ── Mega Menu Hover Handlers with Debounce ────────────────────────────── */
  const handleNavMouseEnter = (sectionId: string, hasDropdown: boolean) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (hasDropdown) {
      setActiveMegaMenu(sectionId);
    } else {
      setActiveMegaMenu(null);
    }
  };

  const handleNavMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 180);
  };

  const handleMegaMenuMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMegaMenuMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 180);
  };

  const handleLogoutClick = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/');
    } catch {
      toast.error('Failed to log out.');
    } finally {
      setIsLoggingOut(false);
      setLogoutModalOpen(false);
    }
  };

  const isLinkActive = (href: string) => {
    if (href.startsWith('/#')) {
      const h = href.substring(1);
      return activePath === '/' && (activeHash === h || (activeHash === '' && h === '#home'));
    }
    if (href === '/' && activePath === '/' && activeHash === '') return true;
    return activePath === href;
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setActiveMegaMenu(null);

    if (href.startsWith('/#')) {
      const id = href.substring(2);
      const scrollTo = () => {
        const el = document.getElementById(id);
        if (el) {
          window.scrollTo({
            top: el.getBoundingClientRect().top + window.pageYOffset - 76,
            behavior: 'smooth',
          });
        }
      };
      if (window.location.pathname === '/') {
        scrollTo();
        setActiveHash(`#${id}`);
        window.history.replaceState(null, '', `/#${id}`);
      } else {
        navigate(`/#${id}`);
        setTimeout(scrollTo, 120);
      }
      return;
    }
    if (href === '/') {
      if (window.location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveHash('');
        window.history.replaceState(null, '', '/');
      } else navigate('/');
      return;
    }
    navigate(href);
  };

  const avatarUrl = userProfile?.photoURL || user?.photoURL || undefined;
  const userInitial =
    userProfile?.name?.[0]?.toUpperCase() ||
    user?.displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    'S';

  const currentMegaSection = useMemo(() => {
    return SQUARESPACE_MENU_SECTIONS.find((s) => s.id === activeMegaMenu);
  }, [activeMegaMenu]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full font-sans transition-all duration-300 border-b backdrop-blur-xl ${
          isScrolled
            ? 'bg-white/95 dark:bg-[#0b0f19]/95 border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-black/5'
            : 'bg-white/90 dark:bg-[#0b0f19]/90 border-slate-200/60 dark:border-slate-800/60'
        }`}
        onMouseLeave={handleNavMouseLeave}
      >
        <div
          className={`w-full max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 transition-all duration-300 ${
            isScrolled ? 'h-16' : 'h-20'
          }`}
        >
          {/* Brand Logo */}
          <BrandLogo size="md" showSubtitle={true} responsive={true} />

          {/* ── Squarespace-Style Clean Top Menu Bar ── */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-2"
            aria-label="Main navigation"
          >
            {SQUARESPACE_MENU_SECTIONS.map((section) => {
              const active = isLinkActive(section.href);
              const isOpen = activeMegaMenu === section.id;

              return (
                <div
                  key={section.id}
                  className="relative"
                  onMouseEnter={() => handleNavMouseEnter(section.id, section.hasDropdown)}
                >
                  <button
                    type="button"
                    onClick={(e) => handleNavClick(e, section.href)}
                    className={`
                      px-4 py-2 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-all duration-200
                      ${
                        isOpen
                          ? 'bg-blue-50 dark:bg-slate-800/90 text-blue-600 dark:text-blue-400 font-extrabold'
                          : active
                          ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <span>{section.name}</span>
                    {section.hasDropdown && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 opacity-60 ${
                          isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400 opacity-100' : ''
                        }`}
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </nav>

          {/* ── Right Actions ── */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-5">
            <ThemeButton />

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer shadow-xs"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="User"
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {userInitial}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* User dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {userProfile?.name || user?.displayName || 'Learner'}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          to={userProfile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-blue-500" />
                          <span>Dashboard Portal</span>
                        </Link>
                        <Link
                          to="/dashboard?tab=settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-400" />
                          <span>Account Settings</span>
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogoutClick}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
                </Link>
                <GradientButton to="/auth/register">
                  Enroll Free
                </GradientButton>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeButton />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── SQUARESPACE MEGA DROPDOWN (EXPANDS ON SCROLLING / HOVERING OVER MENU OPTIONS) ── */}
        <AnimatePresence>
          {activeMegaMenu && currentMegaSection && currentMegaSection.hasDropdown && (
            <motion.div
              key={activeMegaMenu}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={handleMegaMenuMouseEnter}
              onMouseLeave={handleMegaMenuMouseLeave}
              className="w-full bg-white/98 dark:bg-[#0b0f19]/98 backdrop-blur-2xl border-t border-b border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden py-8 px-6 md:px-10"
            >
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Columns: Categorized Options */}
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${
                    currentMegaSection.featured ? 'lg:col-span-8' : 'lg:col-span-12'
                  }`}
                >
                  {currentMegaSection.categories?.map((cat, cIdx) => (
                    <div key={cIdx} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-[10px] font-heading font-black tracking-[0.18em] text-blue-600 dark:text-blue-400 uppercase">
                          {cat.category}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {cat.items.map((item, iIdx) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={iIdx}
                              to={item.href}
                              onClick={(e) => handleNavClick(e, item.href)}
                              className="group flex items-start gap-3.5 p-3 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all duration-200"
                            >
                              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                                <Icon
                                  className={`w-4 h-4 ${
                                    item.accentColor || 'text-slate-600 dark:text-slate-300'
                                  } group-hover:text-white transition-colors`}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {item.title}
                                  </span>
                                  {item.badge && (
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 shadow-xs">
                                      {item.badge}
                                    </span>
                                  )}
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all ml-auto shrink-0" />
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed mt-0.5 font-normal">
                                  {item.desc}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column: Featured Callout Card (Squarespace Highlight) */}
                {currentMegaSection.featured && (
                  <div className="lg:col-span-4 flex flex-col justify-between p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-cyan-500/10 dark:from-blue-950/40 dark:via-slate-900/60 dark:to-cyan-950/30 border border-blue-500/20 dark:border-blue-500/30 relative overflow-hidden group">
                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{currentMegaSection.featured.tag}</span>
                        </span>
                        {currentMegaSection.featured.badge && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            {currentMegaSection.featured.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                        {currentMegaSection.featured.title}
                      </h4>

                      {currentMegaSection.featured.price && (
                        <div className="text-base font-black text-blue-600 dark:text-blue-400">
                          {currentMegaSection.featured.price}
                        </div>
                      )}

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                        {currentMegaSection.featured.desc}
                      </p>
                    </div>

                    <div className="pt-6 relative z-10">
                      <Link
                        to={currentMegaSection.featured.href}
                        onClick={(e) => handleNavClick(e, currentMegaSection.featured!.href)}
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-98"
                      >
                        <span>{currentMegaSection.featured.ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Ambient corner light */}
                    <div className="pointer-events-none absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-blue-500/20 blur-2xl" />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── MOBILE MENU ACCORDION DRAWER ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white dark:bg-[#0b0f19] border-b border-slate-200 dark:border-slate-800 shadow-2xl lg:hidden max-h-[calc(100vh-4rem)] overflow-y-auto px-6 py-6 space-y-6"
          >
            <div className="space-y-3">
              {SQUARESPACE_MENU_SECTIONS.map((section) => {
                const isExpanded = mobileExpandedSection === section.id;
                return (
                  <div
                    key={section.id}
                    className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        if (section.hasDropdown) {
                          setMobileExpandedSection(isExpanded ? null : section.id);
                        } else {
                          handleNavClick(e, section.href);
                        }
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between text-xs font-extrabold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-850"
                    >
                      <span>{section.name}</span>
                      {section.hasDropdown && (
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : ''}`}
                        />
                      )}
                    </button>

                    {section.hasDropdown && isExpanded && (
                      <div className="p-3 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        {section.categories?.flatMap((cat) => cat.items).map((item, idx) => (
                          <Link
                            key={idx}
                            to={item.href}
                            onClick={(e) => handleNavClick(e, item.href)}
                            className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {user ? (
                <div className="space-y-2">
                  <Link
                    to={userProfile?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Dashboard Portal</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center font-bold text-xs text-slate-700 dark:text-slate-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-xl bg-blue-600 text-center font-bold text-xs text-white"
                  >
                    Enroll Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        isProcessing={isLoggingOut}
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        userName={user?.displayName || user?.email?.split('@')[0] || 'User'}
        userEmail={user?.email || undefined}
        userRole={user?.role}
      />
    </>
  );
};

export default Navbar;
