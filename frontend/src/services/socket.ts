import { Socket } from 'socket.io-client';
import { socketService } from './socketService';

export const getLiveClassroomSocket = (token?: string, userInfo?: { uid?: string; name?: string; role?: string; email?: string }): Socket => {
  return socketService.connect(token, userInfo);
};

export { socketService };
