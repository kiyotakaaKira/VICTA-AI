/**
 * routes/health.js — live dependency probes
 */

const { Router } = require('express');
const db = require('../services/supabaseService');

const router = Router();

router.get('/', async (req, res) => {
  let database = 'unknown';
  try {
    database = (await db.healthCheck()) ? 'connected' : 'unreachable';
  } catch {
    database = 'error';
  }

  const ok = database === 'connected';
  res.status(ok ? 200 : 503).json({
    status: ok ? 'OK' : 'DEGRADED',
    database,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

module.exports = router;
