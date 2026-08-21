import React from 'react';
import { motion } from 'framer-motion';
import { BlueSmokeTheme } from '@/components/common/BlueSmokeTheme';
import { SEOHead } from '@/components/seo/SEOHead';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LmsHub: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <BlueSmokeTheme>
      <SEOHead 
        title="What is an LMS? The Ultimate Guide to Learning Management Systems"
        description="Discover how Kaizen Q is redefining the modern Learning Management System (LMS) with AI, practical technology tracks, and an adaptive career-focused learning platform."
        ogType="article"
      />

      <div className="pt-28 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 font-sans text-slate-800 dark:text-zinc-200">
        <motion.article 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-16"
        >
          {/* Header */}
          <header className="text-center space-y-6 max-w-4xl mx-auto">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800 text-blue-600 dark:text-blue-400 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>LMS Resource Hub</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              The Future of the <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Learning Management System
              </span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-600 dark:text-zinc-400 leading-relaxed">
              An LMS is more than just software. It’s the engine for modern education, skill development, and career transformation. Learn how Kaizen Q is building the ultimate AI-powered learning platform.
            </motion.p>
          </header>

          {/* Section 1 */}
          <motion.section variants={itemVariants} className="bg-white dark:bg-zinc-900/50 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-200/20 dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div className="relative z-10 max-w-3xl">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">What is an LMS?</h2>
              <p className="text-lg text-slate-700 dark:text-zinc-300 leading-relaxed mb-6">
                A <strong>Learning Management System (LMS)</strong> is a software application or web-based technology used to plan, implement, and assess a specific learning process. Typically, an LMS provides an instructor with a way to create and deliver content, monitor student participation, and assess student performance.
              </p>
              <p className="text-lg text-slate-700 dark:text-zinc-300 leading-relaxed">
                Kaizen Q takes the traditional LMS further by integrating an <strong>AI-powered learning platform</strong> that not only hosts courses but actively assists learners with an embedded 24/7 AI Tutor, adaptive skill mapping, and interactive coding sandboxes.
              </p>
            </div>
          </motion.section>

          {/* Section 2 */}
          <motion.section variants={itemVariants} className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why Choose an AI-Powered LMS?</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: 'Personalized Learning', desc: 'AI tracks your competency and adjusts the difficulty of assignments automatically.' },
                { title: 'Real-time Evaluation', desc: 'Smart assignment evaluators provide instant feedback on code and quizzes.' },
                { title: '24/7 Tutoring', desc: 'Never get stuck. An AI companion is always available to explain complex topics.' },
                { title: 'Career-Focused', desc: 'Learn technology and practical career skills with guided roadmaps.' }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-zinc-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* CTA */}
          <motion.section variants={itemVariants} className="text-center py-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Learn with Kaizen Q</h2>
            <p className="text-lg text-slate-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
              Join thousands of students building their technology and AI skills on the world's most modern learning management system.
            </p>
            <Link 
              to="/courses" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all shadow-lg shadow-blue-500/30 hover:scale-105"
            >
              Explore Online Courses
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.section>

        </motion.article>
      </div>
    </BlueSmokeTheme>
  );
};
