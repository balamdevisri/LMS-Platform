import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { ModuleAccordion } from './ModuleAccordion';
import type { ModuleData } from './ModuleAccordion';

interface ModulesTabProps {
  courseTitle: string;
  modules: ModuleData[];
  selectedLessonId: string | number;
  completedLessonIds: (string | number)[];
  onSelectLesson: (id: string | number) => void;
  progressPercent: number;
  isNightMode?: boolean;
}

export const ModulesTab: React.FC<ModulesTabProps> = ({
  courseTitle,
  modules,
  selectedLessonId,
  completedLessonIds,
  onSelectLesson,
  progressPercent,
  isNightMode = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openModules, setOpenModules] = useState<{ [key: string]: boolean }>({
    '1': true,
    'git-1': true,
  });

  const toggleModule = (moduleId: string | number) => {
    setOpenModules((prev) => ({
      ...prev,
      [String(moduleId)]: !prev[String(moduleId)],
    }));
  };

  const handleExpandAll = () => {
    const allState: { [key: string]: boolean } = {};
    modules.forEach((m) => {
      allState[String(m.id)] = true;
    });
    setOpenModules(allState);
  };

  const handleCollapseAll = () => {
    setOpenModules({});
  };

  const filteredModules = modules
    .map((mod) => {
      const matchingLessons = mod.lessons.filter((l) =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (mod.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return mod;
      }
      if (matchingLessons.length > 0) {
        return { ...mod, lessons: matchingLessons };
      }
      return null;
    })
    .filter(Boolean) as ModuleData[];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Course Completion Card */}
      <div className={`p-4 rounded-2xl border shadow-md ${isNightMode ? 'bg-slate-900 border-slate-800 text-white shadow-slate-950/40' : 'bg-white border-sky-100 text-slate-900 shadow-sky-500/5'}`}>
        <h2 className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`}>
          {courseTitle}
        </h2>
        <div className={`flex items-center justify-between text-xs mb-2 ${isNightMode ? 'text-slate-200' : 'text-slate-700'}`}>
          <span>Overall Course Completion</span>
          <span className={`font-mono font-bold ${isNightMode ? 'text-cyan-300' : 'text-sky-600'}`}>{progressPercent}%</span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden border ${isNightMode ? 'bg-slate-950 border-slate-800' : 'bg-sky-100 border-sky-200/50'}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 shadow-xs ${isNightMode ? 'bg-linear-to-r from-cyan-500 to-blue-500' : 'bg-linear-to-r from-sky-500 to-blue-600'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className={`w-4 h-4 absolute left-3 top-3 ${isNightMode ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none shadow-xs border ${
              isNightMode
                ? 'bg-slate-900 border-slate-800 text-slate-100 focus:ring-1 focus:ring-cyan-400/60 placeholder:opacity-60'
                : 'bg-white border-sky-100 text-slate-800 focus:ring-1 focus:ring-sky-500/60 placeholder:opacity-60'
            }`}
          />
        </div>

        <div className={`flex items-center justify-between text-[11px] px-1 ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <span className="font-mono">{modules.length} Modules</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExpandAll}
              className={`transition-all cursor-pointer font-medium ${isNightMode ? 'hover:text-cyan-300' : 'hover:text-sky-600'}`}
            >
              Expand All
            </button>
            <span>•</span>
            <button
              onClick={handleCollapseAll}
              className={`transition-all cursor-pointer font-medium ${isNightMode ? 'hover:text-cyan-300' : 'hover:text-sky-600'}`}
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {filteredModules.map((module) => (
          <ModuleAccordion
            key={module.id}
            module={module}
            isOpen={!!openModules[String(module.id)]}
            onToggle={() => toggleModule(module.id)}
            selectedLessonId={selectedLessonId}
            completedLessonIds={completedLessonIds}
            onSelectLesson={onSelectLesson}
            isNightMode={isNightMode}
          />
        ))}
      </div>
    </div>
  );
};
