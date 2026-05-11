/**
 * routes/graph.js
 */

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { getGraph } = require('../controllers/graphController');

const router = Router();
router.use(requireAuth);

router.get('/case/:caseId', getGraph);

module.exports = router;
