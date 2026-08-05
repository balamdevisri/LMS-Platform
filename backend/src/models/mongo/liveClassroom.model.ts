import mongoose, { Schema, Document } from 'mongoose';

// 1. Live Class Interface & Schema
export interface ILiveClass extends Document {
  title: string;
  courseId: string;
  courseName: string;
  moduleName: string;
  instructorId: string;
  instructorName: string;
  status: 'scheduled' | 'running' | 'completed';
  scheduledTime: Date;
  startTime?: Date;
  endTime?: Date;
  chatEnabled: boolean;
  quizEnabled: boolean;
  pollEnabled: boolean;
  locked: boolean;
}

const LiveClassSchema = new Schema<ILiveClass>({
  title: { type: String, required: true },
  courseId: { type: String, required: true },
  courseName: { type: String, required: true },
  moduleName: { type: String, required: true },
  instructorId: { type: String, required: true },
  instructorName: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'running', 'completed'], default: 'scheduled' },
  scheduledTime: { type: Date, required: true },
  startTime: { type: Date },
  endTime: { type: Date },
  chatEnabled: { type: Boolean, default: true },
  quizEnabled: { type: Boolean, default: true },
  pollEnabled: { type: Boolean, default: true },
  locked: { type: Boolean, default: false },
}, { timestamps: true });

// 2. Participant Interface & Schema
export interface IParticipant extends Document {
  classId: string;
  userId: string;
  name: string;
  role: 'instructor' | 'mentor' | 'student';
  socketId?: string;
  online: boolean;
  lastConnected: Date;
  lastDisconnected?: Date;
}

const ParticipantSchema = new Schema<IParticipant>({
  classId: { type: String, required: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['instructor', 'mentor', 'student'], required: true },
  socketId: { type: String },
  online: { type: Boolean, default: false },
  lastConnected: { type: Date, default: Date.now },
  lastDisconnected: { type: Date },
}, { timestamps: true });

// 3. Attendance Interface & Schema
export interface IAttendance extends Document {
  classId: string;
  userId: string;
  name: string;
  joinTime: Date;
  leaveTime?: Date;
  durationSeconds: number;
  lateEntry: boolean;
  earlyExit: boolean;
  attendancePercentage: number;
}

const AttendanceSchema = new Schema<IAttendance>({
  classId: { type: String, required: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  joinTime: { type: Date, required: true, default: Date.now },
  leaveTime: { type: Date },
  durationSeconds: { type: Number, default: 0 },
  lateEntry: { type: Boolean, default: false },
  earlyExit: { type: Boolean, default: false },
  attendancePercentage: { type: Number, default: 0 },
}, { timestamps: true });

// 4. Live Quiz Interface & Schema
export interface ILiveQuiz extends Document {
  classId: string;
  question: string;
  questionType: 'mcq' | 'true_false' | 'fill_in_the_blank' | 'code_output' | 'programming' | 'multiple_correct';
  options: string[];
  correctAnswer: string;
  marks: number;
  negativeMarks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timerSeconds: number;
  explanation?: string;
  publishedAt: Date;
  active: boolean;
}

const LiveQuizSchema = new Schema<ILiveQuiz>({
  classId: { type: String, required: true },
  question: { type: String, required: true },
  questionType: { 
    type: String, 
    enum: ['mcq', 'true_false', 'fill_in_the_blank', 'code_output', 'programming', 'multiple_correct'], 
    required: true 
  },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  marks: { type: Number, default: 10 },
  negativeMarks: { type: Number, default: 0 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  timerSeconds: { type: Number, default: 30 },
  explanation: { type: String },
  publishedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
}, { timestamps: true });

// 5. Live Quiz Response Interface & Schema
export interface ILiveQuizResponse extends Document {
  classId: string;
  quizId: string;
  userId: string;
  userName: string;
  answer: string;
  isCorrect: boolean;
  timeTakenSeconds: number;
  xpEarned: number;
  submittedAt: Date;
}

const LiveQuizResponseSchema = new Schema<ILiveQuizResponse>({
  classId: { type: String, required: true },
  quizId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  answer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  timeTakenSeconds: { type: Number, required: true },
  xpEarned: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// 6. Live Poll Interface & Schema
export interface ILivePoll extends Document {
  classId: string;
  question: string;
  options: {
    optionText: string;
    votes: string[]; // userIds
  }[];
  active: boolean;
}

const LivePollSchema = new Schema<ILivePoll>({
  classId: { type: String, required: true },
  question: { type: String, required: true },
  options: [{
    optionText: { type: String, required: true },
    votes: [{ type: String }]
  }],
  active: { type: Boolean, default: true },
}, { timestamps: true });

// 7. Live Chat Message Interface & Schema
export interface ILiveChatMessage extends Document {
  classId: string;
  userId: string;
  userName: string;
  role: string;
  message: string;
  messageType: 'normal' | 'announcement';
  pinned: boolean;
  replyToId?: string;
  emojis: {
    emoji: string;
    users: string[]; // userIds
  }[];
}

const LiveChatMessageSchema = new Schema<ILiveChatMessage>({
  classId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  role: { type: String, required: true },
  message: { type: String, required: true },
  messageType: { type: String, enum: ['normal', 'announcement'], default: 'normal' },
  pinned: { type: Boolean, default: false },
  replyToId: { type: String },
  emojis: [{
    emoji: { type: String, required: true },
    users: [{ type: String }]
  }]
}, { timestamps: true });

// 8. Live Notification Interface & Schema
export interface ILiveNotification extends Document {
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
}

const LiveNotificationSchema = new Schema<ILiveNotification>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'general' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

// 9. Live AI Report Interface & Schema
export interface ILiveAIReport extends Document {
  classId: string;
  struggledTopics: string[];
  mostIncorrectQuestion?: string;
  attentionNeededStudents: string[];
  rapidlyImprovingStudents: string[];
  suggestedRevisions: string[];
  predictedPerformance: string;
  learningRecommendations: string[];
}

const LiveAIReportSchema = new Schema<ILiveAIReport>({
  classId: { type: String, required: true },
  struggledTopics: [{ type: String }],
  mostIncorrectQuestion: { type: String },
  attentionNeededStudents: [{ type: String }],
  rapidlyImprovingStudents: [{ type: String }],
  suggestedRevisions: [{ type: String }],
  predictedPerformance: { type: String },
  learningRecommendations: [{ type: String }],
}, { timestamps: true });

// Export Mongoose Models
export const LiveClass = mongoose.model<ILiveClass>('LiveClass', LiveClassSchema);
export const Participant = mongoose.model<IParticipant>('Participant', ParticipantSchema);
export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
export const LiveQuiz = mongoose.model<ILiveQuiz>('LiveQuiz', LiveQuizSchema);
export const LiveQuizResponse = mongoose.model<ILiveQuizResponse>('LiveQuizResponse', LiveQuizResponseSchema);
export const LivePoll = mongoose.model<ILivePoll>('LivePoll', LivePollSchema);
export const LiveChatMessage = mongoose.model<ILiveChatMessage>('LiveChatMessage', LiveChatMessageSchema);
export const LiveNotification = mongoose.model<ILiveNotification>('LiveNotification', LiveNotificationSchema);
export const LiveAIReport = mongoose.model<ILiveAIReport>('LiveAIReport', LiveAIReportSchema);
