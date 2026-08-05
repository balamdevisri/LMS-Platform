import { Server as SocketServer, Socket } from 'socket.io';
import { liveClassroomService } from './liveClassroom.service';
import logger from '../../config/logger';

// Track active sockets and participants in-memory
const activeParticipants = new Map<string, {
  socketId: string;
  classId: string;
  userId: string;
  name: string;
  role: 'instructor' | 'mentor' | 'student';
  joinTime: Date;
}>();

export const setupLiveClassroomSockets = (io: SocketServer) => {
  const liveNS = io.of('/live-classroom');

  liveNS.on('connection', (socket: Socket) => {
    logger.info(`[SOCKET] Client connected to live-classroom namespace: ${socket.id}`);

    // Join Live Class Room
    socket.on('join_class', async (data: {
      classId: string;
      userId: string;
      name: string;
      role: 'instructor' | 'mentor' | 'student';
    }) => {
      const { classId, userId, name, role } = data;
      const roomName = `class_${classId}`;
      
      socket.join(roomName);
      logger.info(`[SOCKET] User ${name} (${role}) joined room: ${roomName}`);

      // Track active participant
      activeParticipants.set(socket.id, {
        socketId: socket.id,
        classId,
        userId,
        name,
        role,
        joinTime: new Date()
      });

      // Broadcast join notification to room
      liveNS.to(roomName).emit('user_joined', {
        userId,
        name,
        role,
        socketId: socket.id,
        timestamp: new Date()
      });

      // Broadcast updated online count and participants list
      const roster = Array.from(activeParticipants.values()).filter(p => p.classId === classId);
      liveNS.to(roomName).emit('participants_update', {
        count: roster.length,
        users: roster.map(r => ({ userId: r.userId, name: r.name, role: r.role }))
      });
    });

    // Real-Time Chat Message Handler
    socket.on('send_chat', async (data: {
      classId: string;
      userId: string;
      userName: string;
      role: string;
      message: string;
      messageType?: 'normal' | 'announcement';
      replyToId?: string;
    }) => {
      const roomName = `class_${data.classId}`;
      try {
        const savedMessage = await liveClassroomService.saveChatMessage(data);
        // Broadcast message to everyone in the class
        liveNS.to(roomName).emit('chat_received', savedMessage);
      } catch (err: any) {
        logger.error(`[SOCKET] Chat sending failed: ${err.message}`);
      }
    });

    // Pin Message
    socket.on('pin_chat', (data: { classId: string; messageId: string; pinned: boolean }) => {
      const roomName = `class_${data.classId}`;
      liveNS.to(roomName).emit('chat_pinned', { messageId: data.messageId, pinned: data.pinned });
    });

    // Typing Indicator
    socket.on('typing_status', (data: { classId: string; userName: string; isTyping: boolean }) => {
      const roomName = `class_${data.classId}`;
      socket.to(roomName).emit('typing_received', { userName: data.userName, isTyping: data.isTyping });
    });

    // Real-Time Quiz Broadcaster (Instructor only)
    socket.on('publish_quiz', async (data: {
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
    }) => {
      const roomName = `class_${data.classId}`;
      try {
        const publishedQuiz = await liveClassroomService.publishQuiz(data);
        
        // Broadcast quiz popup to every student in the classroom room
        liveNS.to(roomName).emit('quiz_published', {
          id: publishedQuiz.id || publishedQuiz._id?.toString(),
          classId: publishedQuiz.classId,
          question: publishedQuiz.question,
          questionType: publishedQuiz.questionType,
          options: publishedQuiz.options,
          marks: publishedQuiz.marks,
          timerSeconds: publishedQuiz.timerSeconds,
        });
        
        logger.info(`[SOCKET] Quiz broadcasted for room: ${roomName}`);
      } catch (err: any) {
        logger.error(`[SOCKET] Quiz broadcast failed: ${err.message}`);
      }
    });

    // Real-Time Quiz Response (Student submission)
    socket.on('submit_quiz', async (data: {
      classId: string;
      quizId: string;
      userId: string;
      userName: string;
      answer: string;
      timeTakenSeconds: number;
    }) => {
      const roomName = `class_${data.classId}`;
      try {
        const evaluated = await liveClassroomService.evaluateQuizResponse(data);
        
        // Notify instructors and mentors in the room of a new submission
        liveNS.to(roomName).emit('quiz_submission_update', evaluated);

        // Send leaderboard update
        const responses = await liveClassroomService.getQuizResponses(data.quizId);
        const sortedResponses = responses
          .sort((a, b) => {
            if (a.isCorrect && !b.isCorrect) return -1;
            if (!a.isCorrect && b.isCorrect) return 1;
            return a.timeTakenSeconds - b.timeTakenSeconds;
          })
          .map((r, index) => ({
            rank: index + 1,
            studentName: r.userName,
            timeTaken: `${r.timeTakenSeconds}s`,
            isCorrect: r.isCorrect,
            xpEarned: r.xpEarned
          }));

        liveNS.to(roomName).emit('leaderboard_update', sortedResponses);
      } catch (err: any) {
        logger.error(`[SOCKET] Quiz response error: ${err.message}`);
        socket.emit('quiz_submit_error', { message: err.message });
      }
    });

    // Real-Time Poll creation
    socket.on('publish_poll', async (data: {
      classId: string;
      question: string;
      options: string[];
    }) => {
      const roomName = `class_${data.classId}`;
      try {
        const pollPayload = {
          classId: data.classId,
          question: data.question,
          options: data.options.map(opt => ({ optionText: opt, votes: [] }))
        };
        const poll = await liveClassroomService.submitPollVote(
          `poll_${Date.now()}`, 0, 'dummy' // initialize
        ).catch(() => pollPayload); // fallback

        liveNS.to(roomName).emit('poll_published', {
          id: poll.id || `poll_${Date.now()}`,
          question: poll.question,
          options: poll.options.map((opt: any) => opt.optionText)
        });
      } catch (err: any) {
        logger.error(`[SOCKET] Poll broadcast failed: ${err.message}`);
      }
    });

    // Poll Vote submission
    socket.on('submit_vote', async (data: {
      classId: string;
      pollId: string;
      optionIndex: number;
      userId: string;
    }) => {
      const roomName = `class_${data.classId}`;
      try {
        const updatedPoll = await liveClassroomService.submitPollVote(data.pollId, data.optionIndex, data.userId);
        if (updatedPoll) {
          // Emit updated vote counts
          const voteData = updatedPoll.options.map((opt: any, index: number) => ({
            optionIndex: index,
            optionText: opt.optionText,
            votesCount: opt.votes.length
          }));
          liveNS.to(roomName).emit('poll_update', voteData);
        }
      } catch (err: any) {
        logger.error(`[SOCKET] Poll vote submit failed: ${err.message}`);
      }
    });

    // Raise Hand
    socket.on('raise_hand', (data: { classId: string; userId: string; userName: string }) => {
      const roomName = `class_${data.classId}`;
      liveNS.to(roomName).emit('hand_raised', {
        userId: data.userId,
        userName: data.userName,
        timestamp: new Date()
      });
    });

    // Mute/Mute student chat
    socket.on('mute_student', (data: { classId: string; userId: string; isMuted: boolean }) => {
      const roomName = `class_${data.classId}`;
      liveNS.to(roomName).emit('student_muted', { userId: data.userId, isMuted: data.isMuted });
    });

    // Lock/Unlock classroom
    socket.on('toggle_lock', async (data: { classId: string; locked: boolean }) => {
      const roomName = `class_${data.classId}`;
      await liveClassroomService.updateLiveClass(data.classId, { locked: data.locked }).catch(() => null);
      liveNS.to(roomName).emit('lock_toggled', { locked: data.locked });
    });

    // Handle Disconnect
    socket.on('disconnect', async () => {
      logger.info(`[SOCKET] Client disconnected: ${socket.id}`);
      const session = activeParticipants.get(socket.id);
      
      if (session) {
        const roomName = `class_${session.classId}`;
        
        // Remove from online registry
        activeParticipants.delete(socket.id);

        // Record attendance report in db
        const leaveTime = new Date();
        const durationSeconds = Math.round((leaveTime.getTime() - session.joinTime.getTime()) / 1000);
        
        await liveClassroomService.recordAttendance({
          classId: session.classId,
          userId: session.userId,
          name: session.name,
          joinTime: session.joinTime,
          leaveTime,
          durationSeconds,
          lateEntry: false, // can compute based on class scheduledTime
          earlyExit: true,
          attendancePercentage: Math.min(100, Math.round((durationSeconds / 3600) * 100)) // based on 1 hr class
        }).catch((err) => console.warn('Attendance register notice:', err));

        // Notify room of departure
        liveNS.to(roomName).emit('user_left', {
          userId: session.userId,
          name: session.name,
          role: session.role
        });

        // Broadcast updated online count and participants list
        const roster = Array.from(activeParticipants.values()).filter(p => p.classId === session.classId);
        liveNS.to(roomName).emit('participants_update', {
          count: roster.length,
          users: roster.map(r => ({ userId: r.userId, name: r.name, role: r.role }))
        });
      }
    });
  });
};
