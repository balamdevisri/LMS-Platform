import React from 'react';
import { Link } from 'react-router-dom';
import type { ICourse } from '../../../../shared/types/course';
import { CourseThumbnail } from './CourseThumbnail';
import { CourseStatusBadge } from './CourseStatusBadge';
import { Star, Clock, Users, ArrowRight, Bookmark } from 'lucide-react';

interface CourseCardProps {
  course: ICourse;
  isAdmin?: boolean;
  onBookmark?: (id: string) => void;
  onPublish?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isAdmin = false,
  onBookmark,
}) => {
  const isFree = course.price === 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl bg-white border border-sky-100 hover:border-sky-300 p-4 transition-all duration-300 shadow-md shadow-sky-100/50 hover:shadow-xl hover:shadow-sky-100 font-['Sora'] text-slate-900">
      <div className="space-y-3">
        <div className="relative">
          <CourseThumbnail src={course.thumbnail} alt={course.title} category={course.category} />
          {isAdmin && (
            <div className="absolute top-3 right-3">
              <CourseStatusBadge status={course.status} />
            </div>
          )}
          {!isAdmin && onBookmark && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onBookmark(course.id);
              }}
              className="absolute top-3 right-3 p-2 rounded-xl bg-white/80 border border-sky-200 text-slate-700 hover:text-white hover:bg-sky-600 transition-colors backdrop-blur-md cursor-pointer shadow-xs"
              title="Bookmark Course"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span className="capitalize px-2.5 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-800 font-semibold">
            {course.level.replace('_', ' ')}
          </span>
          <span className="font-heading font-extrabold text-sm text-sky-600">
            {isFree ? 'Free' : `$${course.price.toFixed(2)}`}
          </span>
        </div>

        <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
          <Link to={`/course/${course.slug}`}>{course.title}</Link>
        </h3>

        <p className="text-xs text-slate-600 line-clamp-2 font-normal leading-relaxed">
          {course.shortDescription}
        </p>

        {course.skills && course.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {course.skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200"
              >
                {skill}
              </span>
            ))}
            {course.skills.length > 3 && (
              <span className="text-[10px] text-slate-400 font-medium self-center">
                +{course.skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-sky-100 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>{course.rating.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span>{course.enrollmentCount.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>{course.duration}</span>
          </div>
        </div>

        <Link
          to={`/course/${course.slug}`}
          className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-600/20"
        >
          <span>View Course Details</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
