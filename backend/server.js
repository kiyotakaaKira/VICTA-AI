/**
 * server.js
 * Entry point for the Forensic AI Platform Express server.
 */

require('dotenv').config();

// Validate env before anything else
const { validateEnv } = require('./config/env');
validateEnv();

const http = require('http');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const corsMiddleware = require('./middleware/cors');
const { requestLogger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes/index');
const realtimeService = require('./services/realtimeService');
const { startTelemetryPulse, stopTelemetryPulse } = require('./services/telemetryPulse');
const { autoSchemaSync } = require('./scripts/autoSchemaSync');
const { seedIfEmpty } = require('./services/syntheticDataEngine');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

// ─────────────────────────────────────────
// SECURITY & PARSING MIDDLEWARE
// ─────────────────────────────────────────

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Local uploads (when Firebase disabled)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─────────────────────────────────────────
// REQUEST LOGGING
// ─────────────────────────────────────────

app.use(requestLogger);

// ─────────────────────────────────────────
// RATE LIMITING
// ─────────────────────────────────────────

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Increased for high-density forensic sessions
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Tactical baseline saturated. Please wait.' } },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Higher limit for AI chat
  message: { success: false, error: { code: 'AI_RATE_LIMITED', message: 'AI analysis rate limit reached. Please wait.' } },
});

app.use('/api', limiter);
app.use('/api/ai', aiLimiter);
app.use('/api/analysis', aiLimiter);

// ─────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────

app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Cannot ${req.method} ${req.path}` },
  });
});

// ─────────────────────────────────────────
// GLOBAL ERROR HANDLER (must be last)
// ─────────────────────────────────────────

app.use(errorHandler);

// ─────────────────────────────────────────
// SOCKET.IO (realtime intelligence bus)
// ─────────────────────────────────────────

realtimeService.attach(server);

// ─────────────────────────────────────────
// START
// ─────────────────────────────────────────

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  logger.info(`🚀 Forensic AI Platform API running on port ${PORT}`);
  logger.info(`📡 Socket.IO active (path /socket.io)`);
  logger.info(`🔍 Health check: http://localhost:${PORT}/api/health`);
  
  // 1. Permanent Schema Self-Healing
  await autoSchemaSync();
  
  // 2. Start Realtime Pulses
  startTelemetryPulse();
  
  // 3. Auto-seed database with synthetic forensic data if empty
  seedIfEmpty().catch(err => logger.warn('[Server] Seed skipped', { msg: err.message }));
});

// ─────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────

const shutdown = (signal) => {
  logger.info(`[Server] Received ${signal}. Graceful shutdown...`);
  stopTelemetryPulse();
  realtimeService.close();
  server.close(() => {
    logger.info('[Server] HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('[Server] Force exit after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = { app, server };
