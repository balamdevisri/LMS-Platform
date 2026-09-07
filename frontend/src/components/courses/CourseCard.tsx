import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import type { ICourse } from '../../../../shared/types/course';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { courseService } from '../../services/courseService';
import { useAuth } from '@/contexts/AuthContext';

interface CourseCardProps {
  course: ICourse;
  isAdmin?: boolean;
  onBookmark?: (id: string) => void;
  onPublish?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  index?: number;
}

// Curated avatar pairs matching the exact Pexels references from the user template
const AVATAR_PAIRS = [
  [
    'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150',
  ],
  [
    'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
    'https://images.pexels.com/photos/874158/pexels-photo-874158.jpeg?auto=compress&cs=tinysrgb&w=150',
  ],
  [
    'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150',
    'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
  ],
  [
    'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150',
    'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150',
  ],
];

// Determine card color class based on course topic
const getCardColorClass = (category?: string, index: number = 0): string => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('c ') || cat.includes('c-') || cat.includes('dsa') || cat.includes('algorithm') || cat.includes('beginner')) {
    return 'card-green';
  }
  if (cat.includes('web') || cat.includes('react') || cat.includes('frontend') || cat.includes('javascript') || cat.includes('node')) {
    return 'card-blue';
  }
  if (cat.includes('git') || cat.includes('linux') || cat.includes('devops') || cat.includes('cloud')) {
    return 'card-orange';
  }
  if (cat.includes('dbms') || cat.includes('sql') || cat.includes('database') || cat.includes('k8s') || cat.includes('python')) {
    return 'card-red';
  }
  const fallback = ['card-green', 'card-blue', 'card-orange', 'card-red'];
  return fallback[index % fallback.length];
};

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isAdmin = false,
  onBookmark,
  index = 0,
}) => {
  // ── Progress from courseService (preserves all existing logic) ──────────────
  const { user } = useAuth();
  const activeUserId = user?.uid || 'default_student';
  const checkpoint = courseService.getCourseCheckpoint(course.id, activeUserId);
  const progressPercent = checkpoint?.progressPercent ?? 0;
  const isCompleted = progressPercent >= 100;
  const isInProgress = progressPercent > 0 && !isCompleted;
  const isFree = course.price === 0;

  const colorClass = getCardColorClass(course.category, index);
  const avatarPair = AVATAR_PAIRS[index % AVATAR_PAIRS.length];

  // Duration / CTA text
  const ctaLabel = isCompleted
    ? 'Review'
    : isInProgress
    ? 'Continue'
    : isFree
    ? 'Free • Start'
    : `₹${course.price.toFixed(0)} • Enroll`;

  const subtitle = course.category || course.shortDescription || 'Core Curriculum';
  const displayProgress = progressPercent > 0 ? Math.round(progressPercent) : 10;

  return (
    <div className={`dribbble-course-card ${colorClass}`}>
      {/* ── Card Header ── */}
      <div className="d-card-header">
        <div className="d-date">
          {(course.level || 'All Levels').replace('_', ' ').toUpperCase()}
        </div>

        {onBookmark ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onBookmark(course.id);
            }}
            className="text-white hover:opacity-80 transition-opacity cursor-pointer p-1"
            title="Bookmark Course"
          >
            <Bookmark className="w-5 h-5 text-white fill-transparent hover:fill-white transition-colors" />
          </button>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
            title="Options"
          >
            <path
              fillRule="evenodd"
              d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="d-card-body">
        <Link to={`/course/${course.slug}`}>
          <h3>{course.title}</h3>
        </Link>
        <p>{subtitle}</p>

        <div className="d-progress">
          <div className="d-progress-labels">
            <span>Progress</span>
            <span>{progressPercent > 0 ? `${Math.round(progressPercent)}%` : 'Ready'}</span>
          </div>
          <div className="d-progress-bar">
            <div
              className="d-progress-fill"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Card Footer ── */}
      <div className="d-card-footer">
        <ul>
          <li>
            <img
              src={avatarPair[0]}
              alt="Student"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
              }}
            />
          </li>
          <li>
            <img
              src={avatarPair[1]}
              alt="Student"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100';
              }}
            />
          </li>
          <div className="btn-add" title="Student community">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </ul>

        <Link
          to={`/course/${course.slug}`}
          className="btn-countdown"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
};

export default memo(CourseCard);
