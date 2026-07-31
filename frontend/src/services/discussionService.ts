export interface DiscussionQuestion {
  id: string;
  courseId: string;
  title: string;
  description: string;
  lessonId?: string;
  lessonName?: string;
  tags: string[];
  visibility: 'Course Only';
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: 'student' | 'instructor' | 'admin';
  repliesCount: number;
  participantCount?: number;
  participants?: string[];
  upvotes: string[]; // User IDs who upvoted
  upvotesCount: number;
  status: 'Open' | 'Answered' | 'Closed';
  bestAnswerReplyId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  id: string;
  questionId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: 'student' | 'instructor' | 'admin';
  content: string;
  upvotes: string[]; // User IDs who upvoted
  upvotesCount: number;
  createdAt: string;
  updatedAt: string;
}

class DiscussionService {
  private getQuestionsKey(courseId: string): string {
    return `shaivika_discussions_questions_${courseId}`;
  }

  private getRepliesKey(questionId: string): string {
    return `shaivika_discussions_replies_${questionId}`;
  }

  private getReadStatusKey(userId: string): string {
    return `shaivika_discussions_read_status_${userId}`;
  }

  // Pre-populate discussions (starts empty for real-time live usage)
  private initMockData(courseId: string): DiscussionQuestion[] {
    localStorage.setItem(this.getQuestionsKey(courseId), JSON.stringify([]));
    return [];
  }

  // Get all questions for a specific course
  getQuestions(courseId: string): DiscussionQuestion[] {
    const data = localStorage.getItem(this.getQuestionsKey(courseId));
    if (data !== null) {
      try {
        const parsed: DiscussionQuestion[] = JSON.parse(data);
        // Instantly purge any legacy mock questions
        const filtered = parsed.filter((q) => {
          const isMockId =
            q.id.startsWith('q_linux_') ||
            q.id.startsWith('q_git_') ||
            q.authorId === 'st_elena' ||
            q.authorId === 'st_sam' ||
            q.authorId === 'st_alex';

          const isMockAuthor = ['Elena Rostova', 'Sam Wu', 'Alex Johnson'].includes(q.authorName);
          const isMockTitle =
            q.title.includes('SIGTERM') ||
            q.title.includes('Permission Denied error') ||
            q.title.includes('Systemd custom service') ||
            q.title.includes('Git Merge vs Git Rebase') ||
            q.title.includes('merge conflicts during a rebase');

          return !isMockId && !isMockAuthor && !isMockTitle;
        });

        if (filtered.length !== parsed.length) {
          this.saveQuestions(courseId, filtered);
        }
        return filtered;
      } catch (e) {
        console.warn('Failed to parse discussions cache:', e);
      }
    }
    return this.initMockData(courseId);
  }

  // Save questions list
  private saveQuestions(courseId: string, questions: DiscussionQuestion[]): void {
    localStorage.setItem(this.getQuestionsKey(courseId), JSON.stringify(questions));
  }

  // Add a new discussion question
  addQuestion(
    courseId: string,
    title: string,
    description: string,
    lessonId?: string,
    lessonName?: string,
    tags: string[] = [],
    author?: { uid: string; fullName: string; photoURL?: string | null; role: string }
  ): DiscussionQuestion {
    const questions = this.getQuestions(courseId);
    const now = new Date().toISOString();

    const newQuestion: DiscussionQuestion = {
      id: `q_${Date.now()}`,
      courseId,
      title: title.trim(),
      description: description.trim(),
      lessonId,
      lessonName,
      tags: tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0),
      visibility: 'Course Only',
      authorId: author?.uid || 'default_student',
      authorName: author?.fullName || 'Anonymous User',
      authorAvatar: author?.photoURL || undefined,
      authorRole: (author?.role as any) || 'student',
      repliesCount: 0,
      upvotes: [],
      upvotesCount: 0,
      status: 'Open',
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newQuestion, ...questions];
    this.saveQuestions(courseId, updated);
    localStorage.setItem(this.getRepliesKey(newQuestion.id), JSON.stringify([]));
    return newQuestion;
  }

  // Delete a discussion question
  deleteQuestion(courseId: string, questionId: string): void {
    const questions = this.getQuestions(courseId);
    const filtered = questions.filter((q) => q.id !== questionId);
    this.saveQuestions(courseId, filtered);
    localStorage.removeItem(this.getRepliesKey(questionId));
  }

  // Toggle upvote on a question
  toggleUpvoteQuestion(courseId: string, questionId: string, userId: string): DiscussionQuestion | null {
    const questions = this.getQuestions(courseId);
    let updatedQuestion: DiscussionQuestion | null = null;

    const updated = questions.map((q) => {
      if (q.id === questionId) {
        const isUpvoted = q.upvotes.includes(userId);
        let newUpvotes: string[];
        if (isUpvoted) {
          newUpvotes = q.upvotes.filter((uid) => uid !== userId);
        } else {
          newUpvotes = [...q.upvotes, userId];
        }
        updatedQuestion = {
          ...q,
          upvotes: newUpvotes,
          upvotesCount: newUpvotes.length,
        };
        return updatedQuestion;
      }
      return q;
    });

    if (updatedQuestion) {
      this.saveQuestions(courseId, updated);
    }
    return updatedQuestion;
  }

  // Close or reopen a question status
  setQuestionStatus(courseId: string, questionId: string, status: 'Open' | 'Answered' | 'Closed'): DiscussionQuestion | null {
    const questions = this.getQuestions(courseId);
    let updatedQuestion: DiscussionQuestion | null = null;

    const updated = questions.map((q) => {
      if (q.id === questionId) {
        updatedQuestion = {
          ...q,
          status,
          updatedAt: new Date().toISOString(),
        };
        return updatedQuestion;
      }
      return q;
    });

    if (updatedQuestion) {
      this.saveQuestions(courseId, updated);
    }
    return updatedQuestion;
  }

  // Get replies list for a question
  getReplies(questionId: string): DiscussionReply[] {
    const data = localStorage.getItem(this.getRepliesKey(questionId));
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.warn('Failed to parse replies cache:', e);
      }
    }
    return [];
  }

  // Save replies list
  private saveReplies(questionId: string, replies: DiscussionReply[]): void {
    localStorage.setItem(this.getRepliesKey(questionId), JSON.stringify(replies));
  }

  // Add reply
  addReply(
    courseId: string,
    questionId: string,
    content: string,
    author?: { uid: string; fullName: string; photoURL?: string | null; role: string }
  ): DiscussionReply {
    const replies = this.getReplies(questionId);
    const now = new Date().toISOString();

    const newReply: DiscussionReply = {
      id: `r_${Date.now()}`,
      questionId,
      authorId: author?.uid || 'default_student',
      authorName: author?.fullName || 'Anonymous User',
      authorAvatar: author?.photoURL || undefined,
      authorRole: (author?.role as any) || 'student',
      content: content.trim(),
      upvotes: [],
      upvotesCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const updatedReplies = [...replies, newReply];
    this.saveReplies(questionId, updatedReplies);

    // Update question repliesCount
    const questions = this.getQuestions(courseId);
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          repliesCount: updatedReplies.length,
          updatedAt: now,
        };
      }
      return q;
    });
    this.saveQuestions(courseId, updatedQuestions);

    return newReply;
  }

  // Edit reply
  editReply(questionId: string, replyId: string, content: string): DiscussionReply | null {
    const replies = this.getReplies(questionId);
    let updatedReply: DiscussionReply | null = null;

    const updated = replies.map((r) => {
      if (r.id === replyId) {
        updatedReply = {
          ...r,
          content: content.trim(),
          updatedAt: new Date().toISOString(),
        };
        return updatedReply;
      }
      return r;
    });

    if (updatedReply) {
      this.saveReplies(questionId, updated);
    }
    return updatedReply;
  }

  // Delete reply
  deleteReply(courseId: string, questionId: string, replyId: string): void {
    const replies = this.getReplies(questionId);
    const filtered = replies.filter((r) => r.id !== replyId);
    this.saveReplies(questionId, filtered);

    // Update question repliesCount & best answer if it was deleted
    const questions = this.getQuestions(courseId);
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        const isBestAnswerDeleted = q.bestAnswerReplyId === replyId;
        return {
          ...q,
          repliesCount: filtered.length,
          bestAnswerReplyId: isBestAnswerDeleted ? null : q.bestAnswerReplyId,
          updatedAt: new Date().toISOString(),
        };
      }
      return q;
    });
    this.saveQuestions(courseId, updatedQuestions);
  }

  // Toggle upvote on a reply
  toggleUpvoteReply(questionId: string, replyId: string, userId: string): DiscussionReply | null {
    const replies = this.getReplies(questionId);
    let updatedReply: DiscussionReply | null = null;

    const updated = replies.map((r) => {
      if (r.id === replyId) {
        const isUpvoted = r.upvotes.includes(userId);
        let newUpvotes: string[];
        if (isUpvoted) {
          newUpvotes = r.upvotes.filter((uid) => uid !== userId);
        } else {
          newUpvotes = [...r.upvotes, userId];
        }
        updatedReply = {
          ...r,
          upvotes: newUpvotes,
          upvotesCount: newUpvotes.length,
        };
        return updatedReply;
      }
      return r;
    });

    if (updatedReply) {
      this.saveReplies(questionId, updated);
    }
    return updatedReply;
  }

  // Mark a reply as the Best Answer
  markAsBestAnswer(courseId: string, questionId: string, replyId: string | null): DiscussionQuestion | null {
    const questions = this.getQuestions(courseId);
    let updatedQuestion: DiscussionQuestion | null = null;

    const updated = questions.map((q) => {
      if (q.id === questionId) {
        updatedQuestion = {
          ...q,
          bestAnswerReplyId: replyId,
          status: replyId ? 'Answered' : q.status, // Auto mark as answered if a best answer is chosen
          updatedAt: new Date().toISOString(),
        };
        return updatedQuestion;
      }
      return q;
    });

    if (updatedQuestion) {
      this.saveQuestions(courseId, updated);
    }
    return updatedQuestion;
  }

  // Read status and notifications
  getReadStatus(userId: string): Record<string, string> {
    const key = this.getReadStatusKey(userId);
    const data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
    return {};
  }

  markAsRead(_courseId: string, questionId: string, userId: string): void {
    const key = this.getReadStatusKey(userId);
    const status = this.getReadStatus(userId);
    status[questionId] = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(status));
  }

  getUnreadCount(courseId: string, userId: string): number {
    const questions = this.getQuestions(courseId);
    const readStatus = this.getReadStatus(userId);

    return questions.filter((q) => {
      // Unread if the user has never read it, or if it has been updated since their last read
      const lastRead = readStatus[q.id];
      if (!lastRead) return true;
      return new Date(q.updatedAt).getTime() > new Date(lastRead).getTime();
    }).length;
  }
}

export const discussionService = new DiscussionService();
