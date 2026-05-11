/**
 * utils/helpers.js
 * Shared utility functions used across the backend.
 */

/**
 * Wraps an async route handler to catch errors and forward them to Express error middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Sends a standardized success response.
 */
const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Sends a standardized error response.
 */
const sendError = (res, message, statusCode = 500, code = 'ERROR') => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Sanitizes pagination params from query string.
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Parses a JSON string safely, returning fallback on failure.
 */
const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

/**
 * Strips markdown code fences from AI responses before JSON parsing.
 */
const stripMarkdownJson = (text) => {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
};

module.exports = {
  asyncHandler,
  sendSuccess,
  sendError,
  getPagination,
  safeJsonParse,
  stripMarkdownJson,
};
