import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Code2, ChevronRight, Cpu } from 'lucide-react';
import { PracticeLab } from '../../components/courses/PracticeLab';

export const PracticeLabPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 text-slate-900 font-['Sora'] max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Top Header Banner & Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-medium">
            <Link to="/dashboard" className="hover:text-blue-600 font-semibold transition-colors">
              Main Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize font-extrabold text-blue-600">Practice Sandbox</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 shadow-2xs">
              <Code2 className="w-6 h-6" />
            </span>
            <span>Shaivika AI Cloud Practice Sandbox</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium max-w-2xl">
            Interactive multi-language cloud IDE with live execution engine, automated test validator, and instant AI code assistance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 hover:border-blue-300 font-bold text-xs shadow-3xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Hero Stats & Status Strip */}
      <div className="bg-linear-to-r from-slate-900 via-slate-850 to-indigo-950 rounded-3xl p-5 border border-slate-800 shadow-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h2 className="font-heading font-extrabold text-lg text-white">Live Execution Cluster</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              ONLINE • 0ms Latency
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Write JavaScript, TypeScript, Python, or C++ with zero setup. Supports custom inputs and AI code reviews.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-3.5 py-2 text-center">
            <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Supported Languages</div>
            <div className="text-xs font-extrabold text-emerald-400 font-mono">JS / TS / Python / SQL</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-3.5 py-2 text-center">
            <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">AI Assistant</div>
            <div className="text-xs font-extrabold text-sky-400 font-mono">Active & Ready</div>
          </div>
        </div>
      </div>

      {/* Main Full Viewport Practice Lab IDE */}
      <div className="bg-slate-950 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl h-[calc(100vh-230px)] min-h-180 p-2">
        <PracticeLab standalone={true} courseId="1" />
      </div>
    </div>
  );
};

export default PracticeLabPage;
