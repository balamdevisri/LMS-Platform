import React, { useState, useRef, useCallback, memo } from 'react';
import {
  BookOpen,
  Terminal,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
  Code2,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface MethodologyPillar {
  step: string;
  stepLabel: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  glowColor: string;
  badgeGradient: string;
  borderHoverColor: string;
  highlights: string[];
  ctaText: string;
  ctaLink: string;
}

const METHODOLOGY_PILLARS: MethodologyPillar[] = [
  {
    step: '01',
    stepLabel: 'STEP 01 • FOUNDATION',
    title: 'Learn',
    description: 'Build a strong foundation through structured learning.',
    icon: BookOpen,
    accentColor: '#2563EB',
    glowColor: 'rgba(37, 99, 235, 0.28)',
    badgeGradient: 'from-blue-600 via-sky-500 to-cyan-400',
    borderHoverColor: 'group-hover:border-blue-500/50 dark:group-hover:border-blue-400/50',
    highlights: [
      'Comprehensive step-by-step tracks',
      'Interactive modular curricula',
      'In-depth concept architecture',
    ],
    ctaText: 'Explore Courses',
    ctaLink: '/courses',
  },
  {
    step: '02',
    stepLabel: 'STEP 02 • APPLICATION',
    title: 'Build',
    description: 'Turn knowledge into practical skills through hands-on practice.',
    icon: Terminal,
    accentColor: '#7C3AED',
    glowColor: 'rgba(124, 58, 237, 0.28)',
    badgeGradient: 'from-indigo-600 via-violet-500 to-purple-500',
    borderHoverColor: 'group-hover:border-indigo-500/50 dark:group-hover:border-indigo-400/50',
    highlights: [
      'Zero-setup Linux & Git terminals',
      'Hands-on problem solving labs',
      'Interactive sandbox environments',
    ],
    ctaText: 'Start Practicing',
    ctaLink: '/courses',
  },
  {
    step: '03',
    stepLabel: 'STEP 03 • MASTERY',
    title: 'Evolve',
    description: 'Continuously improve your skills and achieve your goals.',
    icon: TrendingUp,
    accentColor: '#F97316',
    glowColor: 'rgba(249, 115, 22, 0.28)',
    badgeGradient: 'from-rose-500 via-orange-500 to-amber-400',
    borderHoverColor: 'group-hover:border-orange-500/50 dark:group-hover:border-amber-400/50',
    highlights: [
      'Cryptographic QR verified credentials',
      'Weekly cohort leaderboard benchmarks',
      'Career portfolio & roadmap growth',
    ],
    ctaText: 'View Career Tracks',
    ctaLink: '/courses',
  },
];

interface ParallaxPillarCardProps {
  pillar: MethodologyPillar;
  index: number;
}

const ParallaxPillarCard: React.FC<ParallaxPillarCardProps> = ({ pillar }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>('');
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Tilt calculations (-1 to 1)
    const rotateXValue = ((y - centerY) / centerY) * -11; // max 11 deg tilt
    const rotateYValue = ((x - centerX) / centerX) * 11;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateXValue.toFixed(2)}deg) rotateY(${rotateYValue.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`
    );

    // Glare position calculation
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlareStyle({
      opacity: 0.16,
      background: `radial-gradient(circle 240px at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.85), transparent 70%)`,
    });
    setIsResetting(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setIsResetting(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsResetting(true);
    setTransformStyle(
      'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    );
    setGlareStyle({ opacity: 0 });
  }, []);

  const Icon = pillar.icon;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="perspective-container relative group h-full select-none"
    >
      {/* 3D Depth Card Body */}
      <div
        style={{
          transform: transformStyle || 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        }}
        className={`parallax-card-wrapper ${isResetting ? 'is-resetting' : ''} relative h-full rounded-3xl p-8 sm:p-9 flex flex-col justify-between overflow-hidden bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 ${pillar.borderHoverColor} shadow-md transition-all duration-300`}
      >
        {/* Specular Glare Overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-40 rounded-3xl transition-opacity duration-300"
          style={glareStyle}
        />

        {/* Dynamic Glowing Ambient Light behind the Card */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl opacity-20 dark:opacity-30 group-hover:opacity-60 transition-opacity duration-500"
          style={{ backgroundColor: pillar.accentColor }}
        />

        {/* ── LAYER 1: Background Watermark Step Number (translateZ 16px) ── */}
        <div className="layer-depth-watermark absolute top-4 right-6 pointer-events-none select-none">
          <span className="font-black text-7xl sm:text-8xl tracking-tighter text-slate-100 dark:text-slate-800/60 font-heading">
            {pillar.step}
          </span>
        </div>

        {/* ── TOP SECTION: Floating Badge & Step Label ── */}
        <div className="space-y-6 z-10">
          <div className="flex items-center justify-between">
            {/* ── LAYER 2: 3D Pop-Out Icon Orb (translateZ 48px) ── */}
            <div
              className="layer-depth-popout relative w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-br shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{
                boxShadow: isHovered
                  ? `0 14px 28px ${pillar.glowColor}, 0 4px 10px rgba(0,0,0,0.12)`
                  : '0 4px 12px rgba(0,0,0,0.06)',
              }}
            >
              <div
                className={`w-full h-full rounded-2xl bg-gradient-to-tr ${pillar.badgeGradient} flex items-center justify-center text-white shadow-inner`}
              >
                <Icon className="w-7 h-7 stroke-[2.2]" />
              </div>

              {/* Ping Ring on Hover */}
              {isHovered && (
                <span
                  className="absolute -inset-1 rounded-2xl opacity-40 animate-ping pointer-events-none"
                  style={{ backgroundColor: pillar.accentColor }}
                />
              )}
            </div>

            {/* ── LAYER 3: Step Label Pill (translateZ 26px) ── */}
            <div className="layer-depth-content">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 backdrop-blur-md shadow-2xs"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: pillar.accentColor }}
                />
                {pillar.stepLabel}
              </span>
            </div>
          </div>

          {/* ── LAYER 4: Title & Description (translateZ 36px & 26px) ── */}
          <div className="space-y-2.5">
            <h3 className="layer-depth-highlight text-2xl sm:text-3xl font-black text-[#0f172a] dark:text-[#ffffff] tracking-tight">
              {pillar.title}
            </h3>

            <p className="layer-depth-content text-sm sm:text-base text-[#475569] dark:text-[#94a3b8] leading-relaxed font-normal">
              {pillar.description}
            </p>
          </div>

          {/* ── LAYER 5: Pop-Out Feature Highlights List (translateZ 32px) ── */}
          <div className="layer-depth-highlight pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800/70">
            {pillar.highlights.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${pillar.accentColor}20` }}
                >
                  <CheckCircle2
                    className="w-3.5 h-3.5"
                    style={{ color: pillar.accentColor }}
                  />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM SECTION: Interactive Action & Accent Line (translateZ 30px) ── */}
        <div className="layer-depth-highlight pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between z-10">
          <Link
            to={pillar.ctaLink}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
          >
            <span>{pillar.ctaText}</span>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
              style={{
                backgroundColor: `${pillar.accentColor}18`,
                color: pillar.accentColor,
              }}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            {pillar.step}/03
          </span>
        </div>

        {/* Subtle Animated Bottom Accent Gradient Bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-70 group-hover:opacity-100 transition-opacity"
          style={{
            backgroundImage: `linear-gradient(to right, transparent, ${pillar.accentColor}, transparent)`,
          }}
        />
      </div>
    </div>
  );
};

export const ParallaxMethodologyCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
      {METHODOLOGY_PILLARS.map((pillar, idx) => (
        <ParallaxPillarCard key={pillar.title} pillar={pillar} index={idx} />
      ))}
    </div>
  );
};

export default memo(ParallaxMethodologyCards);
