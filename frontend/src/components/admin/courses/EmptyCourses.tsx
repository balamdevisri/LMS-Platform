import React from 'react';
import { Plus, BookOpen } from 'lucide-react';

interface EmptyCoursesProps {
  onCreateCourse: () => void;
}

export const EmptyCourses: React.FC<EmptyCoursesProps> = ({ onCreateCourse }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl shadow-2xs text-center space-y-6 max-w-lg mx-auto">
      
      {/* Premium Custom Vector SVG Illustration */}
      <div className="relative">
        <div className="absolute inset-0 bg-sky-200/30 dark:bg-cyan-500/10 rounded-full blur-xl scale-95" />
        <div className="relative w-24 h-24 bg-sky-50 dark:bg-slate-950 rounded-full flex items-center justify-center border border-sky-200 dark:border-slate-800 shadow-inner">
          <BookOpen className="w-10 h-10 text-sky-500 dark:text-cyan-400 animate-pulse" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
          No courses created yet
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-sm">
          Get started by creating your first course track. You can set the title, syllabus, difficulty levels, and syllabus options.
        </p>
      </div>

      <button
        onClick={onCreateCourse}
        className="btn-blue-primary text-xs py-3 px-6 shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 font-bold cursor-pointer hover:scale-102"
      >
        <Plus className="w-4 h-4" />
        <span>Create First Course</span>
      </button>

    </div>
  );
};

export default EmptyCourses;
