import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Globe, Share2, MessageCircle, Video } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-sky-50/50 text-slate-600 pt-20 pb-12 border-t border-sky-100 relative overflow-hidden font-['Sora']">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-sky-100">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="lg" showSubtitle={true} />
            <p className="text-slate-600 text-xs sm:text-sm max-w-sm leading-relaxed font-normal">
              KaizenQ is the premier AI-first learning management system for universities, tech academies, and enterprise engineering teams.
            </p>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-2">
                Subscribe to AI Product Releases
              </span>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
                  <input
                    type="email"
                    placeholder="Enter work email"
                    className="w-full bg-white border border-sky-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-blue-primary px-4 py-2.5 text-xs font-bold"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-slate-900 text-sm mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><a href="#courses" className="hover:text-sky-600 transition-colors">Course Catalog</a></li>
              <li><a href="#features" className="hover:text-sky-600 transition-colors">AI Features</a></li>
              <li><a href="#pricing" className="hover:text-sky-600 transition-colors">Pricing Plans</a></li>
              <li><Link to="/dashboard" className="hover:text-sky-600 transition-colors">Interactive Workspace</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-bold text-slate-900 text-sm mb-4">Company & Legal</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><a href="#about" className="hover:text-sky-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#about" className="hover:text-sky-600 transition-colors">Terms of Service</a></li>
              <li><a href="#about" className="hover:text-sky-600 transition-colors">Security & SOC2</a></li>
              <li><a href="#about" className="hover:text-sky-600 transition-colors">Data Compliance</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-['Sora']">
          <p>© {new Date().getFullYear()} Kaizen Q. Powered by Shaivika Groups. All rights reserved.</p>
          <div className="flex items-center space-x-3">
            <a href="#" className="w-8 h-8 rounded-lg bg-white border border-sky-200 flex items-center justify-center text-slate-600 hover:text-sky-600 hover:border-sky-400 transition-all shadow-xs" aria-label="Website">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-lg bg-white border border-sky-200 flex items-center justify-center text-slate-600 hover:text-sky-600 hover:border-sky-400 transition-all shadow-xs" aria-label="Share">
              <Share2 className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-lg bg-white border border-sky-200 flex items-center justify-center text-slate-600 hover:text-sky-600 hover:border-sky-400 transition-all shadow-xs" aria-label="Community">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-lg bg-white border border-sky-200 flex items-center justify-center text-slate-600 hover:text-sky-600 hover:border-sky-400 transition-all shadow-xs" aria-label="Videos">
              <Video className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
