import React, { useState, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  BookOpen,
  Terminal,
  Video,
  Award,
  BarChart3,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  Columns2,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export interface PlatformFeature {
  id: string;
  category: 'ai' | 'courses' | 'practice' | 'live' | 'certificates' | 'analytics';
  categoryLabel: string;
  filterGroup: 'all' | 'ai_code' | 'curricula_live' | 'proof_metrics';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  glowColor: string;
  iconGradient: string;
  borderHover: string;
  badgeBg: string;
  badgeText: string;
  chips: string[];
  route: string;
  ctaText: string;
}

const PLATFORM_FEATURES: PlatformFeature[] = [
  {
    id: 'ai-learning',
    category: 'ai',
    categoryLabel: '24/7 AI MENTOR',
    filterGroup: 'ai_code',
    title: 'AI Learning',
    description:
      '24/7 intelligent assistance explaining code line-by-line and diagnosing conceptual roadblocks.',
    icon: Bot,
    accentColor: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.22)',
    iconGradient: 'from-violet-600 to-indigo-600',
    borderHover: 'hover:border-violet-500/50 dark:hover:border-violet-400/50',
    badgeBg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800/60',
    badgeText: 'text-violet-700 dark:text-violet-300',
    chips: ['Line-by-line explanation', 'Code roadblock diagnostics', 'Context-aware hints'],
    route: '/courses',
    ctaText: 'Experience AI Tutor',
  },
  {
    id: 'structured-courses',
    category: 'courses',
    categoryLabel: 'MODULAR TRACKS',
    filterGroup: 'curricula_live',
    title: 'Structured Courses',
    description:
      'Step-by-step modular curricula covering Linux, Git, Systems, and modern engineering stacks.',
    icon: BookOpen,
    accentColor: '#2563EB',
    glowColor: 'rgba(37, 99, 235, 0.22)',
    iconGradient: 'from-blue-600 to-cyan-500',
    borderHover: 'hover:border-blue-500/50 dark:hover:border-blue-400/50',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60',
    badgeText: 'text-blue-700 dark:text-blue-300',
    chips: ['Linux & Git mastery', 'Systems architecture', 'Progressive learning roadmap'],
    route: '/courses',
    ctaText: 'Browse Curricula',
  },
  {
    id: 'coding-practice',
    category: 'practice',
    categoryLabel: 'HANDS-ON LABS',
    filterGroup: 'ai_code',
    title: 'Coding Practice',
    description:
      'Zero-setup interactive terminal labs and in-browser execution playgrounds for real hands-on practice.',
    icon: Terminal,
    accentColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.22)',
    iconGradient: 'from-emerald-600 to-teal-500',
    borderHover: 'hover:border-emerald-500/50 dark:hover:border-emerald-400/50',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    chips: ['Zero-setup web terminal', 'Instant execution sandbox', 'Real-world CLI scenarios'],
    route: '/courses',
    ctaText: 'Launch Practice Labs',
  },
  {
    id: 'live-classes',
    category: 'live',
    categoryLabel: 'INTERACTIVE SESSIONS',
    filterGroup: 'curricula_live',
    title: 'Live Classes',
    description:
      'Interactive live classrooms and mentor-led sessions with real-time feedback and collaboration.',
    icon: Video,
    accentColor: '#F43F5E',
    glowColor: 'rgba(244, 63, 94, 0.22)',
    iconGradient: 'from-rose-600 to-pink-500',
    borderHover: 'hover:border-rose-500/50 dark:hover:border-rose-400/50',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
    badgeText: 'text-rose-700 dark:text-rose-300',
    chips: ['Live interactive video', 'Mentor Q&A channels', 'Peer collaboration'],
    route: '/live-classes',
    ctaText: 'Join Live Classroom',
  },
  {
    id: 'certificates',
    category: 'certificates',
    categoryLabel: 'VERIFIED CREDENTIALS',
    filterGroup: 'proof_metrics',
    title: 'Certificates',
    description:
      'Tamper-proof digital credentials with cryptographic QR verification ready for LinkedIn and employers.',
    icon: Award,
    accentColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.22)',
    iconGradient: 'from-amber-500 to-yellow-500',
    borderHover: 'hover:border-amber-500/50 dark:hover:border-amber-400/50',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    chips: ['Cryptographic QR verification', 'Shareable on LinkedIn', 'Tamper-proof certificate ID'],
    route: '/courses',
    ctaText: 'View Credentials',
  },
  {
    id: 'learning-analytics',
    category: 'analytics',
    categoryLabel: 'PROGRESS METRICS',
    filterGroup: 'proof_metrics',
    title: 'Learning Analytics',
    description:
      'Visual competency graphs and progress tracking that clearly highlight skill milestones.',
    icon: BarChart3,
    accentColor: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.22)',
    iconGradient: 'from-cyan-600 to-blue-500',
    borderHover: 'hover:border-cyan-500/50 dark:hover:border-cyan-400/50',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/60',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    chips: ['Visual skill graphs', 'XP & daily streaks', 'Milestone completion badges'],
    route: '/courses',
    ctaText: 'Track Your Growth',
  },
];

type FilterType = 'all' | 'ai_code' | 'curricula_live' | 'proof_metrics';
type LayoutMode = 'grid' | 'detailed';

export const SmoothViewTransitionGridCards: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const filterTabs: { id: FilterType; label: string; count: number }[] = useMemo(
    () => [
      { id: 'all', label: 'All Features', count: 6 },
      { id: 'ai_code', label: 'AI & Coding', count: 2 },
      { id: 'curricula_live', label: 'Curricula & Live', count: 2 },
      { id: 'proof_metrics', label: 'Credentials & Analytics', count: 2 },
    ],
    []
  );

  const filteredFeatures = useMemo(() => {
    if (activeFilter === 'all') return PLATFORM_FEATURES;
    return PLATFORM_FEATURES.filter((f) => f.filterGroup === activeFilter);
  }, [activeFilter]);

  return (
    <div className="space-y-10">
      {/* ── View Controls Bar (Category Filters + Grid/Detailed Layout Switcher) ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                    : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Layout Mode Toggle (Grid vs Detailed) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setLayoutMode('grid')}
            title="3-Column Grid View"
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              layoutMode === 'grid'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden md:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode('detailed')}
            title="Detailed Spotlight View"
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              layoutMode === 'detailed'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Columns2 className="w-4 h-4" />
            <span className="hidden md:inline">Spotlight</span>
          </button>
        </div>
      </div>

      {/* ── Smooth View Transition Grid Container ── */}
      <div
        className={`grid transition-all duration-300 ease-out gap-6 ${
          layoutMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2'
        }`}
      >
        {filteredFeatures.map((feature) => {
          const Icon = feature.icon;
          const isSelected = activeCardId === feature.id;

          return (
            <div
              key={feature.id}
              onClick={() => setActiveCardId((prev) => (prev === feature.id ? null : feature.id))}
              className={`view-transition-card group relative rounded-3xl p-7 flex flex-col justify-between overflow-hidden bg-white/95 dark:bg-[#111827]/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 ${feature.borderHover} shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer ${
                isSelected ? 'ring-2 ring-blue-500/50 shadow-lg' : ''
              }`}
            >
              {/* Background ambient radial glow spot */}
              <div
                className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-10 dark:opacity-20 group-hover:opacity-45 transition-opacity duration-500"
                style={{ backgroundColor: feature.accentColor }}
              />

              {/* Card Header & Content */}
              <div className="space-y-4 z-10">
                {/* Top Bar: Icon Medallion & Category Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-2xl p-0.5 shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      boxShadow: `0 8px 20px ${feature.glowColor}`,
                    }}
                  >
                    <div
                      className={`w-full h-full rounded-2xl bg-gradient-to-tr ${feature.iconGradient} flex items-center justify-center text-white`}
                    >
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${feature.badgeBg} ${feature.badgeText}`}
                  >
                    {feature.categoryLabel}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-2 pt-1">
                  <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] dark:text-[#ffffff] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94a3b8] leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>

                {/* Capability Chips (Smooth reveal on Spotlight or hover) */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {feature.chips.map((chip, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{chip}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Card Footer with Smooth Arrow Link */}
              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between z-10">
                <Link
                  to={feature.route}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                >
                  <span>{feature.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <span
                  className="w-2 h-2 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: feature.accentColor }}
                />
              </div>

              {/* Subtle Bottom Glow Line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(to right, transparent, ${feature.accentColor}, transparent)`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(SmoothViewTransitionGridCards);
