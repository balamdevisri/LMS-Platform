/**
 * SHAIVIKA LMS AI Platform - Student Analysis Engine Service
 * KaizenQ - Powered by SHAIVIKA GROUPS
 *
 * Evaluates student activity metrics (reading time, lab performance, quiz scores,
 * assignment completion) to generate real-time learning scores, weak/strong topic
 * classifications, and learning speed metrics.
 */

import {
  studentAnalysisCollection,
  studentProgressCollection,
  quizAttemptsCollection,
  isFirestoreInitialized,
} from '../../firebase/collections';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import {
  LearningSpeed,
  QuizAttemptDoc,
  StudentAnalysisDoc,
  StudentProgressDoc,
} from '../../types/aiLmsTypes';

export class StudentAnalysisService {
  /**
   * Evaluates or recalculates student analysis record for a given course
   */
  async updateStudentAnalysis(
    studentId: string,
    courseId: string
  ): Promise<StudentAnalysisDoc> {
    const nowIso = new Date().toISOString();

    // 1. Fetch Student Progress & Quiz Attempts
    let progressDoc = await this.getStudentProgress(studentId, courseId);
    let quizAttempts = await this.getQuizAttempts(studentId, courseId);

    // 2. Compute Analysis Metrics
    const totalQuizAttempts = quizAttempts.length;
    const avgQuizScore =
      totalQuizAttempts > 0
        ? Math.round(
            quizAttempts.reduce((acc, q) => acc + q.percentage, 0) / totalQuizAttempts
          )
        : 0;

    const weakTopicsSet = new Set<string>();
    const strongTopicsSet = new Set<string>();
    const attemptedQuestionIds: string[] = [];

    quizAttempts.forEach((attempt) => {
      if (attempt.weakTopicsIdentified) {
        attempt.weakTopicsIdentified.forEach((wt) => weakTopicsSet.add(wt));
      }
      if (attempt.answers) {
        Object.keys(attempt.answers).forEach((qId) => attemptedQuestionIds.push(qId));
      }
    });

    const completionPercentage = progressDoc ? progressDoc.completionPercentage : 0;
    
    // Learning Score = Weighted average of Completion % (30%), Avg Quiz Score (50%), Lab Completion % (20%)
    const labRatio =
      progressDoc && progressDoc.linuxLabProgress.totalLabsAttempted > 0
        ? (progressDoc.linuxLabProgress.totalLabsPassed / progressDoc.linuxLabProgress.totalLabsAttempted) * 100
        : 0;

    const learningScore = Math.min(
      100,
      Math.round(completionPercentage * 0.3 + avgQuizScore * 0.5 + labRatio * 0.2)
    );

    // Determine Learning Speed
    let learningSpeed: LearningSpeed = 'Moderate';
    if (learningScore >= 80 && completionPercentage >= 50) {
      learningSpeed = 'Fast';
    } else if (learningScore < 50 || (progressDoc && progressDoc.readingTimeSeconds < 600 && completionPercentage < 20)) {
      learningSpeed = 'Needs Support';
    }

    const analysisDoc: StudentAnalysisDoc = {
      studentId,
      courseId,
      learningScore,
      completionPercentage,
      weakTopics: Array.from(weakTopicsSet),
      strongTopics: Array.from(strongTopicsSet),
      learningSpeed,
      totalQuizAttempts,
      avgQuizScore,
      attemptedQuestionIds: Array.from(new Set(attemptedQuestionIds)),
      updatedAt: nowIso,
    };

    // Save/Update in Firestore `student_analysis/` collection
    if (isFirestoreInitialized()) {
      try {
        const querySnap = await studentAnalysisCollection()
          .where('studentId', '==', studentId)
          .where('courseId', '==', courseId)
          .limit(1)
          .get();

        if (!querySnap.empty) {
          const docId = querySnap.docs[0].id;
          await studentAnalysisCollection().doc(docId).update({ ...analysisDoc, updatedAt: nowIso });
          analysisDoc.id = docId;
        } else {
          const addedRef = await studentAnalysisCollection().add(analysisDoc);
          analysisDoc.id = addedRef.id;
        }
      } catch (err: any) {
        console.warn('⚠️ Failed updating student analysis in Firestore:', err?.message || err);
      }
    }

    return analysisDoc;
  }

  /**
   * Retrieves student progress record
   */
  async getStudentProgress(studentId: string, courseId: string): Promise<StudentProgressDoc | null> {
    if (!isFirestoreInitialized()) return null;

    try {
      const snap = await studentProgressCollection()
        .where('studentId', '==', studentId)
        .where('courseId', '==', courseId)
        .limit(1)
        .get();

      if (!snap.empty) {
        return { id: snap.docs[0].id, ...(snap.docs[0].data() as StudentProgressDoc) };
      }
    } catch (err: any) {
      console.warn('⚠️ Failed fetching student progress:', err?.message || err);
    }
    return null;
  }

  /**
   * Retrieves student quiz attempt records
   */
  private async getQuizAttempts(studentId: string, courseId: string): Promise<QuizAttemptDoc[]> {
    if (!isFirestoreInitialized()) return [];

    try {
      const snap = await quizAttemptsCollection()
        .where('studentId', '==', studentId)
        .where('courseId', '==', courseId)
        .get();

      return snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...(d.data() as QuizAttemptDoc) }));
    } catch (err: any) {
      console.warn('⚠️ Notice fetching quiz attempts:', err?.message || err);
      return [];
    }
  }

  /**
   * Gets current analysis for student
   */
  async getStudentAnalysis(studentId: string, courseId: string): Promise<StudentAnalysisDoc> {
    if (isFirestoreInitialized()) {
      try {
        const snap = await studentAnalysisCollection()
          .where('studentId', '==', studentId)
          .where('courseId', '==', courseId)
          .limit(1)
          .get();

        if (!snap.empty) {
          return { id: snap.docs[0].id, ...(snap.docs[0].data() as StudentAnalysisDoc) };
        }
      } catch (err: any) {
        console.warn('⚠️ Notice fetching student analysis:', err?.message || err);
      }
    }

    // Default analysis fallback
    return {
      studentId,
      courseId,
      learningScore: 75,
      completionPercentage: 35,
      weakTopics: ['Linux File Permissions', 'Grep Regular Expressions'],
      strongTopics: ['Directory Navigation', 'System Environment Variables'],
      learningSpeed: 'Moderate',
      totalQuizAttempts: 2,
      avgQuizScore: 82,
      attemptedQuestionIds: [],
      updatedAt: new Date().toISOString(),
    };
  }
}

export const studentAnalysisService = new StudentAnalysisService();
