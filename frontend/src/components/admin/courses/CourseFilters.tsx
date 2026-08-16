import React from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';

interface CourseFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedLevel: string;
  setSelectedLevel: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  selectedSort: string;
  setSelectedSort: (val: string) => void;
  categories: string[];
  levels: string[];
}

export const CourseFilters: React.FC<CourseFiltersProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedLevel,
  setSelectedLevel,
  selectedStatus,
  setSelectedStatus,
  selectedSort,
  setSelectedSort,
  categories,
  levels,
}) => {
  const sortOptions = [
    { value: 'Newest', label: 'Newest' },
    { value: 'Oldest', label: 'Oldest' },
    { value: 'Title A-Z', label: 'Title A-Z' },
    { value: 'Most Students', label: 'Most Students' },
  ];

  return (
    <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/80 p-4 rounded-2xl border border-sky-100/50 dark:border-slate-800">
      
      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider select-none pr-1">
          <Filter className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400" />
          <span>Filters:</span>
        </div>

        {/* Category Filter */}
        <div className="flex flex-col">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-hidden cursor-pointer shadow-2xs transition-colors min-w-36"
          >
            <option value="All" className="dark:bg-slate-900">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="dark:bg-slate-900">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div className="flex flex-col">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-hidden cursor-pointer shadow-2xs transition-colors min-w-32"
          >
            <option value="All" className="dark:bg-slate-900">All Levels</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl} className="dark:bg-slate-900">
                {lvl}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-hidden cursor-pointer shadow-2xs transition-colors min-w-28"
          >
            <option value="All" className="dark:bg-slate-900">All Statuses</option>
            <option value="Published" className="dark:bg-slate-900">Published</option>
            <option value="Draft" className="dark:bg-slate-900">Draft</option>
          </select>
        </div>
      </div>

      {/* Sorting Control */}
      <div className="flex items-center gap-2 select-none self-end xl:self-auto">
        <ArrowUpDown className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400" />
        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Sort by:</span>
        <select
          value={selectedSort}
          onChange={(e) => setSelectedSort(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-hidden cursor-pointer shadow-2xs transition-colors min-w-36"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="dark:bg-slate-900">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
};

export default CourseFilters;
