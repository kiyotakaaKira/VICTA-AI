/**
 * backend/routes/analysis.js
 * AI analysis routes — evidence analysis, risk scoring, behavioral patterns, authenticity.
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const {
  analyzeEvidence,
  generateTimeline,
  predictNextSteps,
  scoreRisk,
  detectBehavioralPatterns,
  analyzeAuthenticity,
  generateGraphNodes,
} = require('../services/geminiService');
const supabase = require('../services/supabaseService');
const logger = require('../utils/logger');

/**
 * POST /api/analysis/analyze-evidence
 * Analyze evidence content using Gemini AI.
 */
router.post('/analyze-evidence', requireAuth, async (req, res) => {
  try {
    const { text, type, evidenceId, metadata } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    const result = await analyzeEvidence({ text, type, metadata });

    // Persist analysis back to evidence record if ID provided
    if (evidenceId) {
      await supabase.updateEvidenceAnalysis(evidenceId, result);
    }

    res.json({ success: true, data: result });
  } catch (err) {
    logger.error('[Route] POST /analysis/analyze-evidence', { error: err.message });
    res.status(500).json({ error: 'AI analysis failed', detail: err.message });
  }
});

/**
 * POST /api/analysis/generate-timeline
 * Generate AI-reconstructed forensic timeline for a case.
 */
router.post('/generate-timeline', requireAuth, async (req, res) => {
  try {
    const { caseId } = req.body;
    if (!caseId) return res.status(400).json({ error: 'caseId is required' });

    const [caseData, evidence, existingEvents] = await Promise.all([
      supabase.getCaseById(caseId),
      supabase.getEvidenceByCase(caseId),
      supabase.getTimelineByCase(caseId),
    ]);

    if (!caseData) return res.status(404).json({ error: 'Case not found' });

    const result = await generateTimeline({ caseData, evidence, existingEvents });

    // Persist new events
    if (result.events?.length > 0) {
      await supabase.bulkInsertTimelineEvents(caseId, result.events);
    }

    res.json({ success: true, data: result });
  } catch (err) {
    logger.error('[Route] POST /analysis/generate-timeline', { error: err.message });
    res.status(500).json({ error: 'Timeline generation failed', detail: err.message });
  }
});

/**
 * POST /api/analysis/predict-next-steps
 * Predict investigative next steps for a case.
 */
router.post('/predict-next-steps', requireAuth, async (req, res) => {
  try {
    const { caseId, caseData: caseDataOverride } = req.body;

    let caseData = caseDataOverride;
    let evidence = [];
    let insights = [];

    if (caseId) {
      [caseData, evidence, insights] = await Promise.all([
        supabase.getCaseById(caseId),
        supabase.getEvidenceByCase(caseId),
        supabase.getInsightsByCase(caseId),
      ]);
    }

    if (!caseData) return res.status(400).json({ error: 'caseData or caseId required' });

    const result = await predictNextSteps({ caseData, evidence, insights });
    res.json({ success: true, data: result });
  } catch (err) {
    logger.error('[Route] POST /analysis/predict-next-steps', { error: err.message });
    res.status(500).json({ error: 'Prediction failed', detail: err.message });
  }
});

/**
 * POST /api/analysis/score-risk
 * Compute composite risk score for a case.
 */
router.post('/score-risk', requireAuth, async (req, res) => {
  try {
    const { caseId } = req.body;
    if (!caseId) return res.status(400).json({ error: 'caseId is required' });

    const [caseData, evidence, insights] = await Promise.all([
      supabase.getCaseById(caseId),
      supabase.getEvidenceByCase(caseId),
      supabase.getInsightsByCase(caseId),
    ]);

    if (!caseData) return res.status(404).json({ error: 'Case not found' });

    const result = await scoreRisk({ caseData, evidence, insights });

    // Update case risk score
    await supabase.updateCaseRiskScore(caseId, result.risk_score);

    res.json({ success: true, data: result });
  } catch (err) {
    logger.error('[Route] POST /analysis/score-risk', { error: err.message });
    res.status(500).json({ error: 'Risk scoring failed', detail: err.message });
  }
});

/**
 * POST /api/analysis/behavioral-patterns
 * Cross-case behavioral pattern detection.
 */
router.post('/behavioral-patterns', requireAuth, async (req, res) => {
  try {
    const { caseIds } = req.body;

    let cases, evidence;
    if (caseIds?.length > 0) {
      cases = await Promise.all(caseIds.map(id => supabase.getCaseById(id)));
      evidence = (await Promise.all(caseIds.map(id => supabase.getEvidenceByCase(id)))).flat();
    } else {
      cases = await supabase.getCases({});
      evidence = [];
    }

    const result = await detectBehavioralPatterns({ cases, evidence });
    res.json({ success: true, data: result });
  } catch (err) {
    logger.error('[Route] POST /analysis/behavioral-patterns', { error: err.message });
    res.status(500).json({ error: 'Pattern detection failed', detail: err.message });
  }
});

/**
 * POST /api/analysis/authenticate
 * Deepfake and document authenticity analysis.
 */
router.post('/authenticate', requireAuth, async (req, res) => {
  try {
    const { contentType, text, evidenceId, metadata } = req.body;
    if (!contentType || !text) return res.status(400).json({ error: 'contentType and text are required' });

    const result = await analyzeAuthenticity({ contentType, text, metadata });

    if (evidenceId) {
      await supabase.updateEvidenceAnalysis(evidenceId, { authenticity_score: result.authenticity_score });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    logger.error('[Route] POST /analysis/authenticate', { error: err.message });
    res.status(500).json({ error: 'Authenticity analysis failed', detail: err.message });
  }
});

/**
 * POST /api/analysis/generate-graph
 * Generate knowledge graph nodes and edges for a case.
 */
router.post('/generate-graph', requireAuth, async (req, res) => {
  try {
    const { caseId } = req.body;
    if (!caseId) return res.status(400).json({ error: 'caseId is required' });

    const [caseData, evidence] = await Promise.all([
      supabase.getCaseById(caseId),
      supabase.getEvidenceByCase(caseId),
    ]);

    if (!caseData) return res.status(404).json({ error: 'Case not found' });

    const result = await generateGraphNodes({ caseData, evidence });
    res.json({ success: true, data: result });
  } catch (err) {
    logger.error('[Route] POST /analysis/generate-graph', { error: err.message });
    res.status(500).json({ error: 'Graph generation failed', detail: err.message });
  }
});

/**
 * POST /api/analysis/upload
 * Secure forensic media ingestion.
 */
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    logger.info('[Analysis] File uploaded successfully', { 
      filename: req.file.filename,
      original: req.file.originalname,
      size: req.file.size
    });

    res.json({
      success: true,
      file: {
        id: req.file.filename,
        name: req.file.originalname,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`,
        mimetype: req.file.mimetype
      }
    });
  } catch (err) {
    logger.error('[Route] POST /analysis/upload', { error: err.message });
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
