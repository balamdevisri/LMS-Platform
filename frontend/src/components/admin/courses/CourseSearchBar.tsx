import React from 'react';
import { Search, X } from 'lucide-react';

interface CourseSearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export const CourseSearchBar: React.FC<CourseSearchBarProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="relative w-full sm:w-96">
      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by title, instructor, category..."
        className="w-full bg-slate-50 border border-sky-100 hover:border-sky-200 focus:border-sky-300 rounded-2xl py-2.5 pl-10 pr-10 text-xs text-slate-900 focus:outline-hidden transition-all font-medium placeholder:text-slate-400"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
          title="Clear search"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default CourseSearchBar;
