/**
 * routes/timeline.js
 */

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { getTimeline, createTimelineEvent } = require('../controllers/timelineController');

const router = Router();
router.use(requireAuth);

router.get('/case/:caseId', getTimeline);
router.post('/', createTimelineEvent);

module.exports = router;
