"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseQuerySchema = exports.UpdateCourseSchema = exports.CreateCourseSchema = exports.CourseLevelSchema = exports.CourseVisibilitySchema = exports.CourseStatusSchema = void 0;
const zod_1 = require("zod");
exports.CourseStatusSchema = zod_1.z.enum(['draft', 'published', 'archived']);
exports.CourseVisibilitySchema = zod_1.z.enum(['public', 'private', 'unlisted']);
exports.CourseLevelSchema = zod_1.z.enum(['beginner', 'intermediate', 'advanced', 'all_levels']);
exports.CreateCourseSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, 'Title must be at least 5 characters long').max(120, 'Title cannot exceed 120 characters'),
    slug: zod_1.z.string().min(3).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-case alphanumeric with hyphens').optional(),
    shortDescription: zod_1.z.string().min(10, 'Short description must be at least 10 characters').max(300, 'Short description cannot exceed 300 characters'),
    description: zod_1.z.string().min(20, 'Full description must be at least 20 characters'),
    thumbnail: zod_1.z.string().min(1, 'Thumbnail is required'),
    banner: zod_1.z.string().optional(),
    category: zod_1.z.string().min(2, 'Category is required'),
    level: exports.CourseLevelSchema.default('all_levels'),
    duration: zod_1.z.string().min(2, 'Duration specification is required'),
    language: zod_1.z.string().default('English'),
    price: zod_1.z.number().min(0, 'Price cannot be negative').default(0),
    instructor: zod_1.z.object({
        id: zod_1.z.string().optional(),
        name: zod_1.z.string().min(2, 'Instructor name is required'),
        role: zod_1.z.string().optional(),
        avatar: zod_1.z.string().optional(),
    }),
    skills: zod_1.z.array(zod_1.z.string()).min(1, 'At least one skill is required'),
    prerequisites: zod_1.z.array(zod_1.z.string()).default([]),
    learningOutcomes: zod_1.z.array(zod_1.z.string()).min(1, 'At least one learning outcome is required'),
    status: exports.CourseStatusSchema.default('draft'),
    visibility: exports.CourseVisibilitySchema.default('public'),
    featured: zod_1.z.boolean().default(false),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    syllabus: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string().min(3),
        description: zod_1.z.string().optional(),
        lessonsCount: zod_1.z.number().optional(),
        duration: zod_1.z.string().optional(),
    })).optional(),
    aiGenerated: zod_1.z.boolean().optional(),
    aiPrompt: zod_1.z.string().optional(),
    aiMetadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
});
exports.UpdateCourseSchema = exports.CreateCourseSchema.partial();
exports.CourseQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    level: exports.CourseLevelSchema.or(zod_1.z.literal('all')).optional(),
    status: exports.CourseStatusSchema.or(zod_1.z.literal('all')).optional(),
    featured: zod_1.z.union([zod_1.z.boolean(), zod_1.z.string().transform((v) => v === 'true')]).optional(),
    language: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'rating', 'price', 'enrollmentCount', 'title']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    page: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform((v) => Number(v) || 1)]).optional(),
    limit: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform((v) => Number(v) || 10)]).optional(),
});
