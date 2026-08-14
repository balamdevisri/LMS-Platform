import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket } from './socket.auth';
import logger from '../config/logger';

interface PollItem {
  id: string;
  liveClassId: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  status: 'ACTIVE' | 'ENDED';
  durationSeconds: number;
  createdAt: string;
  createdBy: string;
  votedUserIds: Set<string>;
}

// In-memory active polls: liveClassId -> PollItem
const activePollsMap = new Map<string, PollItem>();

export const registerPollHandlers = (io: SocketServer, socket: AuthenticatedSocket) => {
  // 1. Create & Start Poll (Instructor / Admin only)
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
      try {
        const user = socket.user;
        if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
          const err = { success: false, error: 'INVALID_PERMISSION', message: 'Only instructors can create polls' };
          socket.emit('poll:error', err);
          if (callback) callback(err);
          return;
        }

        const { liveClassId, question, options, durationSeconds = 60 } = data;
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
          options: options.map((opt, idx) => ({ id: `opt_${idx}`, text: opt.trim(), votes: 0 })),
          status: 'ACTIVE',
          durationSeconds,
          createdAt: new Date().toISOString(),
          createdBy: user.name || 'Instructor',
          votedUserIds: new Set<string>(),
        };

        activePollsMap.set(liveClassId, newPoll);

        const roomName = `live-class:${liveClassId}`;
        logger.info(`[POLL] Created poll ${pollId} in ${roomName}`);

        // Broadcast to entire room
        io.to(roomName).emit('poll:start', {
          id: newPoll.id,
          liveClassId: newPoll.liveClassId,
          question: newPoll.question,
          options: newPoll.options.map((o) => ({ id: o.id, text: o.text, votes: 0 })),
          durationSeconds: newPoll.durationSeconds,
          status: 'ACTIVE',
          createdAt: newPoll.createdAt,
        });

        if (callback) callback({ success: true, pollId });
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );

  // 2. Student Votes on Poll
  socket.on(
    'poll:vote',
    (
      data: { liveClassId: string; pollId: string; optionId: string },
      callback?: (res: any) => void
    ) => {
      try {
        const user = socket.user;
        const liveClassId = data?.liveClassId;

        if (!user || !liveClassId) {
          const err = { success: false, error: 'UNAUTHORIZED_SOCKET' };
          socket.emit('poll:error', err);
          if (callback) callback(err);
          return;
        }

        const activePoll = activePollsMap.get(liveClassId);
        if (!activePoll || activePoll.id !== data.pollId || activePoll.status !== 'ACTIVE') {
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

        const targetOption = activePoll.options.find((opt) => opt.id === data.optionId);
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

        // Broadcast updated tally to the room
        io.to(roomName).emit('poll:update', {
          pollId: activePoll.id,
          liveClassId,
          options: activePoll.options,
          totalVotes,
        });

        if (callback) callback({ success: true });
      } catch (err: any) {
        if (callback) callback({ success: false, error: err.message });
      }
    }
  );

  // 3. End Poll (Instructor / Admin only)
  socket.on(
    'poll:end',
    (data: { liveClassId: string; pollId: string }, callback?: (res: any) => void) => {
      try {
        const user = socket.user;
        if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
          if (callback) callback({ success: false, error: 'INVALID_PERMISSION' });
          return;
        }

        const { liveClassId } = data;
        const activePoll = activePollsMap.get(liveClassId);
        if (activePoll) {
          activePoll.status = 'ENDED';
          const roomName = `live-class:${liveClassId}`;
          const totalVotes = activePoll.options.reduce((acc, curr) => acc + curr.votes, 0);

          io.to(roomName).emit('poll:end', {
            pollId: activePoll.id,
            liveClassId,
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
