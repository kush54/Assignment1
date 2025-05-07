// src/Socket.js
import { io } from 'socket.io-client';

// Using environment variable for socket server URL
const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'); // Default to localhost if not set
export default socket;
