/**
 * SHAIVIKA LMS AI Platform - Question Bank Generator Service
 * KaizenQ - Powered by SHAIVIKA GROUPS
 *
 * Automatically generates multi-format technical question banks (MCQ, True/False,
 * Fill Blanks, Match Following, Scenario, Command Based, Output Prediction, Syntax)
 * with strict uniqueness hashing, difficulty tiers, and Linux terminal examples.
 */

import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import { env } from '../../config/env';
import { questionBankCollection, isFirestoreInitialized } from '../../firebase/collections';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import {
  CourseKnowledgeDoc,
  QuestionBankStats,
  QuestionDifficulty,
  QuestionItem,
  QuestionType,
} from '../../types/aiLmsTypes';

export class QuestionBankService {
  private aiClient?: GoogleGenAI;

  constructor() {
    if (env.GEMINI_API_KEY) {
      try {
        this.aiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      } catch (err: any) {
        console.warn('⚠️ QuestionBankService: Gemini client init warning:', err?.message || err);
      }
    }
  }

  /**
   * Generates a comprehensive question bank for a given Course Knowledge document
   */
  async generateQuestionBankForCourse(
    courseKnowledge: CourseKnowledgeDoc,
    countPerDifficulty: number = 4
  ): Promise<QuestionItem[]> {
    let generatedQuestions: QuestionItem[] = [];

    if (this.aiClient) {
      try {
        generatedQuestions = await this.generateWithGemini(courseKnowledge, countPerDifficulty);
      } catch (err: any) {
        console.warn('⚠️ Gemini AI question bank generation notice, utilizing algorithmic fallback:', err?.message || err);
        generatedQuestions = this.generateAlgorithmicFallback(courseKnowledge, countPerDifficulty);
      }
    } else {
      generatedQuestions = this.generateAlgorithmicFallback(courseKnowledge, countPerDifficulty);
    }

    // Deduplicate against existing Firestore question bank using unique hash
    const uniqueQuestions: QuestionItem[] = [];
    const existingHashes = await this.getExistingQuestionHashes(courseKnowledge.courseId);

    for (const q of generatedQuestions) {
      if (!existingHashes.has(q.uniqueHash)) {
        existingHashes.add(q.uniqueHash);
        uniqueQuestions.push(q);
      }
    }

    // Save unique questions to Firestore `question_bank/` collection
    if (isFirestoreInitialized() && uniqueQuestions.length > 0) {
      try {
        const batch = (questionBankCollection().firestore as any).batch();
        uniqueQuestions.forEach((item) => {
          const docRef = questionBankCollection().doc(item.id);
          batch.set(docRef, item);
        });
        await batch.commit();
        console.log(`✅ QuestionBankService: Saved ${uniqueQuestions.length} questions to Firestore for course ${courseKnowledge.courseId}`);
      } catch (dbErr: any) {
        console.warn('⚠️ Failed batch saving questions to Firestore:', dbErr?.message || dbErr);
      }
    }

    return uniqueQuestions;
  }

  /**
   * Generates questions using Gemini API
   */
  private async generateWithGemini(
    knowledge: CourseKnowledgeDoc,
    countPerDifficulty: number
  ): Promise<QuestionItem[]> {
    if (!this.aiClient) throw new Error('Gemini API client unavailable');

    const prompt = `
You are an expert Linux & Enterprise Systems Examination Author.
Generate a JSON array of technical exam questions based on this lesson knowledge:

Course ID: ${knowledge.courseId}
Lesson Title: ${knowledge.lessonTitle}
Topics: ${knowledge.topics.join(', ')}
Linux Commands: ${knowledge.linuxCommands.map((c) => c.command).join(', ')}
Key Concepts: ${knowledge.importantConcepts.join(', ')}

Requirements:
Generate at least 12 distinct questions covering the 8 question types:
"mcq", "true_false", "fill_blank", "match_following", "scenario_based", "command_based", "output_prediction", "syntax"
Across 3 difficulty levels: "easy", "medium", "hard".

Each question object MUST contain:
- "type": string (one of the 8 types above)
- "question": string (detailed practical text with real Linux context or CLI commands)
- "options": array of 4 string options (for mcq, true_false)
- "correctAnswer": string or object
- "difficulty": "easy" | "medium" | "hard"
- "topic": string
- "subTopic": string
- "marks": number (1 for easy, 2 for medium, 3 for hard)
- "timeLimitSeconds": number (e.g. 45, 60, 90)
- "tags": array of strings (e.g. ["linux", "cli", "permissions"])
- "explanation": string (explaining why the correct answer is right)
- "commandHint": optional string
- "expectedOutput": optional string

Return ONLY valid raw JSON array. Do not wrap in markdown code block.
`;

    const response = await this.aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const rawText = response.text || '';
    const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const rawList = JSON.parse(cleanedJson);

    const nowIso = new Date().toISOString();
    return rawList.map((item: any, index: number) => {
      const uniqueHash = this.computeQuestionHash(knowledge.courseId, item.question);
      return {
        id: `q_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
        courseId: knowledge.courseId,
        lessonId: knowledge.lessonId,
        moduleId: knowledge.moduleId,
        type: item.type || 'mcq',
        question: item.question,
        options: item.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: item.correctAnswer || item.options?.[0] || 'Option A',
        difficulty: item.difficulty || 'medium',
        topic: item.topic || knowledge.topics[0] || 'Linux Administration',
        subTopic: item.subTopic || knowledge.subTopics[0] || 'General',
        marks: item.marks || (item.difficulty === 'hard' ? 3 : item.difficulty === 'medium' ? 2 : 1),
        timeLimitSeconds: item.timeLimitSeconds || 60,
        tags: item.tags || ['linux', 'kaizenq'],
        explanation: item.explanation || 'Detailed technical explanation provided.',
        commandHint: item.commandHint,
        expectedOutput: item.expectedOutput,
        uniqueHash,
        createdAt: nowIso,
      };
    });
  }

  /**
   * Generates algorithmic fallback questions covering all 8 question formats
   */
  private generateAlgorithmicFallback(
    knowledge: CourseKnowledgeDoc,
    countPerDifficulty: number
  ): QuestionItem[] {
    const questions: QuestionItem[] = [];
    const nowIso = new Date().toISOString();

    const topic = knowledge.topics[0] || knowledge.lessonTitle;
    const subTopic = knowledge.subTopics[0] || 'Core Concepts';
    const primaryCmd = knowledge.linuxCommands[0]?.command || 'ls';

    const questionTypes: QuestionType[] = [
      'mcq',
      'true_false',
      'fill_blank',
      'match_following',
      'scenario_based',
      'command_based',
      'output_prediction',
      'syntax',
    ];

    const difficulties: QuestionDifficulty[] = ['easy', 'medium', 'hard'];

    let count = 0;
    for (const diff of difficulties) {
      for (let i = 0; i < countPerDifficulty; i++) {
        const qType = questionTypes[count % questionTypes.length];
        count++;

        let questionText = '';
        let options: string[] | undefined = undefined;
        let correctAnswer: any = '';
        let commandHint: string | undefined = undefined;
        let expectedOutput: string | undefined = undefined;

        switch (qType) {
          case 'mcq':
            questionText = `Which Linux command option is used to display hidden files and detailed file attributes when running \`${primaryCmd}\`?`;
            options = [`${primaryCmd} -la`, `${primaryCmd} -h`, `${primaryCmd} -r`, `${primaryCmd} --help`].sort(
              () => Math.random() - 0.5
            );
            correctAnswer = `${primaryCmd} -la`;
            break;

          case 'true_false':
            questionText = `True or False: In Linux file permissions, read access is represented numerically by the value 4.`;
            options = ['True', 'False'];
            correctAnswer = 'True';
            break;

          case 'fill_blank':
            questionText = `Complete the command to modify file permissions for script.sh to executable: \`chmod +___ script.sh\``;
            correctAnswer = 'x';
            commandHint = 'x';
            break;

          case 'match_following':
            questionText = `Match the Linux command with its primary system operation:`;
            correctAnswer = {
              'chmod 755': 'Set read, write, execute permissions',
              'grep -i': 'Case-insensitive pattern search',
              'systemctl status': 'Check service status',
            };
            break;

          case 'scenario_based':
            questionText = `Scenario: You are debugging a web server issue on Ubuntu Server 24.04. Nginx fails to start. Which command will display real-time error log output?`;
            options = [
              'tail -f /var/log/nginx/error.log',
              'cat /etc/nginx/nginx.conf',
              'ls -l /var/log/nginx',
              'chmod 644 /var/log/nginx',
            ];
            correctAnswer = 'tail -f /var/log/nginx/error.log';
            break;

          case 'command_based':
            questionText = `Enter the exact command to recursively search for the string "ERROR" inside all files in \`/var/log/\`:`;
            correctAnswer = 'grep -r "ERROR" /var/log/';
            commandHint = 'grep -r "ERROR" /var/log/';
            break;

          case 'output_prediction':
            questionText = `Given the command \`echo "KaizenQ LMS" | tr "a-z" "A-Z"\`, what will be the exact standard output?`;
            correctAnswer = 'KAIZENQ LMS';
            expectedOutput = 'KAIZENQ LMS';
            break;

          case 'syntax':
            questionText = `Identify and correct the syntax error in this command: \`find /home -name *.txt -type file\``;
            correctAnswer = 'find /home -name "*.txt" -type f';
            break;
        }

        const uniqueHash = this.computeQuestionHash(knowledge.courseId, `${qType}_${diff}_${questionText}`);

        questions.push({
          id: `q_${Date.now()}_${count}_${Math.random().toString(36).substring(2, 6)}`,
          courseId: knowledge.courseId,
          lessonId: knowledge.lessonId,
          moduleId: knowledge.moduleId,
          type: qType,
          question: questionText,
          options,
          correctAnswer,
          commandHint,
          expectedOutput,
          difficulty: diff,
          topic,
          subTopic,
          marks: diff === 'hard' ? 3 : diff === 'medium' ? 2 : 1,
          timeLimitSeconds: diff === 'hard' ? 90 : diff === 'medium' ? 60 : 45,
          tags: ['linux', 'cli', topic.toLowerCase().replace(/\s+/g, '-')],
          explanation: `The correct response is '${typeof correctAnswer === 'object' ? JSON.stringify(correctAnswer) : correctAnswer}' because it fulfills the standard Linux OS specifications for ${topic}.`,
          uniqueHash,
          createdAt: nowIso,
        });
      }
    }

    return questions;
  }

  /**
   * Computes a SHA-256 hash digest for question uniqueness validation
   */
  private computeQuestionHash(courseId: string, questionText: string): string {
    const cleanText = questionText.toLowerCase().replace(/[^a-z0-9]/g, '');
    return crypto.createHash('sha256').update(`${courseId}:${cleanText}`).digest('hex');
  }

  /**
   * Fetches existing question hashes from Firestore to ensure zero duplicate questions
   */
  private async getExistingQuestionHashes(courseId: string): Promise<Set<string>> {
    const hashes = new Set<string>();
    if (!isFirestoreInitialized()) return hashes;

    try {
      const snap = await questionBankCollection().where('courseId', '==', courseId).get();
      snap.docs.forEach((doc: QueryDocumentSnapshot) => {
        const data = doc.data() as QuestionItem;
        if (data.uniqueHash) hashes.add(data.uniqueHash);
      });
    } catch (err: any) {
      console.warn('⚠️ Notice fetching existing question hashes:', err?.message || err);
    }
    return hashes;
  }

  /**
   * Computes Admin Question Bank Statistics
   */
  async getQuestionBankStats(courseId?: string): Promise<QuestionBankStats> {
    const stats: QuestionBankStats = {
      totalQuestions: 0,
      questionsPerLesson: {},
      questionsPerTopic: {},
      questionsPerDifficulty: { easy: 0, medium: 0, hard: 0 },
      questionsPerType: {},
    };

    if (!isFirestoreInitialized()) return stats;

    try {
      let query: any = questionBankCollection();
      if (courseId) {
        query = query.where('courseId', '==', courseId);
      }
      const snap = await query.get();
      stats.totalQuestions = snap.docs.length;

      snap.docs.forEach((docSnap: any) => {
        const q = docSnap.data() as QuestionItem;

        // Lesson count
        stats.questionsPerLesson[q.lessonId] = (stats.questionsPerLesson[q.lessonId] || 0) + 1;
        // Topic count
        stats.questionsPerTopic[q.topic] = (stats.questionsPerTopic[q.topic] || 0) + 1;
        // Difficulty count
        if (q.difficulty in stats.questionsPerDifficulty) {
          stats.questionsPerDifficulty[q.difficulty]++;
        }
        // Type count
        stats.questionsPerType[q.type] = (stats.questionsPerType[q.type] || 0) + 1;
      });
    } catch (err: any) {
      console.warn('⚠️ Failed computing question bank stats:', err?.message || err);
    }

    return stats;
  }
}

export const questionBankService = new QuestionBankService();
