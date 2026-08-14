import { io, Socket } from 'socket.io-client';

const getSocketUrl = (): string => {
  const envUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/api\/?$/, '');
  }
  return 'http://localhost:5000';
};

class SocketService {
  private socket: Socket | null = null;
  private currentLiveClassId: string | null = null;

  public getSocket(): Socket | null {
    return this.socket;
  }

  public connect(token?: string, userInfo?: { uid?: string; name?: string; role?: string; email?: string }): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    const socketUrl = `${getSocketUrl()}/live-classroom`;
    this.socket = io(socketUrl, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      auth: {
        token: token || localStorage.getItem('token') || localStorage.getItem('shaivika_auth_token') || '',
        userId: userInfo?.uid || 'student_guest',
        name: userInfo?.name || 'Student',
        role: userInfo?.role || 'student',
        email: userInfo?.email || '',
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      if (this.currentLiveClassId) {
        this.leaveLiveClass(this.currentLiveClassId);
      }
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public joinLiveClass(liveClassId: string, name?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error('Socket not initialized. Please connect first.'));
      }
      this.currentLiveClassId = liveClassId;
      this.socket.emit('liveClass:join', { liveClassId, name }, (response: any) => {
        if (response && response.error) {
          reject(response);
        } else {
          resolve(response);
        }
      });
      // Fallback join attendance
      this.socket.emit('attendance:join', { liveClassId });
    });
  }

  public leaveLiveClass(liveClassId: string): void {
    if (this.socket) {
      this.socket.emit('attendance:leave', { liveClassId });
      this.socket.emit('liveClass:leave', { liveClassId });
      if (this.currentLiveClassId === liveClassId) {
        this.currentLiveClassId = null;
      }
    }
  }

  // --- Chat ---
  public sendChat(liveClassId: string, message: string, messageType: 'normal' | 'announcement' = 'normal', replyToId?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('chat:send', { liveClassId, message, messageType, replyToId }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  public deleteChat(liveClassId: string, messageId: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('chat:delete', { liveClassId, messageId }, resolve);
    });
  }

  public moderateChat(liveClassId: string, messageId: string, action: 'pin' | 'unpin' | 'hide'): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('chat:moderate', { liveClassId, messageId, action }, resolve);
    });
  }

  // --- Q&A ---
  public askQuestion(liveClassId: string, question: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('qna:ask', { liveClassId, question }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  public answerQuestion(liveClassId: string, questionId: string, answer: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('qna:answer', { liveClassId, questionId, answer }, resolve);
    });
  }

  public resolveQuestion(liveClassId: string, questionId: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('qna:resolve', { liveClassId, questionId }, resolve);
    });
  }

  // --- Raise Hand ---
  public raiseHand(liveClassId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('hand:raise', { liveClassId }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  public lowerHand(liveClassId: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('hand:lower', { liveClassId }, resolve);
    });
  }

  public acknowledgeHand(liveClassId: string, studentId: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('hand:acknowledge', { liveClassId, studentId }, resolve);
    });
  }

  // --- Announcements ---
  public sendAnnouncement(liveClassId: string, message: string, priority: 'normal' | 'urgent' = 'normal'): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('announcement:send', { liveClassId, message, priority }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  // --- Live Polls ---
  public createPoll(liveClassId: string, question: string, options: string[], durationSeconds: number = 60): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('poll:create', { liveClassId, question, options, durationSeconds }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  public votePoll(liveClassId: string, pollId: string, optionId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('poll:vote', { liveClassId, pollId, optionId }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  public endPoll(liveClassId: string, pollId: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('poll:end', { liveClassId, pollId }, resolve);
    });
  }

  // --- Live Quizzes ---
  public startQuiz(
    liveClassId: string,
    question: string,
    options: string[],
    correctAnswer: string,
    marks: number = 10,
    timerSeconds: number = 30,
    title: string = 'Live Concept Check'
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('quiz:start', { liveClassId, title, question, options, correctAnswer, marks, timerSeconds }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  public submitQuizAnswer(liveClassId: string, quizId: string, answer: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));
      this.socket.emit('quiz:submit', { liveClassId, quizId, answer }, (res: any) => {
        if (res && res.error) reject(res);
        else resolve(res);
      });
    });
  }

  public endQuiz(liveClassId: string, quizId: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false });
      this.socket.emit('quiz:end', { liveClassId, quizId }, resolve);
    });
  }

  // --- Live Status ---
  public updateLiveClassStatus(liveClassId: string, status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'): void {
    if (this.socket) {
      this.socket.emit('liveClass:status', { liveClassId, status });
    }
  }
}

export const socketService = new SocketService();
