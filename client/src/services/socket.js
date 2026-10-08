import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io('/', {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('⚡ [HostelSOS WebSocket] Connected with socket ID:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('⚡ [HostelSOS WebSocket] Disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('hostelsos_access_token');
    socket = initSocket(token);
  }
  return socket;
};
