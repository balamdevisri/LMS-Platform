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

  // Pre-populate mock discussions if none exist in localStorage
  private initMockData(courseId: string): DiscussionQuestion[] {
    const isGit = courseId.includes('git');
    const now = new Date();

    const mockQuestions: DiscussionQuestion[] = isGit
      ? [
          {
            id: 'q_git_1',
            courseId,
            title: 'Git Merge vs Git Rebase: Practical Team Workflows',
            description: 'When collaborating in a small team of 4, should we prefer git rebase or git merge? What are the main pros and cons of both, especially when pushing to a shared remote main branch? @Instructor',
            lessonId: 'git-les-103',
            lessonName: '1.3 Why Git',
            tags: ['git', 'rebase', 'merge', 'workflow'],
            visibility: 'Course Only',
            authorId: 'st_elena',
            authorName: 'Elena Rostova',
            authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            authorRole: 'student',
            repliesCount: 1,
            upvotes: ['st_alex', 'st_sam'],
            upvotesCount: 2,
            status: 'Answered',
            bestAnswerReplyId: 'r_git_1_1',
            createdAt: new Date(now.getTime() - 2 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 1.5 * 24 * 3600 * 1000).toISOString(),
          },
          {
            id: 'q_git_2',
            courseId,
            title: 'How to resolve merge conflicts during a rebase?',
            description: 'I started a rebase and got a conflict. Git says "rebase in progress". How do I resolve it and continue the rebase safely? @Instructor',
            lessonId: 'git-les-105',
            lessonName: '1.5 Installing Git',
            tags: ['git', 'rebase', 'conflict', 'git-cli'],
            visibility: 'Course Only',
            authorId: 'st_sam',
            authorName: 'Sam Wu',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            authorRole: 'student',
            repliesCount: 0,
            upvotes: [],
            upvotesCount: 0,
            status: 'Open',
            createdAt: new Date(now.getTime() - 12 * 3600 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 12 * 3600 * 1000).toISOString(),
          }
        ]
      : [
          {
            id: 'q_linux_1',
            courseId,
            title: "Permission Denied error when running backup.sh in Module 2",
            description: 'I am trying to run the backup.sh script but I keep getting a "Permission Denied" error in the terminal. I ran ls -l backup.sh and it outputs -rw-r--r--. How do I fix this? @Instructor',
            lessonId: '202',
            lessonName: '2.2 File Permissions Demystified: Read, Write & Execute',
            tags: ['linux', 'permissions', 'chmod', 'sysadmin'],
            visibility: 'Course Only',
            authorId: 'st_sam',
            authorName: 'Sam Wu',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            authorRole: 'student',
            repliesCount: 1,
            upvotes: ['st_alex', 'st_elena', 'default_student'],
            upvotesCount: 3,
            status: 'Answered',
            bestAnswerReplyId: 'r_linux_1_1',
            createdAt: new Date(now.getTime() - 3 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 2.5 * 24 * 3600 * 1000).toISOString(),
          },
          {
            id: 'q_linux_2',
            courseId,
            title: 'Systemd custom service fails with "code=exited, status=203/EXEC"',
            description: 'I created a custom systemd service file under /etc/systemd/system/myapp.service. However, when I try to start it, systemctl status myapp shows "Failed to start... status=203/EXEC". How should I debug this? @Instructor',
            lessonId: '303',
            lessonName: '3.3 Configuring Systemd Services',
            tags: ['systemd', 'linux', 'sysadmin', 'debug'],
            visibility: 'Course Only',
            authorId: 'st_alex',
            authorName: 'Alex Johnson',
            authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            authorRole: 'student',
            repliesCount: 2,
            upvotes: ['st_elena'],
            upvotesCount: 1,
            status: 'Open',
            createdAt: new Date(now.getTime() - 1 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(),
          },
          {
            id: 'q_linux_3',
            courseId,
            title: 'Difference between SIGTERM (15) and SIGKILL (9) - Best practices?',
            description: 'Can someone explain when I should use SIGTERM vs SIGKILL? I know kill -9 is the brute force way, but does it cause resource leaks or corrupt databases? Thanks!',
            lessonId: '301',
            lessonName: '3.1 Linux Process Lifecycles',
            tags: ['process', 'signals', 'linux', 'security'],
            visibility: 'Course Only',
            authorId: 'st_elena',
            authorName: 'Elena Rostova',
            authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            authorRole: 'student',
            repliesCount: 0,
            upvotes: [],
            upvotesCount: 0,
            status: 'Open',
            createdAt: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
          }
        ];

    localStorage.setItem(this.getQuestionsKey(courseId), JSON.stringify(mockQuestions));

    // Store mock replies
    if (isGit) {
      const gitReplies: DiscussionReply[] = [
        {
          id: 'r_git_1_1',
          questionId: 'q_git_1',
          authorId: 'inst_bhanu',
          authorName: 'Bhanu Prakash Achari',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          authorRole: 'instructor',
          content: 'Excellent question Elena! A merge commit preserves the historical timeline of branches exactly as they occurred, which is great for audit trials but can lead to a messy commit graph. A rebase rewrites the history so that your changes sit directly on top of the latest main. In a small team, rebasing local branches before pushing to main is highly recommended to keep a clean history. But remember: NEVER rebase a public branch that others are working on!',
          upvotes: ['st_elena', 'st_sam'],
          upvotesCount: 2,
          createdAt: new Date(now.getTime() - 1.5 * 24 * 3600 * 1000).toISOString(),
          updatedAt: new Date(now.getTime() - 1.5 * 24 * 3600 * 1000).toISOString(),
        }
      ];
      localStorage.setItem(this.getRepliesKey('q_git_1'), JSON.stringify(gitReplies));
      localStorage.setItem(this.getRepliesKey('q_git_2'), JSON.stringify([]));
    } else {
      const linux1Replies: DiscussionReply[] = [
        {
          id: 'r_linux_1_1',
          questionId: 'q_linux_1',
          authorId: 'inst_bhanu',
          authorName: 'Bhanu Prakash Achari',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          authorRole: 'instructor',
          content: 'Hi Sam! The output `-rw-r--r--` shows that the file is not marked as executable. You need to grant the execute permission explicitly. You can do this by running `chmod +x backup.sh` in the terminal. Alternatively, using octal notation, you can run `chmod 755 backup.sh` to make it readable and executable for everyone. Let me know if that works! @Instructor',
          upvotes: ['st_sam', 'st_alex'],
          upvotesCount: 2,
          createdAt: new Date(now.getTime() - 2.5 * 24 * 3600 * 1000).toISOString(),
          updatedAt: new Date(now.getTime() - 2.5 * 24 * 3600 * 1000).toISOString(),
        }
      ];
      const linux2Replies: DiscussionReply[] = [
        {
          id: 'r_linux_2_1',
          questionId: 'q_linux_2',
          authorId: 'st_elena',
          authorName: 'Elena Rostova',
          authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          authorRole: 'student',
          content: 'Hey Alex, the 203/EXEC error usually means systemd cannot find or execute the file specified in your ExecStart directive. Double check if the path is correct, and make sure the script begins with a valid shebang line like `#!/bin/bash` or `#!/usr/bin/env node`. Also make sure the script is executable (`chmod +x`).',
          upvotes: ['st_alex'],
          upvotesCount: 1,
          createdAt: new Date(now.getTime() - 18 * 3600 * 1000).toISOString(),
          updatedAt: new Date(now.getTime() - 18 * 3600 * 1000).toISOString(),
        },
        {
          id: 'r_linux_2_2',
          questionId: 'q_linux_2',
          authorId: 'inst_bhanu',
          authorName: 'Bhanu Prakash Achari',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          authorRole: 'instructor',
          content: 'Spot on, Elena! @Elena. 90% of the time, 203/EXEC is caused by a missing shebang or incorrect file path. Check those two items first, Alex!',
          upvotes: [],
          upvotesCount: 0,
          createdAt: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(),
          updatedAt: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(),
        }
      ];
      localStorage.setItem(this.getRepliesKey('q_linux_1'), JSON.stringify(linux1Replies));
      localStorage.setItem(this.getRepliesKey('q_linux_2'), JSON.stringify(linux2Replies));
      localStorage.setItem(this.getRepliesKey('q_linux_3'), JSON.stringify([]));
    }

    return mockQuestions;
  }

  // Get all questions for a specific course
  getQuestions(courseId: string): DiscussionQuestion[] {
    const data = localStorage.getItem(this.getQuestionsKey(courseId));
    if (data) {
      try {
        return JSON.parse(data);
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
