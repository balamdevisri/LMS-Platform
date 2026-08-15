import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, BookOpen, Terminal, Briefcase, Award } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50/80 dark:bg-slate-950 text-slate-600 dark:text-slate-400 pt-20 pb-12 border-t border-[#E6EEF9] dark:border-slate-800 relative overflow-hidden font-['Sora'] transition-colors duration-300">
      
      {/* Background Subtle Glow */}
      <div className="absolute -bottom-10 right-1/4 w-96 h-96 bg-blue-500/5 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          
          {/* Logo & Newsletter Column */}
          <div className="lg:col-span-5 space-y-6">
            <BrandLogo size="lg" showSubtitle={true} />
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed font-normal">
              KaizenQ is the premier AI-first learning management system for universities, tech academies, and enterprise engineering teams.
            </p>

            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest block mb-3">
                Subscribe to AI Product Releases
              </span>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 dark:text-cyan-400" />
                  <input
                    type="email"
                    placeholder="Enter work email"
                    className="w-full bg-white dark:bg-slate-900 border border-[#E6EEF9] dark:border-slate-800 focus:border-blue-500 dark:focus:border-cyan-500 focus:outline-hidden rounded-xl py-3 pl-10 pr-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-premium-primary text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow-md"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Spacer for cleaner layout on desktop */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:col-span-6">
            
            {/* Column 1: Platform */}
            <div className="space-y-4">
              <h4 className="font-heading font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Platform</h4>
              <ul className="space-y-3 text-xs font-semibold">
                <li><a href="#courses" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Courses Catalog</a></li>
                <li><a href="#features" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">AI Core Features</a></li>
                <li><a href="#pricing" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Pricing Plans</a></li>
                <li><Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Interactive IDE</Link></li>
              </ul>
            </div>

            {/* Column 2: Resources */}
            <div className="space-y-4">
              <h4 className="font-heading font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3 text-xs font-semibold">
                <li className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                  <a href="#" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Documentation</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                  <a href="#" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">API Reference</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                  <a href="#" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Certificates</a>
                </li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Status Logs</a></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="space-y-4 col-span-2 sm:col-span-1">
              <h4 className="font-heading font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 text-xs font-semibold">
                <li><a href="#about" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">About Brand</a></li>
                <li className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                  <a href="#" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Careers</a>
                  <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded-sm">Hiring</span>
                </li>
                <li><a href="#about" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Security SOC2</a></li>
                <li><a href="#about" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Divider */}
        <div className="h-px bg-[#E6EEF9] dark:border-slate-800 dark:bg-slate-800 w-full" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400 font-['Sora']">
          <div className="space-y-1 text-center md:text-left">
            <p>© {new Date().getFullYear()} Kaizen Q Inc. All rights reserved.</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Platform credentials verified by ISO 27001 & SOC3 audits.</p>
          </div>

          {/* Theme Selector & Branded Social Icons */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Theme:</span>
              <ThemeToggle />
            </div>
            
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex items-center space-x-2.5">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-[#E6EEF9] dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:border-blue-400 dark:hover:border-slate-700 hover:scale-105 transition-all shadow-xs"
                aria-label="GitHub Repository"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-[#E6EEF9] dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:border-blue-400 dark:hover:border-slate-700 hover:scale-105 transition-all shadow-xs"
                aria-label="LinkedIn Profile"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-[#E6EEF9] dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:border-blue-400 dark:hover:border-slate-700 hover:scale-105 transition-all shadow-xs"
                aria-label="Discord Guild"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.45-5c.87-.64,1.72-1.32,2.53-2a75.48,75.48,0,0,0,72.76,0c.81.7,1.66,1.38,2.53,2a68.43,68.43,0,0,1-10.45,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129.87,49.62,123.86,26.78,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-[#E6EEF9] dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:border-blue-400 dark:hover:border-slate-700 hover:scale-105 transition-all shadow-xs"
                aria-label="YouTube Lectures Channel"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163c-.272-.997-1.09-1.781-2.115-2.048-1.871-.499-9.383-.499-9.383-.499s-7.513 0-9.383.499c-1.025.267-1.843 1.051-2.115 2.048-.5 1.871-.5 5.776-.5 5.776s0 3.905.5 5.776c.272.997 1.09 1.781 2.115 2.048 1.871.499 9.383.499 9.383.499s7.513 0 9.383-.499c1.025-.267 1.843-1.051 2.115-2.048.5-1.871.5-5.776.5-5.776s0-3.905-.5-5.776zm-14.298 9.337v-6.998l6.08 3.5-6.08 3.498z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
