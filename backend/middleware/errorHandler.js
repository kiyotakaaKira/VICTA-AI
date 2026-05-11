/**
 * middleware/errorHandler.js
 * Global Express error handler — catches all errors passed via next(err).
 */

const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  logger.error(`[${req.method}] ${req.path} → ${statusCode}: ${message}`, {
    stack: err.stack,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      statusCode,
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;
