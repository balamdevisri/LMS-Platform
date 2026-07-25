import { CourseValidationSchema } from '../src/types/course';
import { toDocument, toFirestoreDateTime } from '../src/utils/firestore';
import * as admin from 'firebase-admin';

describe('Course Zod Validation Schema', () => {
  it('should fail validation with invalid course data', () => {
    const invalidData = {
      title: 'Hi', // too short
      slug: 'invalid_slug', // underscore not allowed in slug regex
      description: 'Short', // too short
      category: '', // empty
      level: 'Expert', // invalid level enum value
      thumbnail: 'not-a-url', // not a valid URL
      duration: '',
      price: -10, // negative value
      status: 'nonexistent',
      language: 'Spanish',
    };

    const result = CourseValidationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.title).toBeDefined();
      expect(errors.slug).toBeDefined();
      expect(errors.description).toBeDefined();
      expect(errors.category).toBeDefined();
      expect(errors.level).toBeDefined();
      expect(errors.thumbnail).toBeDefined();
      expect(errors.price).toBeDefined();
    }
  });

  it('should validate valid course data successfully', () => {
    const validData = {
      title: 'React Core Fundamentals',
      slug: 'react-core-fundamentals',
      description: 'A comprehensive guide to React core concepts, hooks, and advanced states.',
      category: 'Web Development',
      level: 'Beginner',
      thumbnail: 'https://example.com/thumbnail.png',
      duration: '12 hours',
      price: 499,
      status: 'draft',
      language: 'English',
      instructor: {
        uid: 'instructor-123',
        name: 'Jane Doe',
      },
      createdBy: 'admin-123',
    };

    const result = CourseValidationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('Firestore Helper Utilities', () => {
  it('should convert JavaScript Dates to Firestore Timestamps', () => {
    const date = new Date('2026-07-23T12:00:00.000Z');
    const timestamp = toFirestoreDateTime(date);
    expect(timestamp).toBeInstanceOf(admin.firestore.Timestamp);
    expect(timestamp.toDate().toISOString()).toBe(date.toISOString());
  });

  it('should clean typescript objects for saving as Firestore documents', () => {
    const courseObj = {
      id: 'course-id-123', // should be deleted
      title: 'Test Course',
      price: 199,
      updatedAt: new Date('2026-07-23T12:00:00.000Z'),
      undefinedField: undefined, // should be deleted
      instructor: {
        uid: 'inst-1',
        name: 'Name',
        undefinedSubField: undefined,
      },
    };

    const doc = toDocument(courseObj);
    expect(doc.id).toBeUndefined();
    expect(doc.title).toBe('Test Course');
    expect(doc.price).toBe(199);
    expect(doc.updatedAt).toBeInstanceOf(admin.firestore.Timestamp);
    expect(doc.undefinedField).toBeUndefined();
    expect(doc.instructor.undefinedSubField).toBeUndefined();
  });
});
