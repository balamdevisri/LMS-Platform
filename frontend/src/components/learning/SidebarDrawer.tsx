import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen } from 'lucide-react';
import { ModulesTab } from './ModulesTab';
import type { ModuleData } from './ModuleAccordion';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  modules: ModuleData[];
  selectedLessonId: string | number;
  completedLessonIds: (string | number)[];
  onSelectLesson: (id: string | number) => void;
  progressPercent: number;
  activeCourseTab?: string;
  onSelectCourseTab?: (tabKey: string) => void;
  isNightMode?: boolean;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  courseTitle,
  modules,
  selectedLessonId,
  completedLessonIds,
  onSelectLesson,
  progressPercent,
  isNightMode = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs"
          />

          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 left-0 z-50 h-full w-full sm:w-90 md:w-80 border-r shadow-2xl flex flex-col backdrop-blur-2xl transition-colors ${
              isNightMode
                ? 'bg-slate-950/98 border-slate-800 text-slate-100'
                : 'bg-white/98 border-sky-100 text-slate-900'
            }`}
          >
            <div className={`p-4 border-b flex items-center justify-between ${isNightMode ? 'bg-slate-900 border-slate-800' : 'bg-sky-50/80 border-sky-100'}`}>
              <div className={`flex items-center gap-2 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`}>
                <BookOpen className="w-5 h-5" />
                <span className={`font-heading font-extrabold text-sm tracking-wide ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
                  Course Navigator
                </span>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl border transition-all cursor-pointer shadow-xs ${
                  isNightMode
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-white border-sky-100 text-slate-500 hover:text-slate-900'
                }`}
                title="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`flex-1 p-4 overflow-y-auto scrollbar-thin ${isNightMode ? 'bg-slate-950 scrollbar-thumb-slate-800' : 'bg-slate-50/60 scrollbar-thumb-sky-200'}`}>
              <ModulesTab
                courseTitle={courseTitle}
                modules={modules}
                selectedLessonId={selectedLessonId}
                completedLessonIds={completedLessonIds}
                onSelectLesson={(id) => {
                  onSelectLesson(id);
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
                progressPercent={progressPercent}
                isNightMode={isNightMode}
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
