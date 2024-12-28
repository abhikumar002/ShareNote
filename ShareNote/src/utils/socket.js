import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Your server's URL
export { socket };
