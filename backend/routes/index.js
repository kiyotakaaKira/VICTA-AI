/**
 * routes/index.js
 * Mounts all API route modules.
 */

const { Router } = require('express');

const healthRouter = require('./health');
const casesRouter = require('./cases');
const evidenceRouter = require('./evidence');
const insightsRouter = require('./insights');
const timelineRouter = require('./timeline');
const analysisRouter = require('./analysis');
const graphRouter = require('./graph');

const deepfakeRouter = require('./deepfake');
const toxicologyRouter = require('./toxicology');
const predictionRouter = require('./prediction');
const behavioralRouter = require('./behavioral');
const analyticsRouter = require('./analytics');
const dashboardRouter = require('./dashboard');
const enginesRouter = require('./engines');
const analyzePromptRouter = require('./analyzePrompt');
const aiRoutes = require('./aiRoutes');

const router = Router();

router.use('/health', healthRouter);
router.use('/cases', casesRouter);
router.use('/evidence', evidenceRouter);
router.use('/insights', insightsRouter);
router.use('/timeline', timelineRouter);
router.use('/analysis', analysisRouter);
router.use('/graph', graphRouter);

router.use('/deepfake', deepfakeRouter);
router.use('/toxicology', toxicologyRouter);
router.use('/prediction', predictionRouter);
router.use('/behavioral', behavioralRouter);
router.use('/analytics', analyticsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/engines', enginesRouter);
router.use('/analyze', analyzePromptRouter);
router.use('/ai', aiRoutes);

module.exports = router;
