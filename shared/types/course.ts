export type CourseStatus = 'draft' | 'published' | 'archived';

export type CourseVisibility = 'public' | 'private' | 'unlisted';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';

export interface ICourse {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: string;
  banner?: string;
  category: string;
  level: CourseLevel;
  duration: string;
  language: string;
  price: number;
  instructor: {
    id?: string;
    name: string;
    role?: string;
    avatar?: string;
  };
  skills: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  status: CourseStatus;
  visibility: CourseVisibility;
  featured: boolean;
  tags: string[];
  enrollmentCount: number;
  rating: number;
  ratingCount?: number;
  syllabus?: {
    id: string;
    title: string;
    description?: string;
    lessonsCount?: number;
    duration?: string;
  }[];
  aiGenerated?: boolean;
  aiPrompt?: string;
  aiMetadata?: Record<string, any>;
  progress?: number; // Enrollment completion percentage (0-100)
  isEnrolled?: boolean; // Whether current student is enrolled
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
