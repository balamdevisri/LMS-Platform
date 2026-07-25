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
    <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-slate-50/50 p-4 rounded-2xl border border-sky-100/50">
      
      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider select-none pr-1">
          <Filter className="w-3.5 h-3.5 text-sky-500" />
          <span>Filters:</span>
        </div>

        {/* Category Filter */}
        <div className="flex flex-col">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-sky-100 hover:border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-hidden cursor-pointer shadow-2xs transition-colors min-w-36"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
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
            className="bg-white border border-sky-100 hover:border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-hidden cursor-pointer shadow-2xs transition-colors min-w-32"
          >
            <option value="All">All Levels</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
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
            className="bg-white border border-sky-100 hover:border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-hidden cursor-pointer shadow-2xs transition-colors min-w-28"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Sorting Control */}
      <div className="flex items-center gap-2 select-none self-end xl:self-auto">
        <ArrowUpDown className="w-3.5 h-3.5 text-sky-500" />
        <span className="text-xs text-slate-500 font-semibold">Sort by:</span>
        <select
          value={selectedSort}
          onChange={(e) => setSelectedSort(e.target.value)}
          className="bg-white border border-sky-100 hover:border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-hidden cursor-pointer shadow-2xs transition-colors min-w-36"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
};

export default CourseFilters;
