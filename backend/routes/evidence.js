/**
 * routes/evidence.js
 */

const { Router } = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const {
  getEvidence,
  uploadEvidence,
  updateEvidence,
} = require('../controllers/evidenceController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const router = Router();

router.use(requireAuth);

router.get('/case/:caseId', getEvidence);
router.post('/upload', upload.single('file'), uploadEvidence);
router.put('/:id', updateEvidence);

module.exports = router;
