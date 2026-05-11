/**
 * controllers/analysisController.js
 * Orchestrates Gemini AI analysis calls.
 */

const gemini = require('../services/geminiService');
const db = require('../services/supabaseService');
const { broadcast } = require('../services/websocketService');
const { asyncHandler, sendSuccess, sendError } = require('../utils/helpers');

const analyzeEvidence = asyncHandler(async (req, res) => {
  const { text, type, evidenceId } = req.body;
  if (!text) return sendError(res, 'Evidence text is required.', 400, 'MISSING_FIELDS');

  const analysis = await gemini.analyzeEvidence(text, type || 'document');

  // If an evidenceId was provided, persist the analysis back to the DB
  if (evidenceId) {
    await db.updateEvidence(evidenceId, {
      analysis,
      risk_score: analysis.risk_score ?? 0,
      authenticity_score: analysis.authenticity_score ?? 100,
    });
    broadcast('ANALYSIS_COMPLETE', { evidenceId, analysis });
  }

  sendSuccess(res, analysis);
});

const generateTimeline = asyncHandler(async (req, res) => {
  const { caseId, evidenceTexts } = req.body;
  if (!caseId) return sendError(res, 'caseId is required.', 400, 'MISSING_FIELDS');

  const result = await gemini.generateTimeline(caseId, evidenceTexts || []);

  // Persist generated events
  if (result.events?.length) {
    for (const event of result.events) {
      await db.createTimelineEvent({
        case_id: caseId,
        title: event.description?.slice(0, 100) || 'Event',
        description: event.description,
        type: event.type || 'digital',
        timestamp: event.time || new Date().toISOString(),
        confidence: event.confidence || 80,
      });
    }
    broadcast('TIMELINE_GENERATED', { caseId, eventCount: result.events.length });
  }

  sendSuccess(res, result);
});

const predictNextSteps = asyncHandler(async (req, res) => {
  const { caseData } = req.body;
  if (!caseData) return sendError(res, 'caseData is required.', 400, 'MISSING_FIELDS');
  const result = await gemini.predictNextSteps(caseData);
  sendSuccess(res, result);
});

const scoreRisk = asyncHandler(async (req, res) => {
  const { caseData } = req.body;
  if (!caseData) return sendError(res, 'caseData is required.', 400, 'MISSING_FIELDS');
  const result = await gemini.scoreRisk(caseData);

  // Update case risk score if id provided
  if (caseData.id) {
    const score = result.risk_score ?? result.score;
    if (score != null) await db.updateCase(caseData.id, { risk_score: score });
  }

  sendSuccess(res, result);
});

module.exports = { analyzeEvidence, generateTimeline, predictNextSteps, scoreRisk };
