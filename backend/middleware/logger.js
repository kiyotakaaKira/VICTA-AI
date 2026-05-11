/**
 * middleware/logger.js
 * Winston-based HTTP request logger middleware.
 * Logs method, path, status, and response time for every request.
 */

const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;

    const color =
      statusCode >= 500
        ? '\x1b[31m' // red
        : statusCode >= 400
        ? '\x1b[33m' // yellow
        : '\x1b[32m'; // green

    logger.info(
      `${color}${method}\x1b[0m ${originalUrl} ${color}${statusCode}\x1b[0m ${duration}ms — ${ip}`
    );
  });

  next();
};

module.exports = { requestLogger };
