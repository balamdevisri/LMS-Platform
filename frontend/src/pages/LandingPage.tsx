import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Loader2
} from 'lucide-react';
import { KaizenQVideoPlayer } from '@/components/common/KaizenQVideoPlayer';
import { BlueSmokeTheme } from '@/components/common/BlueSmokeTheme';
import { courseService } from '@/services/courseService';
import type { ICourse } from '../../../shared/types/course';

export const LandingPage: React.FC = () => {
  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [catalogCourses, setCatalogCourses] = useState<ICourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCatalogCourses = async () => {
      try {
        const result = await courseService.getCourses({ status: 'published', limit: 6 });
        setCatalogCourses(result.courses);
      } catch (err) {
        console.warn('Failed to load courses for landing page:', err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCatalogCourses();
  }, []);

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

  // Testimonials
  const testimonials = [
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
      price: '$19',
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
      price: '$49',
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
      price: '$99',
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

  return (
    <BlueSmokeTheme>
      <div className="pt-24 space-y-28 sm:space-y-36 font-['Sora'] select-none">
        
        {/* ----------------- 1. HERO SECTION (CENTERED WHITE & SKY BLUE SAAS LAYOUT) ----------------- */}
        <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 overflow-hidden">
          
          {/* Background Ambient Sky Blue Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-162.5 h-112.5 bg-sky-400/20 rounded-full blur-[130px] pointer-events-none animate-pulse" />

          {/* Centered Hero Content Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center text-center space-y-8 max-w-4xl mx-auto relative z-10"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs sm:text-sm font-bold tracking-wide backdrop-blur-xl shadow-xs mx-auto">
              <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
              <span>Introducing Kaizen Q 3.0 • Powered by Shaivika Groups</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.12] text-center">
              Continuous Learning,{' '}
              <span className="block mt-2 bg-linear-to-r from-sky-600 via-sky-500 to-sky-400 bg-clip-text text-transparent">
                Powered by Kaizen Q AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium text-center">
              Empower engineering teams and students with 24/7 AI mentoring, real-time code evaluation, adaptive knowledge graphs, and verifiable digital credentials.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 bg-linear-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 hover:scale-103 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#ai-overview"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-sky-50 text-slate-800 border border-sky-200 font-bold rounded-xl backdrop-blur-md hover:scale-103 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm shadow-xs"
              >
                <Play className="w-4 h-4 text-sky-600 fill-current" />
                <span>Explore Brand & AI Engine</span>
              </a>
            </div>

            {/* Sub-text */}
            <p className="text-xs text-slate-500 font-medium text-center pt-2">
              Free 14-Day Pro Trial • No credit card required • ISO 27001 & SOC2 Certified
            </p>
          </motion.div>

        </section>


        {/* ----------------- 2. STATISTICS SECTION ----------------- */}
        <section className="bg-sky-50/70 border-y border-sky-100 py-12 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-1">
                <span className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-sky-600">
                  50K+
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">Active Students</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-1">
                <span className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900">
                  250+
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">Expert Courses</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="space-y-1">
                <span className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-sky-500">
                  500+
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">AI Mentors</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="space-y-1">
                <span className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-sky-600">
                  99%
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">Success Rate</p>
              </motion.div>

            </div>
          </div>
        </section>


        {/* ----------------- 3. FEATURES SECTION (6 CARDS) ----------------- */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest bg-sky-100 px-3.5 py-1.5 rounded-full border border-sky-200">
              Core LMS Features
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900">
              Built for Modern High-Growth Education
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Combining world-class course management with real-time AI assistance for students and faculty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/95 border border-sky-100 p-7 rounded-3xl space-y-4 group transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 shadow-sm hover:shadow-xl hover:shadow-sky-500/10"
                >
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-sky-600 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>


        {/* ----------------- 4. AI FEATURES SECTION (6 TOOLS) ----------------- */}
        <section id="ai-features" className="bg-sky-50/60 py-20 border-y border-sky-100 relative overflow-hidden">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-sky-300/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-widest bg-sky-100 px-3.5 py-1.5 rounded-full border border-sky-200">
                AI Tools Suite
              </span>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900">
                6 Powered AI Utilities Included
              </h2>
              <p className="text-sm text-slate-600 font-medium">
                Automate study planning, quiz creation, note summarizing, and interview practice with built-in AI agents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aiToolsList.map((tool, idx) => {
                const Icon = tool.icon;
                return (
                  <div key={idx} className="bg-white/90 p-7 rounded-3xl space-y-4 border border-sky-100 hover:border-sky-300 shadow-xs hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-sky-500 to-sky-400 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-sky-600 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {tool.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>


        {/* ----------------- 5. COURSES SECTION ----------------- */}
        <section id="courses" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-widest bg-sky-100 px-3.5 py-1.5 rounded-full border border-sky-200">
                Explore Catalog
              </span>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900">
                Featured AI & Engineering Tracks
              </h2>
              <p className="text-sm text-slate-600 font-medium">
                Master high-demand tech tracks guided by 24/7 AI mentors and verified digital credentials.
              </p>
            </div>
            <Link to="/dashboard" className="btn-glass-light text-xs font-bold flex items-center gap-1.5 self-start md:self-auto">
              <span>View All 250+ Courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingCourses ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-bold">Loading active course tracks...</p>
            </div>
          ) : catalogCourses.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-medium space-y-3 bg-white rounded-3xl border border-sky-100 p-8">
              <p className="text-slate-800 font-bold text-base">No active course tracks found.</p>
              <p className="text-slate-500 text-xs">Newly added courses will appear here automatically.</p>
              <Link to="/courses" className="btn-blue-primary text-xs py-2 px-5 font-bold inline-flex items-center gap-2 mt-2">
                Explore Full Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {catalogCourses.map((course) => (
                <div key={course.id} className="bg-white border border-sky-100 hover:border-sky-300 rounded-3xl overflow-hidden flex flex-col group shadow-xs hover:shadow-xl hover:shadow-sky-500/10 transition-all">
                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg font-bold capitalize">
                      {course.level || 'All Levels'}
                    </div>
                    <div className="absolute top-3 right-3 bg-sky-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md">
                      ★ {course.rating || 5.0}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Instructor: {typeof course.instructor === 'object' ? course.instructor.name : (course.instructor || 'Bhanu Prakash Achari')}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-sky-100 text-xs">
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>{course.enrollmentCount ? course.enrollmentCount.toLocaleString() : '28,900'} enrolled</span>
                        <span>{course.duration}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-700">
                          <span>Interactive AI Lab</span>
                          <span className="text-sky-600">Active Track</span>
                        </div>
                        <div className="w-full h-2 bg-sky-50 rounded-full overflow-hidden border border-sky-100">
                          <div className="h-full bg-linear-to-r from-sky-600 to-sky-400 rounded-full w-full" />
                        </div>
                      </div>
                    </div>

                    <Link to={`/course/${course.slug || course.id}`} className="w-full btn-blue-primary text-xs py-2.5 justify-center mt-2">
                      View Course Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>


        {/* ----------------- 6. LIVE PLATFORM OVERVIEW SECTION ----------------- */}
        <section id="ai-overview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-widest bg-sky-100 px-3.5 py-1.5 rounded-full border border-sky-200">
                Live AI Platform Overview
              </span>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 leading-tight">
                Next-Gen Autonomous AI Learning Experience
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                Watch Kaizen Q in action. Our AI platform combines real-time code evaluation, automated debugging, RAG knowledge pipelines, and interactive sandboxes designed to accelerate engineering mastery.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">24/7 Real-Time AI Code Companion</h4>
                    <p className="text-xs text-slate-600 font-normal">Explains complex code line-by-line and detects bugs instantly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Adaptive Skill Tree & Knowledge Graph</h4>
                    <p className="text-xs text-slate-600 font-normal">Dynamically maps competency gaps and auto-adjusts your pace.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">ISO-Verified Digital Credentials</h4>
                    <p className="text-xs text-slate-600 font-normal">Cryptographically signed badges ready for instant LinkedIn verification.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/dashboard"
                  className="px-7 py-3 bg-linear-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-500/20 transition-all inline-flex items-center gap-2"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative w-full max-w-xl p-1.5 rounded-[28px] bg-white border border-sky-200 shadow-2xl shadow-sky-500/15">
                <KaizenQVideoPlayer src="/KaizenQ.mp4" />
              </div>
            </div>

          </div>
        </section>


        {/* ----------------- 7. TESTIMONIALS SECTION ----------------- */}
        <section className="bg-sky-50/70 py-16 border-y border-sky-100 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-widest bg-sky-100 px-3.5 py-1.5 rounded-full border border-sky-200">
                Student Reviews
              </span>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900">
                Loved by 50,000+ Active Learners
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((tm, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl border border-sky-100 shadow-xs space-y-6">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(tm.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed font-medium">
                    "{tm.quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-sky-100">
                    <img src={tm.avatar} alt={tm.name} className="w-10 h-10 rounded-full object-cover border-2 border-sky-500" />
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-900">{tm.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{tm.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ----------------- 8. PRICING SECTION ----------------- */}
        <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest bg-sky-100 px-3.5 py-1.5 rounded-full border border-sky-200">
              Transparent Pricing
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900">
              Choose Your AI Learning Tier
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-3xl p-8 flex flex-col justify-between space-y-6 border transition-all relative ${
                  plan.popular ? 'border-sky-500 shadow-xl shadow-sky-500/15 bg-sky-50/40' : 'border-sky-100 shadow-xs'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-600 text-white text-[10px] font-extrabold uppercase px-3.5 py-1 rounded-full shadow-md">
                    Most Popular Choice
                  </span>
                )}

                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-xl text-slate-900">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading font-extrabold text-4xl text-slate-900">{plan.price}</span>
                    <span className="text-xs text-slate-500 font-medium">{plan.period}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{plan.desc}</p>

                  <ul className="space-y-2.5 pt-4 border-t border-sky-100 text-xs text-slate-700 font-medium">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-sky-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/dashboard"
                  className={`w-full text-center text-xs py-3 rounded-xl font-bold transition-all ${
                    plan.popular
                      ? 'btn-blue-primary'
                      : 'btn-glass-light'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>


        {/* ----------------- 9. FAQ ACCORDION SECTION ----------------- */}
        <section id="about" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest bg-sky-100 px-3.5 py-1.5 rounded-full border border-sky-200">
              Frequently Asked Questions
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-sky-100 rounded-2xl overflow-hidden transition-all shadow-xs">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-5 flex items-center justify-between font-heading font-bold text-sm sm:text-base text-slate-900 hover:text-sky-600"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-sky-500 transition-transform duration-300 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-sky-100 pt-3 font-normal">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>


        {/* ----------------- 10. CONTACT SECTION ----------------- */}
        <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-linear-to-br from-slate-900 to-sky-950 rounded-3xl p-8 sm:p-12 text-white grid grid-cols-1 lg:grid-cols-12 gap-10 border border-sky-900/60 shadow-2xl">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold">
                <span>Enterprise Inquiry</span>
              </div>
              <h2 className="font-heading font-extrabold text-3xl text-white">
                Ready to Transform Your School or Enterprise?
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                Schedule a 1-on-1 walkthrough with our AI architects to deploy custom course models and faculty tools.
              </p>
            </div>

            <div className="lg:col-span-7 bg-slate-950/80 p-6 sm:p-8 rounded-2xl border border-sky-800/40 space-y-4">
              <h3 className="font-heading font-bold text-lg text-white">Request AI Demonstration</h3>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden"
                  />
                  <input
                    type="email"
                    placeholder="Work Email"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Institution & student headcount..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden"
                />
                <button type="submit" className="btn-blue-primary w-full justify-center text-xs py-3 font-bold">
                  <span>Submit Inquiry</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </section>

      </div>
    </BlueSmokeTheme>
  );
};
