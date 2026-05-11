/**
 * controllers/timelineController.js
 */

const db = require('../services/supabaseService');
const { asyncHandler, sendSuccess } = require('../utils/helpers');

const getTimeline = asyncHandler(async (req, res) => {
  const data = await db.getTimelineByCase(req.params.caseId);
  sendSuccess(res, data);
});

const createTimelineEvent = asyncHandler(async (req, res) => {
  const { case_id, title, description, type, timestamp, confidence } = req.body;
  const event = await db.createTimelineEvent({
    case_id,
    title,
    description,
    type,
    timestamp,
    confidence: confidence ?? 100,
  });
  sendSuccess(res, event, 201);
});

module.exports = { getTimeline, createTimelineEvent };
