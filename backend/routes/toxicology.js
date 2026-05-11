const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { analyzeToxicology } = require('../controllers/toxicologyController');

const router = Router();

router.use(requireAuth);
router.post('/analyze', analyzeToxicology);

module.exports = router;
