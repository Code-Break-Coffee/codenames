import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => console.log('🔌 Socket connected:', socket.id));
socket.on('connect_error', (err) => console.error('❌ Socket connect error:', err));
socket.on('disconnect', (reason) => console.log('🔌 Socket disconnected:', reason));

export default socket;
