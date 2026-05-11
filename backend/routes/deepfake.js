const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { analyzeDeepfake, upload } = require('../controllers/deepfakeController');

const router = Router();

router.use(requireAuth);
router.post('/analyze', upload.single('file'), analyzeDeepfake);

module.exports = router;
