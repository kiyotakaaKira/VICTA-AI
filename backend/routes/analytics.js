const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { getAnalyticsOverview } = require('../controllers/analyticsController');

const router = Router();

router.use(requireAuth);
router.get('/overview', getAnalyticsOverview);

module.exports = router;
