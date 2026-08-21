import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, GraduationCap, BookOpen, Bot, Star, ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { BlueSmokeTheme } from '@/components/common/BlueSmokeTheme';
import { SEOHead } from '@/components/seo/SEOHead';

// Counter component for statistics count-up animation
const Counter: React.FC<{ value: string }> = ({ value }) => {
  const [count, setCount] = useState(0);
  const numericPart = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    const end = numericPart;
    if (end === 0) return;
    const duration = 2.0; // seconds
    const totalFrames = 60 * duration;
    let frame = 0;
    
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out exponential
      const easeOut = 1 - Math.pow(2, -10 * progress);
      const currentCount = Math.floor(easeOut * end);
      setCount(currentCount);

      if (frame >= totalFrames) {
        clearInterval(counter);
        setCount(end);
      }
    }, 1000 / 60);

    return () => clearInterval(counter);
  }, [numericPart]);

  if (value === '24/7') {
    return <span>24/7</span>;
  }
  return <span>{count}{suffix}</span>;
};

// Floating glass badge component
interface FloatingBadgeProps {
  emoji: string;
  text: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  delay: number;
}

const FloatingBadge: React.FC<FloatingBadgeProps> = ({ emoji, text, top, bottom, left, right, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        y: [0, -25, 15, 0],
        x: [0, 15, -20, 0],
        opacity: [0.4, 0.7, 0.5, 0.4],
        rotate: [0, 6, -6, 0],
      }}
      transition={{
        duration: 12 + Math.random() * 6,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay,
      }}
      style={{ top, bottom, left, right }}
      className="absolute hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(37,99,235,0.05)] text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] select-none pointer-events-none z-0"
    >
      <span>{emoji}</span>
      <span className="text-[10px] tracking-wide uppercase">{text}</span>
    </motion.div>
  );
};

export const AuthLayout: React.FC = () => {
  // 4 Animated Stat Cards
  const stats = [
    { icon: GraduationCap, number: '50K+', label: 'Students' },
    { icon: BookOpen, number: '250+', label: 'Courses' },
    { icon: Bot, number: '24/7', label: 'AI Tutor' },
    { icon: Star, number: '99%', label: 'Satisfaction' },
  ];

  // Stagger variants for fade-up animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any },
    },
  };

  return (
    <BlueSmokeTheme>
      <SEOHead 
        title="Authentication"
        description="Login or register for Kaizen Q"
        noindex={true}
      />
      <div className="min-h-screen w-full bg-transparent text-slate-900 flex flex-col lg:flex-row font-['Sora'] selection:bg-blue-500 selection:text-white select-none relative overflow-hidden">
        
        {/* Floating Glass Badges */}
        <FloatingBadge emoji="🤖" text="AI" top="12%" left="6%" delay={0} />
        <FloatingBadge emoji="💻" text="Code" top="78%" left="4%" delay={1.5} />
        <FloatingBadge emoji="🎓" text="Learning" top="15%" right="6%" delay={0.8} />
        <FloatingBadge emoji="⚡" text="Lightning" top="82%" right="4%" delay={2.2} />
        <FloatingBadge emoji="☁" text="Cloud" top="48%" left="45%" delay={3} />
        <FloatingBadge emoji="📜" text="Certificate" top="65%" right="42%" delay={1.1} />

        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-blue-100/60 dark:border-white/5 z-20">
          <BrandLogo size="sm" showSubtitle={false} />
          <Link to="/" className="text-xs font-bold text-[#2563EB] hover:text-[#3B82F6] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>

        {/* ==================== LEFT HERO COLUMN ==================== */}
        <div className="hidden lg:flex lg:w-1/2 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md text-slate-900 dark:text-slate-100 p-12 flex-col justify-between relative overflow-hidden border-r border-blue-100/50 dark:border-white/5 z-10">
          
          {/* Brand Header */}
          <div className="z-10 relative">
            <div className="relative group inline-block">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/10 to-blue-400/10 rounded-2xl blur-lg opacity-80 group-hover:opacity-100 transition duration-500" />
              <BrandLogo size="lg" showSubtitle={true} className="relative z-10" />
            </div>
          </div>

          {/* Center Headline & Features */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-lg z-10 relative"
          >
            
            {/* Pill Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-[#2563EB] dark:text-[#60A5FA] text-xs font-bold backdrop-blur-md shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] animate-pulse" />
              <span>✨ AI Powered Learning Platform</span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              variants={itemVariants}
              className="font-heading font-extrabold text-3xl lg:text-4xl text-slate-900 dark:text-white leading-tight tracking-tight"
            >
              Learn Smarter with{' '}
              <span className="relative inline-block font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA] pb-1">
                KAIZENQ AI LMS
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA] rounded-full overflow-hidden">
                  <motion.span
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent"
                  />
                </span>
              </span>
            </motion.h2>

            {/* Key Bullet Highlights */}
            <motion.div
              variants={itemVariants}
              className="space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                </div>
                <span>24/7 Personal AI Tutor with real-time code assistant</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                </div>
                <span>Tamper-proof ISO authenticated digital certificates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                </div>
                <span>Interactive coding sandboxes & automated grading engine</span>
              </div>
            </motion.div>

            {/* 4 Animated Statistics Cards */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-3 pt-2"
            >
              {stats.map((stat, idx) => {
                const IconComp = stat.icon;
                return (
                  <motion.div
                    key={idx}
                    animate={{
                      y: [0, -3, 0],
                    }}
                    transition={{
                      duration: 4 + idx * 0.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    whileHover={{
                      y: -6,
                      scale: 1.04,
                      boxShadow: '0 12px 24px -10px rgba(37, 99, 235, 0.15)',
                      borderColor: 'rgba(37, 99, 235, 0.3)',
                    }}
                    className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-blue-100/60 dark:border-white/5 shadow-xs cursor-pointer transition-all duration-300 flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0 group-hover:bg-[#2563EB] group-hover:text-white dark:group-hover:bg-[#2563EB] transition-colors duration-300">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white block group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors">
                        <Counter value={stat.number} />
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                        {stat.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

          </motion.div>

          {/* Footer */}
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium z-10 relative">
            © {new Date().getFullYear()} KAIZENQ AI LMS. All rights reserved.
          </div>
        </div>

        {/* ==================== RIGHT FORM CONTAINER ==================== */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 my-auto min-h-[calc(100vh-64px)] lg:min-h-screen">
          <div className="w-full max-w-md space-y-6">
            <Outlet />
          </div>
        </div>

      </div>
    </BlueSmokeTheme>
  );
};

export default AuthLayout;
