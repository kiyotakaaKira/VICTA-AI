/**
 * utils/errorCodes.js
 * Shared error constants across the application.
 */

const ERROR_CODES = {
  // Auth
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401, message: 'Authentication required.' },
  FORBIDDEN: { code: 'FORBIDDEN', status: 403, message: 'Insufficient permissions.' },

  // Validation
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', status: 400, message: 'Invalid request data.' },
  MISSING_FIELDS: { code: 'MISSING_FIELDS', status: 400, message: 'Required fields are missing.' },

  // Resources
  NOT_FOUND: { code: 'NOT_FOUND', status: 404, message: 'Resource not found.' },
  ALREADY_EXISTS: { code: 'ALREADY_EXISTS', status: 409, message: 'Resource already exists.' },

  // AI
  AI_PROCESSING_ERROR: { code: 'AI_PROCESSING_ERROR', status: 500, message: 'AI analysis failed.' },
  AI_PARSE_ERROR: { code: 'AI_PARSE_ERROR', status: 500, message: 'Failed to parse AI response.' },

  // Storage
  UPLOAD_ERROR: { code: 'UPLOAD_ERROR', status: 500, message: 'File upload failed.' },

  // Database
  DB_ERROR: { code: 'DB_ERROR', status: 500, message: 'Database operation failed.' },

  // General
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500, message: 'An unexpected error occurred.' },
};

module.exports = ERROR_CODES;
