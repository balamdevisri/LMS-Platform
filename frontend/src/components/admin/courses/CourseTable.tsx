import React from 'react';
import type { CourseItem } from '@/contexts/CourseContext';
import CourseRow from './CourseRow';

interface CourseTableProps {
  courses: CourseItem[];
  onView: (course: CourseItem) => void;
  onEdit: (course: CourseItem) => void;
  onTogglePublish: (course: CourseItem) => void;
  onDelete: (course: CourseItem) => void;
}

export const CourseTable: React.FC<CourseTableProps> = ({
  courses,
  onView,
  onEdit,
  onTogglePublish,
  onDelete,
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-sky-100/80 bg-white shadow-2xs">
      <table className="w-full border-collapse text-left min-w-[900px]">
        <thead>
          <tr className="bg-slate-50/80 border-b border-sky-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
            <th className="py-3 px-4 font-bold">Thumbnail</th>
            <th className="py-3 px-4 font-bold">Course Title</th>
            <th className="py-3 px-4 font-bold">Category</th>
            <th className="py-3 px-4 font-bold">Level</th>
            <th className="py-3 px-4 font-bold">Instructor</th>
            <th className="py-3 px-4 font-bold">Duration</th>
            <th className="py-3 px-4 font-bold">Status</th>
            <th className="py-3 px-4 font-bold">Students</th>
            <th className="py-3 px-4 font-bold">Created Date</th>
            <th className="py-3 px-4 font-bold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {courses.map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              onView={onView}
              onEdit={onEdit}
              onTogglePublish={onTogglePublish}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseTable;
