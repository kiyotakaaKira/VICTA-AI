/**
 * Forensic novelty engines — mounted at /api/engines
 */

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/enginesController');

const router = Router();
router.use(requireAuth);

router.post('/toxicology/analyze', ctrl.toxicologyAnalyze);
router.post('/media/authenticity', ctrl.upload.single('file'), ctrl.mediaAuthenticity);
router.post('/cold-case/compare', ctrl.coldCaseCompare);
router.get('/cold-case/queue', ctrl.coldCaseQueue);
router.post('/investigation/predict', ctrl.investigationPredict);
router.get('/city-threat/live', ctrl.cityThreatLive);
router.post('/behavioral/signature', ctrl.behavioralSignature);
router.get('/federation/feed', ctrl.federationFeed);
router.get('/intelligence', ctrl.getIntelligenceFeed);
router.get('/deepfake', ctrl.getDeepfakeScans);

module.exports = router;
