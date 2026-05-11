/**
 * controllers/insightController.js
 */

const db = require('../services/supabaseService');
const { asyncHandler, sendSuccess } = require('../utils/helpers');

const getInsights = asyncHandler(async (req, res) => {
  const data = await db.getInsightsByCase(req.params.caseId);
  sendSuccess(res, data);
});

const createInsight = asyncHandler(async (req, res) => {
  const { case_id, title, description, severity, source } = req.body;
  const insight = await db.createInsight({ case_id, title, description, severity, source });
  sendSuccess(res, insight, 201);
});

module.exports = { getInsights, createInsight };
