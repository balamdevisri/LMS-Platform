import React from 'react';
import { Link } from 'react-router-dom';
import type { ICourse } from '../../../../shared/types/course';
import { CourseStatusBadge } from './CourseStatusBadge';
import { Edit, Trash2, Copy, CheckCircle2, Archive, ExternalLink } from 'lucide-react';

interface CourseTableProps {
  courses: ICourse[];
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onArchive: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const CourseTable: React.FC<CourseTableProps> = ({
  courses,
  onPublish,
  onUnpublish,
  onArchive,
  onDuplicate,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 font-['Sora']">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 text-[10px]">
          <tr>
            <th className="py-3.5 px-4">Course Title</th>
            <th className="py-3.5 px-4">Category</th>
            <th className="py-3.5 px-4">Level</th>
            <th className="py-3.5 px-4">Price</th>
            <th className="py-3.5 px-4">Enrolled</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {courses.map((course) => (
            <tr key={course.id} className="hover:bg-slate-800/40 transition-colors">
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-700/60"
                  />
                  <div>
                    <span className="font-heading font-bold text-white block text-sm line-clamp-1">
                      {course.title}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Instructor: {course.instructor.name}
                    </span>
                  </div>
                </div>
              </td>

              <td className="py-3.5 px-4 font-medium">{course.category}</td>

              <td className="py-3.5 px-4 capitalize">{course.level.replace('_', ' ')}</td>

              <td className="py-3.5 px-4 font-bold text-indigo-400">
                {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
              </td>

              <td className="py-3.5 px-4 font-mono">{course.enrollmentCount.toLocaleString()}</td>

              <td className="py-3.5 px-4">
                <CourseStatusBadge status={course.status} />
              </td>

              <td className="py-3.5 px-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Link
                    to={`/course/${course.slug}`}
                    target="_blank"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Preview Course"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to={`/admin/courses/edit/${course.id}`}
                    className="p-1.5 rounded-lg bg-slate-800 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/60 transition-colors"
                    title="Edit Course"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => onDuplicate(course.id)}
                    className="p-1.5 rounded-lg bg-slate-800 text-purple-400 hover:text-purple-300 hover:bg-purple-950/60 transition-colors cursor-pointer"
                    title="Duplicate Course"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {course.status === 'published' ? (
                    <button
                      onClick={() => onUnpublish(course.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:text-amber-300 hover:bg-amber-950/60 transition-colors cursor-pointer"
                      title="Unpublish (Set to Draft)"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onPublish(course.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 transition-colors cursor-pointer"
                      title="Publish Course"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onArchive(course.id)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Archive Course"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDelete(course.id)}
                    className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 transition-colors cursor-pointer"
                    title="Delete Course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
