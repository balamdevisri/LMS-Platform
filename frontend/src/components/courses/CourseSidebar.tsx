import React, { useState, useEffect } from 'react';
import type { ICourse } from '../../../../shared/types/course';
import { courseService } from '../../services/courseService';
import { Check, ShieldCheck, Bookmark, PlayCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CourseSidebarProps {
  course: ICourse;
  onEnrollSuccess?: () => void;
  onStartCourse?: () => void;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
  course,
  onEnrollSuccess,
  onStartCourse,
}) => {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const enrolled = courseService.isCourseEnrolled(course.id);
      setIsEnrolled(enrolled);
    };
    checkStatus();
  }, [course.id]);

  const handleAction = async () => {
    if (isEnrolled) {
      if (onStartCourse) onStartCourse();
      return;
    }

    setIsEnrolling(true);
    try {
      const res = await courseService.enrollCourse(course.id, 'default_student');
      if (res.success) {
        setIsEnrolled(true);
        toast.success(`Enrolled successfully in "${course.title}"! Click Start to begin.`);
        if (onEnrollSuccess) onEnrollSuccess();
        if (onStartCourse) onStartCourse();
      }
    } catch (err: any) {
      toast.error('Failed to process enrollment.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await courseService.bookmarkCourse(course.id, 'default_student');
      setIsBookmarked(res.bookmarked);
      toast.success(res.bookmarked ? 'Course saved to your bookmarks!' : 'Course removed from bookmarks.');
    } catch (e) {}
  };

  return (
    <div className="sticky top-24 rounded-3xl bg-white border border-sky-100 p-6 shadow-md shadow-sky-100/50 space-y-6 font-['Sora'] text-slate-900">
      <div className="space-y-1">
        <span className="text-xs text-slate-500 font-semibold uppercase">Total Enrollment Fee</span>
        <div className="flex items-baseline gap-2">
          <span className="font-heading font-extrabold text-3xl text-sky-600">
            Free Track
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold uppercase">
            100% Free
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleAction}
          disabled={isEnrolling}
          className={`w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all duration-300 ${
            isEnrolled
              ? 'bg-sky-600 hover:bg-sky-700'
              : 'bg-sky-600 hover:bg-sky-700'
          }`}
        >
          {isEnrolling ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enrolling Now...</span>
            </>
          ) : isEnrolled ? (
            <>
              <PlayCircle className="w-5 h-5 text-white" />
              <span>🚀 Start Learning Now</span>
            </>
          ) : (
            <>
              <PlayCircle className="w-5 h-5" />
              <span>Enroll Free In Course Track</span>
            </>
          )}
        </button>

        <button
          onClick={handleBookmark}
          className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isBookmarked
              ? 'bg-sky-50 border-sky-300 text-sky-700'
              : 'bg-white border-sky-200 text-slate-700 hover:bg-sky-50'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>{isBookmarked ? 'Saved to Bookmarks' : 'Bookmark Course Track'}</span>
        </button>
      </div>

      <div className="space-y-3 pt-4 border-t border-sky-100 text-xs">
        <h4 className="font-heading font-bold text-slate-900 uppercase text-[10px] tracking-wider">
          Included in Track
        </h4>
        <div className="space-y-2 text-slate-700">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Interactive Web Linux Terminal Sandbox</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>5-15s Focus Timers & Gamified XP Rewards</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Downloadable PDF Cheatsheets & Diagrams</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Verified Certificate of Completion</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center gap-3">
        <img
          src={course.instructor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
          alt={course.instructor.name}
          className="w-10 h-10 rounded-full object-cover border border-sky-300"
        />
        <div>
          <h5 className="font-heading font-bold text-xs text-slate-900">{course.instructor.name}</h5>
          <p className="text-[10px] text-slate-500">{course.instructor.role || 'Senior Specialist'}</p>
        </div>
      </div>
    </div>
  );
};
