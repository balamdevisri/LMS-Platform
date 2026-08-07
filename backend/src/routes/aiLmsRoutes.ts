/**
 * SHAIVIKA LMS AI Platform - AI Knowledge & Quiz Engine API Routes
 * KaizenQ - Powered by SHAIVIKA GROUPS
 */

import { Router, Request, Response } from 'express';
import { knowledgeAnalyzerService } from '../services/ai/KnowledgeAnalyzerService';
import { questionBankService } from '../services/ai/QuestionBankService';
import { quizGeneratorService } from '../services/ai/QuizGeneratorService';
import { studentAnalysisService } from '../services/ai/StudentAnalysisService';
import { verifyFirebaseToken, requireRole } from '../middleware/auth.middleware';
import { aiRateLimiter } from '../middleware/rateLimiter.middleware';
import { z } from 'zod';

const router = Router();

// Validation Schemas
const analyzeCourseSchema = z.object({
  courseId: z.string(),
  lessonId: z.string(),
  lessonTitle: z.string(),
  lessonContent: z.string(),
  moduleId: z.string().optional(),
});

const generateQuestionBankSchema = z.object({
  courseId: z.string(),
  lessonId: z.string(),
  lessonTitle: z.string(),
  lessonContent: z.string(),
  countPerDifficulty: z.number().optional().default(4),
});

const generateQuizSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  quizTitle: z.string().optional(),
  questionCount: z.number().optional().default(10),
});

const submitQuizSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  quizId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      userAnswer: z.any(),
    })
  ),
});

/**
 * POST /api/ai-lms/course/analyze
 * Analyzes lesson content and extracts structured knowledge (topics, Linux commands, definitions)
 */
router.post('/course/analyze', verifyFirebaseToken as any, requireRole('admin') as any, aiRateLimiter as any, async (req: Request, res: Response) => {
  try {
    const parse = analyzeCourseSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid input parameters', details: parse.error.flatten() });
    }

    const { courseId, lessonId, lessonTitle, lessonContent, moduleId } = parse.data;

    const knowledge = await knowledgeAnalyzerService.analyzeLessonKnowledge(
      courseId,
      lessonId,
      lessonTitle,
      lessonContent,
      moduleId
    );

    return res.status(200).json({
      message: 'Course lesson knowledge analyzed successfully.',
      knowledge,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed analyzing course knowledge', message: err?.message || String(err) });
  }
});

/**
 * POST /api/ai-lms/course/generate-question-bank
 * Generates question bank across 8 question formats and 3 difficulty levels
 */
router.post('/course/generate-question-bank', verifyFirebaseToken as any, requireRole('admin') as any, aiRateLimiter as any, async (req: Request, res: Response) => {
  try {
    const parse = generateQuestionBankSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid input parameters', details: parse.error.flatten() });
    }

    const { courseId, lessonId, lessonTitle, lessonContent, countPerDifficulty } = parse.data;

    // First ensure knowledge document exists or analyze on the fly
    const knowledge = await knowledgeAnalyzerService.analyzeLessonKnowledge(
      courseId,
      lessonId,
      lessonTitle,
      lessonContent
    );

    const questions = await questionBankService.generateQuestionBankForCourse(knowledge, countPerDifficulty);

    return res.status(200).json({
      message: `Generated ${questions.length} unique questions for course question bank.`,
      count: questions.length,
      questions,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed generating question bank', message: err?.message || String(err) });
  }
});

/**
 * GET /api/ai-lms/course/knowledge
 * Gets extracted knowledge documents for a course
 */
router.get('/course/knowledge', verifyFirebaseToken as any, aiRateLimiter as any, async (req: Request, res: Response) => {
  try {
    const courseId = req.query.courseId as string;
    if (!courseId) {
      return res.status(400).json({ error: 'Query parameter courseId is required' });
    }

    const knowledgeList = await knowledgeAnalyzerService.getCourseKnowledge(courseId);
    return res.status(200).json({ count: knowledgeList.length, knowledge: knowledgeList });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed fetching course knowledge', message: err?.message || String(err) });
  }
});

/**
 * GET /api/ai-lms/admin/question-stats
 * Admin dashboard question bank breakdown statistics
 */
router.get('/admin/question-stats', verifyFirebaseToken as any, requireRole('admin') as any, async (req: Request, res: Response) => {
  try {
    const courseId = req.query.courseId as string | undefined;
    const stats = await questionBankService.getQuestionBankStats(courseId);
    return res.status(200).json({ stats });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed computing question stats', message: err?.message || String(err) });
  }
});

/**
 * POST /api/ai-lms/student/generate-quiz
 * Generates personalized unique adaptive quiz for a student
 */
router.post('/student/generate-quiz', verifyFirebaseToken as any, aiRateLimiter as any, async (req: Request, res: Response) => {
  try {
    const parse = generateQuizSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid quiz generation payload', details: parse.error.flatten() });
    }

    const { studentId, courseId, quizTitle, questionCount } = parse.data;

    const quiz = await quizGeneratorService.generatePersonalizedQuiz(
      studentId,
      courseId,
      quizTitle || 'Adaptive Knowledge Assessment',
      questionCount
    );

    return res.status(200).json({
      message: 'Personalized adaptive quiz generated successfully.',
      quiz,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed generating adaptive quiz', message: err?.message || String(err) });
  }
});

/**
 * POST /api/ai-lms/student/submit-quiz
 * Submits and auto-grades adaptive student quiz
 */
router.post('/student/submit-quiz', verifyFirebaseToken as any, aiRateLimiter as any, async (req: Request, res: Response) => {
  try {
    const parse = submitQuizSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid quiz submission payload', details: parse.error.flatten() });
    }

    const { studentId, courseId, quizId, answers } = parse.data;

    const formattedAnswers = answers.map((a) => ({
      questionId: a.questionId,
      userAnswer: a.userAnswer ?? '',
    }));

    const attempt = await quizGeneratorService.submitQuiz(studentId, courseId, quizId, formattedAnswers);

    return res.status(200).json({
      message: 'Quiz submitted and auto-graded successfully.',
      attempt,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed submitting quiz', message: err?.message || String(err) });
  }
});

/**
 * GET /api/ai-lms/student/analysis
 * Returns student performance analysis, weak topics, learning score, and speed
 */
router.get('/student/analysis', verifyFirebaseToken as any, aiRateLimiter as any, async (req: Request, res: Response) => {
  try {
    const studentId = (req.query.studentId as string) || 'student_demo';
    const courseId = (req.query.courseId as string) || 'course_default';

    const analysis = await studentAnalysisService.getStudentAnalysis(studentId, courseId);
    return res.status(200).json({ analysis });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed fetching student analysis', message: err?.message || String(err) });
  }
});

export default router;
