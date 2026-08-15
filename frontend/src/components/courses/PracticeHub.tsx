import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Code, Cpu, Play, ExternalLink } from 'lucide-react';
import { ChallengeProvider } from '../../services/practice/practiceEngine';

export const PracticeHub: React.FC = () => {
  const navigate = useNavigate();
  const provider = new ChallengeProvider();
  const challenges = provider.getChallenges();

  const handleLaunchChallenge = (id: string) => {
    navigate(`/dashboard/practice-lab?challengeId=${id}`);
  };

  const miniProjects = [
    {
      title: 'Git Branch Graph Parser',
      desc: 'Build a frontend visualizer representing Git commit history DAG (Directed Acyclic Graph) models.',
      xp: 150,
      diff: 'Medium',
    },
    {
      title: 'Linux Cron-scheduler Simulator',
      desc: 'Configure cron formats and implement an in-memory interval loop executing periodic task schedules.',
      xp: 200,
      diff: 'Hard',
    },
    {
      title: 'SQL Normalizer & Index Audit',
      desc: 'Analyze un-normalized database schemas and suggest foreign key indices for performance boosts.',
      xp: 100,
      diff: 'Easy',
    },
  ];

  return (
    <div className="space-y-8 font-sans text-slate-800 dark:text-zinc-100 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="p-6 rounded-3xl border border-sky-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-6 h-6 text-indigo-500" />
            <span>Interactive Practice Hub & Labs - Real time</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Write code, complete mini-projects, audit SQL syntax, and verify command scripts.
          </p>
        </div>
      </div>

      {/* Grid: Main Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Coding Exercises */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
            <h3 className="text-sm font-extrabold text-indigo-900 dark:text-indigo-100 uppercase tracking-wider flex items-center gap-2.5">
              <Code className="w-5 h-5 text-indigo-500" />
              <span>Interactive Coding Exercises</span>
            </h3>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              {challenges.length} Active Challenges
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {challenges.map((ch) => (
              <div
                key={ch.id}
                className="p-5 rounded-3xl border border-sky-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-3xs flex flex-col justify-between hover:border-indigo-200 dark:hover:border-zinc-700 transition-all duration-200 group"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-heading font-black text-xs text-slate-900 dark:text-white group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                      {ch.title}
                    </h4>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                        ch.difficulty === 'Easy'
                          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60'
                          : ch.difficulty === 'Medium'
                          ? 'text-indigo-700 dark:text-cyan-300 bg-indigo-50 dark:bg-cyan-950/60 border-indigo-200 dark:border-cyan-800/60'
                          : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60'
                      }`}
                    >
                      {ch.difficulty}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-450 mt-2 leading-relaxed">
                    {ch.topic} • Estimated Time: {ch.estimatedTime}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-450 dark:text-zinc-550">
                    +50 XP Reward
                  </span>
                  <button
                    onClick={() => handleLaunchChallenge(ch.id)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all shadow-3xs group-hover:scale-105"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start Challenge</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Mini Projects */}
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30">
            <h3 className="text-sm font-extrabold text-emerald-900 dark:text-emerald-100 uppercase tracking-wider flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-emerald-500" />
              <span>Curriculum Mini Projects</span>
            </h3>
          </div>

          <div className="space-y-4">
            {miniProjects.map((p, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl border border-sky-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-3xs space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-heading font-black text-xs text-slate-900 dark:text-white">
                    {p.title}
                  </h4>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-550">
                    {p.diff}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-450 leading-relaxed">
                  {p.desc}
                </p>
                <div className="flex justify-between items-center text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                  <span>+{p.xp} Experience Points</span>
                  <span className="text-slate-400 dark:text-zinc-500 flex items-center gap-0.5">
                    Standalone <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
