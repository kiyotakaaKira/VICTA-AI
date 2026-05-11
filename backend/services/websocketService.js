/**
 * Legacy broadcast facade — all traffic routes through Socket.IO (realtimeService).
 */

const realtime = require('./realtimeService');
const logger = require('../utils/logger');

const broadcast = (event, data) => realtime.broadcast(event, data);

const sendToClient = () => {
  logger.debug('[WS] sendToClient deprecated under Socket.IO fan-out');
};

/** @deprecated raw WS removed; use Socket.IO */
const handleConnection = () => {};

/** @deprecated — use telemetryPulse */
const startIntelligenceStream = () => {
  logger.warn('[WS] startIntelligenceStream is deprecated; telemetryPulse handles pulses.');
};

module.exports = {
  broadcast,
  sendToClient,
  handleConnection,
  clients: new Map(),
  startIntelligenceStream,
};
