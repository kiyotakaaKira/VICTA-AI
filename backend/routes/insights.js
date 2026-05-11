/**
 * routes/insights.js
 */

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { getInsights, createInsight } = require('../controllers/insightController');

const router = Router();
router.use(requireAuth);

router.get('/case/:caseId', getInsights);
router.post('/', createInsight);

module.exports = router;
