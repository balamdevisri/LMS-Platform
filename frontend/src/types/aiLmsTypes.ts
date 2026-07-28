export type QuestionType =
  | 'mcq'
  | 'true_false'
  | 'fill_blank'
  | 'match_following'
  | 'scenario_based'
  | 'command_based'
  | 'output_prediction'
  | 'syntax';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type LearningSpeed = 'Fast' | 'Moderate' | 'Needs Support';

export interface LinuxCommandDoc {
  command: string;
  syntax: string;
  purpose: string;
  exampleUsage: string;
  expectedOutput?: string;
}

export interface DefinitionDoc {
  term: string;
  definition: string;
}

export interface PracticalTaskDoc {
  taskTitle: string;
  instructions: string;
  commandToExecute: string;
}

export interface CourseKnowledgeDoc {
  id?: string;
  courseId: string;
  lessonId: string;
  moduleId?: string;
  lessonTitle: string;
  topics: string[];
  subTopics: string[];
  keywords: string[];
  linuxCommands: LinuxCommandDoc[];
  definitions: DefinitionDoc[];
  importantConcepts: string[];
  examples: string[];
  practicalTasks: PracticalTaskDoc[];
  difficultyLevel: QuestionDifficulty;
  learningObjectives: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface QuestionItem {
  id: string;
  courseId: string;
  lessonId: string;
  moduleId?: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: any;
  matchPairs?: MatchPair[];
  commandHint?: string;
  expectedOutput?: string;
  difficulty: QuestionDifficulty;
  topic: string;
  subTopic: string;
  marks: number;
  timeLimitSeconds: number;
  tags: string[];
  explanation: string;
  uniqueHash: string;
  createdAt: string;
}

export interface StudentAnalysisDoc {
  id?: string;
  studentId: string;
  courseId: string;
  learningScore: number;
  completionPercentage: number;
  weakTopics: string[];
  strongTopics: string[];
  learningSpeed: LearningSpeed;
  totalQuizAttempts: number;
  avgQuizScore: number;
  attemptedQuestionIds: string[];
  updatedAt: string;
}

export interface GeneratedQuizDoc {
  id: string;
  studentId: string;
  courseId: string;
  title: string;
  questionIds: string[];
  questions: QuestionItem[];
  difficultyDistribution: {
    easyCount: number;
    mediumCount: number;
    hardCount: number;
  };
  totalMarks: number;
  timeLimitMinutes: number;
  createdAt: string;
  status: 'active' | 'submitted';
}

export interface QuizAttemptDoc {
  id?: string;
  quizId: string;
  studentId: string;
  courseId: string;
  score: number;
  maxScore: number;
  percentage: number;
  answers: Record<string, any>;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  weakTopicsIdentified: string[];
  attemptDate: string;
  attemptNumber: number;
}

export interface QuestionBankStats {
  totalQuestions: number;
  questionsPerLesson: Record<string, number>;
  questionsPerTopic: Record<string, number>;
  questionsPerDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  questionsPerType: Record<string, number>;
}
