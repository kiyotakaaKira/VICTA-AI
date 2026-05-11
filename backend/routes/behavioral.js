const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { analyzeBehavioral, getBehavioralPatterns } = require('../controllers/behavioralController');

const router = Router();

router.use(requireAuth);
router.get('/', getBehavioralPatterns);
router.post('/analyze', analyzeBehavioral);

module.exports = router;
