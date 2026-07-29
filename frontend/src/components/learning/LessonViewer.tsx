import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Terminal as TerminalIcon, Sparkles, CheckCircle2, ChevronRight, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Terminal } from './Terminal';

export interface LessonDetails {
  id: string | number;
  title: string;
  duration?: string;
  type?: string;
  badge?: string;
  videoUrl?: string;
  content: string;
  commands?: Array<{ command: string; description: string }>;
  resources?: Array<{ title: string; url: string }>;
}

interface LessonViewerProps {
  lesson: LessonDetails;
  isGitCourse?: boolean;
  onExecuteCommand?: (cmd: string) => void;
  onMarkComplete: () => void;
  onNextLesson: () => void;
  isCompleted: boolean;
  isNightMode?: boolean;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  isGitCourse = false,
  onExecuteCommand,
  onMarkComplete,
  onNextLesson,
  isCompleted,
  isNightMode = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(15);

  useEffect(() => {
    if (isCompleted) {
      setTimeLeft(0);
      return;
    }

    setTimeLeft(15);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lesson.id, isCompleted]);

  const handleClaimXP = () => {
    if (isCompleted) {
      toast.info('XP already claimed for this lesson!');
      return;
    }
    if (timeLeft > 0) return;
    onMarkComplete();
    toast.success('🎉 +50 XP Claimed! Lesson marked as completed!');
  };

  const formattedBadge = useMemo(() => {
    let b = lesson.badge || String(lesson.id);
    if (!b) return 'Core Lesson';

    if (b.includes('git-unit-')) {
      const match = b.match(/git-unit-(\d+)-(\d+)/);
      if (match) {
        return `Module ${match[1]} • Unit ${match[1]}.${match[2]}`;
      }
      return 'Hands-on Git Practice';
    }
    if (b.includes('git-les-')) {
      const num = b.replace('git-les-', '');
      return `Module 1 • Lesson ${num}`;
    }
    if (b.startsWith('git-')) {
      return b.replace('git-', 'Git ').replace(/-/g, ' ');
    }
    return b;
  }, [lesson.badge, lesson.id]);

  const formattedTitle = useMemo(() => {
    if (!lesson.title) return '';
    return lesson.title.replace(/^git-unit-\d+-\d+\s*:?\s*/i, '');
  }, [lesson.title]);

  return (
    <article className="w-full space-y-8 py-2 px-1">
      <header className={`space-y-4 border-b pb-8 ${isNightMode ? 'border-slate-800/80' : 'border-sky-100'}`}>
        <div className="flex flex-wrap items-center gap-3">
          {formattedBadge && (
            <span
              className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold flex items-center gap-2 border shadow-xs transition-all ${
                isNightMode
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80 shadow-cyan-950/40'
                  : 'bg-sky-100/90 text-sky-800 border-sky-200 shadow-sky-500/10'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`} />
              <span>{formattedBadge}</span>
            </span>
          )}

          <span
            className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-semibold flex items-center gap-2 border shadow-xs ${
              isNightMode
                ? 'bg-slate-900/90 text-slate-300 border-slate-800'
                : 'bg-white text-slate-700 border-sky-100'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`} />
            <span>Estimated: {lesson.duration || '15 mins'}</span>
          </span>
        </div>

        <h1
          className={`text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight ${
            isNightMode
              ? 'text-transparent bg-clip-text bg-linear-to-r from-white via-slate-100 to-slate-300'
              : 'text-slate-900'
          }`}
        >
          {formattedTitle}
        </h1>
      </header>

      <section className="space-y-4">
        <MarkdownRenderer content={lesson.content} isNightMode={isNightMode} />
      </section>

      <section
        className={`my-8 p-6 rounded-3xl border shadow-md space-y-3 ${
          isNightMode
            ? 'bg-slate-900/90 border-slate-800 text-slate-200 shadow-slate-950/40'
            : 'bg-linear-to-r from-sky-50 via-white to-blue-50/60 border-sky-200/80 text-slate-700 shadow-sky-500/5'
        }`}
      >
        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`}>
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>SHAIVIKA AI Key Concept Breakdown</span>
        </div>
        <p className={`text-sm leading-relaxed font-sans ${isNightMode ? 'text-slate-200' : 'text-slate-700'}`}>
          This lesson covers foundational techniques for real-world production environments. Master the syntax in the CLI terminal lab below to build muscle memory!
        </p>
      </section>

      {!isGitCourse && (
        <section className="my-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-lg font-bold flex items-center gap-2 font-heading ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
              <TerminalIcon className="w-5 h-5 text-emerald-500" />
              Hands-on CLI Terminal Sandbox
            </h3>
            <span className={`text-xs font-mono ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>Live Interactive Execution</span>
          </div>
          <Terminal
            initialCommands={lesson.commands || []}
            isGitCourse={isGitCourse}
            onExecuteCommand={onExecuteCommand}
          />
        </section>
      )}

      <footer
        className={`mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl border shadow-xl ${
          isNightMode
            ? 'bg-slate-900/90 border-slate-800 text-white shadow-slate-950/60'
            : 'bg-white border-sky-100 text-slate-900 shadow-sky-500/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
            <Zap className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
              <span>Finished reading & practice?</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
                +50 XP
              </span>
            </h4>
            <p className={`text-xs ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {isCompleted
                ? 'XP claimed for this lesson! Permanent record saved.'
                : timeLeft > 0
                ? `Read the lesson for ${timeLeft}s to unlock your XP reward.`
                : 'Your XP reward is ready to be claimed!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* CLAIM XP / COMPLETED BUTTON */}
          <button
            onClick={handleClaimXP}
            disabled={isCompleted || timeLeft > 0}
            className={`py-3 px-5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                : timeLeft > 0
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                : 'bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 animate-pulse'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>✓ XP Claimed (+50 XP)</span>
              </>
            ) : timeLeft > 0 ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                <span>Claim XP in {timeLeft}s...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-slate-950 fill-current" />
                <span>⚡ Claim +50 XP</span>
              </>
            )}
          </button>

          {/* NEXT LESSON BUTTON */}
          <button
            onClick={onNextLesson}
            className={`py-3 px-5 rounded-2xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto ${
              isNightMode
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/30 shadow-lg shadow-cyan-950'
                : 'btn-blue-primary shadow-lg shadow-sky-500/20'
            }`}
          >
            <span>Next Lesson</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </article>
  );
};
