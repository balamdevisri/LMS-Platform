import { io, Socket } from 'socket.io-client';

const getSocketUrl = (): string => {
  const envUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Remove /api suffix if present in BACKEND/API URLs
    return envUrl.replace(/\/api\/?$/, '');
  }
  return 'http://localhost:5000';
};

export const getLiveClassroomSocket = (): Socket => {
  return io(`${getSocketUrl()}/live-classroom`, {
    autoConnect: false,
    transports: ['websocket', 'polling'],
  });
};
