export type CourseStatus = 'draft' | 'review' | 'published' | 'archived';

export type CourseVisibility = 'public' | 'private' | 'unlisted';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';

export type VideoProvider = 'cloudinary' | 'youtube' | 'vimeo' | 'firebase-storage' | 'direct';

export type LessonType = 'video' | 'reading' | 'lab' | 'quiz' | 'assignment' | 'project';

export interface CourseRoadmapItem {
  order: number;
  title: string;
  description: string;
  estimatedDuration: string;
}

export interface IVideoItem {
  videoId: string;
  lessonId: string;
  courseId?: string;
  moduleId?: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  provider: VideoProvider;
  order: number;
  isPreview?: boolean;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IResourceItem {
  resourceId: string;
  lessonId: string;
  courseId?: string;
  moduleId?: string;
  title: string;
  description?: string;
  type: 'pdf' | 'ppt' | 'zip' | 'doc' | 'image' | 'github' | 'url' | 'doc_link' | 'video_link';
  url: string;
  order: number;
  downloadable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPracticalLabItem {
  objective: string;
  requirements: string[];
  steps: string[];
  commands: Array<{ command: string; description: string }>;
  expectedOutput?: string;
  expectedResult?: string;
  troubleshooting?: string[];
  bestPractices?: string[];
}

export interface IQuizQuestion {
  questionId: string;
  questionNumber: number;
  question: string;
  type: 'mcq' | 'single' | 'tf';
  options: string[];
  correctAnswer: number | string;
  explanation?: string;
  points: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface IQuizItem {
  quizId: string;
  lessonId: string;
  title: string;
  description?: string;
  questions: IQuizQuestion[];
  totalPoints: number;
  passingScore: number;
  timeLimit?: number; // In minutes
  attemptLimit?: number;
}

export interface IAssignmentItem {
  assignmentId: string;
  lessonId: string;
  title: string;
  description: string;
  objective?: string;
  instructions: string[]; // Numbered instructions
  requirements: string[];
  submissionType: 'text' | 'file' | 'link' | 'code';
  deadline?: string;
  points: number;
  rubric?: string;
  resources?: IResourceItem[];
}

export interface ILessonItem {
  lessonId: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  order: number;
  type: LessonType;
  duration: string;
  learningObjectives: string[];
  video?: IVideoItem | null;
  notes?: string | null;
  resources: IResourceItem[];
  practical?: IPracticalLabItem | null;
  quiz?: IQuizItem | null;
  quizId?: string | null;
  assignment?: IAssignmentItem | null;
  assignmentId?: string | null;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IModuleItem {
  moduleId: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  estimatedDuration: string;
  learningObjectives: string[];
  lessons: ILessonItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IVideoProgress {
  studentId: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  videoId: string;
  watchTime: number; // in seconds
  duration: number; // in seconds
  percentage: number; // 0-100
  lastPosition: number; // position in seconds to resume
  completed: boolean;
  updatedAt: string;
}

export interface ICourse {
  id: string;
  courseId?: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  banner?: string;
  category: string;
  level: CourseLevel;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  language: string;
  price: number;
  instructorId?: string;
  instructorName?: string;
  instructor: {
    id?: string;
    name: string;
    role?: string;
    avatar?: string;
  };
  skills: string[]; // Ordered list of skills
  prerequisites: string[]; // Ordered list of prerequisites
  learningOutcomes: string[]; // Measurable point-wise list
  roadmap?: CourseRoadmapItem[]; // Structured roadmap
  status: CourseStatus;
  visibility: CourseVisibility;
  featured: boolean;
  tags: string[];
  enrollmentCount: number;
  rating: number;
  ratingCount?: number;
  order?: number;
  syllabus?: {
    id: string;
    title: string;
    description?: string;
    lessonsCount?: number;
    duration?: string;
  }[];
  modules?: IModuleItem[] | any[];
  aiGenerated?: boolean;
  aiPrompt?: string;
  aiMetadata?: Record<string, any>;
  progress?: number; // Enrollment completion percentage (0-100)
  isEnrolled?: boolean; // Whether current student is enrolled
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateCourseDTO = Omit<
  ICourse,
  'id' | 'slug' | 'enrollmentCount' | 'rating' | 'ratingCount' | 'createdAt' | 'updatedAt' | 'progress' | 'isEnrolled'
> & {
  id?: string;
  slug?: string;
};

export type UpdateCourseDTO = Partial<CreateCourseDTO>;

export interface CourseFilterOptions {
  search?: string;
  category?: string;
  level?: CourseLevel | 'all';
  status?: CourseStatus | 'all';
  featured?: boolean;
  language?: string;
  sortBy?: 'createdAt' | 'rating' | 'price' | 'enrollmentCount' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CoursePaginationResult {
  courses: ICourse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
