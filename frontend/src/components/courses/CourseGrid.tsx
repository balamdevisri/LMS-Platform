import React from 'react';
import type { ICourse } from '../../../../shared/types/course';
import { CourseCard } from './CourseCard';
import { motion } from 'framer-motion';

interface CourseGridProps {
  courses: ICourse[];
  isAdmin?: boolean;
  onBookmark?: (id: string) => void;
}

export const CourseGrid: React.FC<CourseGridProps> = ({ courses, isAdmin = false, onBookmark }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} isAdmin={isAdmin} onBookmark={onBookmark} />
      ))}
    </motion.div>
  );
};
