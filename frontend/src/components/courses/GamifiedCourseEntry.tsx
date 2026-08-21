import React, { useState, useEffect } from 'react';
import { soundService } from '@/services/soundService';
import { CheckCircle2, Play, BookOpen, Activity } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: string;
}

interface Module {
  id: string;
  title: string;
  duration?: string;
  lessons: Lesson[];
}

interface GamifiedCourseEntryProps {
  courseTitle: string;
  modules: Module[];
  onStartMission: () => void;
}

export const GamifiedCourseEntry: React.FC<GamifiedCourseEntryProps> = ({
  courseTitle,
  modules,
  onStartMission,
}) => {
  const [stage, setStage] = useState<'initializing' | 'revealing' | 'ready'>('initializing');
  const [initProgress, setInitProgress] = useState(0);
  const [checklist, setChecklist] = useState<{ text: string; done: boolean }[]>([
    { text: 'Course core data package loaded', done: false },
    { text: 'Syllabus and learning path verified', done: false },
    { text: 'Practice workspace sandbox initialized', done: false },
  ]);
  const [revealedCount, setRevealedCount] = useState(0);

  // Check user prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Calculate dynamic stagger so total duration is always between 2-4 seconds
  const totalModules = modules.length;
  const staggerDuration = Math.max(100, Math.min(200, Math.floor(1200 / Math.max(1, totalModules))));

  useEffect(() => {
    if (prefersReducedMotion) {
      setStage('ready');
      setRevealedCount(modules.length);
      soundService.play('success');
      return;
    }

    soundService.play('course');

    // 1. Fast 500ms Initialization Progress Bar & Checks
    let tickCount = 0;
    const progressInterval = setInterval(() => {
      tickCount += 8;
      setInitProgress(Math.min(tickCount, 100));
      if (tickCount >= 100) {
        clearInterval(progressInterval);
      }
    }, 35);

    const check1 = setTimeout(() => {
      setChecklist(prev => prev.map((item, idx) => idx === 0 ? { ...item, done: true } : item));
      soundService.play('select');
    }, 120);

    const check2 = setTimeout(() => {
      setChecklist(prev => prev.map((item, idx) => idx === 1 ? { ...item, done: true } : item));
      soundService.play('select');
    }, 280);

    const check3 = setTimeout(() => {
      setChecklist(prev => prev.map((item, idx) => idx === 2 ? { ...item, done: true } : item));
      soundService.play('select');
    }, 420);

    // Transition to module reveal phase
    const transitionReveal = setTimeout(() => {
      setStage('revealing');
    }, 550);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(check1);
      clearTimeout(check2);
      clearTimeout(check3);
      clearTimeout(transitionReveal);
    };
  }, [prefersReducedMotion, modules.length]);

  // 2. Module reveal loop (One-by-one rendering)
  useEffect(() => {
    if (stage !== 'revealing' || prefersReducedMotion) return;

    if (revealedCount < modules.length) {
      const timer = setTimeout(() => {
        setRevealedCount(prev => prev + 1);
        soundService.play('select');
      }, staggerDuration);

      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setStage('ready');
        soundService.play('success');
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [stage, revealedCount, modules.length, prefersReducedMotion, staggerDuration]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex flex-col items-center justify-start py-12 px-4 bg-slate-950/95 backdrop-blur-xl font-['Sora'] text-slate-100 select-none">
      
      {/* Immersive Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      
      {/* Header Info */}
      <div className="relative z-10 max-w-xl w-full text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20 tracking-widest uppercase">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>MISSION DEPLOYMENT PROTOCOL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {courseTitle}
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        
        {/* Phase 1: Initialization screen */}
        {stage === 'initializing' && (
          <div className="p-6 sm:p-8 rounded-3xl border border-primary/30 bg-slate-900/80 shadow-[0_0_50px_rgba(249,115,22,0.1)] dark:shadow-[0_0_50px_rgba(6,182,212,0.1)] space-y-6 animate-scale-up">
            <div className="flex justify-between items-center text-xs font-mono font-bold text-primary">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                ⚡ INITIALIZING MISSION CORE...
              </span>
              <span>{initProgress}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-linear-to-r from-primary to-secondary transition-all duration-75"
                style={{ width: `${initProgress}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 font-mono">
              {checklist.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    item.done ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  <span className="shrink-0 flex items-center justify-center w-5 h-5">
                    {item.done ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-700 animate-pulse" />
                    )}
                  </span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase 2 & 3: Immersion Map Path with Staggered Rendering */}
        {(stage === 'revealing' || stage === 'ready') && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Top Indicator */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold text-slate-500 tracking-wider">
                PATHMAP SEQUENCER
              </span>
              <span className="text-xs font-mono font-bold text-primary">
                REVEALED: {revealedCount}/{modules.length}
              </span>
            </div>

            {/* Curriculum Timeline */}
            <div className="relative pl-8 pb-4">
              
              {/* Timeline Vertical Connector Path Base */}
              <div className="absolute left-3.5 top-5 bottom-5 w-0.5 bg-slate-900 border-l border-slate-850" />

              {/* Staggered Module Elements Rendered One-by-One */}
              {modules.slice(0, prefersReducedMotion ? modules.length : revealedCount).map((mod, idx) => {
                const isLastRevealed = idx === (prefersReducedMotion ? modules.length - 1 : revealedCount - 1);
                const hasNext = idx < modules.length - 1;
                const nextIsRevealed = idx < (prefersReducedMotion ? modules.length - 1 : revealedCount - 1);

                return (
                  <div 
                    key={mod.id}
                    className={`relative mb-6 last:mb-0 transition-all duration-300 transform scale-100 translate-y-0 animate-reveal-card ${
                      isLastRevealed ? 'ring-2 ring-primary/40 rounded-2xl' : ''
                    }`}
                  >
                    {/* Left Node Dot Indicator */}
                    <div className={`absolute -left-8 top-3 w-7 h-7 -translate-x-0.5 rounded-full flex items-center justify-center border-2 font-mono text-[10px] font-bold transition-all duration-300 z-10 ${
                      isLastRevealed 
                        ? 'bg-primary border-primary text-slate-950 shadow-[0_0_15px_var(--color-primary)] scale-110' 
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}>
                      0{idx + 1}
                    </div>

                    {/* Progressive connecting line segment down to the next module */}
                    {hasNext && (
                      <div className={`absolute left-[-22px] top-10 bottom-[-24px] w-0.5 transition-all duration-300 ${
                        nextIsRevealed 
                          ? 'bg-primary shadow-[0_0_8px_var(--color-primary)] animate-line-draw' 
                          : 'bg-transparent'
                      }`} />
                    )}

                    {/* Card container */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xs backdrop-blur-xs flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                              Level 0{idx + 1}
                            </span>
                            {isLastRevealed && (
                              <span className="text-[8px] font-mono font-black text-primary bg-primary/10 border border-primary/20 px-1 rounded-sm animate-pulse">
                                UNLOCKED
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-primary transition-colors leading-tight">
                            {mod.title}
                          </h4>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 border border-slate-850 px-2 py-1 rounded-lg">
                          {mod.lessons.length} topics
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ready State and Deploy CTA */}
            {stage === 'ready' && (
              <div className="pt-6 border-t border-slate-900 text-center space-y-4 animate-scale-up">
                <div className="text-emerald-400 font-mono font-black text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 animate-bounce" />
                  <span>🎯 LEARNING PATH READY</span>
                </div>
                
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Curriculum levels unlocked. Your mission track is ready for entry.
                </p>

                <button
                  onClick={onStartMission}
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white font-black text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-95 cursor-pointer w-full"
                >
                  <Play className="w-4 h-4 fill-white animate-pulse" />
                  <span>START MISSION →</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
