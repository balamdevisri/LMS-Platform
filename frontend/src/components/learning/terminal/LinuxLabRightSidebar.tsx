import React from 'react';
import {
  Target,
  Sparkles,
  CheckCircle2,
  Bot,
  Award
} from 'lucide-react';
import type { LabTask } from './useLinuxShellEngine';

interface LinuxLabRightSidebarProps {
  isNightMode: boolean;
  tasks: LabTask[];
  onOpenAIAssistant: () => void;
}

export const LinuxLabRightSidebar: React.FC<LinuxLabRightSidebarProps> = ({
  isNightMode,
  tasks,
  onOpenAIAssistant,
}) => {
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <aside
      className={`w-full lg:w-80 shrink-0 border-l flex flex-col transition-colors space-y-4 p-4 ${
        isNightMode
          ? 'bg-slate-950 border-slate-800 text-slate-200'
          : 'bg-slate-50/90 border-sky-100 text-slate-800'
      }`}
    >
      {/* Objectives Header Card */}
      <div className={`p-4 rounded-2xl border shadow-xs space-y-3 ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-sky-100'}`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 text-xs font-bold ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`}>
            <Target className="w-4 h-4" />
            <span>Lesson Objectives</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {completedCount}/{tasks.length} Solved
          </span>
        </div>

        {tasks.length === 0 ? (
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Free Interactive Shell Sandbox. Execute any Linux bash commands to practice freely!
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-2 text-xs">
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-500 shrink-0 mt-0.5" />
                )}
                <span className={task.completed ? 'line-through text-slate-400' : 'font-medium'}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Assistant Quick Trigger */}
      <div className={`p-4 rounded-2xl border shadow-xs space-y-3 ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-sky-100'}`}>
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span>Linux AI Companion</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Stuck on a syntax error or permission flag? Ask the AI Tutor for real-time root-cause analysis!
        </p>

        <button
          onClick={onOpenAIAssistant}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
            isNightMode
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/40 shadow-cyan-950'
              : 'bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask Linux AI Assistant</span>
        </button>
      </div>

      {/* Expected Terminal Output Card */}
      <div className={`p-4 rounded-2xl border shadow-xs space-y-2.5 ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-sky-100'}`}>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <Award className="w-4 h-4" />
          <span>Expected Target Result</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1">
          <div>$ pwd</div>
          <div className="text-slate-300">/home/student/linux-practice</div>
          <div className="pt-1 text-slate-400">$ ls -la</div>
          <div className="text-slate-300">notes.txt</div>
        </div>
      </div>
    </aside>
  );
};
