/**
 * middleware/cors.js
 * CORS configuration for the Forensic AI Platform API.
 */

const cors = require('cors');

const corsOptions = {
  origin: '*', // Open for hackathon — restrict in production
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page'],
};

module.exports = cors(corsOptions);
