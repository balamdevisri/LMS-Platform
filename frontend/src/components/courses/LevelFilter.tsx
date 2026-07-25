import React from 'react';
import type { CourseLevel } from '../../../../shared/types/course';

interface LevelFilterProps {
  selectedLevel: CourseLevel | 'all';
  onSelectLevel: (level: CourseLevel | 'all') => void;
}

export const LevelFilter: React.FC<LevelFilterProps> = ({ selectedLevel, onSelectLevel }) => {
  const levels: { label: string; value: CourseLevel | 'all' }[] = [
    { label: 'All Levels', value: 'all' },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
  ];

  return (
    <select
      value={selectedLevel}
      onChange={(e) => onSelectLevel(e.target.value as any)}
      className="bg-white border border-sky-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none font-['Sora'] font-semibold cursor-pointer shadow-xs focus:outline-sky-500"
    >
      {levels.map((lvl) => (
        <option key={lvl.value} value={lvl.value} className="bg-white text-slate-800">
          {lvl.label}
        </option>
      ))}
    </select>
  );
};
