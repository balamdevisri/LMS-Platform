import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Award,
  BarChart3,
  Bot,
  Code2,
  Video,
  FileCheck,
  Zap,
  Star,
  ChevronDown,
  Send,
  Calendar,
  FileText,
  Briefcase,
  Layers,
  Check,
  Play,
  Users,
  Clock,
  Terminal
} from 'lucide-react';
import { BlueSmokeTheme } from '@/components/common/BlueSmokeTheme';
import { AiCoreOrb } from '@/components/common/AiCoreOrb';
import { courseService } from '@/services/courseService';
import type { ICourse } from '../../../shared/types/course';
import { UpcomingLiveSessionsWidget } from '@/components/liveClassroom/UpcomingLiveSessionsWidget';

// Custom Animated Counter Component
const AnimatedCounter: React.FC<{ value: number; suffix?: string; prefix?: string }> = ({ value, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const duration = 1200; // ms
    const incrementTime = Math.max(Math.floor(duration / 40), 20);
    const step = Math.ceil(end / 40);

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Premium Course Card Skeleton
const CourseSkeleton: React.FC = () => {
  return (
    <div className="glass-card overflow-hidden flex flex-col border border-[#E6EEF9] dark:border-zinc-800 animate-pulse">
      <div className="h-52 bg-slate-100 dark:bg-zinc-850" />
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded-md w-1/4" />
            <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded-md w-1/4" />
          </div>
          <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded-md w-11/12" />
          <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded-md w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded-md w-1/3" />
        </div>
        <div className="h-11 bg-slate-200 dark:bg-zinc-800 rounded-xl w-full" />
      </div>
    </div>
  );
};

// Premium Sliding Glow Section Divider
const AnimatedDivider: React.FC<{ className?: string }> = ({ className = 'my-12' }) => {
  return (
    <div className={`relative w-full h-[1px] bg-[#E6EEF9] dark:bg-zinc-850 overflow-hidden max-w-[1280px] mx-auto ${className}`}>
      <div className="absolute top-0 w-1/3 h-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-shine" />
    </div>
  );
};

// Reusable Ripple Button Wrapper
interface RippleButtonProps {
  children: React.ReactNode;
  className?: string;
  to?: string;
  onClick?: () => void;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
}

const RippleButton: React.FC<RippleButtonProps> = ({ children, className = '', to, onClick, href, type = 'button' }) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  const createRipple = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
    };
    
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  const content = (
    <>
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white/25 rounded-full pointer-events-none animate-ripple"
          style={{
            width: '200px',
            height: '200px',
            left: ripple.x,
            top: ripple.y,
          }}
        />
      ))}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={(e: any) => {
          createRipple(e);
          if (onClick) onClick();
        }}
        className={`relative overflow-hidden ${className}`}
      >
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        onClick={(e: any) => {
          createRipple(e);
          if (onClick) onClick();
        }}
        className={`relative overflow-hidden ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={(e: any) => {
        createRipple(e);
        if (onClick) onClick();
      }}
      className={`relative overflow-hidden ${className}`}
    >
      {content}
    </button>
  );
};

export const LandingPage: React.FC = () => {
  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [catalogCourses, setCatalogCourses] = useState<ICourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCatalogCourses = async () => {
      try {
        const result = await courseService.getCourses({ status: 'published', limit: 30 });
        let list = result.courses || [];
        
        // Filter: status = 'published', visibility = 'public', featured = true
        let featuredList = list.filter(c => 
          c.status === 'published' && 
          c.visibility === 'public' && 
          c.featured === true
        );

        // Ensure "Linux Systems & Administration Mastery" and "Git & GitHub Mastery" are included
        const hasLinux = featuredList.some(c => c.slug === 'linux-systems-administration-mastery' || (c.title || '').toLowerCase().includes('linux'));
        const hasGit = featuredList.some(c => c.slug === 'git-github-mastery' || (c.title || '').toLowerCase().includes('git'));

        if (!hasLinux) {
          const found = list.find(c => c.slug === 'linux-systems-administration-mastery' || (c.title || '').toLowerCase().includes('linux'));
          if (found && found.status === 'published' && found.visibility === 'public') {
            featuredList.push(found);
          } else {
            const linuxCourse = courseService.normalizeCourseToICourse({
              id: 'course_linux_101',
              title: 'Linux Systems & Administration Mastery',
              slug: 'linux-systems-administration-mastery',
              shortDescription: 'Enterprise curriculum covering Linux Architecture, Kernel Mechanics, Permissions, Systemd, Bash Scripting, and SSH Security.',
              category: 'Linux & Systems',
              level: 'all_levels',
              duration: '32 hrs',
              status: 'published',
              visibility: 'public',
              featured: true,
              rating: 5.0,
              ratingCount: 145,
              thumbnail: '/assets/images/linux_course_thumbnail.webp',
              banner: '/assets/images/linux_os_architecture.webp',
              instructor: { name: 'KaizenQ Systems Team', role: 'Linux Systems Architect & LMS Specialist' },
              skills: ['Linux CLI', 'Kernel Mechanics', 'Systemd Services', 'Bash Automation', 'SSH & Security']
            });
            featuredList.push(linuxCourse);
          }
        }

        if (!hasGit) {
          const found = list.find(c => c.slug === 'git-github-mastery' || (c.title || '').toLowerCase().includes('git'));
          if (found && found.status === 'published' && found.visibility === 'public') {
            featuredList.push(found);
          } else {
            const gitCourse = courseService.normalizeCourseToICourse({
              id: 'git-github-mastery',
              title: 'Git & GitHub Mastery',
              slug: 'git-github-mastery',
              shortDescription: 'Learn Git & GitHub from beginner to professional, including version control, branching, pull requests, and CI/CD.',
              category: 'Development Tools',
              level: 'all_levels',
              duration: '20 Hours',
              status: 'published',
              visibility: 'public',
              featured: true,
              rating: 5.0,
              ratingCount: 180,
              thumbnail: '/assets/images/github_course_banner.webp',
              banner: '/assets/images/github_course_banner.webp',
              instructor: { name: 'Kaizen Q Team', role: 'Senior Technical Instructor' },
              skills: ['Git CLI', 'Version Control', 'GitHub Actions', 'Codespaces', 'Semantic Versioning']
            });
            featuredList.push(gitCourse);
          }
        }

        // Final verification filter
        featuredList = featuredList.filter(c => 
          c.status === 'published' && 
          c.visibility === 'public'
        );

        setCatalogCourses(featuredList);
      } catch (err) {
        console.warn('Failed to load courses for landing page:', err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCatalogCourses();
  }, []);

  const getCourseImage = (course: ICourse) => {
    if (course.thumbnail && course.thumbnail.trim() !== '' && !course.thumbnail.includes('placeholder')) {
      return course.thumbnail;
    }
    if (course.banner && course.banner.trim() !== '' && !course.banner.includes('placeholder')) {
      return course.banner;
    }
    const t = (course.title || '').toLowerCase();
    const cat = (course.category || '').toLowerCase();
    if (t.includes('linux') || cat.includes('linux')) return '/assets/images/linux_course_thumbnail.webp';
    if (t.includes('git') || cat.includes('git') || t.includes('github')) return '/assets/images/github_course_banner.webp';
    if (t.includes('ai') || cat.includes('ai') || t.includes('machine learning')) return 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80';
    if (t.includes('devops') || cat.includes('devops') || t.includes('cloud')) return 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80';
    if (t.includes('react') || t.includes('web') || t.includes('javascript')) return 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80';
    return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80';
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  // 6 Premium Core Feature Cards
  const coreFeatures = [
    {
      icon: Bot,
      title: '24/7 AI Tutor Companion',
      desc: 'Personalized AI mentor explaining complex code line-by-line, detecting bugs instantly, and adapting to your pace.',
    },
    {
      icon: FileCheck,
      title: 'Smart Assignment Evaluator',
      desc: 'Automated rubrics, real-time sandbox code execution grading, and instant feedback on homework submissions.',
    },
    {
      icon: Code2,
      title: 'Interactive Code Playground',
      desc: 'In-browser IDE with zero-latency compilation, syntax highlighting, and live AI pair programming guidance.',
    },
    {
      icon: Video,
      title: 'AI Timestamps & Summaries',
      desc: 'HD interactive video lectures with auto-generated AI timestamps, transcripts, and inline quiz checkpoints.',
    },
    {
      icon: Award,
      title: 'ISO Digital Credentials',
      desc: 'Cryptographically signed badges with QR verification ready for instant LinkedIn & employer validation.',
    },
    {
      icon: BarChart3,
      title: 'Adaptive Competency Graph',
      desc: 'Dynamically maps skill gaps and auto-adjusts learning speed to guarantee complete concept mastery.',
    },
  ];

  // 6 AI Utility Agents
  const aiToolsList = [
    {
      icon: Zap,
      title: 'AI Code Debugger',
      desc: 'Paste broken code snippets to receive instant root-cause analysis and step-by-step fix explanations.',
    },
    {
      icon: FileText,
      title: 'Lecture Note Synthesizer',
      desc: 'Converts hour-long lecture audio into structured bullet-point summaries and key takeaway flashcards.',
    },
    {
      icon: Calendar,
      title: 'Adaptive Study Planner',
      desc: 'Generates customized day-by-day study schedules based on target exam dates and current availability.',
    },
    {
      icon: Briefcase,
      title: 'Mock Interview Simulator',
      desc: 'Practice technical coding interviews with voice AI that provides real-time scoring and feedback.',
    },
    {
      icon: Layers,
      title: 'AI Quiz & Flashcard Generator',
      desc: 'Instantly creates interactive multiple-choice quizzes and active recall flashcards from any document.',
    },
    {
      icon: Sparkles,
      title: 'Skill Gap Radar',
      desc: 'Visualizes student progress against industry benchmarks to highlight areas needing extra practice.',
    },
  ];

  // Student Testimonials
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'DevOps Engineer',
      quote: 'The distraction-free learning environment and built-in interactive CLI lab made mastering Git and Linux effortless. Highly recommend!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Alex Chen',
      role: 'Full-Stack Developer',
      quote: 'Cleanest LMS interface I have ever used! Compares with Microsoft Learn and Codecademy.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Sarah Jenkins',
      role: 'Lead Software Engineer at CloudTech',
      quote: 'Kaizen Q transformed our onboarding time by 60%. The 24/7 AI tutor answers technical questions immediately without blocking senior engineers.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Prof. David Chen',
      role: 'Head of Computer Science Dept',
      quote: 'The automated assignment evaluation and competency graphs give our university faculty unprecedented visibility into student learning curves.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
  ];

  // Pricing Plans
  const pricingPlans = [
    {
      name: 'Starter Pro',
      price: '1499',
      period: 'per month',
      desc: 'Ideal for individual students and self-paced developers.',
      features: [
        '24/7 Unlimited AI Tutor Access',
        'Interactive In-Browser IDE Sandbox',
        'ISO-Verified Digital Certificates',
        'Community Forum & Peer Review',
      ],
      cta: 'Start 14-Day Free Trial',
      popular: false,
    },
    {
      name: 'Pro Academy',
      price: '3999',
      period: 'per seat / month',
      desc: 'Built for engineering teams, bootcamps, and academies.',
      features: [
        'Everything in Starter Pro',
        'Automated Assignment Grading Engine',
        'Real-time Competency Skill Trees',
        'Priority AI Agent Processing',
        'ISO 27001 & SOC2 Verifiable Badges',
      ],
      cta: 'Start Pro Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise Organization',
      price: '7999',
      period: 'per seat / month',
      desc: 'For universities and corporate learning organizations.',
      features: [
        'Dedicated SAML SSO Integration',
        'Custom Course & Grading Builder',
        'Faculty Engagement Analytics',
        'White-label Branding & Custom Domain',
        'Dedicated 24/7 Account Architect',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  // FAQ Items
  const faqs = [
    {
      question: 'What makes Kaizen Q unique compared to traditional LMS tools?',
      answer: 'Kaizen Q is built from the ground up as an AI-first learning management system. It combines real-time code evaluation, automated assignment grading, adaptive skill trees, and continuous 24/7 AI tutoring into a crisp, high-performance White & Sky Blue interface.',
    },
    {
      question: 'How does the 24/7 AI Tutor assist students during coding?',
      answer: 'The AI Tutor analyzes code line-by-line in real time. If you hit a bug or conceptual roadblock, it provides targeted step-by-step hints and explanations without giving away direct answers, ensuring true mastery.',
    },
    {
      question: 'Are the digital credentials ISO-verified for LinkedIn?',
      answer: 'Yes! Every certificate issued includes a tamper-proof cryptographic QR code verified against ISO standards, allowing employers to instantly confirm your credentials.',
    },
    {
      question: 'Can universities or bootcamps integrate with existing SSO & SIS systems?',
      answer: 'Absolutely. We support SAML SSO, Google Workspace, Canvas/Blackboard LTI 1.3 standards, and REST/GraphQL APIs.',
    },
  ];

  // Split headline for stagger slide reveal animation
  const headlineWords = "Transform Learning Into Intelligence.".split(" ");

  // Stagger variants for AI tools and Features
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const gridItemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 80,
        damping: 15,
      },
    },
  };

  const textContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 110,
        damping: 17,
      },
    },
  };

  return (
    <BlueSmokeTheme>
      
      {/* Inject custom micro-keyframes directly in React */}
      <style>{`
        @keyframes ripple-effect {
          0% { transform: scale(0); opacity: 0.55; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        .animate-ripple {
          animation: ripple-effect 0.6s cubic-bezier(0.1, 0.8, 0.3, 1);
          transform-origin: center;
        }
        @keyframes section-shine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        .animate-shine {
          animation: section-shine 4.5s infinite linear;
        }
        .glow-hover {
          position: relative;
        }
        .glow-hover::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.4));
          opacity: 0;
          z-index: -1;
          transition: opacity 0.35s ease;
        }
        .glow-hover:hover::after {
          opacity: 1;
        }
      `}</style>

      <div className="pt-24 sm:pt-28 font-['Sora'] select-none">
        
        {/* ----------------- 1. HERO SECTION ----------------- */}
        <section className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-0 overflow-visible min-h-[560px] lg:min-h-[620px] flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Left Column: Hero Content Container */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 max-w-2xl lg:max-w-[48%] relative z-10 w-full">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 dark:bg-zinc-900/80 border border-blue-100 dark:border-zinc-800 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-xl shadow-2xs hover:scale-103 active:scale-95 transition-all">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              <span>Enterprise AI LMS Platform 3.0</span>
            </div>

            {/* Headline with slide stagger animation */}
            <motion.h1 
              variants={textContainerVariants}
              initial="hidden"
              animate="show"
              className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight leading-[1.15] sm:leading-[1.1] flex flex-wrap justify-center lg:justify-start gap-x-2 sm:gap-x-3 gap-y-1"
            >
              {headlineWords.map((word, i) => (
                <motion.span 
                  key={i} 
                  variants={wordVariants}
                  className={word === "Intelligence." ? "text-gradient-primary" : ""}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base lg:text-lg text-slate-650 dark:text-zinc-350 leading-relaxed font-normal">
              Master high-impact engineering & AI tracks with 24/7 intelligent tutoring, real-time sandbox code evaluation, adaptive skill trees, and ISO-verified digital credentials.
            </p>

            {/* CTA Buttons with click ripple */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
              <RippleButton
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 btn-premium-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </RippleButton>

              <RippleButton
                href="#ai-overview"
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 btn-premium-secondary text-slate-800 dark:text-zinc-100 font-bold rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-xs border border-[#E6EEF9] dark:border-zinc-700"
              >
                <Play className="w-4 h-4 text-blue-500 fill-current" />
                <span>Explore AI Engine</span>
              </RippleButton>
            </div>

            {/* Sub-text */}
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-medium pt-1">
              Free 14-Day Pro Trial • No credit card required • ISO 27001 & SOC2 Certified
            </p>
          </div>

          {/* Right Column: Interactive AI Core Orb */}
          <div className="relative w-full lg:w-[48%] h-[340px] sm:h-[500px] lg:h-[600px] flex items-center justify-center z-10 overflow-visible">
            <AiCoreOrb />
          </div>
        </section>


        {/* Statistics Divider (Hero -> Stats = 48px) */}
        <AnimatedDivider className="mt-[24px] mb-[24px]" />


        {/* ----------------- 2. STATISTICS SECTION ----------------- */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md p-6 rounded-2xl border border-[#E6EEF9] dark:border-zinc-800 shadow-2xs hover:shadow-md hover:border-blue-200/50 dark:hover:border-blue-900/50 transition-all flex flex-col items-center justify-center space-y-1 group glow-hover"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
                <AnimatedCounter value={25000} suffix="+" />
              </span>
              <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Active Students</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md p-6 rounded-2xl border border-[#E6EEF9] dark:border-zinc-800 shadow-2xs hover:shadow-md hover:border-blue-200/50 dark:hover:border-blue-900/50 transition-all flex flex-col items-center justify-center space-y-1 group glow-hover"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
                <AnimatedCounter value={150} suffix="+" />
              </span>
              <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Expert Courses</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md p-6 rounded-2xl border border-[#E6EEF9] dark:border-zinc-800 shadow-2xs hover:shadow-md hover:border-blue-200/50 dark:hover:border-blue-900/50 transition-all flex flex-col items-center justify-center space-y-1 group glow-hover"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <span className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
                <AnimatedCounter value={95} suffix="%" />
              </span>
              <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Placement Ready</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md p-6 rounded-2xl border border-[#E6EEF9] dark:border-zinc-800 shadow-2xs hover:shadow-md hover:border-blue-200/50 dark:hover:border-blue-900/50 transition-all flex flex-col items-center justify-center space-y-1 group glow-hover"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-heading font-extrabold text-3xl sm:text-4xl text-blue-600 dark:text-blue-400">
                24/7
              </span>
              <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">AI Mentor Access</p>
            </motion.div>

          </div>
        </section>

        {/* Enterprise Live Broadcast Sessions */}
        <UpcomingLiveSessionsWidget />

        {/* Core Features Divider */}
        <AnimatedDivider className="mt-12 mb-12" />


        {/* ----------------- 3. FEATURES SECTION ----------------- */}
        <section id="features" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-16">
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center space-y-4 py-2">
            <span className="inline-flex items-center justify-center text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-zinc-900 px-4 py-1.5 rounded-full border border-blue-100 dark:border-zinc-850 shadow-2xs hover:scale-105 transition-transform duration-200 cursor-pointer mb-2">
              Core LMS Features
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight pt-1">
              Built for Modern High-Growth Education
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed font-normal max-w-lg mx-auto pt-1">
              Combining world-class course management with real-time AI assistance for students and faculty.
            </p>
          </div>

          <motion.div 
            variants={gridContainerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {coreFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={gridItemVariants}
                  className="glass-card p-8 space-y-5 group glow-hover"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </section>


        {/* AI Features Divider (Features -> AI Utilities = 80px) */}
        <AnimatedDivider className="mt-[40px] mb-[40px]" />


        {/* ----------------- 4. AI FEATURES SECTION ----------------- */}
        <section id="ai-features" className="py-0 relative overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
            <div className="text-center max-w-2xl mx-auto flex flex-col items-center space-y-4 py-2">
              <span className="inline-flex items-center justify-center text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-zinc-900 px-4 py-1.5 rounded-full border border-blue-100 dark:border-zinc-850 shadow-2xs hover:scale-105 transition-transform duration-200 cursor-pointer mb-2">
                AI Tools Suite
              </span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight pt-1">
                6 Powered AI Utilities Included
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed font-normal max-w-lg mx-auto pt-1">
                Automate study planning, quiz creation, note summarizing, and interview practice with built-in AI agents.
              </p>
            </div>

            <motion.div 
              variants={gridContainerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {aiToolsList.map((tool, idx) => {
                const Icon = tool.icon;
                return (
                  <motion.div 
                    key={idx}
                    variants={gridItemVariants}
                    className="glass-card p-8 space-y-5 group glow-hover"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-slate-200/60 dark:border-zinc-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105 transition-all duration-300 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                      {tool.desc}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>


        {/* Course Divider */}
        <AnimatedDivider />


        {/* ----------------- 5. COURSES SECTION ----------------- */}
        <section id="courses" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-0 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col items-start space-y-3">
              <span className="inline-flex items-center justify-center text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-950/20 px-4 py-1.5 rounded-full border border-purple-100 dark:border-purple-900/40 mb-2">
                Explore Catalog
              </span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight pt-1">
                Featured AI & Engineering Tracks
              </h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-normal pt-1">
                Master high-demand tech tracks guided by 24/7 AI mentors and verified digital credentials.
              </p>
            </div>
            <Link to="/dashboard" className="px-5 py-3 rounded-2xl bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 hover:scale-102 transition-all text-xs font-bold flex items-center gap-1.5 self-start md:self-auto shadow-2xs">
              <span>View All Courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingCourses ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px] max-w-4xl mx-auto justify-center items-stretch">
              <CourseSkeleton />
              <CourseSkeleton />
            </div>
          ) : catalogCourses.length === 0 ? (
            <div className="py-16 text-center text-slate-550 text-xs font-medium space-y-4 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8 shadow-2xs">
              <p className="text-slate-800 dark:text-white font-bold text-lg">No active course tracks found.</p>
              <p className="text-slate-550 text-xs">Newly added courses will appear here automatically.</p>
              <Link to="/courses" className="btn-premium-primary text-xs py-2.5 px-6 font-bold inline-flex items-center gap-2 mt-2">
                Explore Full Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px] max-w-4xl mx-auto justify-center items-stretch">
              {catalogCourses.map((course, idx) => (
                <div key={course.id || course.slug || idx} className="glass-card overflow-hidden flex flex-col group transition-all duration-350 hover:-translate-y-[6px] hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 dark:hover:border-blue-500/30 glow-hover h-full">
                  {/* Thumbnail */}
                  <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    <img
                      src={getCourseImage(course)}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute top-3.5 left-3.5 bg-slate-900/85 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-xl font-bold capitalize select-none hover:scale-105 transition-transform">
                      {(course.level || 'all_levels').replace('_', ' ')}
                    </div>
                    <div className="absolute top-3.5 right-3.5 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-xl shadow-md flex items-center gap-1 select-none hover:scale-105 transition-transform">
                      <Star className="w-3.5 h-3.5 fill-current text-amber-300" />
                      <span>{course.rating || 5.0}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      {/* Badge Row */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[9px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 hover:scale-105 transition-transform cursor-pointer">
                          <Sparkles className="w-2.5 h-2.5" /> AI Companion
                        </span>
                        <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 hover:scale-105 transition-transform cursor-pointer">
                          <Terminal className="w-2.5 h-2.5" /> Interactive Lab
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-550 dark:text-zinc-400 font-medium">
                        Instructor: {typeof course.instructor === 'object' ? course.instructor.name : (course.instructor || 'KaizenQ Team')}
                      </p>
                    </div>

                    <div className="space-y-3.5 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
                      <div className="flex justify-between text-slate-500 dark:text-zinc-400 font-medium">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {(course.enrollmentCount || 102).toLocaleString()} enrolled</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                          <span>Progress Skill Mapping</span>
                          <span className="text-blue-600 dark:text-blue-400">100% Concept Coverage</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-zinc-700/50">
                          <motion.div 
                            initial={{ width: 0 }} 
                            whileInView={{ width: '100%' }} 
                            viewport={{ once: true }} 
                            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full" 
                          />
                        </div>
                      </div>
                    </div>

                    <RippleButton
                      to="/dashboard"
                      className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs group-hover:shadow-md cursor-pointer"
                    >
                      <span>Explore Course</span>
                      <ArrowRight className="w-4 h-4" />
                    </RippleButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>


        {/* Showcase Divider (Featured Courses -> Platform Preview = 80px) */}
        <AnimatedDivider className="mt-[40px] mb-[40px]" />


        {/* ----------------- 6. LIVE PLATFORM OVERVIEW SECTION ----------------- */}
        <section id="ai-overview" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-0 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 flex flex-col items-start space-y-4">
              <span className="inline-flex items-center justify-center text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-zinc-900 px-4 py-1.5 rounded-full border border-blue-100 dark:border-zinc-850 shadow-2xs hover:scale-105 transition-transform duration-200 cursor-pointer mb-2">
                Live AI Platform Overview
              </span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white leading-tight pt-1">
                Next-Gen Autonomous AI Learning Experience
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed font-normal pt-1">
                Watch Kaizen Q in action. Our AI platform combines real-time code evaluation, automated debugging, RAG knowledge pipelines, and interactive sandboxes designed to accelerate engineering mastery.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">24/7 Real-Time AI Code Companion</h4>
                    <p className="text-xs text-slate-650 dark:text-zinc-400 font-normal mt-0.5">Explains complex code line-by-line and detects compilation bugs instantly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <BarChart3 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Adaptive Skill Tree & Knowledge Graph</h4>
                    <p className="text-xs text-slate-650 dark:text-zinc-400 font-normal mt-0.5">Dynamically maps competency gaps and auto-adjusts your path speed.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Award className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">ISO-Verified Digital Credentials</h4>
                    <p className="text-xs text-slate-650 dark:text-zinc-400 font-normal mt-0.5">Cryptographically signed credentials ready for instant LinkedIn verification.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <RippleButton
                  to="/dashboard"
                  className="px-8 py-3.5 btn-premium-primary text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-2"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </RippleButton>
              </div>
            </div>

            {/* Platform Mockup Showcase */}
            <div className="lg:col-span-6 relative flex justify-center">
              {/* Blur behind showcase */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-blue-500/10 dark:bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

              {/* Large Browser mockup */}
              <div className="relative w-full max-w-xl p-1.5 rounded-[22px] bg-white dark:bg-zinc-900 border border-[#E6EEF9] dark:border-zinc-800 shadow-2xl shadow-blue-500/10 dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 overflow-hidden">
                {/* Mockup Header bar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block animate-pulse" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block animate-pulse" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-455 inline-block animate-pulse" />
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 select-none bg-white dark:bg-zinc-950 px-8 py-0.5 rounded-md border border-slate-100 dark:border-zinc-800">
                    lms.kaizenq.ai/dashboard/labs
                  </div>
                  <div className="w-8" />
                </div>
                
                {/* Interactive Player / Dashboard View */}
                <div className="p-1 relative overflow-hidden rounded-xl">
                  <video
                    src="/KaizenQ.mp4"
                    autoPlay
                    muted
                    playsInline
                    loop
                    className="w-full rounded-xl object-cover shadow-inner pointer-events-none"
                    ref={(el) => {
                      if (el) {
                        el.muted = true;
                        el.volume = 0;
                      }
                    }}
                  />

                  {/* Watermark Cover Badge — Moved down to top-10 right-3 to directly cover the Gemini watermark */}
                  <div className="absolute top-10 right-3 z-30 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-950/95 border border-slate-700/90 text-white shadow-2xl backdrop-blur-md font-['Sora'] pointer-events-none select-none">
                    <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400 flex items-center justify-center text-white text-[10px] font-black shadow-xs shrink-0">
                      Q
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold tracking-tight text-white leading-none">Kaizen<span className="text-cyan-400">Q</span> LMS</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">AI Engine Active</span>
                    </div>
                  </div>
                </div>

                {/* Floating micro-cards overlay */}
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4.4, ease: "easeInOut" }}
                  className="absolute top-12 right-6 p-3 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md rounded-xl border border-blue-200/55 dark:border-zinc-850 shadow-lg text-[10px] font-bold space-y-1.5 max-w-[170px] pointer-events-none z-20"
                >
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Grader Active</span>
                  </div>
                  <p className="text-[9px] text-slate-550 dark:text-zinc-400 font-medium">Automatic sandbox test passes at 100%.</p>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  className="absolute bottom-6 left-6 p-3 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md rounded-xl border border-emerald-200/60 dark:border-zinc-850 shadow-lg text-[10px] font-bold space-y-1.5 max-w-[180px] pointer-events-none z-20"
                >
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5 bg-emerald-100 dark:bg-emerald-950 rounded-full p-0.5" />
                    <span>ISO Verified Badging</span>
                  </div>
                  <p className="text-[9px] text-slate-550 dark:text-zinc-400 font-medium">Credly and LinkedIn integrations sync ready.</p>
                </motion.div>
              </div>
            </div>

          </div>
        </section>


        {/* Testimonials Divider (Platform Preview -> Testimonials = 70px) */}
        <AnimatedDivider className="mt-[35px] mb-0" />


        {/* ----------------- 7. TESTIMONIALS SECTION ----------------- */}
        <section className="pt-[35px] pb-[40px] border-y border-[#E6EEF9] dark:border-zinc-850 bg-slate-50/40 dark:bg-[#0E1325]/20 backdrop-blur-xs">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-2xl mx-auto flex flex-col items-center space-y-4 py-2">
              <span className="inline-flex items-center justify-center text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-zinc-900 px-4 py-1.5 rounded-full border border-blue-100 dark:border-zinc-850 shadow-2xs hover:scale-105 transition-transform duration-200 cursor-pointer mb-2">
                Student Testimonials
              </span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight pt-1">
                Loved by 50,000+ Active Learners
              </h2>
              <p className="text-sm sm:text-base text-slate-655 dark:text-zinc-400 leading-relaxed font-normal max-w-md mx-auto pt-1">
                Hear directly from software engineers, developers, and students excelling with Kaizen Q.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((tm, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md p-8 rounded-[22px] border border-[#E6EEF9] dark:border-zinc-800 shadow-sm hover:border-blue-300 dark:hover:border-purple-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col justify-between space-y-6 glow-hover"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(tm.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-450 text-amber-450" />
                        ))}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-150 px-2.5 py-1 rounded-full dark:bg-zinc-950 dark:text-blue-400 dark:border-zinc-800 hover:scale-105 transition-all">
                        Verified Learner
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 italic leading-relaxed font-medium">
                      "{tm.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <img
                      src={tm.avatar}
                      alt={tm.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-blue-400 shadow-xs"
                    />
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">{tm.name}</h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{tm.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* Pricing Divider (Testimonials -> Pricing = 80px) */}
        <AnimatedDivider className="mt-0 mb-[40px]" />


        {/* ----------------- 8. PRICING SECTION ----------------- */}
        <section id="pricing" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-0 space-y-16">
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center space-y-4 py-2">
            <span className="inline-flex items-center justify-center text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-zinc-900 px-4 py-1.5 rounded-full border border-blue-100 dark:border-zinc-850 shadow-2xs hover:scale-105 transition-transform duration-200 cursor-pointer mb-2">
              Transparent Pricing
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight pt-1">
              Choose Your AI Learning Tier
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-6">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`bg-white dark:bg-zinc-900 rounded-[22px] p-8 flex flex-col justify-between space-y-8 border transition-all duration-300 relative glow-hover ${
                  plan.popular 
                    ? 'border-2 border-blue-500 shadow-2xl shadow-blue-500/10 dark:shadow-[0_20px_50px_rgba(59,130,246,0.15)] md:scale-[1.04] md:z-10 hover:scale-[1.06]' 
                    : 'border-[#E6EEF9] dark:border-zinc-800 shadow-xs hover:-translate-y-1.5'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-extrabold uppercase px-4 py-1.5 rounded-full shadow-md tracking-wider animate-pulse">
                    Most Popular Choice
                  </span>
                )}

                <div className="space-y-5">
                  <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">₹</span>
                    <span className="font-heading font-extrabold text-5xl text-slate-900 dark:text-white tracking-tight">{plan.price}</span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium ml-1">/{plan.period}</span>
                  </div>
                  <p className="text-xs text-slate-650 dark:text-zinc-400 leading-relaxed font-normal">{plan.desc}</p>

                  <ul className="space-y-3 pt-5 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 font-medium">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <RippleButton
                  to="/dashboard"
                  className={`w-full text-center text-xs py-3.5 rounded-xl font-bold transition-all ${
                    plan.popular
                      ? 'btn-premium-primary text-white shadow-md'
                      : 'btn-premium-secondary text-slate-800 dark:text-zinc-100 hover:border-blue-400 border border-[#E6EEF9] dark:border-zinc-800'
                  }`}
                >
                  {plan.cta}
                </RippleButton>
              </div>
            ))}
          </div>
        </section>


        {/* FAQ Divider (Pricing -> FAQ = 70px) */}
        <AnimatedDivider className="mt-[35px] mb-[35px]" />


        {/* ----------------- 9. FAQ ACCORDION SECTION ----------------- */}
        <section id="about" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-0 space-y-12">
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center space-y-4 py-2">
            <span className="inline-flex items-center justify-center text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-zinc-900 px-4 py-1.5 rounded-full border border-blue-100 dark:border-zinc-850 shadow-2xs hover:scale-105 transition-transform duration-200 cursor-pointer mb-2">
              Frequently Asked Questions
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight pt-1">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-900 border border-[#E6EEF9] dark:border-zinc-800 rounded-2xl overflow-hidden transition-all shadow-2xs glow-hover">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-6 flex items-center justify-between font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-blue-500 transition-transform duration-300 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === idx && (
                    <motion.div
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { opacity: 1, height: "auto" },
                        collapsed: { opacity: 0, height: 0 }
                      }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-xs sm:text-sm text-slate-655 dark:text-zinc-400 leading-relaxed border-t border-slate-100 dark:border-zinc-800 pt-4 font-normal">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>


        {/* Contact Divider (FAQ -> Contact = 80px) */}
        <AnimatedDivider className="mt-[40px] mb-[40px]" />


        {/* ----------------- 10. CONTACT SECTION ----------------- */}
        <section id="contact" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-[60px]">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-[#0F172A] rounded-3xl p-8 sm:p-14 text-white grid grid-cols-1 lg:grid-cols-12 gap-12 border border-slate-800 shadow-2xl">
            {/* Glowing background spotlight */}
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="lg:col-span-5 space-y-6 z-10 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold w-fit">
                <span>Enterprise Request</span>
              </div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
                Ready to Transform Your School or Enterprise?
              </h2>
              <p className="text-slate-350 text-xs sm:text-sm leading-relaxed font-normal max-w-sm">
                Schedule a 1-on-1 walkthrough with our AI architects to deploy custom course models and faculty engagement tools.
              </p>
            </div>

            <div className="lg:col-span-7 bg-slate-950/70 p-6 sm:p-10 rounded-2xl border border-slate-800/80 shadow-2xl z-10 space-y-6">
              <h3 className="font-heading font-bold text-lg text-white">Request AI Demonstration</h3>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="bg-slate-900/60 border border-slate-800 focus:border-blue-500 focus:outline-hidden rounded-xl px-4 py-3.5 text-xs text-white placeholder-slate-500 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Work Email"
                    className="bg-slate-900/60 border border-slate-800 focus:border-blue-500 focus:outline-hidden rounded-xl px-4 py-3.5 text-xs text-white placeholder-slate-500 transition-colors"
                  />
                </div>
                <textarea
                  rows={4}
                  placeholder="Institution or team details & headcount..."
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-blue-500 focus:outline-hidden rounded-xl px-4 py-3.5 text-xs text-white placeholder-slate-500 transition-colors"
                />
                <RippleButton type="submit" className="btn-premium-primary w-full justify-center text-xs py-3.5 font-bold cursor-pointer text-white flex items-center gap-2 rounded-xl">
                  <span>Submit Demo Inquiry</span>
                  <Send className="w-4 h-4" />
                </RippleButton>
              </form>
            </div>
          </div>
        </section>

      </div>
    </BlueSmokeTheme>
  );
};
