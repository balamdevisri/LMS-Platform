import React from 'react';
import { ChevronDown, ChevronUp, Layers, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { LessonList } from './LessonList';
import type { LessonItemData } from './LessonList';

export interface ModuleData {
  id: number | string;
  title: string;
  duration?: string;
  lessons: LessonItemData[];
}

interface ModuleAccordionProps {
  module: ModuleData;
  isOpen: boolean;
  onToggle: () => void;
  selectedLessonId: string | number;
  completedLessonIds: (string | number)[];
  onSelectLesson: (id: string | number) => void;
  isNightMode?: boolean;
  isUnlocked?: boolean;
  prevModuleTitle?: string;
}

export const ModuleAccordion: React.FC<ModuleAccordionProps> = ({
  module,
  isOpen,
  onToggle,
  selectedLessonId,
  completedLessonIds,
  onSelectLesson,
  isNightMode = false,
  isUnlocked = true,
  prevModuleTitle,
}) => {
  const completedCount = module.lessons.filter((l) =>
    completedLessonIds.some((id) => String(id) === String(l.id))
  ).length;

  const isFullyCompleted = completedCount === module.lessons.length && module.lessons.length > 0;

  const handleHeaderClick = () => {
    if (!isUnlocked) {
      toast.warning(`🔒 Module Locked! Complete all lessons in "${prevModuleTitle || 'Previous Module'}" & claim XP first!`);
      return;
    }
    onToggle();
  };

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-xs transition-all duration-200 ${
      !isUnlocked
        ? isNightMode
          ? 'border-slate-800/60 bg-slate-950/60 opacity-80'
          : 'border-slate-200 bg-slate-100/60 opacity-85'
        : isNightMode
        ? 'border-slate-800 bg-slate-900 hover:border-slate-700'
        : 'border-sky-100 bg-white hover:border-sky-200'
    }`}>
      <button
        onClick={handleHeaderClick}
        className={`w-full flex items-center justify-between p-3.5 text-left transition-all cursor-pointer ${
          !isUnlocked
            ? isNightMode
              ? 'bg-slate-950/80 text-slate-500'
              : 'bg-slate-100/80 text-slate-500'
            : isNightMode
            ? 'bg-slate-900/80 hover:bg-slate-800/80'
            : 'bg-sky-50/40 hover:bg-sky-50'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-2 rounded-xl border shrink-0 ${
              !isUnlocked
                ? isNightMode
                  ? 'bg-slate-900 border-slate-800 text-slate-500'
                  : 'bg-slate-200/80 border-slate-300 text-slate-500'
                : isFullyCompleted
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : isOpen
                ? isNightMode
                  ? 'bg-slate-800 border-slate-700 text-cyan-300'
                  : 'bg-sky-100 border-sky-200 text-sky-700'
                : isNightMode
                ? 'bg-slate-950 border-slate-800 text-slate-400'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
          >
            {!isUnlocked ? (
              <Lock className="w-4 h-4 text-amber-500" />
            ) : isFullyCompleted ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Layers className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`text-xs sm:text-sm font-bold truncate leading-snug ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
                {module.title}
              </h3>
              {!isUnlocked && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                  isNightMode
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  🔒 Locked
                </span>
              )}
            </div>
            <div className={`flex items-center gap-2 text-[11px] font-mono mt-0.5 ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>{module.lessons.length} lessons</span>
              <span>•</span>
              <span className={`font-semibold ${!isUnlocked ? (isNightMode ? 'text-amber-400' : 'text-amber-600') : isNightMode ? 'text-cyan-300' : 'text-sky-600'}`}>
                {!isUnlocked ? 'Requires Prerequisite' : `${completedCount}/${module.lessons.length} completed`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {!isUnlocked ? (
            <Lock className="w-4 h-4 text-amber-500" />
          ) : isOpen ? (
            <ChevronUp className={`w-4 h-4 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`} />
          ) : (
            <ChevronDown className={`w-4 h-4 ${isNightMode ? 'text-slate-400' : 'text-slate-400'}`} />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && isUnlocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`px-2 pb-2 pt-1 border-t ${isNightMode ? 'border-slate-800 bg-slate-950/60' : 'border-sky-100 bg-slate-50/40'}`}
          >
            <LessonList
              lessons={module.lessons}
              selectedLessonId={selectedLessonId}
              completedLessonIds={completedLessonIds}
              onSelectLesson={onSelectLesson}
              isNightMode={isNightMode}
              isUnlocked={isUnlocked}
              prevModuleTitle={prevModuleTitle}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
