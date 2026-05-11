/**
 * Live operational dashboard API
 */

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  getPlatformStats,
  getCharts,
  getTelemetrySeries,
  getRecentInsights,
  getIntelligenceFeed,
} = require('../controllers/dashboardController');

const router = Router();
router.use(requireAuth);

router.get('/stats', getPlatformStats);
router.get('/charts', getCharts);
router.get('/telemetry', getTelemetrySeries);
router.get('/insights', getRecentInsights);
router.get('/intelligence-feed', getIntelligenceFeed);

module.exports = router;
