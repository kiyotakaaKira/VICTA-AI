/**
 * Socket.IO realtime layer — broadcasts forensic intelligence to all dashboard clients.
 */

const { Server } = require('socket.io');
const logger = require('../utils/logger');

let io = null;

function attach(httpServer) {
  const origins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: origins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info(`[Socket.IO] Client connected: ${socket.id}`);
    socket.emit('CONNECTED', {
      clientId: socket.id,
      message: 'Forensic intelligence channel active. Operational telemetry subscribed.',
    });

    socket.on('PING', () => {
      socket.emit('PONG', { timestamp: new Date().toISOString() });
    });

    socket.on('disconnect', (reason) => {
      logger.debug(`[Socket.IO] Disconnected ${socket.id}: ${reason}`);
    });
  });

  logger.info('[Socket.IO] Server attached.');
  return io;
}

function getIO() {
  return io;
}

/**
 * Broadcast to all connected dashboards (namespace /).
 */
function broadcast(event, data) {
  if (!io) {
    logger.debug(`[Socket.IO] skip broadcast (no io): ${event}`);
    return;
  }
  const payload = {
    ...data,
    timestamp: new Date().toISOString(),
  };
  io.emit(event, payload);
  logger.debug(`[Socket.IO] emit ${event}`);
}

function close() {
  if (io) {
    io.close();
    io = null;
  }
}

module.exports = {
  attach,
  getIO,
  broadcast,
  close,
};
