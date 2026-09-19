import React, { useMemo } from 'react';
import {
  CheckCircle2,
  Lock,
  X,
  ArrowLeft,
  Terminal,
  Database,
  GitBranch,
  Code2,
  Server,
  Cloud,
  Layers,
  Cpu,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { getPresentationLessonTitle } from '@/services/courseNormalizer';
import type { ModuleData } from './ModuleAccordion';

const getThemeColorClasses = (themeColor?: string | null) => {
  switch (themeColor) {
    case 'indigo': return { dot: 'bg-indigo-500', text: 'text-indigo-400', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
    case 'sky': return { dot: 'bg-sky-500', text: 'text-sky-400', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30' };
    case 'emerald': return { dot: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    case 'amber': return { dot: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    case 'purple': return { dot: 'bg-purple-500', text: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
    case 'rose': return { dot: 'bg-rose-500', text: 'text-rose-400', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
    case 'cyan': return { dot: 'bg-cyan-500', text: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
    case 'slate': return { dot: 'bg-slate-400', text: 'text-slate-400', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
    default: return null;
  }
};

const getThemeIconComponent = (iconName?: string | null) => {
  switch (iconName) {
    case 'terminal': return Terminal;
    case 'database': return Database;
    case 'git-branch': return GitBranch;
    case 'code': return Code2;
    case 'server': return Server;
    case 'cloud': return Cloud;
    case 'layers': return Layers;
    case 'cpu': return Cpu;
    case 'shield': return ShieldCheck;
    case 'book-open': return BookOpen;
    default: return null;
  }
};

interface CourseSidebarOutlineProps {
  courseTitle: string;
  modules: ModuleData[];
  allLessons: { id: string | number; title: string; moduleTitle: string }[];
  selectedLessonId: string | number;
  completedLessonIds: (string | number)[];
  onSelectLesson: (id: string | number) => void;
  isNightMode?: boolean;
  onBackToCourseDetails?: () => void;
  /** Mobile drawer mode — show close button */
  isDrawer?: boolean;
  onClose?: () => void;
}

/**
 * CourseSidebarOutline — flat lesson list with module group headers.
 * Each lesson shows: ✓ completed (green check), ● current (accent circle), 🔒 locked.
 */
export const CourseSidebarOutline: React.FC<CourseSidebarOutlineProps> = ({
  courseTitle,
  modules,
  allLessons,
  selectedLessonId,
  completedLessonIds,
  onSelectLesson,
  isNightMode = false,
  onBackToCourseDetails,
  isDrawer = false,
  onClose,
}) => {
  // Build a flat list grouped by module
  const groupedLessons = useMemo(() => {
    return modules.map((mod: any, modIdx: number) => {
      const rawLessons: any[] = [];
      if (mod.lessons && mod.lessons.length > 0) {
        mod.lessons.forEach((l: any) => rawLessons.push(l));
      } else if (mod.topics && mod.topics.length > 0) {
        mod.topics.forEach((t: any) => {
          if (t.learningUnits && t.learningUnits.length > 0) {
            t.learningUnits.forEach((u: any) => {
              rawLessons.push(u);
            });
          }
        });
      }

      return {
        moduleId: mod.id,
        moduleTitle: mod.title,
        themeColor: mod.themeColor || rawLessons[0]?.themeColor || null,
        themeIcon: mod.themeIcon || rawLessons[0]?.themeIcon || null,
        topicImageUrl: mod.topicImageUrl || rawLessons[0]?.topicImageUrl || null,
        lessons: rawLessons.map((lesson) => {
          const flatIdx = allLessons.findIndex((l) => String(l.id) === String(lesson.id));
          const isCompleted = completedLessonIds.some((id) => String(id) === String(lesson.id));
          const isSelected = String(selectedLessonId) === String(lesson.id);

          // Sequential unlock: first lesson always unlocked, rest require previous complete
          let isUnlocked = true;
          if (flatIdx > 0) {
            const prevLesson = allLessons[flatIdx - 1];
            isUnlocked = completedLessonIds.some((id) => String(id) === String(prevLesson.id));
          }

          const displayTitle = getPresentationLessonTitle(lesson.title, modIdx + 1, rawLessons.length);

          return {
            id: lesson.id,
            title: displayTitle,
            flatIndex: flatIdx,
            isCompleted,
            isSelected,
            isUnlocked,
            themeColor: lesson.themeColor || null,
            themeIcon: lesson.themeIcon || null,
            topicImageUrl: lesson.topicImageUrl || null,
          };
        }),
      };
    });
  }, [modules, allLessons, selectedLessonId, completedLessonIds]);

  return (
    <div className={`flex flex-col h-full
      ${isNightMode ? 'bg-slate-900' : 'bg-slate-50'}`}>

      {/* Header */}
      <div className={`flex flex-col gap-2.5 px-4 py-3 border-b shrink-0
        ${isNightMode ? 'border-slate-800' : 'border-slate-200'}`}>
        {onBackToCourseDetails && (
          <button
            onClick={onBackToCourseDetails}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border
              ${isNightMode
                ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-sky-400 hover:text-white'
                : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700 hover:text-sky-900'
              }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Course Overview</span>
          </button>
        )}
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h2 className={`text-[11px] font-semibold uppercase tracking-wider
              ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Course Outline
            </h2>
            <p className={`text-sm font-semibold truncate mt-0.5
              ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
              {courseTitle}
            </p>
          </div>
          {isDrawer && onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer
                ${isNightMode
                  ? 'hover:bg-slate-800 text-slate-500 hover:text-white'
                  : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
                }`}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Lesson list */}
      <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-3 space-y-1">
        {groupedLessons.map((group) => {
          const themeClasses = getThemeColorClasses(group.themeColor);
          const GroupIcon = getThemeIconComponent(group.themeIcon);

          return (
            <div key={group.moduleId} className="mb-3">
              {/* Module group header with theme styling */}
              <button
                type="button"
                onClick={() => {
                  const firstUnlocked = group.lessons.find((l) => l.isUnlocked);
                  if (firstUnlocked) {
                    onSelectLesson(firstUnlocked.id);
                    if (isDrawer && onClose && window.innerWidth < 1024) {
                      onClose();
                    }
                  }
                }}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 min-w-0 text-left cursor-pointer hover:opacity-80 transition-opacity"
              >
                {group.themeColor && (
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${themeClasses?.dot || 'bg-sky-500'}`} />
                )}
                {GroupIcon && (
                  <GroupIcon className={`w-3.5 h-3.5 shrink-0 ${themeClasses ? themeClasses.text : (isNightMode ? 'text-slate-500' : 'text-slate-400')}`} />
                )}
                <h3 className={`text-[10px] font-bold uppercase tracking-wider truncate
                  ${themeClasses ? themeClasses.text : (isNightMode ? 'text-slate-500' : 'text-slate-400')}`}>
                  {group.moduleTitle.replace(/^(🟢|🟡|🔵|🔴)\s*/, '')}
                </h3>
              </button>

              {/* Lessons */}
              {group.lessons.map((lesson) => {
                const handleClick = () => {
                  if (!lesson.isUnlocked) return;
                  onSelectLesson(lesson.id);
                  if (isDrawer && onClose && window.innerWidth < 1024) {
                    onClose();
                  }
                };

                const lessonTheme = getThemeColorClasses(lesson.themeColor);
                const LessonIcon = getThemeIconComponent(lesson.themeIcon);

                return (
                  <button
                    key={lesson.id}
                    onClick={handleClick}
                    disabled={!lesson.isUnlocked}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[13px]
                      transition-colors duration-150 cursor-pointer
                      ${!lesson.isUnlocked
                        ? `opacity-50 cursor-not-allowed
                            ${isNightMode ? 'text-slate-600' : 'text-slate-400'}`
                        : lesson.isSelected
                          ? isNightMode
                            ? 'bg-sky-500/10 text-sky-300 font-medium'
                            : 'bg-sky-50 text-sky-700 font-medium'
                          : isNightMode
                            ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    title={!lesson.isUnlocked ? 'Complete the previous lesson to unlock' : lesson.title}
                  >
                    {/* Status icon */}
                    <span className="shrink-0 flex items-center justify-center w-5 h-5">
                      {!lesson.isUnlocked ? (
                        <Lock className={`w-3.5 h-3.5 ${isNightMode ? 'text-slate-600' : 'text-slate-400'}`} />
                      ) : lesson.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : lesson.isSelected ? (
                        <span className={`w-3 h-3 rounded-full
                          ${lessonTheme ? lessonTheme.dot : (isNightMode ? 'bg-sky-400' : 'bg-sky-500')}`} />
                      ) : (
                        <span className={`w-3 h-3 rounded-full border-2
                          ${isNightMode ? 'border-slate-600' : 'border-slate-300'}`} />
                      )}
                    </span>

                    {/* Lesson specific icon */}
                    {LessonIcon && (
                      <LessonIcon className={`w-3.5 h-3.5 shrink-0 ${lessonTheme ? lessonTheme.text : 'text-slate-400'}`} />
                    )}

                    {/* Title */}
                    <span className="truncate">{lesson.title}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>
    </div>
  );
};
