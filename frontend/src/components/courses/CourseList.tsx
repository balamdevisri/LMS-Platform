import React from 'react';
import { Link } from 'react-router-dom';
import type { ICourse } from '../../../../shared/types/course';
import { CourseThumbnail } from './CourseThumbnail';
import { Star, Clock, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CourseListProps {
  courses: ICourse[];
}

export const CourseList: React.FC<CourseListProps> = ({ courses }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {courses.map((course) => (
        <div
          key={course.id}
          className="group relative flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/50 backdrop-blur-xl p-4 sm:p-6 transition-all duration-300 font-['Sora'] text-slate-100"
        >
          <div className="w-full md:w-64 shrink-0">
            <CourseThumbnail src={course.thumbnail} alt={course.title} category={course.category} />
          </div>

          <div className="flex-1 space-y-2 text-left">
            <div className="flex items-center gap-3">
              <span className="capitalize text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700/50 text-indigo-300">
                {course.level.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 font-medium">{course.language}</span>
            </div>

            <h3 className="font-heading font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">
              <Link to={`/course/${course.slug}`}>{course.title}</Link>
            </h3>

            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {course.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 font-medium">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>{course.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>{course.enrollmentCount.toLocaleString()} Students</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>{course.duration}</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
            <div className="text-right">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Course Price</span>
              <span className="font-heading font-extrabold text-xl text-indigo-400">
                {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
              </span>
            </div>

            <Link
              to={`/course/${course.slug}`}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 inline-flex items-center gap-2"
            >
              <span>Explore Course</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ))}
    </motion.div>
  );
};
