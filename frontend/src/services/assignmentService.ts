export interface SubmittedFile {
  name: string;
  size: number;
  type: string;
}

export interface RubricCriteria {
  score: number;
  maxScore: number;
}

export interface RubricScores {
  codeQuality: RubricCriteria;
  documentation: RubricCriteria;
  uiUx: RubricCriteria;
  functionality: RubricCriteria;
  testing: RubricCriteria;
}

export interface TimelineEvent {
  status: 'Draft Saved' | 'Submitted' | 'Resubmitted' | 'Reviewed' | 'Graded' | 'Resubmission Required';
  timestamp: string;
  user: string;
  comment?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  files: SubmittedFile[];
  comments: string;
  status: 'Not Started' | 'Draft Saved' | 'Submitted' | 'Under Review' | 'Graded' | 'Resubmission Required';
  submittedAt?: string;
  gradedAt?: string;
  marksObtained?: number;
  marksMax: number;
  passingMarks: number;
  feedback?: string;
  rubricScores?: RubricScores;
  history: TimelineEvent[];
  isLate: boolean;
}

export interface AssignmentNotification {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  type: 'draft_saved' | 'submitted' | 'returned' | 'graded';
  message: string;
  timestamp: string;
  read: boolean;
}

class AssignmentService {
  private submissionsKey = 'shaivika_submissions_all_v1';
  private notificationsKey = 'shaivika_assignment_notifications_v1';

  private initMockSubmissions(): AssignmentSubmission[] {
    const now = new Date();
    const mock: AssignmentSubmission[] = [
      {
        id: 'sub_alex_113',
        assignmentId: '1.1.3',
        assignmentTitle: '1.3 Practical Core Assignment: concentric Linux layers',
        courseId: 'course_linux_101',
        studentId: 'st_alex',
        studentName: 'Alex Johnson',
        studentEmail: 'alex.johnson@stanford.edu',
        studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        files: [{ name: 'linux_layered_architecture.pdf', size: 2450000, type: 'application/pdf' }],
        comments: 'Here is my concentric layered ring model along with explanations of syscall vectors. Looking forward to feedback! @Instructor',
        status: 'Submitted',
        submittedAt: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
        history: [
          { status: 'Draft Saved', timestamp: new Date(now.getTime() - 28 * 3600 * 1000).toISOString(), user: 'Alex Johnson' },
          { status: 'Submitted', timestamp: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(), user: 'Alex Johnson' }
        ],
        isLate: false,
        marksMax: 100,
        passingMarks: 70
      },
      {
        id: 'sub_elena_113',
        assignmentId: '1.1.3',
        assignmentTitle: '1.3 Practical Core Assignment: concentric Linux layers',
        courseId: 'course_linux_101',
        studentId: 'st_elena',
        studentName: 'Elena Rostova',
        studentEmail: 'elena@berkeley.edu',
        studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        files: [
          { name: 'backup_script.sh', size: 4500, type: 'text/x-shellscript' },
          { name: 'execution_log.txt', size: 1024, type: 'text/plain' }
        ],
        comments: 'I implemented the backup rotation bash script and included the diagnostic console execution log file.',
        status: 'Graded',
        submittedAt: new Date(now.getTime() - 3 * 24 * 3600 * 1000).toISOString(),
        gradedAt: new Date(now.getTime() - 2.5 * 24 * 3600 * 1000).toISOString(),
        marksObtained: 95,
        marksMax: 100,
        passingMarks: 70,
        feedback: 'Outstanding submission, Elena! @Elena. Your bash scripts display excellent error protection logic. The shebang configuration is spot on, and the logs confirm it queries diagnostic kernel outputs successfully.',
        rubricScores: {
          codeQuality: { score: 19, maxScore: 20 },
          documentation: { score: 18, maxScore: 20 },
          uiUx: { score: 19, maxScore: 20 },
          functionality: { score: 20, maxScore: 20 },
          testing: { score: 19, maxScore: 20 }
        },
        history: [
          { status: 'Draft Saved', timestamp: new Date(now.getTime() - 3.5 * 24 * 3600 * 1000).toISOString(), user: 'Elena Rostova' },
          { status: 'Submitted', timestamp: new Date(now.getTime() - 3 * 24 * 3600 * 1000).toISOString(), user: 'Elena Rostova' },
          { status: 'Reviewed', timestamp: new Date(now.getTime() - 2.6 * 24 * 3600 * 1000).toISOString(), user: 'Instructor' },
          { status: 'Graded', timestamp: new Date(now.getTime() - 2.5 * 24 * 3600 * 1000).toISOString(), user: 'Instructor' }
        ],
        isLate: false
      },
      {
        id: 'sub_sam_113',
        assignmentId: '1.1.3',
        assignmentTitle: '1.3 Practical Core Assignment: concentric Linux layers',
        courseId: 'course_linux_101',
        studentId: 'st_sam',
        studentName: 'Sam Wu',
        studentEmail: 'sam.wu@mit.edu',
        studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        files: [{ name: 'concentric_layers_report.zip', size: 9400000, type: 'application/zip' }],
        comments: 'Sorry for the slight delay! My terminal loop simulation crashed during testing. Uploading my full report now.',
        status: 'Submitted',
        submittedAt: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
        history: [
          { status: 'Submitted', timestamp: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(), user: 'Sam Wu' }
        ],
        isLate: true,
        marksMax: 100,
        passingMarks: 70
      },
      {
        id: 'sub_dave_113',
        assignmentId: '1.1.3',
        assignmentTitle: '1.3 Practical Core Assignment: concentric Linux layers',
        courseId: 'course_linux_101',
        studentId: 'st_dave',
        studentName: 'Dave Miller',
        studentEmail: 'd.miller@tech.org',
        files: [{ name: 'syscalls_draft.txt', size: 840, type: 'text/plain' }],
        comments: 'Initial draft containing syscall descriptors.',
        status: 'Resubmission Required',
        submittedAt: new Date(now.getTime() - 4 * 24 * 3600 * 1000).toISOString(),
        gradedAt: new Date(now.getTime() - 3.8 * 24 * 3600 * 1000).toISOString(),
        feedback: 'You have only described the syscall layer. Please make sure to map the concentric rings model in full (Hardware, Kernel, Shell, and User space) and resubmit for evaluation. @Dave',
        history: [
          { status: 'Submitted', timestamp: new Date(now.getTime() - 4 * 24 * 3600 * 1000).toISOString(), user: 'Dave Miller' },
          { status: 'Reviewed', timestamp: new Date(now.getTime() - 3.9 * 24 * 3600 * 1000).toISOString(), user: 'Instructor' },
          { status: 'Resubmission Required', timestamp: new Date(now.getTime() - 3.8 * 24 * 3600 * 1000).toISOString(), user: 'Instructor' }
        ],
        isLate: false,
        marksMax: 100,
        passingMarks: 70
      }
    ];

    localStorage.setItem(this.submissionsKey, JSON.stringify(mock));
    return mock;
  }

  // Fetch all submissions from localStorage
  getAllSubmissions(): AssignmentSubmission[] {
    const data = localStorage.getItem(this.submissionsKey);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.warn('Failed to parse assignments:', e);
      }
    }
    return this.initMockSubmissions();
  }

  // Save submissions array to localStorage
  private saveAllSubmissions(submissions: AssignmentSubmission[]): void {
    localStorage.setItem(this.submissionsKey, JSON.stringify(submissions));
  }

  // Fetch submission for a specific assignment and student
  getStudentSubmission(assignmentId: string, studentId: string): AssignmentSubmission | null {
    const list = this.getAllSubmissions();
    const found = list.find((sub) => sub.assignmentId === assignmentId && sub.studentId === studentId);
    return found || null;
  }

  // Save submission as Draft
  saveDraft(
    assignmentId: string,
    assignmentTitle: string,
    courseId: string,
    studentInfo: { uid: string; fullName: string; email: string; photoURL?: string },
    files: SubmittedFile[],
    comments: string
  ): AssignmentSubmission {
    const list = this.getAllSubmissions();
    const existingIdx = list.findIndex(
      (sub) => sub.assignmentId === assignmentId && sub.studentId === studentInfo.uid
    );

    const now = new Date().toISOString();
    let submission: AssignmentSubmission;

    if (existingIdx >= 0) {
      const prev = list[existingIdx];
      // Append a Draft Saved event to history if files or comments changed
      const history = [...prev.history];
      if (
        prev.files.length !== files.length ||
        prev.comments !== comments ||
        prev.status !== 'Draft Saved'
      ) {
        history.push({
          status: 'Draft Saved',
          timestamp: now,
          user: studentInfo.fullName,
        });
      }

      submission = {
        ...prev,
        files,
        comments,
        status: 'Draft Saved',
        history,
      };
      list[existingIdx] = submission;
    } else {
      submission = {
        id: `sub_${Date.now()}`,
        assignmentId,
        assignmentTitle,
        courseId,
        studentId: studentInfo.uid,
        studentName: studentInfo.fullName,
        studentEmail: studentInfo.email,
        studentAvatar: studentInfo.photoURL,
        files,
        comments,
        status: 'Draft Saved',
        history: [
          {
            status: 'Draft Saved',
            timestamp: now,
            user: studentInfo.fullName,
          },
        ],
        isLate: false,
        marksMax: 100,
        passingMarks: 70,
      };
      list.push(submission);
    }

    this.saveAllSubmissions(list);
    this.addNotification(
      studentInfo.uid,
      assignmentId,
      assignmentTitle,
      'draft_saved',
      `Draft saved for assignment "${assignmentTitle}".`
    );
    return submission;
  }

  // Final Submit Assignment
  submitAssignment(
    assignmentId: string,
    assignmentTitle: string,
    courseId: string,
    studentInfo: { uid: string; fullName: string; email: string; photoURL?: string },
    files: SubmittedFile[],
    comments: string,
    dueDateStr?: string
  ): AssignmentSubmission {
    const list = this.getAllSubmissions();
    const existingIdx = list.findIndex(
      (sub) => sub.assignmentId === assignmentId && sub.studentId === studentInfo.uid
    );

    const now = new Date();
    const nowIso = now.toISOString();

    // Lateness check
    let isLate = false;
    if (dueDateStr) {
      const dueDate = new Date(dueDateStr);
      isLate = now > dueDate;
    }

    let submission: AssignmentSubmission;

    if (existingIdx >= 0) {
      const prev = list[existingIdx];
      const history = [...prev.history];
      
      const isResubmission = prev.status === 'Resubmission Required';
      history.push({
        status: isResubmission ? 'Resubmitted' as any : 'Submitted',
        timestamp: nowIso,
        user: studentInfo.fullName,
        comment: comments,
      });

      submission = {
        ...prev,
        files,
        comments,
        status: 'Submitted',
        submittedAt: nowIso,
        history,
        isLate,
      };
      list[existingIdx] = submission;
    } else {
      submission = {
        id: `sub_${Date.now()}`,
        assignmentId,
        assignmentTitle,
        courseId,
        studentId: studentInfo.uid,
        studentName: studentInfo.fullName,
        studentEmail: studentInfo.email,
        studentAvatar: studentInfo.photoURL,
        files,
        comments,
        status: 'Submitted',
        submittedAt: nowIso,
        history: [
          {
            status: 'Submitted',
            timestamp: nowIso,
            user: studentInfo.fullName,
            comment: comments,
          },
        ],
        isLate,
        marksMax: 100,
        passingMarks: 70,
      };
      list.push(submission);
    }

    this.saveAllSubmissions(list);
    
    // Also save in the LMS completed units system so progress updates
    try {
      let completedIds: Record<string, boolean> = {};
      const cacheKey = `lms_completed_units_${courseId}`;
      const stored = localStorage.getItem(cacheKey);
      if (stored) completedIds = JSON.parse(stored);
      completedIds[assignmentId] = true;
      localStorage.setItem(cacheKey, JSON.stringify(completedIds));
    } catch (e) {
      console.warn('Failed to update lms completed units progress:', e);
    }

    this.addNotification(
      studentInfo.uid,
      assignmentId,
      assignmentTitle,
      'submitted',
      `Assignment "${assignmentTitle}" submitted successfully!`
    );

    return submission;
  }

  // Instructor grading panel submission handler
  gradeSubmission(
    submissionId: string,
    gradeData: {
      marks: number;
      feedback: string;
      rubricScores?: RubricScores;
      status: 'Graded' | 'Resubmission Required';
    },
    instructorName: string
  ): AssignmentSubmission | null {
    const list = this.getAllSubmissions();
    const idx = list.findIndex((sub) => sub.id === submissionId);
    if (idx < 0) return null;

    const prev = list[idx];
    const nowIso = new Date().toISOString();
    const history = [...prev.history];

    history.push({
      status: 'Reviewed',
      timestamp: nowIso,
      user: instructorName,
    });

    history.push({
      status: gradeData.status,
      timestamp: nowIso,
      user: instructorName,
      comment: gradeData.feedback,
    });

    const updated: AssignmentSubmission = {
      ...prev,
      status: gradeData.status,
      marksObtained: gradeData.status === 'Graded' ? gradeData.marks : undefined,
      feedback: gradeData.feedback,
      rubricScores: gradeData.rubricScores,
      gradedAt: nowIso,
      history,
    };

    list[idx] = updated;
    this.saveAllSubmissions(list);

    this.addNotification(
      prev.studentId,
      prev.assignmentId,
      prev.assignmentTitle,
      gradeData.status === 'Graded' ? 'graded' : 'returned',
      gradeData.status === 'Graded'
        ? `Your assignment "${prev.assignmentTitle}" has been graded: ${gradeData.marks}/${prev.marksMax}.`
        : `Your assignment "${prev.assignmentTitle}" requires resubmission.`
    );

    return updated;
  }

  // Get notifications
  getNotifications(studentId: string): AssignmentNotification[] {
    const data = localStorage.getItem(this.notificationsKey);
    if (data) {
      try {
        const list: AssignmentNotification[] = JSON.parse(data);
        return list.filter((n) => n.studentId === studentId);
      } catch (e) {}
    }
    return [];
  }

  // Add notification
  private addNotification(
    studentId: string,
    assignmentId: string,
    assignmentTitle: string,
    type: 'draft_saved' | 'submitted' | 'returned' | 'graded',
    message: string
  ): void {
    let list: AssignmentNotification[] = [];
    const data = localStorage.getItem(this.notificationsKey);
    if (data) {
      try {
        list = JSON.parse(data);
      } catch (e) {}
    }

    const newNotif: AssignmentNotification = {
      id: `notif_${Date.now()}`,
      assignmentId,
      assignmentTitle,
      studentId,
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };

    list = [newNotif, ...list];
    localStorage.setItem(this.notificationsKey, JSON.stringify(list));
  }

  // Mark all notifications as read
  markNotificationsAsRead(studentId: string): void {
    let list: AssignmentNotification[] = [];
    const data = localStorage.getItem(this.notificationsKey);
    if (data) {
      try {
        list = JSON.parse(data);
      } catch (e) {}
    }

    const updated = list.map((n) => (n.studentId === studentId ? { ...n, read: true } : n));
    localStorage.setItem(this.notificationsKey, JSON.stringify(updated));
  }
}

export const assignmentService = new AssignmentService();
