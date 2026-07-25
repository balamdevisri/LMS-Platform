import { z } from 'zod';

export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Beginner to Advanced';
export type CourseLanguage = 'English' | 'Telugu' | 'Hindi';
// ...
export type CourseCategory = 
  | 'Programming'
  | 'Artificial Intelligence'
  | 'Machine Learning'
  | 'Cloud Computing'
  | 'Cyber Security'
  | 'Linux'
  | 'DevOps'
  | 'Git & GitHub'
  | 'Web Development'
  | 'Data Structures';

export interface Instructor {
  uid: string;
  name: string;
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: CourseCategory | string;
  subcategory: string;
  level: CourseLevel;
  thumbnail: string;
  bannerImage?: string;
  duration: string;
  price: number;
  currency: string;
  status: CourseStatus;
  language: CourseLanguage;
  instructor: Instructor;
  lessonsCount: number;
  modulesCount: number;
  studentsEnrolled: number;
  rating: number;
  totalRatings: number;
  tags: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  certificate: boolean;
  featured: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Zod schemas for validation
export const CourseStatusSchema = z.enum(['draft', 'published', 'archived']);
export const CourseLevelSchema = z.enum(['Beginner', 'Intermediate', 'Advanced', 'Beginner to Advanced']);
export const CourseLanguageSchema = z.enum(['English', 'Telugu', 'Hindi']);

export const CourseValidationSchema = z.object({
  title: z.string({
    required_error: 'Title is required',
  })
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters'),

  slug: z.string({
    required_error: 'Slug is required',
  })
    .min(3, 'Slug must be at least 3 characters long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens (e.g., react-from-zero-to-hero)'),

  description: z.string({
    required_error: 'Description is required',
  })
    .min(10, 'Description must be at least 10 characters long'),

  shortDescription: z.string().max(250, 'Short description cannot exceed 250 characters').default(''),

  category: z.string({
    required_error: 'Category is required',
  })
    .min(1, 'Category cannot be empty'),

  subcategory: z.string().default(''),

  level: CourseLevelSchema,

  thumbnail: z.string({
    required_error: 'Thumbnail URL is required',
  })
    .url('Thumbnail must be a valid URL'),

  bannerImage: z.string().url('Banner image must be a valid URL').optional().or(z.literal('')),

  duration: z.string({
    required_error: 'Duration is required',
  })
    .min(1, 'Duration is required'),

  price: z.number({
    required_error: 'Price is required',
    invalid_type_error: 'Price must be a number',
  })
    .min(0, 'Price must be a non-negative number'),

  currency: z.string().default('INR'),

  status: CourseStatusSchema.default('draft'),

  language: CourseLanguageSchema.default('English'),

  instructor: z.object({
    uid: z.string().min(1, 'Instructor UID is required'),
    name: z.string().min(1, 'Instructor name is required'),
    avatar: z.string().url().optional(),
  }),

  lessonsCount: z.number().int().nonnegative().default(0),
  modulesCount: z.number().int().nonnegative().default(0),
  studentsEnrolled: z.number().int().nonnegative().default(0),
  rating: z.number().min(0).max(5).default(0),
  totalRatings: z.number().int().nonnegative().default(0),
  tags: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  learningOutcomes: z.array(z.string()).default([]),
  certificate: z.boolean().default(false),
  featured: z.boolean().default(false),
  createdBy: z.string().min(1, 'CreatedBy UID is required'),
});

export type CreateCourseInput = z.infer<typeof CourseValidationSchema>;
export type UpdateCourseInput = Partial<CreateCourseInput>;

// Module Interface & Zod Schema
export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
  duration: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ModuleValidationSchema = z.object({
  courseId: z.string({ required_error: 'Course ID is required' }),
  title: z.string({ required_error: 'Module title is required' }).min(3),
  order: z.number({ required_error: 'Module order is required' }).int().nonnegative(),
  duration: z.string({ required_error: 'Module duration is required' }),
});

// Lesson Interface & Zod Schema
export interface LessonCodeExample {
  title: string;
  code: string;
  description?: string;
}

export interface LessonCommand {
  command: string;
  description?: string;
}

export interface LessonResource {
  title: string;
  url: string;
  type: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  order: number;
  duration: string;
  type: 'video' | 'lab' | 'quiz' | 'reading';
  readingTime: string;
  videoUrl?: string;
  content: string; // Markdown notes
  codeExamples?: LessonCodeExample[];
  commands?: LessonCommand[];
  resources?: LessonResource[];
  createdAt: Date;
  updatedAt: Date;
}

export const LessonValidationSchema = z.object({
  courseId: z.string({ required_error: 'Course ID is required' }),
  moduleId: z.string({ required_error: 'Module ID is required' }),
  title: z.string({ required_error: 'Lesson title is required' }).min(3),
  order: z.number({ required_error: 'Lesson order is required' }).int().nonnegative(),
  duration: z.string({ required_error: 'Lesson duration is required' }),
  type: z.enum(['video', 'lab', 'quiz', 'reading']),
  readingTime: z.string().default('5 mins'),
  videoUrl: z.string().url().optional().or(z.literal('')),
  content: z.string().default(''),
  codeExamples: z.array(z.object({
    title: z.string(),
    code: z.string(),
    description: z.string().optional(),
  })).optional(),
  commands: z.array(z.object({
    command: z.string(),
    description: z.string().optional(),
  })).optional(),
  resources: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
    type: z.string(),
  })).optional(),
});

// Quiz Interface & Zod Schema
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export const QuizValidationSchema = z.object({
  courseId: z.string({ required_error: 'Course ID is required' }),
  moduleId: z.string({ required_error: 'Module ID is required' }),
  title: z.string({ required_error: 'Quiz title is required' }).min(3),
  questions: z.array(z.object({
    id: z.number(),
    question: z.string(),
    options: z.array(z.string()).min(2),
    correct: z.number().int().nonnegative(),
  })).min(1),
  passingScore: z.number().min(0).max(100).default(70),
});

// Assignment Interface & Zod Schema
export interface Assignment {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  submissionGuidelines?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const AssignmentValidationSchema = z.object({
  courseId: z.string({ required_error: 'Course ID is required' }),
  moduleId: z.string({ required_error: 'Module ID is required' }),
  title: z.string({ required_error: 'Assignment title is required' }).min(3),
  description: z.string({ required_error: 'Assignment description is required' }).min(10),
  submissionGuidelines: z.string().optional(),
});

// Progress Interface & Zod Schema
export interface Progress {
  id: string;
  uid: string;
  courseId: string;
  completedLessons: string[];
  completedModules: string[];
  quizScores: Record<string, number>;
  assignmentCompleted: Record<string, boolean>;
  percentage: number;
  updatedAt: Date;
}

// Certificate Interface & Zod Schema
export interface Certificate {
  id: string;
  uid: string;
  courseId: string;
  issuedAt: Date;
  certificateUrl: string;
}
