import { db, isFirebaseAdminInitialized } from './index';
import * as admin from 'firebase-admin';

/**
 * Safely retrieves a Firestore collection reference.
 */
export const getCollection = (collectionName: string): admin.firestore.CollectionReference => {
  return db.collection(collectionName);
};

/**
 * Safely checks if the real Firestore database is initialized.
 */
export const isFirestoreInitialized = (): boolean => {
  return isFirebaseAdminInitialized();
};

/**
 * Enterprise Collection Getters
 */
export const coursesCollection = () => getCollection('courses');
export const courseModulesCollection = () => getCollection('course_modules');
export const courseLessonsCollection = () => getCollection('course_lessons');
export const courseKnowledgeCollection = () => getCollection('course_knowledge');
export const questionBankCollection = () => getCollection('question_bank');
export const studentProgressCollection = () => getCollection('student_progress');
export const studentAnalysisCollection = () => getCollection('student_analysis');
export const generatedQuizzesCollection = () => getCollection('generated_quizzes');
export const quizAttemptsCollection = () => getCollection('quiz_attempts');

// Legacy Aliases
export const modulesCollection = () => getCollection('modules');
export const lessonsCollection = () => getCollection('lessons');
export const quizzesCollection = () => getCollection('quizzes');
export const resourcesCollection = () => getCollection('resources');
export const assignmentsCollection = () => getCollection('assignments');
export const progressCollection = () => getCollection('progress');
export const certificatesCollection = () => getCollection('certificates');
export const emailLogsCollection = () => getCollection('email_logs');
export const assignmentSubmissionsCollection = () => getCollection('assignment_submissions');
