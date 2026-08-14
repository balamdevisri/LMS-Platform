import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, CheckSquare, ShieldCheck } from 'lucide-react';

interface QuestionItem {
  q: string;
  a: string;
  category: 'Git & GitHub' | 'Linux Admin' | 'Database RDBMS' | 'HR Behavioral';
}

export const InterviewPrep: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'Git & GitHub' | 'Linux Admin' | 'Database RDBMS' | 'HR Behavioral'>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const qaList: QuestionItem[] = [
    {
      category: 'Git & GitHub',
      q: 'Explain the difference between git reset --hard, --soft, and --mixed.',
      a: '--soft leaves changes staged in index and working tree untouched. --mixed (default) resets the index, leaving changes in local workspace. --hard discards all local work and staged changes entirely, resetting workspace state back to commit state.',
    },
    {
      category: 'Git & GitHub',
      q: 'How does Git handle merge conflicts internally?',
      a: 'Git uses three-way merge logic (compares current branch head, incoming branch head, and their common ancestor base). It labels conflict regions with marker brackets (<<<<<<<, =======, >>>>>>>) and prompts user resolution.',
    },
    {
      category: 'Linux Admin',
      q: 'What is the role of an Inode in the Linux file system?',
      a: 'An index node (Inode) is a data structure storing file metadata: size, file owner, permissions (read/write/execute), group ownership, timestamps, and disk block pointers. Importantly, it does not store the actual file content or the filename.',
    },
    {
      category: 'Linux Admin',
      q: 'Explain privilege escalation validation using the visudo command.',
      a: 'Using visudo audits syntax configurations of /etc/sudoers file before applying changes. If syntax errors occur, it blocks saving to prevent disabling the root sudo permissions cascade completely.',
    },
    {
      category: 'Database RDBMS',
      q: 'Detail the ACID transaction rules.',
      a: 'Atomicity (all operations commit or all fail), Consistency (state conforms to constraints/schemas), Isolation (concurrent operations do not interfere), and Durability (once committed, records persist even through systems failure).',
    },
    {
      category: 'Database RDBMS',
      q: 'How does database indexing improve query speed, and when should we avoid it?',
      a: 'Indexing structures (e.g. B+ Trees) allow binary search access logs rather than full sequential table scans. Avoid them on columns with low cardinality (e.g. boolean status), or tables with frequent updates/writes (due to index rebuild overhead).',
    },
    {
      category: 'HR Behavioral',
      q: 'Walk me through a technical challenge you solved and your problem-solving process.',
      a: 'Focus your response on the STAR method: describe a specific technical problem (e.g., resolving transaction blocking issues), the Task required, Action steps (analyzing deadlock trace logs, restructuring indices), and positive Result metrics (queries speeded up by 40%).',
    },
  ];

  const filteredQa = activeCategory === 'all' ? qaList : qaList.filter(item => item.category === activeCategory);

  const mockSteps = [
    'Prepare STAR format examples for behavioral queries.',
    'Formulate explanations for complex systems structures (e.g., Git DAG vs tree).',
    'Review basic query optimization patterns and SQL joins mechanics.',
    'Test systems command lines (bash logs auditing, visudo config locks).',
  ];

  return (
    <div className="space-y-8 font-sans text-slate-800 dark:text-zinc-100 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl border border-sky-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-indigo-500" />
            <span>Interview Prep & Mock Q&A</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Audit standard technical viva and HR behavioral questions to clear placements.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap bg-slate-100/50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/50 rounded-2xl p-1 text-[10px] font-bold gap-1">
          {['all', 'Git & GitHub', 'Linux Admin', 'Database RDBMS', 'HR Behavioral'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat as any);
                setExpandedIndex(null);
              }}
              className={`px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
                activeCategory === cat 
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm border border-slate-200 dark:border-zinc-600' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-zinc-700/50 border border-transparent'
              }`}
            >
              {cat === 'all' ? 'All Questions' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Questions Feed */}
        <div className="lg:col-span-2 space-y-4">
          {filteredQa.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="p-5 rounded-3xl border border-sky-100 dark:border-zinc-850 bg-white dark:bg-zinc-900 shadow-3xs hover:border-indigo-150 dark:hover:border-zinc-800 transition-all"
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest">
                      {item.category}
                    </span>
                    <h4 className="font-heading font-black text-xs text-slate-900 dark:text-white leading-relaxed">
                      {item.q}
                    </h4>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-3.5 border-t border-dashed border-slate-100 dark:border-zinc-800 text-[11.5px] text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Mock Prep Checklist */}
        <div className="p-6 rounded-3xl border border-sky-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-6 self-start relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30">
            <h3 className="text-sm font-extrabold text-emerald-900 dark:text-emerald-100 uppercase tracking-wider flex items-center gap-2.5">
              <CheckSquare className="w-5 h-5 text-emerald-500" />
              <span>Placement Readiness Checks</span>
            </h3>
          </div>

          <div className="space-y-4 relative z-10">
            {mockSteps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-805 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-black">
                  ✓
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-450 leading-relaxed font-medium">
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-750 dark:text-indigo-300 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-500 shrink-0" />
            <div>
              <span className="text-[10px] font-black block">Placement Assistance Office</span>
              <span className="text-[9px] opacity-80 block">All modules credentials verified automatically.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
