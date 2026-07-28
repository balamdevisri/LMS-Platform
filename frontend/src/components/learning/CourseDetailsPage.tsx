import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Award,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  PlayCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CourseDetailsProps {
  course: {
    id: string | number;
    title: string;
    subtitle?: string;
    instructor: string;
    role?: string;
    avatar?: string;
    rating: number;
    reviews?: number;
    students: string;
    duration: string;
    category: string;
    level?: string;
    thumbnail: string;
    introText: string[];
    outcomes: string[];
    modules: Array<{
      id: string | number;
      title: string;
      duration?: string;
      lessons: Array<{
        id: string | number;
        title: string;
        duration?: string;
        type?: string;
      }>;
    }>;
  };
  onStartLearning: () => void;
  isEnrolled?: boolean;
  onEnroll?: () => void;
}

export const CourseDetailsPage: React.FC<CourseDetailsProps> = ({
  course,
  onStartLearning,
  isEnrolled = false,
  onEnroll,
}) => {
  const navigate = useNavigate();
  const [openModuleId, setOpenModuleId] = useState<string | number | null>(course.modules[0]?.id || null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleModule = (id: string | number) => {
    setOpenModuleId(openModuleId === id ? null : id);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const skills = [
    'CLI Terminal Navigation',
    'Version Control & Git Pipelines',
    'System Architecture',
    'Shell Automation',
    'Production Hardening',
    'CI/CD Workflows',
  ];

  const prerequisites = [
    'Basic understanding of computers and operating systems',
    'No prior Linux or Git coding experience required',
    'A modern browser (Chrome, Edge, Firefox, Safari)',
  ];

  const faqs = [
    {
      q: 'Will I get a verified completion certificate?',
      a: 'Yes! Upon finishing all module lessons and hands-on assessments, you will earn a verifiable SHAIVIKA AI LMS completion certificate.',
    },
    {
      q: 'Is there hands-on terminal practice included?',
      a: 'Absolutely. The course features built-in interactive CLI terminal sandboxes right inside the lesson interface, with no manual setup needed.',
    },
    {
      q: 'How long do I have access to the course content?',
      a: 'You receive lifetime unlimited access to all course modules, updates, cheat sheets, and downloadable resources.',
    },
  ];

  const reviews = [
    {
      name: 'Priya Sharma',
      role: 'DevOps Engineer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      comment: 'The distraction-free learning environment and built-in interactive CLI lab made mastering Git and Linux effortless. Highly recommend!',
    },
    {
      name: 'Alex Chen',
      role: 'Full-Stack Developer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      comment: 'Cleanest LMS interface I have ever used! Compares with Microsoft Learn and Codecademy.',
    },
  ];

  const totalLessonsCount = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <section className="relative overflow-hidden bg-linear-to-b from-sky-50/80 via-white to-slate-50 border-b border-sky-100 pt-28 sm:pt-32 lg:pt-36 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-sky-400/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 relative z-10">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-sky-50 border border-sky-200/80 text-sky-800 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-sky-600" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-sky-100 text-sky-700 border border-sky-200 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                {course.category}
              </span>
              <span className="px-3.5 py-1 rounded-full text-xs font-mono font-semibold bg-white text-slate-600 border border-sky-100 shadow-xs">
                {course.level || 'All Levels'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-black text-slate-900 tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-sans">
              {course.introText[0]}
            </p>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-sky-100 shadow-sm w-fit">
              <img
                src={course.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={course.instructor}
                className="w-10 h-10 rounded-full object-cover border-2 border-sky-400"
              />
              <div>
                <span className="text-xs text-slate-500 block font-medium">Instructor</span>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  {course.instructor} <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              {isEnrolled ? (
                <button
                  onClick={onStartLearning}
                  className="px-8 py-4 rounded-2xl bg-linear-to-r from-sky-500 via-sky-400 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-base flex items-center gap-3 transition-all duration-200 shadow-xl shadow-sky-500/25 hover:scale-105 active:scale-95 cursor-pointer border border-sky-300/40"
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>Resume Course Track</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={onEnroll || onStartLearning}
                  className="px-8 py-4 rounded-2xl bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-base flex items-center gap-3 transition-all duration-200 shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 cursor-pointer border border-emerald-300/40"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Enroll in Course (Free)</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="p-4 rounded-3xl bg-white border border-sky-100 shadow-xl shadow-sky-500/5 space-y-5 relative">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-sky-100 group shadow-sm">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100">
                  <span className="text-slate-500 block">Total Duration</span>
                  <span className="font-bold text-slate-900 font-mono">{course.duration}</span>
                </div>
                <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100">
                  <span className="text-slate-500 block">Lessons</span>
                  <span className="font-bold text-slate-900 font-mono">{totalLessonsCount} Lessons</span>
                </div>
                <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100">
                  <span className="text-slate-500 block">Enrolled Students</span>
                  <span className="font-bold text-slate-900 font-mono">{course.students}</span>
                </div>
                <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100">
                  <span className="text-slate-500 block">Rating</span>
                  <span className="font-bold text-amber-500 font-mono flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {course.rating} ({course.reviews || 120})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-sky-100 shadow-md shadow-sky-500/5 space-y-4">
            <h2 className="text-xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-sky-600" />
              What You'll Learn
            </h2>
            <ul className="space-y-3">
              {course.outcomes.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-sky-100 shadow-md shadow-sky-500/5 space-y-4">
            <h2 className="text-xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-sky-600" />
              Skills You'll Master
            </h2>
            <div className="flex flex-wrap gap-2.5 pt-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 rounded-xl bg-sky-50 border border-sky-100 text-xs font-mono font-bold text-sky-700 shadow-xs"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="pt-4 border-t border-sky-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Prerequisites</h3>
              <ul className="space-y-2">
                {prerequisites.map((pre, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
                    <span>{pre}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-6 h-6 text-sky-600" />
                Course Curriculum Preview
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {course.modules.length} Modules • {totalLessonsCount} Lessons • {course.duration} Total Length
              </p>
            </div>

            {isEnrolled ? (
              <button
                onClick={onStartLearning}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto shadow-md shadow-sky-500/20"
              >
                <span>Explore Curriculum & Start</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onEnroll || onStartLearning}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto shadow-md shadow-emerald-500/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>Enroll Free to Access</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {course.modules.map((mod) => {
              const isOpen = openModuleId === mod.id;
              return (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-sky-100 bg-white overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full p-4 flex items-center justify-between text-left bg-sky-50/40 hover:bg-sky-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-sky-600" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{mod.title}</h3>
                        <span className="text-xs text-slate-500 font-mono">
                          {mod.lessons.length} Lessons {mod.duration ? `• ${mod.duration}` : ''}
                        </span>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-sky-600" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 py-2 border-t border-sky-100 bg-white space-y-2"
                      >
                        {mod.lessons.map((les) => (
                          <div
                            key={les.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs text-slate-700 border border-slate-100"
                          >
                            <span className="truncate">{les.title}</span>
                            <span className="font-mono text-slate-400 shrink-0 ml-2">{les.duration}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              Student Testimonials
            </h2>
            <div className="space-y-4">
              {reviews.map((rev, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white border border-sky-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={rev.avatar} alt={rev.name} className="w-10 h-10 rounded-full object-cover border-2 border-sky-300" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rev.name}</h4>
                      <span className="text-[11px] text-slate-500">{rev.role}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-xl font-heading font-extrabold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-sky-600" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="rounded-2xl border border-sky-100 bg-white overflow-hidden shadow-xs">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-slate-900 cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-sky-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-slate-600 border-t border-sky-100/60 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
