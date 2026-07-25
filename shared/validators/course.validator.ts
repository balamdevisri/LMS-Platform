import { z } from 'zod';

export const CourseStatusSchema = z.enum(['draft', 'published', 'archived']);
export const CourseVisibilitySchema = z.enum(['public', 'private', 'unlisted']);
export const CourseLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'all_levels']);

export const CreateCourseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').max(120, 'Title cannot exceed 120 characters'),
  slug: z.string().min(3).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-case alphanumeric with hyphens').optional(),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters').max(300, 'Short description cannot exceed 300 characters'),
  description: z.string().min(20, 'Full description must be at least 20 characters'),
  thumbnail: z.string().min(1, 'Thumbnail is required'),
  banner: z.string().optional(),
  category: z.string().min(2, 'Category is required'),
  level: CourseLevelSchema.default('all_levels'),
  duration: z.string().min(2, 'Duration specification is required'),
  language: z.string().default('English'),
  price: z.number().min(0, 'Price cannot be negative').default(0),
  instructor: z.object({
    id: z.string().optional(),
    name: z.string().min(2, 'Instructor name is required'),
    role: z.string().optional(),
    avatar: z.string().optional(),
  }),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  prerequisites: z.array(z.string()).default([]),
  learningOutcomes: z.array(z.string()).min(1, 'At least one learning outcome is required'),
  status: CourseStatusSchema.default('draft'),
  visibility: CourseVisibilitySchema.default('public'),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  syllabus: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(3),
      description: z.string().optional(),
      lessonsCount: z.number().optional(),
      duration: z.string().optional(),
    })
  ).optional(),
  aiGenerated: z.boolean().optional(),
  aiPrompt: z.string().optional(),
  aiMetadata: z.record(z.string(), z.any()).optional(),
});

export const UpdateCourseSchema = CreateCourseSchema.partial();

export const CourseQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  level: CourseLevelSchema.or(z.literal('all')).optional(),
  status: CourseStatusSchema.or(z.literal('all')).optional(),
  featured: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).optional(),
  language: z.string().optional(),
  sortBy: z.enum(['createdAt', 'rating', 'price', 'enrollmentCount', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.union([z.number(), z.string().transform((v) => Number(v) || 1)]).optional(),
  limit: z.union([z.number(), z.string().transform((v) => Number(v) || 10)]).optional(),
});

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;
export type CourseQueryInput = z.infer<typeof CourseQuerySchema>;
