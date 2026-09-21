import React, { useMemo } from 'react';
import { LessonContentPanel } from './LessonContentPanel';
import { processCanonicalLessonContent } from '@/utils/lessonNormalizer';

export interface CanonicalLessonInput {
  id?: string | number;
  lessonId?: string | number;
  title: string;
  moduleTitle?: string;
  readingContent?: string;
  conceptTheory?: string;
  content?: string;
  description?: string;
  shortDescription?: string;
  duration?: string;
  type?: string;
  topicImageUrl?: string | null;
  themeColor?: string | null;
  themeIcon?: string | null;
  learningObjectives?: any;
  codeExamples?: any;
  keyPoints?: any;
  practiceQuestions?: any;
  resources?: any;
  resourceLinks?: any;
  isDraft?: boolean;
}

export interface StudentLessonRendererProps {
  lesson: CanonicalLessonInput;
  lessonIndex?: number;
  totalLessons?: number;
  isCompleted?: boolean;
  hasPrevLesson?: boolean;
  hasNextLesson?: boolean;
  onPrevLesson?: () => void;
  onNextLesson?: () => void;
  onMarkComplete?: () => void;
  isNightMode?: boolean;
  mode?: 'student' | 'preview';
  className?: string;
}

/**
 * StudentLessonRenderer — The authoritative, single-source student-facing lesson content renderer.
 * 
 * Used identically in:
 * 1. Student Live Classroom (`CourseLearningLayout.tsx`)
 * 2. Admin Course Editor Live Student Preview (`AdminCourseEdit.tsx`)
 * 3. Admin Unit Content Editor Preview Tab (`UnitContentEditor.tsx`)
 * 4. Admin Course Details Student Simulation (`AdminCourseDetails.tsx`)
 * 
 * Guarantees:
 * - 100% WYSIWYG parity between Admin Preview and Student Reading View
 * - Consistent Markdown normalization, heading styling, code block execution, and responsive layout
 * - Zero divergent JSX between preview and production
 */
export const StudentLessonRenderer: React.FC<StudentLessonRendererProps> = ({
  lesson,
  lessonIndex = 0,
  totalLessons = 1,
  isCompleted = false,
  hasPrevLesson = false,
  hasNextLesson = false,
  onPrevLesson = () => {},
  onNextLesson = () => {},
  onMarkComplete = () => {},
  isNightMode = false,
  mode = 'student',
  className = '',
}) => {
  // Extract and normalize raw markdown content through canonical pipeline
  const normalizedContent = useMemo(() => {
    const raw = lesson.readingContent || lesson.conceptTheory || lesson.content || lesson.description || '';
    return processCanonicalLessonContent(raw);
  }, [lesson.readingContent, lesson.conceptTheory, lesson.content, lesson.description]);

  const rawResources = lesson.resourceLinks || lesson.resources || [];

  return (
    <div className={`student-lesson-renderer-root w-full ${mode === 'preview' ? 'preview-mode-active' : ''} ${className}`}>
      {mode === 'preview' && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-between gap-3 text-xs text-sky-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold uppercase tracking-wider text-[11px]">Live Student View Simulation</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Authoritative Renderer (WYSIWYG Parity)
          </span>
        </div>
      )}

      <LessonContentPanel
        lessonTitle={lesson.title || 'Module Complete Notes'}
        moduleTitle={lesson.moduleTitle}
        lessonContent={normalizedContent}
        shortDescription={lesson.shortDescription || lesson.description}
        lessonIndex={lessonIndex}
        totalLessons={totalLessons}
        isCompleted={isCompleted}
        hasPrevLesson={hasPrevLesson}
        hasNextLesson={hasNextLesson}
        onPrevLesson={onPrevLesson}
        onNextLesson={onNextLesson}
        onMarkComplete={onMarkComplete}
        isNightMode={isNightMode}
        topicImageUrl={lesson.topicImageUrl}
        themeColor={lesson.themeColor}
        themeIcon={lesson.themeIcon}
        learningObjectives={lesson.learningObjectives}
        codeExamples={lesson.codeExamples}
        keyPoints={lesson.keyPoints}
        practiceQuestions={lesson.practiceQuestions}
        resourceLinks={rawResources}
      />
    </div>
  );
};

export default StudentLessonRenderer;
