import React from 'react';
import { CheckCircle2, PlayCircle, BookOpen, Terminal, HelpCircle, Circle, Lock } from 'lucide-react';
import { toast } from 'sonner';

export interface LessonItemData {
  id: string | number;
  title: string;
  duration?: string;
  type?: 'video' | 'lab' | 'reading' | 'quiz' | string;
}

interface LessonListProps {
  lessons: LessonItemData[];
  selectedLessonId: string | number;
  completedLessonIds: (string | number)[];
  onSelectLesson: (id: string | number) => void;
  isNightMode?: boolean;
  isUnlocked?: boolean;
  prevModuleTitle?: string;
}

export const LessonList: React.FC<LessonListProps> = ({
  lessons,
  selectedLessonId,
  completedLessonIds,
  onSelectLesson,
  isNightMode = false,
  isUnlocked = true,
  prevModuleTitle,
}) => {
  const getIcon = (type?: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className={`w-4 h-4 shrink-0 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`} />;
      case 'lab':
        return <Terminal className={`w-4 h-4 shrink-0 ${isNightMode ? 'text-emerald-400' : 'text-emerald-600'}`} />;
      case 'quiz':
        return <HelpCircle className={`w-4 h-4 shrink-0 ${isNightMode ? 'text-amber-400' : 'text-amber-500'}`} />;
      default:
        return <BookOpen className={`w-4 h-4 shrink-0 ${isNightMode ? 'text-cyan-300' : 'text-sky-500'}`} />;
    }
  };

  const handleLessonClick = (id: string | number) => {
    if (!isUnlocked) {
      toast.warning(`🔒 Module Locked! Complete all lessons in "${prevModuleTitle || 'Previous Module'}" & claim XP first!`);
      return;
    }
    onSelectLesson(id);
  };

  return (
    <div className="space-y-1 py-1">
      {lessons.map((lesson) => {
        const isSelected = String(selectedLessonId) === String(lesson.id);
        const isCompleted = completedLessonIds.some((id) => String(id) === String(lesson.id));

        return (
          <button
            key={lesson.id}
            onClick={() => handleLessonClick(lesson.id)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left text-xs cursor-pointer ${
              !isUnlocked
                ? isNightMode
                  ? 'opacity-60 bg-slate-900/40 cursor-not-allowed'
                  : 'opacity-60 bg-slate-100/40 cursor-not-allowed'
                : isSelected
                ? isNightMode
                  ? 'bg-slate-900 border border-cyan-500/60 text-cyan-300 font-bold shadow-xs'
                  : 'bg-sky-100/90 border border-sky-300 text-sky-950 font-bold shadow-xs'
                : isNightMode
                ? 'hover:bg-slate-900/80 text-slate-300 hover:text-white border border-transparent'
                : 'hover:bg-sky-50 text-slate-700 hover:text-slate-900 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {!isUnlocked ? (
                <Lock className="w-4 h-4 shrink-0 text-amber-500" />
              ) : isCompleted ? (
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${isNightMode ? 'text-emerald-400 fill-emerald-950' : 'text-emerald-600 fill-emerald-100'}`} />
              ) : isSelected ? (
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isNightMode ? 'border-cyan-400' : 'border-sky-600'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isNightMode ? 'bg-cyan-400' : 'bg-sky-600'}`} />
                </div>
              ) : (
                <Circle className={`w-4 h-4 shrink-0 ${isNightMode ? 'text-slate-600' : 'text-slate-400'}`} />
              )}

              <span className={`truncate ${isSelected ? (isNightMode ? 'text-cyan-200 font-bold' : 'text-sky-900 font-bold') : (isNightMode ? 'text-slate-200' : 'text-slate-700')}`}>
                {lesson.title}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isUnlocked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : getIcon(lesson.type)}
              {lesson.duration && (
                <span className={`text-[10px] font-mono ${isNightMode ? 'text-slate-400' : 'text-slate-400'}`}>{lesson.duration}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
