const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { analyzePrediction, getPredictions } = require('../controllers/predictionController');

const router = Router();

router.use(requireAuth);
router.get('/', getPredictions);
router.post('/analyze', analyzePrediction);

module.exports = router;
