import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, BookOpen, Terminal, Briefcase, Award, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setIsSubmittingNewsletter(true);
    try {
      await fetch(
        'https://script.google.com/macros/s/AKfycbwUY3ZK2CU9ndoUioMwJbzD9svnG23RVd6LVLOk_eYh8M-dZwRBBb6sVyPahz7nnILL2g/exec',
        {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({ workEmail: newsletterEmail }),
        }
      );
      setNewsletterStatus('success');
      setNewsletterEmail('');
    } catch (error) {
      console.error('Newsletter submit error', error);
      setNewsletterStatus('error');
    } finally {
      setIsSubmittingNewsletter(false);
      setTimeout(() => setNewsletterStatus('idle'), 6000);
    }
  };

  return (
    <footer className="bg-slate-50/90 dark:bg-slate-950 text-slate-600 dark:text-slate-400 pt-20 pb-8 border-t border-slate-200/80 dark:border-slate-800 font-['Sora'] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          
          {/* Logo & Newsletter Column */}
          <div className="lg:col-span-5 space-y-6">
            <BrandLogo size="md" showSubtitle={true} />
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed font-normal">
              KaizenQ is a modern learning platform designed to help students and aspiring developers build practical technology skills through structured learning and hands-on practice.
            </p>

            {/* Powered By Shaivika IT Technologies Callout Card */}
            <div className="pt-1">
              <a
                href="https://www.shaivikaittechnologies.in"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3.5 p-3 pr-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-400/50 shadow-xs hover:shadow-md transition-all duration-300"
                title="Visit Shaivika IT Technologies - www.shaivikaittechnologies.in"
              >
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/95 border border-slate-200/80 dark:border-white/20 flex items-center justify-center p-1 overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                  <img
                    src="/brand/shaivika-logo.png"
                    alt="Shaivika IT Technologies Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600 dark:text-cyan-400">
                      Powered by
                    </span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    Shaivika IT Technologies
                  </p>
                  <span className="text-[11px] text-blue-600/90 dark:text-cyan-400/90 font-mono underline decoration-blue-400/40 underline-offset-2">
                    www.shaivikaittechnologies.in
                  </span>
                </div>
              </a>
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest block mb-2.5">
                Subscribe to Product Updates
              </span>
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter work email"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:outline-hidden rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingNewsletter}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                >
                  <span>{isSubmittingNewsletter ? 'Joining...' : 'Join'}</span>
                  {!isSubmittingNewsletter && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </form>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:col-span-6">
            
            {/* Column 1: Platform */}
            <div className="space-y-3.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Platform
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li><a href="#courses" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Courses Catalog</a></li>
                <li><a href="#features" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Platform Features</a></li>
                <li><a href="#pricing" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Pricing Plans</a></li>
                <li><Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Student Dashboard</Link></li>
              </ul>
            </div>

            {/* Column 2: Resources */}
            <div className="space-y-3.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Resources
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <a href="#about" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Documentation</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-500" />
                  <a href="#features" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Practice Labs</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-500" />
                  <Link to="/verify-certificate" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Verify Certificate</Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="space-y-3.5 col-span-2 sm:col-span-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li><a href="#about" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">About Brand</a></li>
                <li className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                  <a href="#contact" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Careers</a>
                </li>
                <li><a href="#contact" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Institutional Inquiries</a></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200/80 dark:bg-slate-800 w-full" />

        {/* Bottom Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="text-center lg:text-left">
            <p>© {new Date().getFullYear()} KaizenQ. All rights reserved.</p>
          </div>

          {/* Powered by Shaivika IT Technologies Bottom Pill */}
          <div className="flex items-center">
            <a
              href="https://www.shaivikaittechnologies.in"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-400/50 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-all shadow-2xs"
              title="Powered by Shaivika IT Technologies"
            >
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                <img
                  src="/brand/shaivika-logo.png"
                  alt="Shaivika IT Technologies"
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                />
              </div>
              <span className="text-[11px] font-medium">
                Powered by{' '}
                <strong className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                  Shaivika IT Technologies
                </strong>
                <span className="hidden sm:inline text-slate-400 dark:text-slate-500 mx-1">•</span>
                <span className="font-mono text-blue-600 dark:text-cyan-400 underline decoration-blue-400/40 underline-offset-2">
                  www.shaivikaittechnologies.in
                </span>
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
            </a>
          </div>

          {/* Theme Selector & Social Icons */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex items-center space-x-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors shadow-2xs"
                aria-label="GitHub Repository"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors shadow-2xs"
                aria-label="LinkedIn Profile"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Success Popup */}
        <AnimatePresence>
          {newsletterStatus === 'success' && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 left-8 z-50 bg-white dark:bg-slate-900 border border-emerald-500/40 p-4 rounded-xl shadow-xl flex items-center gap-3 max-w-sm"
            >
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Subscribed</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">You will receive product updates.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </footer>
  );
};
