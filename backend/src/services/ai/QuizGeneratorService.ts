/**
 * SHAIVIKA LMS AI Platform - Personalized Adaptive Quiz Engine Service
 * KaizenQ - Powered by SHAIVIKA GROUPS
 *
 * Generates unique, non-repeating personalized quizzes for students based on
 * completed lessons, weak topics, previous question history, and performance score.
 * Auto-grades submissions and updates student analysis metrics.
 */

import {
  generatedQuizzesCollection,
  questionBankCollection,
  quizAttemptsCollection,
  isFirestoreInitialized,
} from '../../firebase/collections';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import {
  GeneratedQuizDoc,
  QuestionItem,
  QuizAnswerInput,
  QuizAttemptDoc,
} from '../../types/aiLmsTypes';
import { studentAnalysisService } from './StudentAnalysisService';

export class QuizGeneratorService {
  /**
   * Generates a unique, personalized adaptive quiz for a student
   */
  async generatePersonalizedQuiz(
    studentId: string,
    courseId: string,
    quizTitle: string = 'Adaptive Knowledge Assessment',
    questionCount: number = 10
  ): Promise<GeneratedQuizDoc> {
    const nowIso = new Date().toISOString();

    // 1. Fetch Student Analysis to retrieve weak topics & attempted question history
    const analysis = await studentAnalysisService.getStudentAnalysis(studentId, courseId);
    const weakTopics = analysis.weakTopics || [];
    const attemptedQuestionIds = new Set(analysis.attemptedQuestionIds || []);

    // 2. Fetch Question Bank candidate items for this course
    let candidates = await this.fetchQuestionCandidates(courseId);

    // 3. Exclude previously attempted questions (Part 6 Rule: Never present repeated questions)
    let unattemptedCandidates = candidates.filter((q) => !attemptedQuestionIds.has(q.id));

    // Fallback if question bank is small or fully attempted: recycle least recent candidate items
    if (unattemptedCandidates.length < questionCount) {
      unattemptedCandidates = candidates;
    }

    // 4. Calculate Difficulty Distribution based on Student's Learning Score
    const { easyCount, mediumCount, hardCount } = this.calculateDifficultyDistribution(
      analysis.learningScore,
      questionCount
    );

    // 5. Select Questions with Priority Weight for Weak Topics
    const selectedQuestions = this.selectTargetedQuestions(
      unattemptedCandidates,
      weakTopics,
      easyCount,
      mediumCount,
      hardCount,
      questionCount
    );

    // 6. Randomize Question Order and Options Order
    const randomizedQuestions = this.randomizeQuizElements(selectedQuestions);

    const totalMarks = randomizedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
    const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const generatedQuiz: GeneratedQuizDoc = {
      id: quizId,
      studentId,
      courseId,
      title: quizTitle,
      questionIds: randomizedQuestions.map((q) => q.id),
      questions: randomizedQuestions,
      difficultyDistribution: { easyCount, mediumCount, hardCount },
      totalMarks,
      timeLimitMinutes: Math.max(5, Math.ceil(totalMarks * 1.5)),
      createdAt: nowIso,
      status: 'active',
    };

    // Store generated quiz in Firestore `generated_quizzes/` collection
    if (isFirestoreInitialized()) {
      try {
        await generatedQuizzesCollection().doc(quizId).set(generatedQuiz);
      } catch (err: any) {
        console.warn('⚠️ Failed saving generated quiz to Firestore:', err?.message || err);
      }
    }

    return generatedQuiz;
  }

  /**
   * Fetches candidate questions from question bank
   */
  private async fetchQuestionCandidates(courseId: string): Promise<QuestionItem[]> {
    if (isFirestoreInitialized()) {
      try {
        const snap = await questionBankCollection().where('courseId', '==', courseId).get();
        if (!snap.empty) {
          return snap.docs.map((d: QueryDocumentSnapshot) => ({ ...(d.data() as QuestionItem), id: d.id }));
        }
      } catch (err: any) {
        console.warn('⚠️ Notice fetching question candidates:', err?.message || err);
      }
    }

    // Algorithmic candidate generator fallback if Firestore bank is empty
    return this.createMockCandidateQuestions(courseId);
  }

  /**
   * Computes dynamic difficulty distribution
   */
  private calculateDifficultyDistribution(
    learningScore: number,
    totalCount: number
  ): { easyCount: number; mediumCount: number; hardCount: number } {
    let easyPct = 0.4;
    let medPct = 0.4;
    let hardPct = 0.2;

    if (learningScore >= 85) {
      easyPct = 0.1;
      medPct = 0.4;
      hardPct = 0.5;
    } else if (learningScore <= 50) {
      easyPct = 0.6;
      medPct = 0.3;
      hardPct = 0.1;
    }

    const easyCount = Math.round(totalCount * easyPct);
    const hardCount = Math.round(totalCount * hardPct);
    const mediumCount = totalCount - easyCount - hardCount;

    return { easyCount, mediumCount, hardCount };
  }

  /**
   * Selects targeted questions prioritizing weak topics
   */
  private selectTargetedQuestions(
    candidates: QuestionItem[],
    weakTopics: string[],
    easyReq: number,
    medReq: number,
    hardReq: number,
    totalReq: number
  ): QuestionItem[] {
    const selected: QuestionItem[] = [];
    const usedIds = new Set<string>();

    const weakTopicSet = new Set(weakTopics.map((t) => t.toLowerCase()));

    // Phase 1: High priority selection for weak topic questions
    const weakCandidates = candidates.filter(
      (q) => weakTopicSet.has(q.topic.toLowerCase()) || weakTopicSet.has(q.subTopic.toLowerCase())
    );

    for (const q of weakCandidates) {
      if (selected.length >= Math.ceil(totalReq * 0.4)) break;
      if (!usedIds.has(q.id)) {
        usedIds.add(q.id);
        selected.push(q);
      }
    }

    // Phase 2: Fill difficulty quota for Easy, Medium, Hard
    const fillQuota = (diff: 'easy' | 'medium' | 'hard', targetCount: number) => {
      const diffCandidates = candidates.filter((q) => q.difficulty === diff && !usedIds.has(q.id));
      for (const q of diffCandidates) {
        const countOfDiff = selected.filter((s) => s.difficulty === diff).length;
        if (countOfDiff >= targetCount) break;
        usedIds.add(q.id);
        selected.push(q);
      }
    };

    fillQuota('easy', easyReq);
    fillQuota('medium', medReq);
    fillQuota('hard', hardReq);

    // Phase 3: Fill remaining spots up to totalReq
    for (const q of candidates) {
      if (selected.length >= totalReq) break;
      if (!usedIds.has(q.id)) {
        usedIds.add(q.id);
        selected.push(q);
      }
    }

    return selected;
  }

  /**
   * Randomizes question order and options order
   */
  private randomizeQuizElements(questions: QuestionItem[]): QuestionItem[] {
    return questions
      .map((q) => {
        const qCopy = { ...q };
        if (qCopy.options && qCopy.options.length > 0) {
          // Shuffle options
          qCopy.options = [...qCopy.options].sort(() => Math.random() - 0.5);
        }
        return qCopy;
      })
      .sort(() => Math.random() - 0.5);
  }

  /**
   * Evaluates submitted student quiz answers, computes score & weak topics, and updates analysis
   */
  async submitQuiz(
    studentId: string,
    courseId: string,
    quizId: string,
    userAnswers: QuizAnswerInput[]
  ): Promise<QuizAttemptDoc> {
    const nowIso = new Date().toISOString();

    // 1. Fetch generated quiz from Firestore or fallback
    let quizDoc: GeneratedQuizDoc | null = null;
    if (isFirestoreInitialized()) {
      try {
        const docSnap = await generatedQuizzesCollection().doc(quizId).get();
        if (docSnap.exists) {
          quizDoc = { ...(docSnap.data() as GeneratedQuizDoc), id: docSnap.id };
        }
      } catch (err: any) {
        console.warn('⚠️ Notice fetching quiz doc:', err?.message || err);
      }
    }

    const questionMap = new Map<string, QuestionItem>();
    if (quizDoc) {
      quizDoc.questions.forEach((q) => questionMap.set(q.id, q));
    }

    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    const answerLog: Record<string, any> = {};
    const wrongTopicsSet = new Set<string>();

    userAnswers.forEach((ansInput) => {
      const question = questionMap.get(ansInput.questionId);
      const marks = question ? question.marks || 1 : 1;
      maxScore += marks;

      const isCorrect = this.checkAnswer(ansInput.userAnswer, question?.correctAnswer);
      answerLog[ansInput.questionId] = {
        userAnswer: ansInput.userAnswer,
        isCorrect,
        correctAnswer: question?.correctAnswer,
      };

      if (isCorrect) {
        totalScore += marks;
        correctCount++;
      } else {
        wrongCount++;
        if (question?.topic) wrongTopicsSet.add(question.topic);
      }
    });

    if (maxScore === 0) maxScore = 10;
    const percentage = Math.round((totalScore / maxScore) * 100);

    const attemptNumber = Math.floor(Date.now() / 100000);

    const attemptDoc: QuizAttemptDoc = {
      quizId,
      studentId,
      courseId,
      score: totalScore,
      maxScore,
      percentage,
      answers: answerLog,
      correctAnswersCount: correctCount,
      wrongAnswersCount: wrongCount,
      weakTopicsIdentified: Array.from(wrongTopicsSet),
      attemptDate: nowIso,
      attemptNumber,
    };

    // 2. Save Quiz Attempt record in Firestore `quiz_attempts/` collection
    if (isFirestoreInitialized()) {
      try {
        const addedRef = await quizAttemptsCollection().add(attemptDoc);
        attemptDoc.id = addedRef.id;

        // Mark quiz status as submitted
        if (quizDoc) {
          await generatedQuizzesCollection().doc(quizId).update({ status: 'submitted' });
        }
      } catch (err: any) {
        console.warn('⚠️ Failed saving quiz attempt to Firestore:', err?.message || err);
      }
    }

    // 3. Trigger Student Analysis Engine update to adapt future quizzes to identified weak topics
    await studentAnalysisService.updateStudentAnalysis(studentId, courseId);

    return attemptDoc;
  }

  /**
   * Normalizes and verifies user answer against correct answer
   */
  private checkAnswer(userAns: any, correctAns: any): boolean {
    if (userAns === undefined || userAns === null) return false;

    const normUser = String(userAns).trim().toLowerCase();
    const normCorrect = String(correctAns).trim().toLowerCase();

    if (normUser === normCorrect) return true;

    // Check partial string matching for command or syntax inputs
    if (normCorrect.length > 5 && normUser.includes(normCorrect)) return true;

    return false;
  }

  /**
   * Candidate question generator fallback for offline / mock testing
   */
  private createMockCandidateQuestions(courseId: string): QuestionItem[] {
    const nowIso = new Date().toISOString();
    return [
      {
        id: `mock_q1_${courseId}`,
        courseId,
        lessonId: 'lesson_1',
        type: 'mcq',
        question: 'Which Linux command is used to display present working directory path?',
        options: ['pwd', 'cd', 'ls', 'mkdir'],
        correctAnswer: 'pwd',
        difficulty: 'easy',
        topic: 'Linux CLI',
        subTopic: 'Directory Commands',
        marks: 1,
        timeLimitSeconds: 45,
        tags: ['linux', 'pwd'],
        explanation: 'pwd stands for Print Working Directory.',
        uniqueHash: `hash_mock_q1_${courseId}`,
        createdAt: nowIso,
      },
      {
        id: `mock_q2_${courseId}`,
        courseId,
        lessonId: 'lesson_1',
        type: 'command_based',
        question: 'Write the command to grant read, write, and execute permissions to owner, and read-only to others for script.sh:',
        options: [],
        correctAnswer: 'chmod 744 script.sh',
        commandHint: 'chmod 744 script.sh',
        difficulty: 'medium',
        topic: 'Linux File Permissions',
        subTopic: 'Chmod Utility',
        marks: 2,
        timeLimitSeconds: 60,
        tags: ['linux', 'permissions'],
        explanation: '7 = rwx (owner), 4 = r-- (group), 4 = r-- (others).',
        uniqueHash: `hash_mock_q2_${courseId}`,
        createdAt: nowIso,
      },
      {
        id: `mock_q3_${courseId}`,
        courseId,
        lessonId: 'lesson_2',
        type: 'scenario_based',
        question: 'Scenario: Your system is experiencing high CPU usage. Which command interactive tool helps identify top processes?',
        options: ['top', 'df -h', 'ip a', 'cat /proc/cpuinfo'],
        correctAnswer: 'top',
        difficulty: 'medium',
        topic: 'Process Monitoring',
        subTopic: 'System Resource Monitoring',
        marks: 2,
        timeLimitSeconds: 60,
        tags: ['top', 'processes'],
        explanation: 'top provides real-time task manager output.',
        uniqueHash: `hash_mock_q3_${courseId}`,
        createdAt: nowIso,
      },
      {
        id: `mock_q4_${courseId}`,
        courseId,
        lessonId: 'lesson_2',
        type: 'syntax',
        question: 'Correct the syntax error: `grep -r "error" /var/log/nginx.log -i`',
        options: [],
        correctAnswer: 'grep -i -r "error" /var/log/nginx.log',
        difficulty: 'hard',
        topic: 'Grep Regular Expressions',
        subTopic: 'Pattern Search',
        marks: 3,
        timeLimitSeconds: 90,
        tags: ['grep', 'syntax'],
        explanation: 'Option flags should precede search pattern and file target.',
        uniqueHash: `hash_mock_q4_${courseId}`,
        createdAt: nowIso,
      },
    ];
  }
}

export const quizGeneratorService = new QuizGeneratorService();
