import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import { liveClassroomService } from '../modules/liveClassroom/liveClassroom.service';
import logger from '../config/logger';

interface PollItem {
  id: string;
  liveClassId: string;
  question: string;
  options: { id: string; optionIndex: number; text: string; votes: number }[];
  status: 'ACTIVE' | 'ENDED';
  durationSeconds: number;
  createdAt: string;
  createdBy: string;
  votedUserIds: Set<string>;
}

// In-memory active polls: liveClassId -> PollItem
const activePollsMap = new Map<string, PollItem>();

export const registerPollHandlers = (io: SocketServer, socket: AuthenticatedSocket) => {
  // Common Poll Create Function
  const createPoll = (
    liveClassId: string,
    question: string,
    options: string[],
    durationSeconds: number = 60,
    callback?: (res: any) => void
  ) => {
    try {
      const user = socket.user;
      if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
        const err = { success: false, error: 'INVALID_PERMISSION', message: 'Only instructors can create polls' };
        socket.emit('poll:error', err);
        if (callback) callback(err);
        return;
      }

      if (!liveClassId || !question || !Array.isArray(options) || options.length < 2) {
        const err = { success: false, error: 'INVALID_PAYLOAD', message: 'Poll must have at least 2 options' };
        socket.emit('poll:error', err);
        if (callback) callback(err);
        return;
      }

      const pollId = `poll_${Date.now()}`;
      const newPoll: PollItem = {
        id: pollId,
        liveClassId,
        question: question.trim(),
        options: options.map((opt, idx) => ({ id: `opt_${idx}`, optionIndex: idx, text: opt.trim(), votes: 0 })),
        status: 'ACTIVE',
        durationSeconds,
        createdAt: new Date().toISOString(),
        createdBy: user.name || 'Instructor',
        votedUserIds: new Set<string>(),
      };

      activePollsMap.set(liveClassId, newPoll);

      // Persist poll in repository non-blockingly
      liveClassroomService.createPoll({
        classId: liveClassId,
        title: question.trim(),
        options: options.map((opt) => ({ text: opt.trim(), votesCount: 0, voters: [] })),
        status: 'open',
        createdBy: user.name || 'Instructor',
        createdAt: new Date().toISOString(),
      }).catch((e: any) => logger.warn('[SOCKET POLL] DB save notice:', e?.message));

      const roomName = `live-class:${liveClassId}`;
      logger.info(`[POLL] Created poll ${pollId} in ${roomName}`);

      const pollPayload = {
        id: newPoll.id,
        _id: newPoll.id,
        classId: newPoll.liveClassId,
        liveClassId: newPoll.liveClassId,
        question: newPoll.question,
        options: newPoll.options.map((o) => ({ id: o.id, optionIndex: o.optionIndex, text: o.text, votes: 0 })),
        durationSeconds: newPoll.durationSeconds,
        status: 'ACTIVE',
        createdAt: newPoll.createdAt,
      };

      // Broadcast to both modern & legacy listeners
      io.to(roomName).emit('poll:start', pollPayload);
      io.to(roomName).emit('poll_published', {
        id: newPoll.id,
        classId: newPoll.liveClassId,
        question: newPoll.question,
        options: options.map((opt) => opt.trim()),
      });

      if (callback) callback({ success: true, pollId });
    } catch (err: any) {
      if (callback) callback({ success: false, error: err.message });
    }
  };

  // Common Poll Vote Function
  const recordVote = (
    liveClassId: string,
    pollId: string,
    optionIdentifier: string | number,
    callback?: (res: any) => void
  ) => {
    try {
      const user = socket.user;
      if (!user || !liveClassId) {
        const err = { success: false, error: 'UNAUTHORIZED_SOCKET' };
        socket.emit('poll:error', err);
        if (callback) callback(err);
        return;
      }

      const activePoll = activePollsMap.get(liveClassId);
      if (!activePoll || activePoll.status !== 'ACTIVE') {
        const err = { success: false, error: 'POLL_NOT_ACTIVE', message: 'Poll has ended or does not exist' };
        socket.emit('poll:error', err);
        if (callback) callback(err);
        return;
      }

      const userId = user.uid || user.id;
      if (activePoll.votedUserIds.has(userId)) {
        const err = { success: false, error: 'ALREADY_VOTED', message: 'You have already submitted a vote for this poll' };
        socket.emit('poll:error', err);
        if (callback) callback(err);
        return;
      }

      let targetOption = activePoll.options.find(
        (opt) =>
          opt.id === optionIdentifier ||
          opt.optionIndex === optionIdentifier ||
          (typeof optionIdentifier === 'string' && opt.text.toLowerCase() === optionIdentifier.toLowerCase())
      );

      if (!targetOption && typeof optionIdentifier === 'number' && activePoll.options[optionIdentifier]) {
        targetOption = activePoll.options[optionIdentifier];
      }

      if (!targetOption) {
        const err = { success: false, error: 'INVALID_OPTION', message: 'Selected option not found' };
        socket.emit('poll:error', err);
        if (callback) callback(err);
        return;
      }

      // Record vote server-side
      targetOption.votes += 1;
      activePoll.votedUserIds.add(userId);

      const totalVotes = activePoll.options.reduce((acc, curr) => acc + curr.votes, 0);
      const roomName = `live-class:${liveClassId}`;

      // Broadcast to both modern & legacy format listeners
      io.to(roomName).emit('poll:update', {
        pollId: activePoll.id,
        liveClassId,
        options: activePoll.options,
        totalVotes,
      });

      // Format for LivePollWidget (Array of PollOption)
      const widgetFormat = activePoll.options.map((opt) => ({
        optionIndex: opt.optionIndex,
        optionText: opt.text,
        votesCount: opt.votes,
      }));
      io.to(roomName).emit('poll_update', widgetFormat);

      if (callback) callback({ success: true, totalVotes });
    } catch (err: any) {
      if (callback) callback({ success: false, error: err.message });
    }
  };

  // 1. Modern Poll Create
  socket.on(
    'poll:create',
    (
      data: {
        liveClassId: string;
        question: string;
        options: string[];
        durationSeconds?: number;
      },
      callback?: (res: any) => void
    ) => {
      createPoll(data?.liveClassId, data?.question, data?.options, data?.durationSeconds, callback);
    }
  );

  // 2. Legacy Poll Publish Alias
  socket.on(
    'publish_poll',
    (data: { classId?: string; liveClassId?: string; question: string; options: string[] }, callback?: (res: any) => void) => {
      const classId = data.liveClassId || data.classId || '';
      createPoll(classId, data?.question, data?.options, 60, callback);
    }
  );

  // 3. Modern Poll Vote
  socket.on(
    'poll:vote',
    (
      data: { liveClassId: string; pollId: string; optionId: string },
      callback?: (res: any) => void
    ) => {
      recordVote(data?.liveClassId, data?.pollId, data?.optionId, callback);
    }
  );

  // 4. Legacy Poll Vote Alias
  socket.on(
    'submit_vote',
    (data: { classId?: string; liveClassId?: string; pollId?: string; optionIndex?: number; optionId?: string }, callback?: (res: any) => void) => {
      const classId = data.liveClassId || data.classId || '';
      const activePoll = activePollsMap.get(classId);
      const pollId = data.pollId || (activePoll ? activePoll.id : '');
      const opt = data.optionId !== undefined ? data.optionId : (data.optionIndex !== undefined ? data.optionIndex : 0);
      recordVote(classId, pollId, opt, callback);
    }
  );

  // 5. End Poll
  socket.on(
    'poll:end',
    (data: { liveClassId?: string; classId?: string; pollId?: string }, callback?: (res: any) => void) => {
      try {
        const user = socket.user;
        if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
          if (callback) callback({ success: false, error: 'INVALID_PERMISSION' });
          return;
        }

        const classId = data.liveClassId || data.classId || '';
        const activePoll = activePollsMap.get(classId);
        if (activePoll) {
          activePoll.status = 'ENDED';
          const roomName = `live-class:${classId}`;
          const totalVotes = activePoll.options.reduce((acc, curr) => acc + curr.votes, 0);

          io.to(roomName).emit('poll:end', {
            pollId: activePoll.id,
            liveClassId: classId,
            options: activePoll.options,
            totalVotes,
          });
        }

        if (callback) callback({ success: true });
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );
};
