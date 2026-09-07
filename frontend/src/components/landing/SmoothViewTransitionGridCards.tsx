import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  BookOpen,
  Terminal,
  Video,
  Award,
  BarChart3,
  ArrowRight
} from 'lucide-react';

export interface PlatformFeature {
  id: string;
  step: number;
  stepLabel: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  route: string;
  ctaText: string;
}

const PLATFORM_FEATURES: PlatformFeature[] = [
  {
    id: 'ai-learning',
    step: 1,
    stepLabel: 'STEP 01',
    title: 'AI Learning',
    description:
      '24/7 intelligent assistance explaining code line-by-line and diagnosing conceptual roadblocks.',
    icon: Bot,
    accentColor: '#b8df4e',
    route: '/courses',
    ctaText: 'Experience AI Tutor',
  },
  {
    id: 'structured-courses',
    step: 2,
    stepLabel: 'STEP 02',
    title: 'Structured Courses',
    description:
      'Step-by-step modular curricula covering Linux, Git, Systems, and modern engineering stacks.',
    icon: BookOpen,
    accentColor: '#4cbccb',
    route: '/courses',
    ctaText: 'Browse Curricula',
  },
  {
    id: 'coding-practice',
    step: 3,
    stepLabel: 'STEP 03',
    title: 'Coding Practice',
    description:
      'Zero-setup interactive terminal labs and in-browser execution playgrounds for real hands-on practice.',
    icon: Terminal,
    accentColor: '#7197d3',
    route: '/courses',
    ctaText: 'Launch Terminal Labs',
  },
  {
    id: 'live-classes',
    step: 4,
    stepLabel: 'STEP 04',
    title: 'Live Classes',
    description:
      'Interactive live classrooms and mentor-led sessions with real-time feedback and collaboration.',
    icon: Video,
    accentColor: '#ae78cb',
    route: '/live-classes',
    ctaText: 'Join Classroom',
  },
  {
    id: 'certificates',
    step: 5,
    stepLabel: 'STEP 05',
    title: 'Certificates',
    description:
      'Tamper-proof digital credentials with cryptographic QR verification ready for LinkedIn and employers.',
    icon: Award,
    accentColor: '#7dc7a4',
    route: '/verify-certificate',
    ctaText: 'Verify Credentials',
  },
  {
    id: 'learning-analytics',
    step: 6,
    stepLabel: 'STEP 06',
    title: 'Learning Analytics',
    description:
      'Visual competency graphs and progress tracking that clearly highlight skill milestones.',
    icon: BarChart3,
    accentColor: '#f078c2',
    route: '/courses',
    ctaText: 'Track Your Growth',
  },
];

export const SmoothViewTransitionGridCards: React.FC = () => {
  return (
    <div className="ol-circle-cards-wrapper py-6">
      <style>{`
        .ol-circle-cards-wrapper {
          --color: rgb(15, 23, 42);
          --bgColor: #f8fafc;
          --cardBg: #ffffff;
          --shadowColor: rgba(0, 0, 0, 0.15);
          --shadowHover: rgba(0, 0, 0, 0.25);
          --descrColor: #475569;
          --titleColor: #0f172a;
        }

        .dark .ol-circle-cards-wrapper {
          --color: rgb(248, 250, 252);
          --bgColor: #0b0f19;
          --cardBg: #111827;
          --shadowColor: rgba(0, 0, 0, 0.65);
          --shadowHover: rgba(0, 0, 0, 0.85);
          --descrColor: #94a3b8;
          --titleColor: #ffffff;
        }

        .ol-circle-cards {
          width: min(64rem, 100%);
          margin-inline: auto;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 2.25rem;
          list-style: none;
          counter-reset: stepnr;
          padding: 0;
        }

        .ol-circle-cards li:nth-child(6n + 1) { --accent-color: #b8df4e; }
        .ol-circle-cards li:nth-child(6n + 2) { --accent-color: #4cbccb; }
        .ol-circle-cards li:nth-child(6n + 3) { --accent-color: #7197d3; }
        .ol-circle-cards li:nth-child(6n + 4) { --accent-color: #ae78cb; }
        .ol-circle-cards li:nth-child(6n + 5) { --accent-color: #7dc7a4; }
        .ol-circle-cards li:nth-child(6n + 6) { --accent-color: #f078c2; }

        .ol-circle-cards li {
          counter-increment: stepnr;
          width: 18.5rem;
          --borderS: 1.75rem;
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-left: calc(var(--borderS) + 1.25rem);
          position: relative;
          background: var(--cardBg);
          border-radius: 50%;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
          cursor: pointer;
          text-decoration: none;
        }

        .ol-circle-cards li:hover {
          transform: translateY(-8px) scale(1.025);
        }

        .ol-circle-cards li::before,
        .ol-circle-cards li::after {
          content: "";
          inset: 0;
          position: absolute;
          border-radius: 50%;
          border: var(--borderS) solid var(--bgColor);
          line-height: 1.1;
          pointer-events: none;
        }

        .ol-circle-cards li::before {
          content: counter(stepnr);
          color: var(--accent-color);
          padding-left: 9.75rem;
          font-size: 11.5rem;
          font-weight: 800;
          overflow: hidden;
          display: flex;
          align-items: center;
          user-select: none;
          opacity: 0.88;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .ol-circle-cards li:hover::before {
          opacity: 1;
          transform: translateX(3px);
        }

        .ol-circle-cards li::after {
          filter: drop-shadow(-0.25rem 0.25rem 0.5rem var(--shadowColor));
          transition: filter 0.35s ease;
        }

        .ol-circle-cards li:hover::after {
          filter: drop-shadow(-0.35rem 0.35rem 0.75rem var(--shadowHover)) drop-shadow(0 0 1rem var(--accent-color));
        }

        .ol-circle-cards li > * {
          width: 8rem;
          position: relative;
          z-index: 10;
        }

        .ol-circle-cards .circle-card-content {
          width: 8rem;
        }

        .ol-circle-cards .circle-card-icon {
          font-size: 1.85rem;
          color: var(--accent-color);
          margin-bottom: 0.4rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .ol-circle-cards li:hover .circle-card-icon {
          transform: scale(1.12);
        }

        .ol-circle-cards .circle-card-title {
          font-size: 1.22rem;
          font-weight: 700;
          color: var(--titleColor);
          line-height: 1.15;
          letter-spacing: -0.01em;
          margin-bottom: 0.35rem;
        }

        .ol-circle-cards .circle-card-descr {
          font-size: 0.74rem;
          font-weight: 400;
          color: var(--descrColor);
          line-height: 1.35;
        }

        .ol-circle-cards .circle-card-link {
          margin-top: 0.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--accent-color);
          transition: transform 0.2s ease, opacity 0.2s ease;
          opacity: 0.9;
        }

        .ol-circle-cards li:hover .circle-card-link {
          opacity: 1;
          transform: translateX(3px);
        }
      `}</style>

      <ol className="ol-circle-cards">
        {PLATFORM_FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <li key={feature.id}>
              <Link to={feature.route} className="circle-card-content block select-none">
                <div className="circle-card-icon">
                  <Icon className="w-8 h-8" />
                </div>
                <div className="circle-card-title">{feature.title}</div>
                <div className="circle-card-descr">{feature.description}</div>
                <div className="circle-card-link">
                  <span>{feature.ctaText}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default memo(SmoothViewTransitionGridCards);
