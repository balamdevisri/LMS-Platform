import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Edit, Globe, FileText, Trash2 } from 'lucide-react';
import type { CourseItem } from '@/contexts/CourseContext';

interface CourseRowProps {
  course: CourseItem;
  onView: (course: CourseItem) => void;
  onEdit: (course: CourseItem) => void;
  onTogglePublish: (course: CourseItem) => void;
  onDelete: (course: CourseItem) => void;
}

export const CourseRow: React.FC<CourseRowProps> = ({
  course,
  onView,
  onEdit,
  onTogglePublish,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Format creation date safely
  const formatDate = (dateVal: any) => {
    if (!dateVal) return 'N/A';
    if (typeof dateVal.toDate === 'function') {
      return dateVal.toDate().toLocaleDateString();
    }
    if (dateVal instanceof Date) {
      return dateVal.toLocaleDateString();
    }
    if (typeof dateVal === 'string') {
      return new Date(dateVal).toLocaleDateString();
    }
    if (typeof dateVal === 'number') {
      return new Date(dateVal).toLocaleDateString();
    }
    return 'N/A';
  };

  return (
    <tr className="hover:bg-sky-50/20 border-b border-slate-100 transition-colors last:border-0 group">

      {/* Thumbnail */}
      <td className="py-4 px-4 align-middle">
        <div className="w-12 h-8 rounded-lg overflow-hidden border border-sky-100 shadow-2xs shrink-0 bg-slate-100">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80";
            }}
          />
        </div>
      </td>

      {/* Course Title */}
      <td className="py-4 px-4 align-middle font-semibold text-slate-900 text-xs sm:text-sm max-w-xs md:max-w-sm truncate" title={course.title}>
        <div className="font-bold text-slate-900 truncate">{course.title}</div>
        {course.subtitle && (
          <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{course.subtitle}</div>
        )}
      </td>

      {/* Category */}
      <td className="py-4 px-4 align-middle">
        <span className="inline-flex items-center text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100/80">
          {course.category}
        </span>
      </td>

      {/* Level */}
      <td className="py-4 px-4 align-middle">
        <span className="text-slate-600 text-xs font-semibold">
          {course.level || 'Beginner'}
        </span>
      </td>

      {/* Instructor */}
      <td className="py-4 px-4 align-middle">
        <div className="flex items-center gap-2">
          {course.avatar && (
            <img
              src={course.avatar}
              alt={course.instructor}
              className="w-6 h-6 rounded-full object-cover border border-sky-200"
            />
          )}
          <span className="text-slate-700 text-xs font-bold truncate max-w-28">
            {course.instructor}
          </span>
        </div>
      </td>

      {/* Duration */}
      <td className="py-4 px-4 align-middle text-slate-500 font-medium text-xs font-mono">
        {course.duration}
      </td>

      {/* Status */}
      <td className="py-4 px-4 align-middle">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${course.status === 'Published'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${course.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {course.status}
        </span>
      </td>

      {/* Students */}
      <td className="py-4 px-4 align-middle text-slate-700 font-bold text-xs">
        {course.students || '0'}
      </td>

      {/* Created Date */}
      <td className="py-4 px-4 align-middle text-slate-500 font-medium text-xs">
        {formatDate(course.createdAt)}
      </td>

      {/* Actions */}
      <td className="py-4 px-4 align-middle text-right relative">
        <div className="inline-block" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
            title="Course Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-4 mt-1 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-40 text-left animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onView(course);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500" />
                <span>View Course</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(course);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit Details</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onTogglePublish(course);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
              >
                {course.status === 'Published' ? (
                  <>
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Unpublish Course</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Publish Course</span>
                  </>
                )}
              </button>

              <hr className="my-1 border-slate-100" />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(course);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Delete Course</span>
              </button>
            </div>
          )}
        </div>
      </td>

    </tr>
  );
};

export default CourseRow;
