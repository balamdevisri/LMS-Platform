import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Terminal, Award, Sparkles, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { SignupForm } from '@/components/auth/SignupForm';

export const StudentSignup: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50/80 via-white to-sky-100/50 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-['Sora'] selection:bg-sky-500 selection:text-white">
      
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-150 h-150 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-150 h-150 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: Premium Hero Showcase (Desktop) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 space-y-8 text-slate-900"
        >
          {/* Brand Header */}
          <div className="space-y-3">
            <BrandLogo size="lg" showSubtitle={true} />
            <div className="pt-2 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 border border-sky-200 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-pulse" /> AI Learning Engine v4.0
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900 leading-tight">
              Master Cloud, DevOps & Linux with <span className="bg-linear-to-r from-sky-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">24/7 AI Guidance</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Accelerate your engineering career with real-time browser sandboxes, automated homework evaluation, and verified digital badges.
            </p>
          </div>

          {/* Feature Showcase List */}
          <div className="space-y-4 pt-2">
            
            <div className="p-4 rounded-2xl bg-white/80 border border-sky-100 shadow-xs flex items-start gap-3.5 hover:border-sky-300 transition-all">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Personalized 24/7 AI Code Tutor</h4>
                <p className="text-[11px] text-slate-500 font-normal">Explains complex terminal commands & code errors line-by-line in real time.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-sky-100 shadow-xs flex items-start gap-3.5 hover:border-sky-300 transition-all">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">In-Browser Linux Sandboxes</h4>
                <p className="text-[11px] text-slate-500 font-normal">Zero-setup terminal environments running interactive quizzes & lab challenges.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-sky-100 shadow-xs flex items-start gap-3.5 hover:border-sky-300 transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">ISO Digital Credentials</h4>
                <p className="text-[11px] text-slate-500 font-normal">Cryptographically verifiable certificates for LinkedIn & employer showcase.</p>
              </div>
            </div>

          </div>

          {/* Social Proof */}
          <div className="pt-2 flex items-center gap-3 text-xs text-slate-500 font-medium">
            <div className="flex -space-x-2">
              <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" alt="Learner" />
              <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" alt="Learner" />
              <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" alt="Learner" />
            </div>
            <span>Joined by <strong>50,000+</strong> active engineering students.</span>
          </div>

        </motion.div>

        {/* Right Column: Glassmorphic Signup Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7"
        >
          <div className="bg-white/90 backdrop-blur-2xl border border-sky-200/90 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-sky-500/15 text-slate-900 relative">
            
            {/* Header Title & Subtitle */}
            <div className="text-center sm:text-left space-y-1.5 pb-6 border-b border-sky-100">
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                Create Your Student Account
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Join KaizenQ AI Learning Platform and start your learning journey.
              </p>
            </div>

            {/* Form */}
            <div className="pt-6">
              <SignupForm />
            </div>

            {/* Security Badge Footer */}
            <div className="pt-6 border-t border-sky-100 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium mt-6">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SSL 256-Bit Encrypted Data Privacy & Protection</span>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default StudentSignup;
